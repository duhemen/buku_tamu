import { api } from '@/lib/api';

export interface FaceGuest {
  id: string;
  fullName: string;
  company: string | null;
  address: string | null;
  nik: string | null;
  phone: string | null;
  email: string | null;
}

export interface FaceMatchResult {
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

/**
 * Recognize wajah via InsightFace (Python service di backend).
 * Kirim foto base64, terima guest yang match.
 */
export async function matchFace(
  _hash: string, // diabaikan (kompatibilitas interface lama)
  image?: string
): Promise<FaceMatchResult> {
  if (!image) {
    return {
      ok: false,
      matched: false,
      similarity: 0,
      guestId: null,
      guest: null,
      reason: 'Foto tidak tersedia',
    };
  }

  return api<FaceMatchResult>('/face/recognize', {
    method: 'POST',
    body: JSON.stringify({ image }),
  });
}

/**
 * Enroll wajah ke guest tertentu.
 * Biasanya dipanggil dari backend (auto-enroll), tapi bisa juga manual.
 */
export async function enrollFaceForGuest(
  guestId: string,
  image: string
): Promise<EnrollResult> {
  return api<EnrollResult>('/face/enroll', {
    method: 'POST',
    body: JSON.stringify({ image, guestId }),
  });
}

/**
 * Alias untuk kompatibilitas dengan KioskPage lama.
 * Update embedding tamu lama dengan foto baru.
 */
export async function attachFace(
  guestId: string,
  image: string
): Promise<EnrollResult> {
  return enrollFaceForGuest(guestId, image);
}