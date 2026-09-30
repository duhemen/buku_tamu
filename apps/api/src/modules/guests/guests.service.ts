import type { Guest } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { encrypt, decrypt } from '../../common/utils/crypto.js';
import { maskNik, maskPhone, maskEmail } from '../../common/utils/masking.js';
import type {
  GuestCreateInput,
  GuestUpdateInput,
  GuestListQuery,
} from './guests.schema.js';

export function toInternal(g: Guest) {
  return {
    id: g.id,
    fullName: g.fullName,
    company: g.company,
    address: g.address,
    nik: decrypt(g.nikEncrypted),
    phone: decrypt(g.phoneEncrypted),
    email: decrypt(g.emailEncrypted),
    consentAt: g.consentAt,
    hasFace: Boolean(g.faceHash),
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

export function toPublic(g: Guest) {
  return {
    id: g.id,
    fullName: g.fullName,
    company: g.company,
    nik: maskNik(decrypt(g.nikEncrypted)),
    phone: maskPhone(decrypt(g.phoneEncrypted)),
    email: maskEmail(decrypt(g.emailEncrypted)),
    createdAt: g.createdAt,
  };
}

export async function listGuests(q: GuestListQuery) {
  const where = q.q
    ? {
        OR: [
          { fullName: { contains: q.q, mode: 'insensitive' as const } },
          { company: { contains: q.q, mode: 'insensitive' as const } },
        ],
      }
    : {};
  const skip = (q.page - 1) * q.pageSize;
  const [items, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      skip,
      take: q.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guest.count({ where }),
  ]);
  return {
    items: items.map(toInternal),
    total,
    page: q.page,
    pageSize: q.pageSize,
  };
}

export async function getGuestById(id: string) {
  const g = await prisma.guest.findUnique({ where: { id } });
  return g ? toInternal(g) : null;
}

export async function createGuest(data: GuestCreateInput) {
  const g = await prisma.guest.create({
    data: {
      fullName: data.fullName,
      company: data.company ?? null,
      address: data.address ?? null,
      nikEncrypted: encrypt(data.nik ?? null),
      phoneEncrypted: encrypt(data.phone ?? null),
      emailEncrypted: encrypt(data.email ?? null),
      consentAt: data.consentAt ? new Date(data.consentAt) : null,
      facePhoto: data.facePhoto ?? null,
      faceHash: data.faceHash ?? null,
    },
  });
  return toInternal(g);
}

export async function updateGuest(id: string, data: GuestUpdateInput) {
  const payload: Record<string, unknown> = {};
  if (data.fullName !== undefined) payload.fullName = data.fullName;
  if (data.company !== undefined) payload.company = data.company;
  if (data.address !== undefined) payload.address = data.address;
  if (data.nik !== undefined) payload.nikEncrypted = encrypt(data.nik);
  if (data.phone !== undefined) payload.phoneEncrypted = encrypt(data.phone);
  if (data.email !== undefined) payload.emailEncrypted = encrypt(data.email);
  if (data.consentAt !== undefined) {
    payload.consentAt = data.consentAt ? new Date(data.consentAt) : null;
  }
  if (data.facePhoto !== undefined) payload.facePhoto = data.facePhoto;
  if (data.faceHash !== undefined) payload.faceHash = data.faceHash;

  const g = await prisma.guest.update({ where: { id }, data: payload });
  return toInternal(g);
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } });
  return { ok: true };
}