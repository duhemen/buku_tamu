import { prisma } from '../../config/prisma.js';

export type OperatingStatus =
  | 'OPEN'
  | 'CUT_OFF'
  | 'BREAK'
  | 'CLOSED'
  | 'HOLIDAY'
  | 'OVERRIDE';

export interface SessionInfo {
  sessionNumber: number;
  openTime: string;
  cutOffTime: string;
  closeTime: string;
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
    // legacy fields (dipertahankan untuk kompatibilitas)
    openTime?: string;
    cutOffTime?: string;
    closeTime?: string;
  };
  holidayName?: string;
  overrideReason?: string;
  now: string;
}

// ============================================================
// Helper
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

function parseTimeToMinutes(time: string): number {
  const [hh, mm] = time.split(':').map(Number);
  return hh * 60 + mm;
}

function getTodayWIB(now: Date = new Date()): string {
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
}

function getNowMinutesWIB(now: Date = new Date()): number {
  const hhmm = now.toLocaleTimeString('sv-SE', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return parseTimeToMinutes(hhmm);
}

function getNowDayWIB(now: Date = new Date()): number {
  const wibDateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  const [y, m, d] = wibDateStr.split('-').map(Number);
  const wibDate = new Date(Date.UTC(y, m - 1, d));
  return wibDate.getUTCDay();
}

function formatMinutes(m: number): string {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

async function findNextOpenDay(
  currentDay: number
): Promise<{ dayLabel: string; openTime: string } | null> {
  const allHours = await prisma.operatingHours.findMany({
    include: {
      sessions: { orderBy: { sessionNumber: 'asc' } },
    },
  });

  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const prismaDay = JS_DAY_TO_PRISMA[nextDay];
    const schedule = allHours.find((h) => h.dayOfWeek === prismaDay);
    if (schedule && schedule.isOpen && schedule.sessions.length > 0) {
      return {
        dayLabel: PRISMA_DAY_TO_LABEL[schedule.dayOfWeek] ?? schedule.dayOfWeek,
        openTime: schedule.sessions[0].openTime,
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
  // 1. Cek override
  // ============================================================
  const override = await prisma.timeOverride.findFirst({
    where: { date: new Date(todayStr + 'T00:00:00.000Z') },
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
    return {
      isOpen: true,
      status: 'OVERRIDE',
      reason: 'Dibuka khusus: ' + override.reason,
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
    const next = await findNextOpenDay(getNowDayWIB(now));
    return {
      isOpen: false,
      status: 'HOLIDAY',
      reason: 'Hari libur: ' + holiday.name,
      holidayName: holiday.name,
      nextOpenTime: next ? next.dayLabel + ', ' + next.openTime : undefined,
      now: nowIso,
    };
  }

  // ============================================================
  // 3. Ambil jadwal hari ini + semua sesi
  // ============================================================
  const todayPrismaDay = JS_DAY_TO_PRISMA[getNowDayWIB(now)];
  const schedule = await prisma.operatingHours.findUnique({
    where: { dayOfWeek: todayPrismaDay as any },
    include: {
      sessions: { orderBy: { sessionNumber: 'asc' } },
    },
  });

  // Hari libur (weekend)
  if (!schedule || !schedule.isOpen || schedule.sessions.length === 0) {
    const next = await findNextOpenDay(getNowDayWIB(now));
    return {
      isOpen: false,
      status: 'CLOSED',
      reason: 'Hari ' + (PRISMA_DAY_TO_LABEL[todayPrismaDay] ?? '') + ' kantor tutup',
      nextOpenTime: next ? next.dayLabel + ', ' + next.openTime : undefined,
      now: nowIso,
    };
  }

  // ============================================================
  // 4. Cek tiap sesi
  // ============================================================
  const nowMin = getNowMinutesWIB(now);
  const sessions: SessionInfo[] = schedule.sessions.map((s) => ({
    sessionNumber: s.sessionNumber,
    openTime: s.openTime,
    cutOffTime: s.cutOffTime,
    closeTime: s.closeTime,
  }));

  const todaySchedule = {
    sessions,
    // Legacy: pakai sesi pertama untuk kompatibilitas
    openTime: sessions[0]?.openTime,
    cutOffTime: sessions[0]?.cutOffTime,
    closeTime: sessions[0]?.closeTime,
  };

  // Loop sesi untuk cari yang aktif
  let currentSession: SessionInfo | null = null;
  let nextSession: SessionInfo | null = null;

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const sOpen = parseTimeToMinutes(s.openTime);
    const sCut = parseTimeToMinutes(s.cutOffTime);
    const sClose = parseTimeToMinutes(s.closeTime);

    // Sebelum sesi buka
    if (nowMin < sOpen) {
      // Cek apakah ini sesi pertama atau sesi berikutnya
      if (i === 0) {
        return {
          isOpen: false,
          status: 'CLOSED',
          reason: 'Kantor belum buka. Jam buka: ' + s.openTime,
          todaySchedule,
          nextOpenTime: 'Hari ini, ' + s.openTime,
          now: nowIso,
        };
      } else {
        // Istirahat (BREAK) — antara sesi sebelumnya tutup dan sesi ini buka
        const prevSession = sessions[i - 1];
        return {
          isOpen: false,
          status: 'BREAK',
          reason:
            'Kantor sedang istirahat (ISHOMA). Sesi ' +
            prevSession.sessionNumber +
            ': ' +
            prevSession.openTime +
            ' - ' +
            prevSession.closeTime +
            ' | Sesi ' +
            s.sessionNumber +
            ': ' +
            s.openTime +
            ' - ' +
            s.closeTime,
          todaySchedule,
          nextOpenTime: 'Hari ini, ' + s.openTime,
          now: nowIso,
        };
      }
    }

    // Dalam sesi buka
    if (nowMin >= sOpen && nowMin < sCut) {
      const minutesUntilCutOff = sCut - nowMin;
      return {
        isOpen: true,
        status: 'OPEN',
        reason:
          'Registrasi dibuka (Sesi ' +
          s.sessionNumber +
          '). Sisa: ' +
          minutesUntilCutOff +
          ' menit',
        currentSession: s,
        minutesUntilCutOff,
        todaySchedule,
        now: nowIso,
      };
    }

    // Dalam cut-off period (buka tapi sudah lewat cut-off)
    if (nowMin >= sCut && nowMin < sClose) {
      // Cek apakah ada sesi berikutnya
      if (i + 1 < sessions.length) {
        const nextS = sessions[i + 1];
        return {
          isOpen: false,
          status: 'CUT_OFF',
          reason:
            'Waktu registrasi sesi ' +
            s.sessionNumber +
            ' sudah berakhir. Cut-off: ' +
            s.cutOffTime,
          todaySchedule,
          nextOpenTime: 'Hari ini, ' + nextS.openTime,
          now: nowIso,
        };
      } else {
        // Sesi terakhir
        const next = await findNextOpenDay(getNowDayWIB(now));
        return {
          isOpen: false,
          status: 'CUT_OFF',
          reason:
            'Waktu registrasi sudah berakhir. Cut-off: ' + s.cutOffTime,
          todaySchedule,
          nextOpenTime: next ? next.dayLabel + ', ' + next.openTime : undefined,
          now: nowIso,
        };
      }
    }
  }

  // Setelah semua sesi tutup
  const lastSession = sessions[sessions.length - 1];
  if (nowMin >= parseTimeToMinutes(lastSession.closeTime)) {
    const next = await findNextOpenDay(getNowDayWIB(now));
    return {
      isOpen: false,
      status: 'CLOSED',
      reason:
        'Kantor sudah tutup. Jam operasional sesi terakhir: ' +
        lastSession.openTime +
        ' - ' +
        lastSession.closeTime,
      todaySchedule,
      nextOpenTime: next ? next.dayLabel + ', ' + next.openTime : undefined,
      now: nowIso,
    };
  }

  // Fallback (tidak seharusnya sampai sini)
  return {
    isOpen: false,
    status: 'CLOSED',
    reason: 'Di luar jam operasional',
    todaySchedule,
    now: nowIso,
  };
}

// ============================================================
// Admin: List jam operasional (termasuk sesi)
// ============================================================
export async function listOperatingHours() {
  const rows = await prisma.operatingHours.findMany({
    include: {
      sessions: { orderBy: { sessionNumber: 'asc' } },
    },
  });
  const order: Record<string, number> = {
    MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
    FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  };
  return rows.sort((a, b) => (order[a.dayOfWeek] ?? 99) - (order[b.dayOfWeek] ?? 99));
}

// ============================================================
// Admin: Update jam per hari (dengan sesi)
// ============================================================
export async function updateOperatingHours(
  day: string,
  data: {
    isOpen?: boolean;
    notes?: string | null;
    sessions?: Array<{
      sessionNumber: number;
      openTime: string;
      cutOffTime: string;
      closeTime: string;
    }>;
  }
) {
  const hours = await prisma.operatingHours.findUnique({
    where: { dayOfWeek: day as any },
  });
  if (!hours) throw new Error('Hari tidak ditemukan');

  // Update isOpen + notes
  await prisma.operatingHours.update({
    where: { id: hours.id },
    data: {
      ...(data.isOpen !== undefined && { isOpen: data.isOpen }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  // Kalau ada sessions, replace semua
  if (data.sessions) {
    // Hapus sesi lama
    await prisma.operatingSession.deleteMany({
      where: { operatingHoursId: hours.id },
    });

    // Insert sesi baru
    if (data.sessions.length > 0) {
      await prisma.operatingSession.createMany({
        data: data.sessions.map((s) => ({
          operatingHoursId: hours.id,
          sessionNumber: s.sessionNumber,
          openTime: s.openTime,
          cutOffTime: s.cutOffTime,
          closeTime: s.closeTime,
        })),
      });
    }
  }

  // Return updated
  return prisma.operatingHours.findUnique({
    where: { id: hours.id },
    include: { sessions: { orderBy: { sessionNumber: 'asc' } } },
  });
}

// ============================================================
// Sisanya sama seperti sebelumnya (holidays, overrides)
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

export async function createHoliday(data: {
  date: string;
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

export async function deleteHoliday(id: string) {
  await prisma.holiday.delete({ where: { id } });
  return { ok: true };
}

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

export async function deleteOverride(id: string) {
  await prisma.timeOverride.delete({ where: { id } });
  return { ok: true };
}