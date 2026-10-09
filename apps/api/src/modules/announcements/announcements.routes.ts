import type { FastifyInstance } from 'fastify';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from './announcements.schema.js';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} from './announcements.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function announcementRoutes(app: FastifyInstance) {
  // ============================================================
  // PUBLIC: Agenda aktif hari ini
  // ============================================================
  app.get('/public/active', async () => {
    return getActiveAnnouncements();
  });

  // ============================================================
  // PROTECTED
  // ============================================================
  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    instance.get(
      '/',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST', 'VIEWER')] },
      async (req) => {
        const q = req.query as { includeInactive?: string; category?: string };
        return listAnnouncements(q.includeInactive === 'true', q.category);
      }
    );

    instance.post(
      '/',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const parsed = createAnnouncementSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const ann = await createAnnouncement(parsed.data);
        return reply.code(201).send(ann);
      }
    );

    instance.put(
      '/:id',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        const parsed = updateAnnouncementSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply.code(400).send({ error: 'Invalid input' });
        }
        return updateAnnouncement(id, parsed.data);
      }
    );

    instance.delete(
      '/:id',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        await deleteAnnouncement(id);
        return reply.code(204).send();
      }
    );
  });
}