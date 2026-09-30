import { api } from '@/lib/api';
import type { Visit, Paginated } from '@/types';

export interface CheckInLetterPayload {
  letterNumber?: string;
  subject: string;
  sender?: string;
  recipient?: string;
}

export interface CheckInPayload {
  guestId: string;
  purpose: string;
  destination: string;
  notes?: string;
  letter?: CheckInLetterPayload;
}

export interface CheckInResult {
  visit: Visit;
  queue: { id: string; number: string; status: string };
  receipt: { id: string; receiptNumber: string };
}

export async function checkIn(payload: CheckInPayload): Promise<CheckInResult> {
  return api<CheckInResult>('/visits/check-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getVisit(id: string): Promise<Visit> {
  return api<Visit>('/visits/' + id);
}

export async function listVisits(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Visit>> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  const qs = q.toString();
  return api<Paginated<Visit>>('/visits' + (qs ? '?' + qs : ''));
}

export async function checkOut(visitId: string): Promise<Visit> {
  return api<Visit>('/visits/' + visitId + '/check-out', { method: 'POST' });
}