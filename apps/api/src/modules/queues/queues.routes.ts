import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';
import { dayRange } from '../../common/utils/queueNumber.js';

export async function queueRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/today', async () => {
    const { start, end } = dayRange();
    return prisma.queue.findMany({
      where: { date: { gte: start, lte: end } },
      include: { visit: { include: { guest: true } } },
      orderBy: { number: 'asc' },
    });
  });

  app.get('/next', async () => {
    return prisma.queue.findFirst({
      where: { status: 'WAITING' },
      orderBy: { number: 'asc' },
      include: { visit: { include: { guest: true } } },
    });
  });

  app.post(
    '/:id/call',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req) => {
      const { id } = req.params as { id: string };
      return prisma.queue.update({
        where: { id },
        data: { status: 'CALLED', calledAt: new Date() },
      });
    }
  );

  app.post(
    '/:id/serve',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req) => {
      const { id } = req.params as { id: string };
      return prisma.queue.update({
        where: { id },
        data: { status: 'SERVED' },
      });
    }
  );
}