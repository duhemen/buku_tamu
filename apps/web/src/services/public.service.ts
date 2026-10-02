import { api } from '@/lib/api';

// ============================================================
// Tipe
// ============================================================
export type HandoverType =
  | 'SURAT'
  | 'JAMINAN_TENDER'
  | 'PAKET'
  | 'DOKUMEN'
  | 'LAINNYA';

export interface PublicCheckInPayload {
  guest: {
    fullName: string;
    company?: string;
    address?: string;
    nik?: string;
    phone?: string;
    email?: string;
    consentAt: string;
    faceImage?: string;
    matchedGuestId?: string;
  };
  visit: {
    purpose: string;
    destination: string;
    notes?: string;
  };
  handover?: {
    type: HandoverType;
    referenceNo?: string;
    description: string;
    recipient?: string;
  } | null;
}

export interface PublicCheckInResult {
  visitId: string;
  queueNumber: string;
  receiptNumber: string;
  guestId: string;
  guestName: string;
  isReturningGuest: boolean;
  handoverCode?: string | null;
}

export interface FaceGuest {
  id: string;
  fullName: string;
  company: string | null;
  address: string | null;
  nik: string | null;
  phone: string | null;
  email: string | null;
}

export interface PublicFaceMatchResult {
  ok: boolean;
  matched: boolean;
  similarity: number;
  guestId: string | null;
  guest: FaceGuest | null;
  reason?: string;
}

// ============================================================
// Endpoint
// ============================================================

/**
 * Check-in tamu (publik, tanpa auth).
 * Gabungan: create guest + visit + queue + handover.
 */
export async function publicCheckIn(
  payload: PublicCheckInPayload
): Promise<PublicCheckInResult> {
  return api<PublicCheckInResult>('/public/check-in', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

/**
 * Face match untuk auto-fill tamu lama.
 */
export async function publicFaceMatch(
  image: string
): Promise<PublicFaceMatchResult> {
  return api<PublicFaceMatchResult>('/public/face/match', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ image }),
  });
}