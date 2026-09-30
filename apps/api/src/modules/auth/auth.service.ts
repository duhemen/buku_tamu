import argon2 from 'argon2';
import { prisma } from '../../config/prisma.js';

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return null;
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return null;
  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}