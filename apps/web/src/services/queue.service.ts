import { api } from '@/lib/api';
import type { Queue, Visit } from '@/types';

export interface QueueWithVisit extends Queue {
  visit: Visit & { guest?: { fullName: string; company?: string | null } };
}

export async function listTodayQueues(): Promise<QueueWithVisit[]> {
  return api<QueueWithVisit[]>('/queues/today');
}

export async function getNextQueue(): Promise<QueueWithVisit | null> {
  return api<QueueWithVisit | null>('/queues/next');
}

export async function callQueue(id: string): Promise<Queue> {
  return api<Queue>('/queues/' + id + '/call', { method: 'POST' });
}

export async function serveQueue(id: string): Promise<Queue> {
  return api<Queue>('/queues/' + id + '/serve', { method: 'POST' });
}