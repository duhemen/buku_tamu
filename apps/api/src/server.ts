import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { guestRoutes } from './modules/guests/guests.routes.js';
import { visitRoutes } from './modules/visits/visits.routes.js';
import { queueRoutes } from './modules/queues/queues.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { tvRoutes } from './modules/dashboard/tv.routes.js';
import { verifyRoutes } from './modules/verify/verify.routes.js';
import { faceRoutes } from './modules/face/face.routes.js';
import { handoverRoutes } from './modules/handovers/handover.routes.js';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
});
await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.JWT_EXPIRES_IN },
});
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

app.get('/health', async () => ({
  status: 'ok',
  ts: Date.now(),
  env: env.NODE_ENV,
}));

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(guestRoutes, { prefix: '/api/guests' });
await app.register(visitRoutes, { prefix: '/api/visits' });
await app.register(queueRoutes, { prefix: '/api/queues' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(tvRoutes, { prefix: '/api/dashboard' });
await app.register(verifyRoutes, { prefix: '/api/verify' });
await app.register(faceRoutes, { prefix: '/api/face' });
await app.register(handoverRoutes, { prefix: '/api/handovers' });

app.setErrorHandler((error, _req, reply) => {
  app.log.error(error);
  const status = error.statusCode ?? 500;
  reply.code(status).send({
    error: error.name || 'InternalServerError',
    message: error.message,
  });
});

app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info('API ready on :' + env.PORT);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}