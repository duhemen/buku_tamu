import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@buku-tamu.local' },
    update: {},
    create: { email: 'admin@buku-tamu.local', name: 'Administrator', passwordHash, role: Role.ADMIN },
  });
  console.log('Seed OK. Login: admin@buku-tamu.local / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });