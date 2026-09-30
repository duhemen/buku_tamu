export type Role = 'ADMIN' | 'RECEPTIONIST' | 'SECURITY' | 'VIEWER';
export type VisitStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
export type QueueStatus = 'WAITING' | 'CALLED' | 'SERVED' | 'SKIPPED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Guest {
  id: string;
  fullName: string;
  company?: string | null;
  address?: string | null;
  nik?: string | null;
  phone?: string | null;
  email?: string | null;
  consentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Queue {
  id: string;
  visitId: string;
  number: string;
  date: string;
  status: QueueStatus;
  calledAt?: string | null;
  counter?: string | null;
}

export interface Letter {
  id: string;
  visitId: string;
  letterNumber?: string | null;
  subject: string;
  sender?: string | null;
  recipient?: string | null;
  fileUrl?: string | null;
}

export interface Receipt {
  id: string;
  visitId: string;
  receiptNumber: string;
  printedAt?: string | null;
  digitalUrl?: string | null;
}

export interface Visit {
  id: string;
  guestId: string;
  officerId?: string | null;
  purpose: string;
  destination: string;
  notes?: string | null;
  status: VisitStatus;
  checkInAt: string;
  checkOutAt?: string | null;
  guest?: Guest;
  queue?: Queue | null;
  letters?: Letter[];
  receipt?: Receipt | null;
}

export interface DashboardSummary {
  today: number;
  week: number;
  month: number;
  year: number;
  waiting: number;
  inProgress: number;
  done: number;
  inside: number;
  canceled: number;
}

export interface HourlyPoint {
  hour: string;
  count: number;
}

export interface WeeklyPoint {
  day: string;
  label: string;
  count: number;
}

export interface DestinationPoint {
  destination: string;
  count: number;
}

export interface PurposePoint {
  purpose: string;
  count: number;
}

export interface PublicVisit {
  id: string;
  queueNumber: string;
  guestName: string;
  company?: string | null;
  nik: string;
  phone: string;
  email: string;
  destination: string;
  purpose: string;
  letterSubject?: string | null;
  status: VisitStatus;
  checkInAt: string;
  checkOutAt?: string | null;
}

export interface RecentVisit {
  id: string;
  queueNumber: string;
  guestName: string;
  company?: string | null;
  destination: string;
  status: VisitStatus;
  checkInAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
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
}