import { prisma } from '../../config/prisma.js';

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Math.max(a.length, b.length) * 4;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    let bits = x;
    while (bits) {
      dist += bits & 1;
      bits >>= 1;
    }
  }
  return dist;
}

export interface FaceMatchResult {
  matched: boolean;
  similarity: number;
  guest: {
    id: string;
    fullName: string;
    company: string | null;
    nik: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
}

export async function findGuestByFaceHash(
  hash: string,
  threshold = 0.85
): Promise<FaceMatchResult> {
  const guests = await prisma.guest.findMany({
    where: { faceHash: { not: null } },
    select: {
      id: true,
      fullName: true,
      company: true,
      address: true,
      nikEncrypted: true,
      phoneEncrypted: true,
      emailEncrypted: true,
      faceHash: true,
    },
  });

  if (guests.length === 0) {
    return { matched: false, similarity: 0, guest: null };
  }

  let best: { guest: typeof guests[0]; sim: number } | null = null;
  const maxBits = hash.length * 4;

  for (const g of guests) {
    if (!g.faceHash) continue;
    const dist = hammingDistance(hash, g.faceHash);
    const sim = 1 - dist / maxBits;
    if (!best || sim > best.sim) {
      best = { guest: g, sim };
    }
  }

  if (best && best.sim >= threshold) {
    const { decrypt } = await import('../../common/utils/crypto.js');
    return {
      matched: true,
      similarity: Math.round(best.sim * 100) / 100,
      guest: {
        id: best.guest.id,
        fullName: best.guest.fullName,
        company: best.guest.company,
        address: best.guest.address,
        nik: decrypt(best.guest.nikEncrypted),
        phone: decrypt(best.guest.phoneEncrypted),
        email: decrypt(best.guest.emailEncrypted),
      },
    };
  }

  return {
    matched: false,
    similarity: best ? Math.round(best.sim * 100) / 100 : 0,
    guest: null,
  };
}

export async function attachFaceToGuest(
  guestId: string,
  photo: string,
  hash: string
): Promise<void> {
  await prisma.guest.update({
    where: { id: guestId },
    data: { facePhoto: photo, faceHash: hash },
  });
}