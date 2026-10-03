import { z } from 'zod';

export const dayOfWeekEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

// Format waktu "HH:MM" (00:00 - 23:59)
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const updateHoursSchema = z.object({
  isOpen: z.boolean().optional(),
  openTime: z.string().regex(timeRegex, 'Format HH:MM').optional(),
  cutOffTime: z.string().regex(timeRegex, 'Format HH:MM').optional(),
  closeTime: z.string().regex(timeRegex, 'Format HH:MM').optional(),
  notes: z.string().max(500).optional().nullable(),
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