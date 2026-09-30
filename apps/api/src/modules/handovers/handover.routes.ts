import type { FastifyInstance } from 'fastify';
import {
  handoverCreateSchema,
  handoverUpdateSchema,
} from './handover.schema.js';
import {
  createHandover,
  listHandovers,
  getHandoverByCode,
  updateHandover,
  handoverStats,
} from './handover.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function handoverRoutes(app: FastifyInstance) {
  app.get('/public/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const h = await getHandoverByCode(code);
    if (!h) return reply.code(404).send({ error: 'Kode tidak ditemukan' });
    return h;
  });

  app.get('/public/stats', async () => {
    return handoverStats();
  });

  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    instance.get('/', async (req) => {
      const q = req.query as {
        status?: string;
        from?: string;
        to?: string;
        limit?: string;
      };
      return listHandovers({
        status: q.status,
        from: q.from,
        to: q.to,
        limit: q.limit ? parseInt(q.limit, 10) : 100,
      });
    });

    instance.get('/:code', async (req, reply) => {
      const { code } = req.params as { code: string };
      const h = await getHandoverByCode(code);
      if (!h) return reply.code(404).send({ error: 'Not found' });
      return h;
    });

    instance.post(
      '/',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const parsed = handoverCreateSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const h = await createHandover(parsed.data);
        return reply.code(201).send(h);
      }
    );

    instance.put(
      '/:id',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        const parsed = handoverUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply.code(400).send({ error: 'Invalid input' });
        }
        return updateHandover(id, parsed.data);
      }
    );
  });
}