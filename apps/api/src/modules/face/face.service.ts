import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { decrypt } from '../../common/utils/crypto.js';

const FACE_URL = process.env.FACE_SERVICE_URL ?? 'http://localhost:8000';
const FACE_THRESHOLD = parseFloat(process.env.FACE_THRESHOLD ?? '0.5');
const TIMEOUT_MS = 15000;

// ============================================================
// Tipe
// ============================================================
export interface FaceGuest {
  id: string;
  fullName: string;
  company: string | null;
  address: string | null;
  nik: string | null;
  phone: string | null;
  email: string | null;
}

export interface RecognizeResult {
  ok: boolean;
  matched: boolean;
  similarity: number;
  guestId: string | null;
  guest: FaceGuest | null;
  reason?: string;
}

export interface EnrollResult {
  ok: boolean;
  embeddingLength?: number;
  quality?: number;
  reason?: string;
}

// ============================================================
// Helper
// ============================================================
function stripDataUrl(base64: string): string {
  return base64.replace(/^data:image\/\w+;base64,/, '');
}

async function postFace(path: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(FACE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error('Face service HTTP ' + res.status + ': ' + text.slice(0, 200));
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getFace(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(FACE_URL + path, { signal: controller.signal });
    if (!res.ok) throw new Error('Face service HTTP ' + res.status);
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// Konversi embedding float32 array <-> Buffer
// ============================================================
function bufferToEmbedding(buf: Buffer): number[] {
  // Buffer -> Float32Array -> array biasa
  const arr = new Float32Array(
    buf.buffer,
    buf.byteOffset,
    buf.byteLength / Float32Array.BYTES_PER_ELEMENT
  );
  return Array.from(arr);
}

function embeddingToBuffer(embedding: number[]): Buffer {
  const f32 = new Float32Array(embedding);
  return Buffer.from(f32.buffer);
}

// ============================================================
// Health check
// ============================================================
export async function faceServiceHealth(): Promise<{
  ok: boolean;
  modelReady: boolean;
  modelName?: string;
  reason?: string;
}> {
  try {
    const data = (await getFace('/health')) as {
      status: string;
      model_ready: boolean;
      model_name: string;
    };
    return {
      ok: data.status === 'ok',
      modelReady: data.model_ready,
      modelName: data.model_name,
    };
  } catch (e) {
    return {
      ok: false,
      modelReady: false,
      reason: (e as Error).message,
    };
  }
}

// ============================================================
// Enroll: extract embedding dari foto -> simpan ke DB
// ============================================================
export async function enrollFace(
  imageBase64: string,
  guestId: string
): Promise<EnrollResult> {
  try {
    // 1. Kirim foto ke Python untuk extract embedding
    const data = (await postFace('/enroll-base64', { image: imageBase64 })) as {
      ok: boolean;
      embedding?: number[];
      quality?: number;
      error?: string;
    };

    if (!data.ok || !data.embedding) {
      return { ok: false, reason: data.error ?? 'Wajah tidak terdeteksi' };
    }

    // 2. Konversi embedding ke Buffer (Bytes)
    const buffer = embeddingToBuffer(data.embedding);

    // 3. Cek apakah guest sudah punya embedding
    const existing = await prisma.faceEmbedding.findFirst({
      where: { guestId },
    });

    if (existing) {
      // Update embedding yang ada
      await prisma.faceEmbedding.update({
        where: { id: existing.id },
        data: {
          embedding: buffer,
          qualityScore: data.quality ?? null,
          modelVersion: 'buffalo_l-v1',
        },
      });
    } else {
      // Buat embedding baru
      await prisma.faceEmbedding.create({
        data: {
          guestId,
          embedding: buffer,
          qualityScore: data.quality ?? null,
          modelVersion: 'buffalo_l-v1',
        },
      });
    }

    return {
      ok: true,
      embeddingLength: data.embedding.length,
      quality: data.quality,
    };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

// ============================================================
// Recognize: cari guest dengan kemiripan tertinggi
// ============================================================
export async function recognizeFace(imageBase64: string): Promise<RecognizeResult> {
  try {
    // 1. Ambil semua embedding dari DB
    const allEmbeddings = await prisma.faceEmbedding.findMany({
      select: {
        guestId: true,
        embedding: true,
      },
    });

    if (allEmbeddings.length === 0) {
      return {
        ok: true,
        matched: false,
        similarity: 0,
        guestId: null,
        guest: null,
      };
    }

    // 2. Konversi ke format kandidat
    const candidates = allEmbeddings.map((e) => ({
      guestId: e.guestId,
      embedding: bufferToEmbedding(e.embedding),
    }));

    // 3. Kirim ke Python
    const data = (await postFace('/recognize', {
      image: imageBase64,
      candidates,
    })) as {
      ok: boolean;
      matched: boolean;
      similarity: number;
      guestId?: string | null;
      error?: string;
    };

    if (!data.ok) {
      return {
        ok: false,
        matched: false,
        similarity: 0,
        guestId: null,
        guest: null,
        reason: data.error,
      };
    }

    if (!data.matched || !data.guestId) {
      return {
        ok: true,
        matched: false,
        similarity: data.similarity,
        guestId: null,
        guest: null,
      };
    }

    // 4. Ambil data guest dari DB
    const guest = await prisma.guest.findUnique({
      where: { id: data.guestId },
    });

    if (!guest) {
      return {
        ok: true,
        matched: false,
        similarity: data.similarity,
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
        address: guest.address,
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