import { api } from '@/lib/api';
import type {
  DashboardSummary,
  HourlyPoint,
  WeeklyPoint,
  DestinationPoint,
  PurposePoint,
  PublicVisit,
  RecentVisit,
} from '@/types';

export async function getSummary(): Promise<DashboardSummary> {
  return api<DashboardSummary>('/dashboard/summary', { auth: false });
}

export async function getHourlyChart(): Promise<HourlyPoint[]> {
  return api<HourlyPoint[]>('/dashboard/chart/hourly', { auth: false });
}

export async function getWeeklyChart(): Promise<WeeklyPoint[]> {
  return api<WeeklyPoint[]>('/dashboard/chart/weekly', { auth: false });
}

export async function getDestinationChart(): Promise<DestinationPoint[]> {
  return api<DestinationPoint[]>('/dashboard/chart/destination', { auth: false });
}

export async function getPurposeChart(): Promise<PurposePoint[]> {
  return api<PurposePoint[]>('/dashboard/chart/purpose', { auth: false });
}

export async function getPublicVisits(): Promise<PublicVisit[]> {
  return api<PublicVisit[]>('/dashboard/visits', { auth: false });
}

export async function getRecentVisits(): Promise<RecentVisit[]> {
  return api<RecentVisit[]>('/dashboard/recent', { auth: false });
}
export interface HandoverSummary {
  today: number;
  month: number;
  byType: { type: string; label: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export async function getHandoverSummary(): Promise<HandoverSummary> {
  return api<HandoverSummary>('/dashboard/handover-summary', { auth: false });
}