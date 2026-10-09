import type { FastifyInstance } from 'fastify';
import {
  createOfficerSchema,
  updateOfficerSchema,
  bulkDailyStatusSchema,
} from './officers.schema.js';
import {
  listOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
  getDailyStatuses,
  bulkUpdateDailyStatus,
  getPublicOfficerStatus,
} from './officers.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function officerRoutes(app: FastifyInstance) {
  // ============================================================
  // PUBLIC: Status petugas hari ini
  // ============================================================
  app.get('/public/today', async () => {
    return getPublicOfficerStatus();
  });

  // ============================================================
  // PROTECTED: Semua endpoint di bawah butuh auth
  // ============================================================
  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    // List petugas
    instance.get(
      '/',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST', 'VIEWER')] },
      async (req) => {
        const q = req.query as { includeInactive?: string };
        return listOfficers(q.includeInactive === 'true');
      }
    );

    // Tambah petugas
    instance.post(
      '/',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const parsed = createOfficerSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const officer = await createOfficer(parsed.data);
        return reply.code(201).send(officer);
      }
    );

    // Update petugas
    instance.put(
      '/:id',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        const parsed = updateOfficerSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply.code(400).send({ error: 'Invalid input' });
        }
        return updateOfficer(id, parsed.data);
      }
    );

    // Hapus petugas
    instance.delete(
      '/:id',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        await deleteOfficer(id);
        return reply.code(204).send();
      }
    );

    // Get daily status
    instance.get(
      '/daily-status',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req) => {
        const q = req.query as { date?: string };
        return getDailyStatuses(q.date);
      }
    );

    // Bulk update daily status
    instance.post(
      '/daily-status/bulk',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const parsed = bulkDailyStatusSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const user = req.user as { sub: string };
        return bulkUpdateDailyStatus(parsed.data, user.sub);
      }
    );
  });
}