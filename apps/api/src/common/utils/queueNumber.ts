import { prisma } from '../../config/prisma.js';

export function todayWIBString(date: Date = new Date()): string {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
}

export function dateStringToUtcMidnight(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function dayRange(dateStr?: string): { start: Date; end: Date } {
  const s = dateStr ?? todayWIBString();
  const start = dateStringToUtcMidnight(s);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

export function todayDateForDb(): Date {
  return dateStringToUtcMidnight(todayWIBString());
}

export type Period = 'today' | 'week' | 'month' | 'year';

export function periodRangeWIB(period: Period): { start: Date; end: Date } {
  const nowStr = todayWIBString();
  const [y, m, d] = nowStr.split('-').map(Number);

  let startStr: string;
  let endStr: string;

  if (period === 'today') {
    startStr = nowStr;
    const tomorrow = new Date(Date.UTC(y, m - 1, d + 1));
    endStr = tomorrow.toISOString().slice(0, 10);
  } else if (period === 'week') {
    const date = new Date(Date.UTC(y, m - 1, d));
    const dow = (date.getUTCDay() + 6) % 7;
    const monday = new Date(date);
    monday.setUTCDate(monday.getUTCDate() - dow);
    startStr = monday.toISOString().slice(0, 10);
    const nextMonday = new Date(monday);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    endStr = nextMonday.toISOString().slice(0, 10);
  } else if (period === 'month') {
    startStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const nextMonth =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    endStr = nextMonth;
  } else {
    startStr = `${y}-01-01`;
    endStr = `${y + 1}-01-01`;
  }

  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  return {
    start: new Date(Date.UTC(sy, sm - 1, sd)),
    end: new Date(Date.UTC(ey, em - 1, ed) - 1),
  };
}

export async function nextQueueNumber(dateStr?: string): Promise<string> {
  const { start, end } = dayRange(dateStr);
  const count = await prisma.queue.count({
    where: { date: { gte: start, lte: end } },
  });
  return 'A-' + String(count + 1).padStart(3, '0');
}