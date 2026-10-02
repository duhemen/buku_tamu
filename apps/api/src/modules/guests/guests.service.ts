import type { Guest } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { encrypt, decrypt } from '../../common/utils/crypto.js';
import { maskNik, maskPhone, maskEmail } from '../../common/utils/masking.js';
import { enrollFace } from '../face/face.service.js';
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
  // 1. Simpan data tamu ke DB (tanpa face)
  const g = await prisma.guest.create({
    data: {
      fullName: data.fullName,
      company: data.company ?? null,
      address: data.address ?? null,
      nikEncrypted: encrypt(data.nik ?? null),
      phoneEncrypted: encrypt(data.phone ?? null),
      emailEncrypted: encrypt(data.email ?? null),
      consentAt: data.consentAt ? new Date(data.consentAt) : null,
    },
  });

  // 2. Kalau ada foto, enroll otomatis (async, tidak blocking response)
  if (data.faceImage && data.consentAt) {
    try {
      const result = await enrollFace(data.faceImage, g.id);
      if (!result.ok) {
        // Log warning tapi tidak gagalkan create guest
        console.warn(
          `[auto-enroll] Gagal enroll guest ${g.id}: ${result.reason}`
        );
      } else {
        console.log(
          `[auto-enroll] Guest ${g.id} enrolled: ${result.embeddingLength} dims, quality ${result.quality}`
        );
      }
    } catch (e) {
      console.error('[auto-enroll] Error:', e);
    }
  }

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

  const g = await prisma.guest.update({ where: { id }, data: payload });

  // Kalau ada foto baru, re-enroll (update embedding)
  if (data.faceImage) {
    try {
      const result = await enrollFace(data.faceImage, id);
      if (!result.ok) {
        console.warn(`[auto-enroll] Re-enroll guest ${id} gagal: ${result.reason}`);
      }
    } catch (e) {
      console.error('[auto-enroll] Error:', e);
    }
  }

  return toInternal(g);
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } });
  return { ok: true };
}