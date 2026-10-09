import { api } from '@/lib/api';

// ============================================================
// Types
// ============================================================
export type AnnouncementCategory =
  | 'LELANG'
  | 'PEMBUKTIAN'
  | 'RAPAT'
  | 'PENGUMUMAN'
  | 'LAINNYA';

export interface Announcement {
  id: string;
  title: string;
  description?: string | null;
  category?: AnnouncementCategory | null;
  referenceNo?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveAnnouncement {
  id: string;
  title: string;
  description?: string | null;
  category?: AnnouncementCategory | null;
  referenceNo?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  priority: number;
  isMultiDay: boolean;
  isToday: boolean;
  isEndingToday: boolean;
}

export interface CreateAnnouncementPayload {
  title: string;
  description?: string;
  category?: AnnouncementCategory;
  referenceNo?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  priority?: number;
  isActive?: boolean;
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;

// ============================================================
// Public
// ============================================================
export async function getActiveAnnouncements(): Promise<ActiveAnnouncement[]> {
  return api<ActiveAnnouncement[]>('/announcements/public/active', { auth: false });
}

// ============================================================
// Admin
// ============================================================
export async function listAnnouncements(
  includeInactive = false,
  category?: string
): Promise<Announcement[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.set('includeInactive', 'true');
  if (category) params.set('category', category);
  const qs = params.toString();
  return api<Announcement[]>('/announcements' + (qs ? '?' + qs : ''));
}

export async function createAnnouncement(
  data: CreateAnnouncementPayload
): Promise<Announcement> {
  return api<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementPayload
): Promise<Announcement> {
  return api<Announcement>('/announcements/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  return api<void>('/announcements/' + id, { method: 'DELETE' });
}

// ============================================================
// Helper
// ============================================================
export const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  LELANG: 'Lelang',
  PEMBUKTIAN: 'Pembuktian',
  RAPAT: 'Rapat',
  PENGUMUMAN: 'Pengumuman',
  LAINNYA: 'Lainnya',
};

export const CATEGORY_COLOR: Record<AnnouncementCategory, string> = {
  LELANG: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-700',
  PEMBUKTIAN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  RAPAT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  PENGUMUMAN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  LAINNYA: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};