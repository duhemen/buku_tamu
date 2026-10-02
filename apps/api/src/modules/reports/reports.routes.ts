import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { decrypt } from '../../common/utils/crypto.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1, -7, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, -7, 0, 0) - 1);
  return { start, end };
}

export async function reportsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get(
    '/monthly',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST', 'VIEWER')] },
    async (req, reply) => {
      const q = req.query as { year?: string; month?: string };
      const year = q.year ? parseInt(q.year, 10) : new Date().getFullYear();
      const month = q.month ? parseInt(q.month, 10) : new Date().getMonth() + 1;

      if (year < 2000 || year > 2100 || month < 1 || month > 12) {
        return reply.code(400).send({ error: 'Invalid year/month' });
      }

      const { start, end } = monthRange(year, month);

      const visits = await prisma.visit.findMany({
        where: { checkInAt: { gte: start, lte: end } },
        orderBy: { checkInAt: 'asc' },
        include: {
          guest: true,
          queue: true,
          letters: true,
        },
      });

      const handovers = await prisma.handover.findMany({
        where: { receivedAt: { gte: start, lte: end } },
        include: {
          visit: { include: { guest: true, queue: true } },
        },
      });

      const byStatus = {
        WAITING: visits.filter((v) => v.status === 'WAITING').length,
        IN_PROGRESS: visits.filter((v) => v.status === 'IN_PROGRESS').length,
        DONE: visits.filter((v) => v.status === 'DONE').length,
        CANCELED: visits.filter((v) => v.status === 'CANCELED').length,
      };

      const destinationCount = new Map<string, number>();
      for (const v of visits) {
        destinationCount.set(v.destination, (destinationCount.get(v.destination) ?? 0) + 1);
      }
      const byDestination = Array.from(destinationCount.entries())
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count);

      const byDay: { day: string; label: string; count: number }[] = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStart = new Date(Date.UTC(year, month - 1, d, -7, 0, 0));
        const dayEnd = new Date(Date.UTC(year, month - 1, d + 1, -7, 0, 0) - 1);
        const count = visits.filter(
          (v) => v.checkInAt >= dayStart && v.checkInAt <= dayEnd
        ).length;
        const dow = new Date(year, month - 1, d).getDay();
        byDay.push({
          day: String(d).padStart(2, '0'),
          label: dayNames[dow],
          count,
        });
      }

      const byHandoverType = new Map<string, number>();
      for (const h of handovers) {
        byHandoverType.set(h.type, (byHandoverType.get(h.type) ?? 0) + 1);
      }
      const handoverStats = Array.from(byHandoverType.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const TYPE_LABEL: Record<string, string> = {
        SURAT: 'Surat / Dokumen',
        JAMINAN_TENDER: 'Jaminan Tender',
        PAKET: 'Paket / Barang',
        DOKUMEN: 'Dokumen',
        LAINNYA: 'Lainnya',
      };

      const rows = visits.map((v) => ({
        id: v.id,
        date: v.checkInAt,
        queueNumber: v.queue?.number ?? '-',
        guestName: v.guest.fullName,
        company: v.guest.company,
        nik: decrypt(v.guest.nikEncrypted) ?? '-',
        phone: decrypt(v.guest.phoneEncrypted) ?? '-',
        email: decrypt(v.guest.emailEncrypted) ?? '-',
        destination: v.destination,
        purpose: v.purpose,
        letterSubject: v.letters[0]?.subject ?? null,
        status: v.status,
        checkOutAt: v.checkOutAt,
      }));

      const uniqueGuests = new Set(visits.map((v) => v.guestId)).size;

      return {
        period: {
          year,
          month,
          label: new Date(year, month - 1).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          }),
        },
        summary: {
          totalVisits: visits.length,
          uniqueGuests,
          totalHandovers: handovers.length,
          byStatus,
          busiestDay: byDay.reduce(
            (max, d) => (d.count > max.count ? d : max),
            { day: '-', label: '-', count: 0 }
          ),
        },
        byDay,
        byDestination,
        handoverStats: handoverStats.map((h) => ({
          type: h.type,
          label: TYPE_LABEL[h.type] ?? h.type,
          count: h.count,
        })),
        rows,
        generatedAt: new Date().toISOString(),
      };
    }
  );
}