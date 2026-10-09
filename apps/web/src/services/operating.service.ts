import { api } from '@/lib/api';

// ============================================================
// Types
// ============================================================
export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type OperatingStatus = 'OPEN' | 'CUT_OFF' | 'BREAK' | 'CLOSED' | 'HOLIDAY' | 'OVERRIDE';

export interface SessionInfo {
  sessionNumber: number;
  openTime: string;
  cutOffTime: string;
  closeTime: string;
}

export interface OperatingSession extends SessionInfo {
  id: string;
  operatingHoursId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  id: string;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  notes?: string | null;
  sessions: OperatingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  isActive: boolean;
  notes?: string | null;
}

export interface TimeOverride {
  id: string;
  date: string;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason: string;
  createdBy?: string | null;
  createdAt: string;
}

export interface OperatingStatusResult {
  isOpen: boolean;
  status: OperatingStatus;
  reason?: string;
  nextOpenTime?: string;
  minutesUntilCutOff?: number;
  currentSession?: SessionInfo;
  todaySchedule?: {
    sessions: SessionInfo[];
    openTime?: string;
    cutOffTime?: string;
    closeTime?: string;
  };
  holidayName?: string;
  overrideReason?: string;
  now: string;
}

// ============================================================
// Public
// ============================================================
export async function getPublicOperatingStatus(): Promise<OperatingStatusResult> {
  return api<OperatingStatusResult>('/operating/public/operating-status', { auth: false });
}

// ============================================================
// Admin: Jam Operasional
// ============================================================
export async function listOperatingHours(): Promise<OperatingHours[]> {
  return api<OperatingHours[]>('/operating/hours');
}

export async function updateOperatingHours(
  day: DayOfWeek,
  data: {
    isOpen?: boolean;
    notes?: string | null;
    sessions?: SessionInfo[];
  }
): Promise<OperatingHours> {
  return api<OperatingHours>('/operating/hours/' + day, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================================
// Admin: Hari Libur
// ============================================================
export async function listHolidays(year?: number): Promise<Holiday[]> {
  const params = year ? '?year=' + year : '';
  return api<Holiday[]>('/operating/holidays' + params);
}

export async function createHoliday(data: {
  date: string;
  name: string;
  notes?: string;
}): Promise<Holiday> {
  return api<Holiday>('/operating/holidays', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteHoliday(id: string): Promise<void> {
  return api<void>('/operating/holidays/' + id, { method: 'DELETE' });
}

// ============================================================
// Admin: Override
// ============================================================
export async function listOverrides(from?: string, to?: string): Promise<TimeOverride[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return api<TimeOverride[]>('/operating/overrides' + (qs ? '?' + qs : ''));
}

export async function createOverride(data: {
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason: string;
}): Promise<TimeOverride> {
  return api<TimeOverride>('/operating/overrides', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteOverride(id: string): Promise<void> {
  return api<void>('/operating/overrides/' + id, { method: 'DELETE' });
}

// ============================================================
// Helper
// ============================================================
export const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jum\'at',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};