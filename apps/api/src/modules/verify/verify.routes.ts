import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { decrypt } from '../../common/utils/crypto.js';
import { maskNik, maskPhone, maskEmail } from '../../common/utils/masking.js';

const TYPE_LABEL: Record<string, string> = {
  SURAT: 'Surat / Dokumen',
  JAMINAN_TENDER: 'Jaminan Tender / Lelang',
  PAKET: 'Paket / Barang',
  DOKUMEN: 'Dokumen',
  LAINNYA: 'Lainnya',
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: 'Diterima',
  IN_PROGRESS: 'Diproses',
  COMPLETED: 'Selesai',
  RETURNED: 'Dikembalikan',
};

export async function verifyRoutes(app: FastifyInstance) {
  app.get('/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const upper = code.toUpperCase();

    if (upper.startsWith('TT-')) {
      const handover = await prisma.handover.findUnique({
        where: { code: upper },
        include: {
          visit: {
            include: { guest: true, queue: true },
          },
        },
      });
      if (!handover) {
        return reply
          .code(404)
          .send({ ok: false, error: 'Kode bukti terima tidak ditemukan' });
      }
      const v = handover.visit;
      return {
        ok: true,
        kind: 'handover',
        visitId: handover.visitId,
        queueNumber: handover.code,
        status: handover.status,
        guest: {
          fullName: v.guest.fullName,
          company: v.guest.company,
          nik: maskNik(decrypt(v.guest.nikEncrypted)),
          phone: maskPhone(decrypt(v.guest.phoneEncrypted)),
          email: maskEmail(decrypt(v.guest.emailEncrypted)),
        },
        visit: {
          purpose: v.purpose,
          destination: v.destination,
          checkInAt: v.checkInAt,
          checkOutAt: v.checkOutAt,
          status: v.status,
        },
        handover: {
          code: handover.code,
          type: handover.type,
          typeLabel: TYPE_LABEL[handover.type] ?? handover.type,
          statusLabel: STATUS_LABEL[handover.status] ?? handover.status,
          referenceNo: handover.referenceNo,
          description: handover.description,
          recipient: handover.recipient,
          receivedAt: handover.receivedAt,
          completedAt: handover.completedAt,
          notes: handover.notes,
        },
        letter: null,
        receiptNumber: null,
      };
    }

    const queue = await prisma.queue.findFirst({
      where: { number: upper },
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: { guest: true, letters: true, receipt: true },
        },
      },
    });

    if (!queue) {
      return reply.code(404).send({ ok: false, error: 'Kode tidak ditemukan' });
    }

    const v = queue.visit;
    return {
      ok: true,
      kind: 'visit',
      visitId: queue.visitId,
      queueNumber: queue.number,
      status: queue.status,
      guest: {
        fullName: v.guest.fullName,
        company: v.guest.company,
        nik: maskNik(decrypt(v.guest.nikEncrypted)),
        phone: maskPhone(decrypt(v.guest.phoneEncrypted)),
        email: maskEmail(decrypt(v.guest.emailEncrypted)),
      },
      visit: {
        purpose: v.purpose,
        destination: v.destination,
        checkInAt: v.checkInAt,
        checkOutAt: v.checkOutAt,
        status: v.status,
      },
      handover: null,
      letter: v.letters[0]
        ? {
            letterNumber: v.letters[0].letterNumber,
            subject: v.letters[0].subject,
            sender: v.letters[0].sender,
            recipient: v.letters[0].recipient,
          }
        : null,
      receiptNumber: v.receipt?.receiptNumber ?? null,
    };
  });
}