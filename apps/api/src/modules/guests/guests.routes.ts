import type { FastifyInstance } from 'fastify';
import { guestCreateSchema, guestUpdateSchema, guestListQuerySchema } from './guests.schema.js';
import {
  listGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} from './guests.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function guestRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.get('/', async (req, reply) => {
    const parsed = guestListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    return listGuests(parsed.data);
  });

  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const g = await getGuestById(id);
    if (!g) return reply.code(404).send({ error: 'Not found' });
    return g;
  });

  app.post(
    '/',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req, reply) => {
      const parsed = guestCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
      }
      const g = await createGuest(parsed.data);
      return reply.code(201).send(g);
    }
  );

  app.put(
    '/:id',
    { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parsed = guestUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
      }
      const g = await updateGuest(id, parsed.data);
      return g;
    }
  );

  app.delete(
    '/:id',
    { preHandler: [roleGuard('ADMIN')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await deleteGuest(id);
      return reply.code(204).send();
    }
  );
}