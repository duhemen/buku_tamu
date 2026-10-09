import { z } from 'zod';

export const officerStatusEnum = z.enum([
  'AVAILABLE',
  'BUSY',
  'ABSENT',
  'OFFLINE',
]);

export const createOfficerSchema = z.object({
  name: z.string().min(1).max(200),
  position: z.string().min(1).max(100),
  unit: z.string().max(100).optional().nullable(),
  room: z.string().max(200).optional().nullable(),
  telegramChatId: z.string().max(50).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
});

export const updateOfficerSchema = createOfficerSchema.partial().extend({
  active: z.boolean().optional(),
});

export const dailyStatusSchema = z.object({
  officerId: z.string().min(1),
  status: officerStatusEnum,
  note: z.string().max(500).optional().nullable(),
  returnAt: z.string().max(100).optional().nullable(),
});

export const bulkDailyStatusSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  statuses: z.array(dailyStatusSchema),
});

export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;
export type UpdateOfficerInput = z.infer<typeof updateOfficerSchema>;
export type DailyStatusInput = z.infer<typeof dailyStatusSchema>;
export type BulkDailyStatusInput = z.infer<typeof bulkDailyStatusSchema>;