import type { FastifyInstance } from 'fastify';
import { publicCheckInSchema, publicFaceMatchSchema } from './public.schema.js';
import { publicCheckIn, publicFaceMatch } from './public.service.js';

/**
 * Endpoint PUBLIK (tanpa auth).
 * Dilindungi oleh rate limiting ketat.
 * Untuk kiosk tamu, tidak boleh mengakses data.
 */
export async function publicRoutes(app: FastifyInstance) {
  // Check-in tamu (create guest + visit + queue + handover)
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
          error: 'Invalid input',
          details: parsed.error.flatten(),
        });
      }
      try {
        const result = await publicCheckIn(parsed.data);
        return reply.code(201).send(result);
      } catch (e) {
        app.log.error(e);
        return reply.code(500).send({
          error: 'Check-in gagal',
          message: (e as Error).message,
        });
      }
    }
  );

  // Face match untuk auto-fill tamu lama
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
        return reply.code(400).send({ error: 'Invalid input' });
      }
      try {
        return await publicFaceMatch(parsed.data.image);
      } catch (e) {
        app.log.error(e);
        return reply.code(500).send({
          error: 'Face match gagal',
          message: (e as Error).message,
        });
      }
    }
  );
}