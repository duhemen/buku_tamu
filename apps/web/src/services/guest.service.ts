import { api } from '@/lib/api';
import type { Guest, Paginated } from '@/types';

export interface CreateGuestPayload {
  fullName: string;
  company?: string;
  address?: string;
  nik?: string;
  phone?: string;
  email?: string;
  consentAt?: string;
  faceImage?: string;
}

export type UpdateGuestPayload = Partial<CreateGuestPayload>;

export async function createGuest(payload: CreateGuestPayload): Promise<Guest> {
  return api<Guest>('/guests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listGuests(
  q?: string,
  page = 1,
  pageSize = 20
): Promise<Paginated<Guest>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) params.set('q', q);
  return api<Paginated<Guest>>('/guests?' + params.toString());
}

export async function getGuest(id: string): Promise<Guest> {
  return api<Guest>('/guests/' + id);
}

export async function updateGuest(id: string, payload: UpdateGuestPayload): Promise<Guest> {
  return api<Guest>('/guests/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGuest(id: string): Promise<void> {
  return api<void>('/guests/' + id, { method: 'DELETE' });
}