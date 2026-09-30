import { api } from '@/lib/api';

export type HandoverType =
  | 'SURAT'
  | 'JAMINAN_TENDER'
  | 'PAKET'
  | 'DOKUMEN'
  | 'LAINNYA';

export type HandoverStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'RETURNED';

export interface Handover {
  id: string;
  visitId: string;
  code: string;
  type: HandoverType;
  referenceNo?: string | null;
  description: string;
  recipient?: string | null;
  status: HandoverStatus;
  receivedAt: string;
  completedAt?: string | null;
  notes?: string | null;
  visit?: {
    id: string;
    guest: { fullName: string; company?: string | null };
    queue?: { number: string } | null;
  };
}

export interface HandoverCreatePayload {
  visitId: string;
  type: HandoverType;
  referenceNo?: string;
  description: string;
  recipient?: string;
  notes?: string;
}

export interface HandoverStats {
  total: number;
  today: number;
  byType: { type: HandoverType; count: number }[];
  byStatus: { status: HandoverStatus; count: number }[];
}

export async function createHandover(payload: HandoverCreatePayload): Promise<Handover> {
  return api<Handover>('/handovers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getHandoverByCode(code: string): Promise<Handover> {
  return api<Handover>('/handovers/public/' + encodeURIComponent(code), { auth: false });
}

export async function getHandoverStats(): Promise<HandoverStats> {
  return api<HandoverStats>('/handovers/public/stats', { auth: false });
}

export async function listHandovers(params?: {
  status?: string;
  limit?: number;
}): Promise<Handover[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return api<Handover[]>('/handovers' + (qs ? '?' + qs : ''));
}

export async function updateHandoverStatus(
  id: string,
  status: HandoverStatus,
  notes?: string
): Promise<Handover> {
  return api<Handover>('/handovers/' + id, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
}