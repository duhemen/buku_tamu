import { api } from '@/lib/api';

export interface FaceGuest {
  id: string;
  fullName: string;
  company: string | null;
  nik: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface FaceMatchResult {
  matched: boolean;
  similarity: number;
  guest: FaceGuest | null;
}

export async function matchFace(hash: string, photo?: string): Promise<FaceMatchResult> {
  return api<FaceMatchResult>('/face/match', {
    method: 'POST',
    body: JSON.stringify({ hash, photo }),
  });
}

export async function attachFace(
  guestId: string,
  photo: string,
  hash: string
): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>('/face/attach', {
    method: 'POST',
    body: JSON.stringify({ guestId, photo, hash }),
  });
}