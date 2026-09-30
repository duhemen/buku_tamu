import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { decrypt } from '../../common/utils/crypto.js';
import { maskNik, maskPhone, maskEmail } from '../../common/utils/masking.js';
import { dayRange, periodRangeWIB } from '../../common/utils/queueNumber.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/summary', async () => {
    const today = periodRangeWIB('today');
    const week = periodRangeWIB('week');
    const month = periodRangeWIB('month');
    const year = periodRangeWIB('year');

    const [
      todayCount,
      weekCount,
      monthCount,
      yearCount,
      waiting,
      inProgress,
      done,
      inside,
      canceled,
    ] = await Promise.all([
      prisma.visit.count({
        where: { checkInAt: { gte: today.start, lte: today.end } },
      }),
      prisma.visit.count({
        where: { checkInAt: { gte: week.start, lte: week.end } },
      }),
      prisma.visit.count({
        where: { checkInAt: { gte: month.start, lte: month.end } },
      }),
      prisma.visit.count({
        where: { checkInAt: { gte: year.start, lte: year.end } },
      }),
      prisma.visit.count({
        where: { status: 'WAITING', checkInAt: { gte: today.start, lte: today.end } },
      }),
      prisma.visit.count({
        where: { status: 'IN_PROGRESS', checkInAt: { gte: today.start, lte: today.end } },
      }),
      prisma.visit.count({
        where: { status: 'DONE', checkInAt: { gte: today.start, lte: today.end } },
      }),
      prisma.visit.count({
        where: { status: { in: ['WAITING', 'IN_PROGRESS'] } },
      }),
      prisma.visit.count({
        where: { status: 'CANCELED', checkInAt: { gte: today.start, lte: today.end } },
      }),
    ]);

    return {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      year: yearCount,
      waiting,
      inProgress,
      done,
      inside,
      canceled,
    };
  });

  app.get('/chart/hourly', async () => {
    const { start, end } = dayRange();
    const visits = await prisma.visit.findMany({
      where: { checkInAt: { gte: start, lte: end } },
      select: { checkInAt: true },
    });
    const buckets: Record<string, number> = {};
    for (let h = 0; h < 24; h++) buckets[String(h).padStart(2, '0')] = 0;
    for (const v of visits) {
      const h = String(v.checkInAt.getHours()).padStart(2, '0');
      buckets[h]++;
    }
    return Object.entries(buckets).map(([hour, count]) => ({ hour, count }));
  });

  app.get('/chart/weekly', async () => {
    const { start } = periodRangeWIB('week');
    const days: { day: string; label: string; count: number }[] = [];
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const next = new Date(d);
      next.setUTCDate(next.getUTCDate() + 1);

      const count = await prisma.visit.count({
        where: { checkInAt: { gte: d, lt: next } },
      });
      days.push({
        day: d.toISOString().slice(0, 10),
        label: dayNames[i],
        count,
      });
    }
    return days;
  });

  app.get('/chart/destination', async () => {
    const { start, end } = periodRangeWIB('month');
    const groups = await prisma.visit.groupBy({
      by: ['destination'],
      where: { checkInAt: { gte: start, lte: end } },
      _count: { _all: true },
    });
    return groups
      .map((g) => ({ destination: g.destination, count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  app.get('/chart/purpose', async () => {
    const { start, end } = periodRangeWIB('month');
    const groups = await prisma.visit.groupBy({
      by: ['purpose'],
      where: { checkInAt: { gte: start, lte: end } },
      _count: { _all: true },
    });
    return groups
      .map((g) => ({ purpose: g.purpose, count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  app.get('/handover-summary', async () => {
    const today = periodRangeWIB('today');
    const month = periodRangeWIB('month');

    const [todayCount, monthCount, byType, byStatus] = await Promise.all([
      prisma.handover.count({
        where: { receivedAt: { gte: today.start, lte: today.end } },
      }),
      prisma.handover.count({
        where: { receivedAt: { gte: month.start, lte: month.end } },
      }),
      prisma.handover.groupBy({
        by: ['type'],
        where: { receivedAt: { gte: month.start, lte: month.end } },
        _count: { _all: true },
      }),
      prisma.handover.groupBy({
        by: ['status'],
        where: { receivedAt: { gte: month.start, lte: month.end } },
        _count: { _all: true },
      }),
    ]);

    const TYPE_LABEL: Record<string, string> = {
      SURAT: 'Surat',
      JAMINAN_TENDER: 'Jaminan Tender',
      PAKET: 'Paket',
      DOKUMEN: 'Dokumen',
      LAINNYA: 'Lainnya',
    };

    return {
      today: todayCount,
      month: monthCount,
      byType: byType.map((b) => ({
        type: b.type,
        label: TYPE_LABEL[b.type] ?? b.type,
        count: b._count._all,
      })),
      byStatus: byStatus.map((b) => ({ status: b.status, count: b._count._all })),
    };
  });
  app.get('/visits', async () => {
    const { start, end } = dayRange();
    const visits = await prisma.visit.findMany({
      where: { checkInAt: { gte: start, lte: end } },
      orderBy: { checkInAt: 'desc' },
      take: 100,
      include: { guest: true, queue: true, letters: true },
    });
    return visits.map((v) => ({
      id: v.id,
      queueNumber: v.queue?.number ?? '-',
      guestName: v.guest.fullName,
      company: v.guest.company,
      nik: maskNik(decrypt(v.guest.nikEncrypted)),
      phone: maskPhone(decrypt(v.guest.phoneEncrypted)),
      email: maskEmail(decrypt(v.guest.emailEncrypted)),
      destination: v.destination,
      purpose: v.purpose,
      letterSubject: v.letters[0]?.subject ?? null,
      status: v.status,
      checkInAt: v.checkInAt,
      checkOutAt: v.checkOutAt,
    }));
  });

  app.get('/recent', async () => {
    const visits = await prisma.visit.findMany({
      orderBy: { checkInAt: 'desc' },
      take: 6,
      include: { guest: true, queue: true },
    });
    return visits.map((v) => ({
      id: v.id,
      queueNumber: v.queue?.number ?? '-',
      guestName: v.guest.fullName,
      company: v.guest.company,
      destination: v.destination,
      status: v.status,
      checkInAt: v.checkInAt,
    }));
  });
}