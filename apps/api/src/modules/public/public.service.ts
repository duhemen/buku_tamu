import { prisma } from '../../config/prisma.js';
import { encrypt } from '../../common/utils/crypto.js';
import { enrollFace, recognizeFace } from '../face/face.service.js';
import { nextQueueNumber, todayDateForDb } from '../../common/utils/queueNumber.js';
import { getOperatingStatus } from '../operating/operating.service.js';
import { notifyGuestArrival } from '../telegram/telegram.service.js';
import type { PublicCheckInInput } from './public.schema.js';

export interface PublicCheckInResult {
  visitId: string;
  queueNumber: string;
  receiptNumber: string;
  guestId: string;
  guestName: string;
  isReturningGuest: boolean;
  handoverCode?: string | null;
}

export class OperatingClosedError extends Error {
  status: string;
  nextOpenTime?: string;
  constructor(message: string, status: string, nextOpenTime?: string) {
    super(message);
    this.name = 'OperatingClosedError';
    this.status = status;
    this.nextOpenTime = nextOpenTime;
  }
}

// ============================================================
// Helper: Cari petugas berdasarkan tujuan (destination)
// ============================================================
async function findOfficerByDestination(destination: string) {
  // Strategy: cocokkan destination dengan position / unit petugas
  // Contoh: destination "Bagian Umum" → petugas dengan unit "Umum"
  // Fallback: ambil petugas POKJA / PPK pertama kalau tidak ada match
  
  const lowerDest = destination.toLowerCase();
  
  // Cari petugas yang posisinya mengandung kata kunci dari destination
  const allOfficers = await prisma.officer.findMany({
    where: { active: true, telegramChatId: { not: null } },
  });
  
  // Match 1: cari officer dengan position/unit mengandung kata destination
  for (const o of allOfficers) {
    const positionMatch = o.position.toLowerCase();
    const unitMatch = (o.unit ?? '').toLowerCase();
    
    if (
      positionMatch.includes(lowerDest) ||
      lowerDest.includes(positionMatch) ||
      unitMatch.includes(lowerDest) ||
      lowerDest.includes(unitMatch)
    ) {
      return o;
    }
  }
  
  // Match 2: cari berdasarkan kata kunci umum
  const keywords: { key: string; match: string[] }[] = [
    { key: 'umum', match: ['kasubbagtu', 'umum'] },
    { key: 'keuangan', match: ['bendahara', 'keuangan'] },
    { key: 'ppk', match: ['ppk'] },
    { key: 'pokja', match: ['pokja'] },
    { key: 'pengadaan', match: ['pokja', 'ppk'] },
    { key: 'tender', match: ['pokja'] },
    { key: 'lelang', match: ['pokja'] },
    { key: 'pimpinan', match: ['kabalai'] },
  ];
  
  for (const kw of keywords) {
    if (lowerDest.includes(kw.key)) {
      for (const o of allOfficers) {
        const positionMatch = o.position.toLowerCase();
        if (kw.match.some((m) => positionMatch.includes(m))) {
          return o;
        }
      }
    }
  }
  
  return null;
}

export async function publicCheckIn(
  data: PublicCheckInInput
): Promise<PublicCheckInResult> {
  // ============================================================
  // 1. Cek jam operasional DULU
  // ============================================================
  const operatingStatus = await getOperatingStatus();

  if (!operatingStatus.isOpen) {
    const messages: Record<string, string> = {
      CLOSED: operatingStatus.reason ?? 'Kantor sedang tutup',
      CUT_OFF: operatingStatus.reason ?? 'Waktu registrasi tamu sudah berakhir',
      HOLIDAY: operatingStatus.reason ?? 'Hari ini kantor libur',
      OVERRIDE: operatingStatus.reason ?? 'Kantor tutup berdasarkan keputusan admin',
    };
    throw new OperatingClosedError(
      messages[operatingStatus.status] ?? 'Registrasi tidak dibuka',
      operatingStatus.status,
      operatingStatus.nextOpenTime
    );
  }

  // ============================================================
  // 2. Cari atau buat guest
  // ============================================================
  let guestId: string;
  let isReturning = false;

  if (data.guest.matchedGuestId) {
    const existing = await prisma.guest.findUnique({
      where: { id: data.guest.matchedGuestId },
    });
    if (existing) {
      guestId = existing.id;
      isReturning = true;
    } else {
      const created = await createNewGuest(data.guest);
      guestId = created.id;
    }
  } else {
    const created = await createNewGuest(data.guest);
    guestId = created.id;
  }

  // ============================================================
  // 3. Transaksi: buat visit + queue + receipt + handover
  // ============================================================
  const result = await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({
      data: {
        guestId,
        purpose: data.visit.purpose,
        destination: data.visit.destination,
        notes: data.visit.notes ?? null,
        status: 'WAITING',
      },
    });

    const queueNumber = await nextQueueNumber();
    const today = todayDateForDb();

    const queue = await tx.queue.create({
      data: {
        visitId: visit.id,
        number: queueNumber,
        date: today,
        status: 'WAITING',
      },
    });

    const receiptNumber = 'R-' + Date.now().toString(36).toUpperCase();
    await tx.receipt.create({
      data: {
        visitId: visit.id,
        receiptNumber,
      },
    });

    let handoverCode: string | null = null;

    if (data.handover) {
      const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = 'TT-' + ymd + '-';
      const last = await tx.handover.findFirst({
        where: { code: { startsWith: prefix } },
        orderBy: { code: 'desc' },
        select: { code: true },
      });
      let seq = 1;
      if (last) {
        const parts = last.code.split('-');
        seq = parseInt(parts[parts.length - 1], 10) + 1;
      }
      handoverCode = prefix + String(seq).padStart(3, '0');

      await tx.handover.create({
        data: {
          visitId: visit.id,
          code: handoverCode,
          type: data.handover.type,
          referenceNo: data.handover.referenceNo ?? null,
          description: data.handover.description,
          recipient: data.handover.recipient ?? null,
        },
      });
    }

    const guest = await tx.guest.findUnique({
      where: { id: guestId },
      select: { fullName: true },
    });

    return {
      visitId: visit.id,
      queueNumber,
      receiptNumber,
      guestId,
      guestName: guest?.fullName ?? '',
      handoverCode,
    };
  });

  // ============================================================
  // 4. Auto-enroll face kalau ada foto + tamu baru
  // ============================================================
  if (data.guest.faceImage && !isReturning) {
    try {
      const enroll = await enrollFace(data.guest.faceImage, guestId);
      if (!enroll.ok) {
        console.warn('[public-checkin] Enroll gagal:', enroll.reason);
      }
    } catch (e) {
      console.error('[public-checkin] Enroll error:', e);
    }
  }

  // ============================================================
  // Notifikasi Telegram ke petugas tujuan
  // ============================================================
  try {
    const officer = await findOfficerByDestination(data.visit.destination);
    if (officer?.telegramChatId) {
      const handoverType = data.handover?.type ?? null;
      await notifyGuestArrival({
        chatId: officer.telegramChatId,
        guestName: result.guestName,
        guestCompany: data.guest.company ?? null,
        purpose: data.visit.purpose,
        destination: data.visit.destination,
        queueNumber: result.queueNumber,
        hasHandover: !!data.handover,
        handoverType: handoverType,
      });
      console.log(
        '[telegram] Notif sent to ' + officer.name + ' (' + officer.position + ')'
      );
    } else {
      console.log('[telegram] Tidak ada petugas dengan chat ID untuk tujuan: ' + data.visit.destination);
    }
  } catch (e) {
    console.error('[telegram] Gagal kirim notif:', e);
  }

  return {
    ...result,
    isReturningGuest: isReturning,
  };
}

async function createNewGuest(guestData: PublicCheckInInput['guest']) {
  return prisma.guest.create({
    data: {
      fullName: guestData.fullName,
      company: guestData.company ?? null,
      address: guestData.address ?? null,
      nikEncrypted: encrypt(guestData.nik ?? null),
      phoneEncrypted: encrypt(guestData.phone ?? null),
      emailEncrypted: encrypt(guestData.email ?? null),
      consentAt: new Date(guestData.consentAt),
    },
  });
}

export async function publicFaceMatch(imageBase64: string) {
  return recognizeFace(imageBase64);
}