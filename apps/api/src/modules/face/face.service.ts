import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { decrypt } from '../../common/utils/crypto.js';

const FACE_URL = process.env.FACE_SERVICE_URL ?? 'http://localhost:8000';

function stripDataUrl(base64: string): string {
  return base64.replace(/^data:image\/\w+;base64,/, '');
}

async function postFace(endpoint: string, imageBase64: string): Promise<unknown> {
  const buf = Buffer.from(stripDataUrl(imageBase64), 'base64');
  const blob = new Blob([buf], { type: 'image/jpeg' });
  const fd = new FormData();
  fd.append('file', blob, 'capture.jpg');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(FACE_URL + endpoint, {
      method: 'POST',
      body: fd,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error('Face service HTTP ' + res.status);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export interface RecognizeResult {
  ok: boolean;
  matched: boolean;
  similarity: number;
  guestId: string | null;
  guest: {
    id: string;
    fullName: string;
    company: string | null;
    nik: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  reason?: string;
}

export async function recognizeFace(imageBase64: string): Promise<RecognizeResult> {
  try {
    const data = (await postFace('/recognize', imageBase64)) as {
      ok: boolean;
      matched: boolean;
      similarity: number;
      guestId?: string | null;
    };

    if (!data.matched || !data.guestId) {
      return {
        ok: true,
        matched: false,
        similarity: data.similarity ?? 0,
        guestId: null,
        guest: null,
      };
    }

    const guest = await prisma.guest.findUnique({ where: { id: data.guestId } });
    if (!guest) {
      return {
        ok: true,
        matched: false,
        similarity: data.similarity ?? 0,
        guestId: null,
        guest: null,
      };
    }

    return {
      ok: true,
      matched: true,
      similarity: data.similarity,
      guestId: guest.id,
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        company: guest.company,
        nik: decrypt(guest.nikEncrypted),
        phone: decrypt(guest.phoneEncrypted),
        email: decrypt(guest.emailEncrypted),
      },
    };
  } catch (e) {
    return {
      ok: false,
      matched: false,
      similarity: 0,
      guestId: null,
      guest: null,
      reason: (e as Error).message,
    };
  }
}

export async function enrollFace(imageBase64: string, guestId: string) {
  try {
    const data = (await postFace('/enroll', imageBase64)) as {
      ok: boolean;
      embedding: number[];
      quality: number;
    };
    if (!data.ok) return { ok: false, reason: 'Enroll gagal' };

    const buf = Buffer.from(new Float32Array(data.embedding).buffer);
    await prisma.faceEmbedding.create({
      data: {
        guestId,
        embedding: buf,
        modelVersion: 'v1',
        qualityScore: data.quality,
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}