import type { FastifyInstance } from 'fastify';
import { publicCheckInSchema, publicFaceMatchSchema } from './public.schema.js';
import {
  publicCheckIn,
  publicFaceMatch,
  OperatingClosedError,
} from './public.service.js';

/**
 * Endpoint PUBLIK (tanpa auth).
 * Dilindungi oleh rate limiting ketat.
 * Untuk kiosk tamu, tidak boleh mengakses data.
 */
export async function publicRoutes(app: FastifyInstance) {
  app.post(
    '/check-in',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (req, reply) => {
      const parsed = publicCheckInSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'INVALID_INPUT',
          message: 'Data tidak lengkap atau tidak valid',
          details: parsed.error.flatten(),
        });
      }

      try {
        const result = await publicCheckIn(parsed.data);
        return reply.code(201).send(result);
      } catch (e) {
        // Tangani khusus error jam operasional
        if (e instanceof OperatingClosedError) {
          return reply.code(403).send({
            error: 'OPERATING_CLOSED',
            status: e.status,
            message: e.message,
            nextOpenTime: e.nextOpenTime,
          });
        }
        app.log.error(e);
        return reply.code(500).send({
          error: 'CHECKIN_FAILED',
          message: (e as Error).message,
        });
      }
    }
  );

  app.post(
    '/face/match',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute',
        },
      },
    },
    async (req, reply) => {
      const parsed = publicFaceMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'INVALID_INPUT' });
      }
      try {
        return await publicFaceMatch(parsed.data.image);
      } catch (e) {
        app.log.error(e);
        return reply.code(500).send({
          error: 'FACE_MATCH_FAILED',
          message: (e as Error).message,
        });
      }
    }
  );
}