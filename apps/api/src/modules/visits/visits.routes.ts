import type { FastifyInstance } from 'fastify';
import { visitCheckInSchema, visitListQuerySchema } from './visits.schema.js';
import { checkIn, checkOut, listVisits, getVisitById } from './visits.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function visitRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (req, reply) => {
    const parsed = visitListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    return listVisits(parsed.data);
  });

  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const visit = await getVisitById(id);
    if (!visit) return reply.code(404).send({ error: 'Not found' });
    return visit;
  });

  app.post(
    '/check-in',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req, reply) => {
      const parsed = visitCheckInSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
      }
      const result = await checkIn(parsed.data, req.user.sub);
      return reply.code(201).send(result);
    }
  );

  app.post(
    '/:id/check-out',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const visit = await checkOut(id);
      return visit;
    }
  );
}