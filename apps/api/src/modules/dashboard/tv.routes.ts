import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { dayRange } from '../../common/utils/queueNumber.js';

export async function tvRoutes(app: FastifyInstance) {
  app.get('/tv', async () => {
    const { start, end } = dayRange();

    const queues = await prisma.queue.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { number: 'asc' },
      include: {
        visit: {
          include: {
            guest: { select: { fullName: true, company: true } },
          },
        },
      },
    });

    const current = queues.find((q) => q.status === 'CALLED') ?? null;
    const waiting = queues.filter((q) => q.status === 'WAITING');
    const served = queues.filter((q) => q.status === 'SERVED');

    return {
      current: current
        ? {
            number: current.number,
            guestName: current.visit.guest.fullName,
            company: current.visit.guest.company,
            destination: current.visit.destination,
            calledAt: current.calledAt,
          }
        : null,
      waiting: waiting.map((q) => ({
        number: q.number,
        guestName: q.visit.guest.fullName,
        destination: q.visit.destination,
      })),
      stats: {
        total: queues.length,
        waiting: waiting.length,
        called: current ? 1 : 0,
        served: served.length,
      },
      updatedAt: new Date().toISOString(),
    };
  });
}