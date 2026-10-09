import { prisma } from '../../config/prisma.js';
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from './announcements.schema.js';

// ============================================================
// Helper
// ============================================================
function dateStringToUtc(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function todayWIBString(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
}

// ============================================================
// CRUD
// ============================================================
export async function listAnnouncements(includeInactive = false, category?: string) {
  const where: Record<string, unknown> = {};
  if (!includeInactive) where.isActive = true;
  if (category) where.category = category;

  return prisma.announcement.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { startDate: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function createAnnouncement(data: CreateAnnouncementInput) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category ?? null,
      referenceNo: data.referenceNo ?? null,
      location: data.location ?? null,
      startDate: dateStringToUtc(data.startDate),
      endDate: data.endDate ? dateStringToUtc(data.endDate) : null,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      priority: data.priority ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateAnnouncement(id: string, data: UpdateAnnouncementInput) {
  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.category !== undefined) payload.category = data.category;
  if (data.referenceNo !== undefined) payload.referenceNo = data.referenceNo;
  if (data.location !== undefined) payload.location = data.location;
  if (data.startDate !== undefined) payload.startDate = dateStringToUtc(data.startDate);
  if (data.endDate !== undefined) {
    payload.endDate = data.endDate ? dateStringToUtc(data.endDate) : null;
  }
  if (data.startTime !== undefined) payload.startTime = data.startTime;
  if (data.endTime !== undefined) payload.endTime = data.endTime;
  if (data.priority !== undefined) payload.priority = data.priority;
  if (data.isActive !== undefined) payload.isActive = data.isActive;

  return prisma.announcement.update({ where: { id }, data: payload });
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({ where: { id } });
  return { ok: true };
}

// ============================================================
// Public: Agenda aktif hari ini
// ============================================================
export async function getActiveAnnouncements() {
  const today = dateStringToUtc(todayWIBString());

  // Agenda dengan:
  // - isActive: true
  // - startDate <= today
  // - endDate >= today ATAU endDate null (single-day) tapi startDate = today
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      startDate: { lte: today },
      OR: [
        { endDate: { gte: today } },
        { endDate: null, startDate: today },
      ],
    },
    orderBy: [
      { priority: 'desc' },
      { startDate: 'asc' },
    ],
  });

  return announcements.map((a) => {
    const start = new Date(a.startDate).toISOString().slice(0, 10);
    const end = a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : null;
    const isMultiDay = end && end !== start;
    const isToday = start === todayWIBString();
    const isEndingToday = end === todayWIBString();

    return {
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      referenceNo: a.referenceNo,
      location: a.location,
      startDate: start,
      endDate: end,
      startTime: a.startTime,
      endTime: a.endTime,
      priority: a.priority,
      isMultiDay,
      isToday,
      isEndingToday,
    };
  });
}