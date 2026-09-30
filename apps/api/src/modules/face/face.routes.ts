import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { findGuestByFaceHash, attachFaceToGuest } from './face-match.service.js';
import { authGuard } from '../../common/middleware/auth.js';

const matchSchema = z.object({
  hash: z.string().min(32).max(512),
  photo: z.string().optional(),
});

const attachSchema = z.object({
  guestId: z.string().min(1),
  photo: z.string().min(20),
  hash: z.string().min(32).max(512),
});

export async function faceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  app.post('/match', async (req, reply) => {
    const parsed = matchSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }
    const result = await findGuestByFaceHash(parsed.data.hash);
    return result;
  });

  app.post('/attach', async (req, reply) => {
    const parsed = attachSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }
    await attachFaceToGuest(
      parsed.data.guestId,
      parsed.data.photo,
      parsed.data.hash
    );
    return { ok: true };
  });
}