import { api } from '@/lib/api';

// ============================================================
// Types
// ============================================================
export type OfficerStatusType = 'AVAILABLE' | 'BUSY' | 'ABSENT' | 'OFFLINE';

export interface Officer {
  id: string;
  name: string;
  position: string;
  unit?: string | null;
  room?: string | null;
  phone?: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicOfficer {
  id: string;
  name: string;
  position: string;
  unit?: string | null;
  room?: string | null;
  status: OfficerStatusType;
  note?: string | null;
  returnAt?: string | null;
  confirmedAt?: string | null;
  hasConfirmedToday: boolean;
}

export interface DailyStatus {
  id: string;
  officerId: string;
  date: string;
  status: OfficerStatusType;
  note?: string | null;
  returnAt?: string | null;
  confirmedBy?: string | null;
  confirmedAt: string;
  officer?: Officer;
}

export interface CreateOfficerPayload {
  name: string;
  position: string;
  unit?: string;
  room?: string;
  phone?: string;
  order?: number;
}

export type UpdateOfficerPayload = Partial<CreateOfficerPayload> & {
  active?: boolean;
};

export interface BulkStatusPayload {
  date: string;
  statuses: Array<{
    officerId: string;
    status: OfficerStatusType;
    note?: string | null;
    returnAt?: string | null;
  }>;
}

// ============================================================
// Public
// ============================================================
export async function getPublicOfficersToday(): Promise<PublicOfficer[]> {
  return api<PublicOfficer[]>('/officers/public/today', { auth: false });
}

// ============================================================
// Admin: Officers CRUD
// ============================================================
export async function listOfficers(includeInactive = false): Promise<Officer[]> {
  const params = includeInactive ? '?includeInactive=true' : '';
  return api<Officer[]>('/officers' + params);
}

export async function createOfficer(data: CreateOfficerPayload): Promise<Officer> {
  return api<Officer>('/officers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOfficer(id: string, data: UpdateOfficerPayload): Promise<Officer> {
  return api<Officer>('/officers/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOfficer(id: string): Promise<void> {
  return api<void>('/officers/' + id, { method: 'DELETE' });
}

// ============================================================
// Admin: Daily Status
// ============================================================
export async function getDailyStatuses(date?: string): Promise<DailyStatus[]> {
  const params = date ? '?date=' + date : '';
  return api<DailyStatus[]>('/officers/daily-status' + params);
}

export async function bulkUpdateDailyStatus(data: BulkStatusPayload): Promise<{ ok: boolean; updated: number }> {
  return api<{ ok: boolean; updated: number }>('/officers/daily-status/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================
// Helper
// ============================================================
export const STATUS_LABEL: Record<OfficerStatusType, string> = {
  AVAILABLE: 'Tersedia',
  BUSY: 'Sibuk',
  ABSENT: 'Tidak Ada',
  OFFLINE: 'Belum Konfirmasi',
};

export const STATUS_COLOR: Record<OfficerStatusType, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  BUSY: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ABSENT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  OFFLINE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const STATUS_DOT_COLOR: Record<OfficerStatusType, string> = {
  AVAILABLE: 'bg-emerald-500',
  BUSY: 'bg-amber-500',
  ABSENT: 'bg-rose-500',
  OFFLINE: 'bg-slate-400',
};