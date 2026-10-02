import { api } from '@/lib/api';

export interface ReportPeriod {
  year: number;
  month: number;
  label: string;
}

export interface ReportSummary {
  totalVisits: number;
  uniqueGuests: number;
  totalHandovers: number;
  byStatus: {
    WAITING: number;
    IN_PROGRESS: number;
    DONE: number;
    CANCELED: number;
  };
  busiestDay: { day: string; label: string; count: number };
}

export interface ReportByDay {
  day: string;
  label: string;
  count: number;
}

export interface ReportByDestination {
  destination: string;
  count: number;
}

export interface ReportHandoverStat {
  type: string;
  label: string;
  count: number;
}

export interface ReportRow {
  id: string;
  date: string;
  queueNumber: string;
  guestName: string;
  company?: string | null;
  nik: string;
  phone: string;
  email: string;
  destination: string;
  purpose: string;
  letterSubject?: string | null;
  status: string;
  checkOutAt?: string | null;
}

export interface MonthlyReport {
  period: ReportPeriod;
  summary: ReportSummary;
  byDay: ReportByDay[];
  byDestination: ReportByDestination[];
  handoverStats: ReportHandoverStat[];
  rows: ReportRow[];
  generatedAt: string;
}

export async function getMonthlyReport(
  year: number,
  month: number
): Promise<MonthlyReport> {
  return api<MonthlyReport>(
    '/reports/monthly?year=' + year + '&month=' + month
  );
}