import type { FastifyInstance } from 'fastify';
import {
  updateHoursSchema,
  createHolidaySchema,
  createOverrideSchema,
  dayOfWeekEnum,
} from './operating.schema.js';
import {
  getOperatingStatus,
  listOperatingHours,
  updateOperatingHours,
  listHolidays,
  createHoliday,
  deleteHoliday,
  createOverride,
  listOverrides,
  deleteOverride,
} from './operating.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

export async function operatingRoutes(app: FastifyInstance) {
  // ============================================================
  // PUBLIC: Cek status operasional sekarang (untuk kiosk)
  // ============================================================
  app.get('/public/operating-status', async () => {
    return getOperatingStatus();
  });

  // ============================================================
  // PROTECTED: Semua endpoint di bawah butuh auth admin
  // ============================================================
  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    // List jam operasional
    instance.get(
      '/hours',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST', 'VIEWER')] },
      async () => listOperatingHours()
    );

    // Update jam per hari
    instance.put(
      '/hours/:day',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { day } = req.params as { day: string };
        const parsedDay = dayOfWeekEnum.safeParse(day.toUpperCase());
        if (!parsedDay.success) {
          return reply.code(400).send({ error: 'Hari tidak valid' });
        }
        const parsed = updateHoursSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        return updateOperatingHours(parsedDay.data, parsed.data);
      }
    );

    // List hari libur
    instance.get(
      '/holidays',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST', 'VIEWER')] },
      async (req) => {
        const q = req.query as { year?: string };
        const year = q.year ? parseInt(q.year, 10) : undefined;
        return listHolidays(year);
      }
    );

    // Tambah hari libur
    instance.post(
      '/holidays',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const parsed = createHolidaySchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        try {
          const result = await createHoliday(parsed.data);
          return reply.code(201).send(result);
        } catch (e) {
          return reply.code(400).send({ error: (e as Error).message });
        }
      }
    );

    // Hapus hari libur
    instance.delete(
      '/holidays/:id',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        await deleteHoliday(id);
        return reply.code(204).send();
      }
    );

    // List override
    instance.get(
      '/overrides',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req) => {
        const q = req.query as { from?: string; to?: string };
        return listOverrides(q.from, q.to);
      }
    );

    // Buat override
    instance.post(
      '/overrides',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const parsed = createOverrideSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const user = req.user as { sub: string };
        const result = await createOverride({
          ...parsed.data,
          createdBy: user.sub,
        });
        return reply.code(201).send(result);
      }
    );

    // Hapus override
    instance.delete(
      '/overrides/:id',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        await deleteOverride(id);
        return reply.code(204).send();
      }
    );
  });
}