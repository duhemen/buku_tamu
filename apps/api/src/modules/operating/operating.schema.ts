import { z } from 'zod';

export const dayOfWeekEnum = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

// ============================================================
// Schema untuk 1 sesi
// ============================================================
export const sessionSchema = z.object({
  sessionNumber: z.number().int().min(1).max(10),
  openTime: z.string().regex(timeRegex, 'Format HH:MM'),
  cutOffTime: z.string().regex(timeRegex, 'Format HH:MM'),
  closeTime: z.string().regex(timeRegex, 'Format HH:MM'),
});

// ============================================================
// Schema update jam (dengan sessions array)
// ============================================================
export const updateHoursSchema = z.object({
  isOpen: z.boolean().optional(),
  notes: z.string().max(500).optional().nullable(),
  sessions: z.array(sessionSchema).optional(),
});

export const createHolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  name: z.string().min(1).max(200),
  notes: z.string().max(500).optional().nullable(),
});

export const createOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  isOpen: z.boolean(),
  openTime: z.string().regex(timeRegex, 'Format HH:MM').optional().nullable(),
  closeTime: z.string().regex(timeRegex, 'Format HH:MM').optional().nullable(),
  reason: z.string().min(1).max(500),
});

export type UpdateHoursInput = z.infer<typeof updateHoursSchema>;
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type CreateOverrideInput = z.infer<typeof createOverrideSchema>;