import { prisma } from '../../config/prisma.js';
import type { HandoverCreateInput, HandoverUpdateInput } from './handover.schema.js';

async function generateCode(): Promise<string> {
  const today = new Date();
  const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = 'TT-' + ymd + '-';

  const last = await prisma.handover.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
    select: { code: true },
  });

  let seq = 1;
  if (last) {
    const parts = last.code.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return prefix + String(seq).padStart(3, '0');
}

export async function createHandover(data: HandoverCreateInput) {
  const code = await generateCode();
  const h = await prisma.handover.create({
    data: {
      visitId: data.visitId,
      code,
      type: data.type,
      referenceNo: data.referenceNo ?? null,
      description: data.description,
      recipient: data.recipient ?? null,
      notes: data.notes ?? null,
    },
    include: {
      visit: {
        include: {
          guest: true,
          queue: true,
        },
      },
    },
  });
  return h;
}

export async function listHandovers(params: {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.from || params.to) {
    where.receivedAt = {};
    if (params.from) (where.receivedAt as Record<string, unknown>).gte = new Date(params.from);
    if (params.to) (where.receivedAt as Record<string, unknown>).lte = new Date(params.to);
  }

  return prisma.handover.findMany({
    where,
    orderBy: { receivedAt: 'desc' },
    take: params.limit ?? 100,
    include: {
      visit: {
        include: {
          guest: { select: { fullName: true, company: true } },
          queue: { select: { number: true } },
        },
      },
    },
  });
}

export async function getHandoverByCode(code: string) {
  return prisma.handover.findUnique({
    where: { code },
    include: {
      visit: {
        include: {
          guest: true,
          queue: true,
        },
      },
    },
  });
}

export async function updateHandover(id: string, data: HandoverUpdateInput) {
  const update: Record<string, unknown> = {};
  if (data.status !== undefined) {
    update.status = data.status;
    if (data.status === 'COMPLETED') update.completedAt = new Date();
  }
  if (data.recipient !== undefined) update.recipient = data.recipient;
  if (data.notes !== undefined) update.notes = data.notes;

  return prisma.handover.update({
    where: { id },
    data: update,
    include: { visit: { include: { guest: true, queue: true } } },
  });
}

export async function handoverStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [total, todayCount, byType, byStatus] = await Promise.all([
    prisma.handover.count(),
    prisma.handover.count({
      where: { receivedAt: { gte: today, lte: endOfToday } },
    }),
    prisma.handover.groupBy({
      by: ['type'],
      _count: { _all: true },
    }),
    prisma.handover.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  return {
    total,
    today: todayCount,
    byType: byType.map((b) => ({ type: b.type, count: b._count._all })),
    byStatus: byStatus.map((b) => ({ status: b.status, count: b._count._all })),
  };
}