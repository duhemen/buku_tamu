import { prisma } from '../../config/prisma.js';
import { encrypt } from '../../common/utils/crypto.js';
import { enrollFace, recognizeFace } from '../face/face.service.js';
import { nextQueueNumber, todayDateForDb } from '../../common/utils/queueNumber.js';
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

export async function publicCheckIn(
  data: PublicCheckInInput
): Promise<PublicCheckInResult> {
  // 1. Cari atau buat guest
  let guestId: string;
  let isReturning = false;

  if (data.guest.matchedGuestId) {
    // Tamu lama — pakai guestId yang sudah ada
    const existing = await prisma.guest.findUnique({
      where: { id: data.guest.matchedGuestId },
    });
    if (existing) {
      guestId = existing.id;
      isReturning = true;
    } else {
      // Fallback — buat baru kalau tidak ditemukan
      const created = await createNewGuest(data.guest);
      guestId = created.id;
    }
  } else {
    // Tamu baru
    const created = await createNewGuest(data.guest);
    guestId = created.id;
  }

  // 2. Transaksi: buat visit + queue + receipt + handover
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

  // 3. Auto-enroll face kalau ada foto + tamu baru (di luar transaksi)
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