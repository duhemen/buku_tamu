import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function roleGuard(...allowed: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!allowed.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}