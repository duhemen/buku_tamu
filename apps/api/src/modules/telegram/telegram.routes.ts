import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  sendTelegramMessage,
  testTelegramConnection,
  notifyGuestArrival,
} from './telegram.service.js';
import { authGuard, roleGuard } from '../../common/middleware/auth.js';

const testMessageSchema = z.object({
  chatId: z.string().min(1),
  text: z.string().min(1).max(4000),
});

const guestNotifySchema = z.object({
  chatId: z.string().min(1),
  guestName: z.string().min(1),
  guestCompany: z.string().optional().nullable(),
  purpose: z.string().min(1),
  destination: z.string().min(1),
  queueNumber: z.string().min(1),
  hasHandover: z.boolean().optional(),
  handoverType: z.string().optional().nullable(),
});

export async function telegramRoutes(app: FastifyInstance) {
  // ============================================================
  // PUBLIC: Health check telegram bot
  // ============================================================
  app.get('/health', async () => {
    return testTelegramConnection();
  });

  // ============================================================
  // PROTECTED: Semua endpoint di bawah butuh auth admin
  // ============================================================
  app.register(async (instance) => {
    instance.addHook('preHandler', authGuard);

    // Test connection (admin only)
    instance.get(
      '/test-connection',
      { preHandler: [roleGuard('ADMIN')] },
      async () => {
        return testTelegramConnection();
      }
    );

    // Send test message
    instance.post(
      '/test-message',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const parsed = testMessageSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const result = await sendTelegramMessage(
          parsed.data.chatId,
          parsed.data.text
        );
        return reply.code(result.ok ? 200 : 500).send(result);
      }
    );

    // Test notif tamu
    instance.post(
      '/test-guest-notify',
      { preHandler: [roleGuard('ADMIN')] },
      async (req, reply) => {
        const parsed = guestNotifySchema.safeParse(req.body);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const result = await notifyGuestArrival(parsed.data);
        return reply.code(result.ok ? 200 : 500).send(result);
      }
    );
  });
}