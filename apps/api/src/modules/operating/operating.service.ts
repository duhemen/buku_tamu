import { prisma } from '../../config/prisma.js';

export type OperatingStatus = 'OPEN' | 'CUT_OFF' | 'CLOSED' | 'HOLIDAY' | 'OVERRIDE';

export interface OperatingStatusResult {
  isOpen: boolean;
  status: OperatingStatus;
  reason?: string;
  nextOpenTime?: string; // ISO string
  minutesUntilCutOff?: number;
  todaySchedule?: {
    openTime: string;
    cutOffTime: string;
    closeTime: string;
  };
  holidayName?: string;
  overrideReason?: string;
  now: string; // ISO string waktu server
}

// ============================================================
// Helper: Konversi nama hari Prisma <-> JavaScript
// ============================================================
const JS_DAY_TO_PRISMA: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

const PRISMA_DAY_TO_LABEL: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jum\'at',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};

// ============================================================
// Helper: Parse waktu "HH:MM" jadi menit sejak tengah malam
// ============================================================
function parseTimeToMinutes(time: string): number {
  const [hh, mm] = time.split(':').map(Number);
  return hh * 60 + mm;
}

// ============================================================
// Helper: Format waktu WIB sekarang jadi YYYY-MM-DD
// ============================================================
function getTodayWIB(now: Date = new Date()): string {
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
}

// ============================================================
// Helper: Ambil menit sekarang dalam WIB
// ============================================================
function getNowMinutesWIB(now: Date = new Date()): number {
  const hhmm = now.toLocaleTimeString('sv-SE', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return parseTimeToMinutes(hhmm);
}

// ============================================================
// Helper: Ambil hari ini dalam WIB (0=Sunday, 6=Saturday)
// ============================================================
function getNowDayWIB(now: Date = new Date()): number {
  const dayStr = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
  });
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[dayStr] ?? 0;
}

// ============================================================
// Helper: Cari hari buka berikutnya
// ============================================================
async function findNextOpenDay(
  currentDay: number,
  hours: { dayOfWeek: string; isOpen: boolean; openTime: string }[]
): Promise<{ dayLabel: string; openTime: string } | null> {
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const prismaDay = JS_DAY_TO_PRISMA[nextDay];
    const schedule = hours.find((h) => h.dayOfWeek === prismaDay);
    if (schedule && schedule.isOpen) {
      return {
        dayLabel: PRISMA_DAY_TO_LABEL[schedule.dayOfWeek] ?? schedule.dayOfWeek,
        openTime: schedule.openTime,
      };
    }
  }
  return null;
}

// ============================================================
// MAIN: getOperatingStatus
// ============================================================
export async function getOperatingStatus(
  now: Date = new Date()
): Promise<OperatingStatusResult> {
  const nowIso = now.toISOString();
  const todayStr = getTodayWIB(now);

  // ============================================================
  // 1. Cek override hari ini (prioritas tertinggi)
  // ============================================================
  const override = await prisma.timeOverride.findFirst({
    where: {
      date: new Date(todayStr + 'T00:00:00.000Z'),
    },
  });

  if (override) {
    if (!override.isOpen) {
      return {
        isOpen: false,
        status: 'OVERRIDE',
        reason: override.reason || 'Kantor tutup berdasarkan keputusan admin',
        overrideReason: override.reason,
        now: nowIso,
      };
    }
    // Override buka — lewati cek jam, langsung buka
    return {
      isOpen: true,
      status: 'OVERRIDE',
      reason: `Dibuka khusus: ${override.reason}`,
      overrideReason: override.reason,
      now: nowIso,
    };
  }

  // ============================================================
  // 2. Cek hari libur
  // ============================================================
  const holiday = await prisma.holiday.findFirst({
    where: {
      date: new Date(todayStr + 'T00:00:00.000Z'),
      isActive: true,
    },
  });

  if (holiday) {
    const hours = await prisma.operatingHours.findMany();
    const next = await findNextOpenDay(getNowDayWIB(now), hours);
    return {
      isOpen: false,
      status: 'HOLIDAY',
      reason: `Hari libur: ${holiday.name}`,
      holidayName: holiday.name,
      nextOpenTime: next
        ? `${next.dayLabel}, ${next.openTime}`
        : undefined,
      now: nowIso,
    };
  }

  // ============================================================
  // 3. Cek jam operasional hari ini
  // ============================================================
  const todayPrismaDay = JS_DAY_TO_PRISMA[getNowDayWIB(now)];
  const schedule = await prisma.operatingHours.findUnique({
    where: { dayOfWeek: todayPrismaDay as any },
  });

  const allHours = await prisma.operatingHours.findMany();

  if (!schedule || !schedule.isOpen) {
    const next = await findNextOpenDay(getNowDayWIB(now), allHours);
    return {
      isOpen: false,
      status: 'CLOSED',
      reason: `Hari ${PRISMA_DAY_TO_LABEL[todayPrismaDay] ?? ''} kantor tutup`,
      nextOpenTime: next
        ? `${next.dayLabel}, ${next.openTime}`
        : undefined,
      now: nowIso,
    };
  }

  // ============================================================
  // 4. Cek jam (open / cut-off / close)
  // ============================================================
  const nowMin = getNowMinutesWIB(now);
  const openMin = parseTimeToMinutes(schedule.openTime);
  const cutOffMin = parseTimeToMinutes(schedule.cutOffTime);
  const closeMin = parseTimeToMinutes(schedule.closeTime);

  const todaySchedule = {
    openTime: schedule.openTime,
    cutOffTime: schedule.cutOffTime,
    closeTime: schedule.closeTime,
  };

  // Sebelum buka
  if (nowMin < openMin) {
    return {
      isOpen: false,
      status: 'CLOSED',
      reason: `Kantor belum buka. Jam buka: ${schedule.openTime}`,
      todaySchedule,
      nextOpenTime: `Hari ini, ${schedule.openTime}`,
      now: nowIso,
    };
  }

  // Setelah tutup
  if (nowMin >= closeMin) {
    const next = await findNextOpenDay(getNowDayWIB(now), allHours);
    return {
      isOpen: false,
      status: 'CLOSED',
      reason: `Kantor sudah tutup. Jam operasional: ${schedule.openTime} - ${schedule.closeTime}`,
      todaySchedule,
      nextOpenTime: next
        ? `${next.dayLabel}, ${next.openTime}`
        : undefined,
      now: nowIso,
    };
  }

  // Dalam cut-off period (buka tapi sudah lewat cut-off)
  if (nowMin >= cutOffMin) {
    return {
      isOpen: false,
      status: 'CUT_OFF',
      reason: `Waktu registrasi tamu sudah berakhir. Cut-off: ${schedule.cutOffTime}`,
      todaySchedule,
      nextOpenTime: `Besok, ${schedule.openTime}`,
      now: nowIso,
    };
  }

  // BUKA — hitung sisa waktu sampai cut-off
  const minutesUntilCutOff = cutOffMin - nowMin;

  return {
    isOpen: true,
    status: 'OPEN',
    reason: `Registrasi dibuka. Sisa waktu: ${minutesUntilCutOff} menit`,
    minutesUntilCutOff,
    todaySchedule,
    now: nowIso,
  };
}

// ============================================================
// Admin: List jam operasional
// ============================================================
export async function listOperatingHours() {
  const rows = await prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: 'asc' },
  });
  // Urutkan berdasarkan hari (Senin-Minggu)
  const order: Record<string, number> = {
    MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
    FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  };
  return rows.sort((a, b) => (order[a.dayOfWeek] ?? 99) - (order[b.dayOfWeek] ?? 99));
}

// ============================================================
// Admin: Update jam per hari
// ============================================================
export async function updateOperatingHours(
  day: string,
  data: {
    isOpen?: boolean;
    openTime?: string;
    cutOffTime?: string;
    closeTime?: string;
    notes?: string | null;
  }
) {
  return prisma.operatingHours.update({
    where: { dayOfWeek: day as any },
    data,
  });
}

// ============================================================
// Admin: List hari libur
// ============================================================
export async function listHolidays(year?: number) {
  const where: Record<string, unknown> = {};
  if (year) {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    where.date = { gte: start, lt: end };
  }
  return prisma.holiday.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

// ============================================================
// Admin: Tambah hari libur
// ============================================================
export async function createHoliday(data: {
  date: string; // YYYY-MM-DD
  name: string;
  notes?: string | null;
}) {
  const [y, m, d] = data.date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));

  return prisma.holiday.upsert({
    where: { date: dateObj },
    update: { name: data.name, notes: data.notes ?? null, isActive: true },
    create: { date: dateObj, name: data.name, notes: data.notes ?? null },
  });
}

// ============================================================
// Admin: Hapus hari libur
// ============================================================
export async function deleteHoliday(id: string) {
  await prisma.holiday.delete({ where: { id } });
  return { ok: true };
}

// ============================================================
// Admin: Buat override sementara
// ============================================================
export async function createOverride(data: {
  date: string;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason: string;
  createdBy?: string | null;
}) {
  const [y, m, d] = data.date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));

  return prisma.timeOverride.create({
    data: {
      date: dateObj,
      isOpen: data.isOpen,
      openTime: data.openTime ?? null,
      closeTime: data.closeTime ?? null,
      reason: data.reason,
      createdBy: data.createdBy ?? null,
    },
  });
}

// ============================================================
// Admin: List override
// ============================================================
export async function listOverrides(from?: string, to?: string) {
  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as any).gte = new Date(from);
    if (to) (where.date as any).lte = new Date(to);
  }
  return prisma.timeOverride.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

// ============================================================
// Admin: Hapus override
// ============================================================
export async function deleteOverride(id: string) {
  await prisma.timeOverride.delete({ where: { id } });
  return { ok: true };
}