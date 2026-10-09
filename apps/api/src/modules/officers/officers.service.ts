import { prisma } from '../../config/prisma.js';
import type {
  CreateOfficerInput,
  UpdateOfficerInput,
  BulkDailyStatusInput,
} from './officers.schema.js';

// ============================================================
// Helper: Konversi string YYYY-MM-DD ke Date UTC midnight
// ============================================================
function dateStringToUtc(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function todayWIBString(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
}

// ============================================================
// Officer CRUD
// ============================================================
export async function listOfficers(includeInactive = false) {
  return prisma.officer.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: [{ order: 'asc' }, { position: 'asc' }],
  });
}

export async function createOfficer(data: CreateOfficerInput) {
  return prisma.officer.create({
    data: {
      name: data.name,
      position: data.position,
      unit: data.unit ?? null,
      room: data.room ?? null,
      telegramChatId: data.telegramChatId ?? null,
      phone: data.phone ?? null,
      order: data.order ?? 0,
    },
  });
}

export async function updateOfficer(id: string, data: UpdateOfficerInput) {
  return prisma.officer.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.room !== undefined && { room: data.room }),
      ...(data.telegramChatId !== undefined && { telegramChatId: data.telegramChatId }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });
}

export async function deleteOfficer(id: string) {
  await prisma.officer.delete({ where: { id } });
  return { ok: true };
}

// ============================================================
// Daily Status
// ============================================================
export async function getDailyStatuses(dateStr?: string) {
  const date = dateStringToUtc(dateStr ?? todayWIBString());
  return prisma.officerDailyStatus.findMany({
    where: { date },
    include: { officer: true },
    orderBy: { officer: { order: 'asc' } },
  });
}

export async function bulkUpdateDailyStatus(data: BulkDailyStatusInput, userId: string) {
  const date = dateStringToUtc(data.date);

  const results = await Promise.all(
    data.statuses.map((s) =>
      prisma.officerDailyStatus.upsert({
        where: {
          officerId_date: {
            officerId: s.officerId,
            date,
          },
        },
        update: {
          status: s.status,
          note: s.note ?? null,
          returnAt: s.returnAt ?? null,
          confirmedBy: userId,
        },
        create: {
          officerId: s.officerId,
          date,
          status: s.status,
          note: s.note ?? null,
          returnAt: s.returnAt ?? null,
          confirmedBy: userId,
        },
      })
    )
  );

  return { ok: true, updated: results.length };
}

// ============================================================
// Public: Status hari ini + petugas aktif
// ============================================================
export async function getPublicOfficerStatus() {
  const today = dateStringToUtc(todayWIBString());

  const officers = await prisma.officer.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { position: 'asc' }],
    include: {
      dailyStatuses: {
        where: { date: today },
        take: 1,
      },
    },
  });

  return officers.map((o) => {
    const status = o.dailyStatuses[0];
    return {
      id: o.id,
      name: o.name,
      position: o.position,
      unit: o.unit,
      room: o.room,
      status: status?.status ?? 'OFFLINE',
      note: status?.note ?? null,
      returnAt: status?.returnAt ?? null,
      confirmedAt: status?.confirmedAt ?? null,
      hasConfirmedToday: !!status,
    };
  });
}