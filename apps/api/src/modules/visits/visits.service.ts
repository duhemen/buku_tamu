import { prisma } from '../../config/prisma.js';
import { nextQueueNumber, todayDateForDb } from '../../common/utils/queueNumber.js';
import type { VisitCheckInInput, VisitListQuery } from './visits.schema.js';

export async function checkIn(data: VisitCheckInInput, officerId?: string) {
  return prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({
      data: {
        guestId: data.guestId,
        officerId: officerId ?? null,
        purpose: data.purpose,
        destination: data.destination,
        notes: data.notes ?? null,
        status: 'WAITING',
      },
    });

    const number = await nextQueueNumber();
    const today = todayDateForDb();

    const queue = await tx.queue.create({
      data: {
        visitId: visit.id,
        number,
        date: today,
        status: 'WAITING',
      },
    });

    if (data.letter) {
      await tx.letter.create({
        data: {
          visitId: visit.id,
          letterNumber: data.letter.letterNumber ?? null,
          subject: data.letter.subject,
          sender: data.letter.sender ?? null,
          recipient: data.letter.recipient ?? null,
        },
      });
    }

    const receiptNumber = 'R-' + Date.now().toString(36).toUpperCase();
    const receipt = await tx.receipt.create({
      data: { visitId: visit.id, receiptNumber },
    });

    return { visit, queue, receipt };
  });
}

export async function checkOut(visitId: string) {
  return prisma.visit.update({
    where: { id: visitId },
    data: { status: 'DONE', checkOutAt: new Date() },
  });
}

export async function listVisits(q: VisitListQuery) {
  const where: Record<string, unknown> = {};
  if (q.status) where.status = q.status;
  if (q.from || q.to) {
    where.checkInAt = {};
    if (q.from) (where.checkInAt as Record<string, unknown>).gte = new Date(q.from);
    if (q.to) (where.checkInAt as Record<string, unknown>).lte = new Date(q.to);
  }
  const skip = (q.page - 1) * q.pageSize;
  const [items, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      skip,
      take: q.pageSize,
      orderBy: { checkInAt: 'desc' },
      include: { guest: true, queue: true, letters: true, receipt: true },
    }),
    prisma.visit.count({ where }),
  ]);
  return { items, total, page: q.page, pageSize: q.pageSize };
}

export async function getVisitById(id: string) {
  return prisma.visit.findUnique({
    where: { id },
    include: { guest: true, queue: true, letters: true, receipt: true },
  });
}