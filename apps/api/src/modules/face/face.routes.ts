import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  recognizeFace,
  enrollFace,
  faceServiceHealth,
} from './face.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

const recognizeSchema = z.object({
  image: z.string().min(50, 'Image terlalu pendek'),
});

const enrollSchema = z.object({
  image: z.string().min(50, 'Image terlalu pendek'),
  guestId: z.string().min(1),
});

export async function faceRoutes(app: FastifyInstance) {
  // Public: health check face service
  app.get('/health', async () => {
    return faceServiceHealth();
  });

  // Protected: enroll + recognize
  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    instance.post(
      '/recognize',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const parsed = recognizeSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        return recognizeFace(parsed.data.image);
      }
    );

    instance.post(
      '/enroll',
      { preHandler: [roleGuard('ADMIN', 'RECEPTIONIST')] },
      async (req, reply) => {
        const parsed = enrollSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        return enrollFace(parsed.data.image, parsed.data.guestId);
      }
    );
  });
}