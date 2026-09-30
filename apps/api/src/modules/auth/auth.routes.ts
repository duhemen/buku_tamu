import type { FastifyInstance } from 'fastify';
import { loginSchema } from './auth.schema.js';
import { verifyLogin, getUserById } from './auth.service.js';
import { authGuard } from '../../common/middleware/auth.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const user = await verifyLogin(email, password);
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = await reply.jwtSign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  });

  app.get('/me', { preHandler: [authGuard] }, async (req, reply) => {
    const user = await getUserById(req.user.sub);
    if (!user) return reply.code(404).send({ error: 'Not found' });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  });
}