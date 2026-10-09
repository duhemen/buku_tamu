import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ============================================================
// Helper: String opsional yang normalize '' -> null
// ============================================================
const optionalString = (maxLen: number) =>
  z
    .string()
    .max(maxLen)
    .optional()
    .nullable()
    .transform((v) => (v === '' || v === undefined ? null : v));

const optionalDateString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    if (!v || v === '') return null;
    if (!dateRegex.test(v)) {
      throw new Error('Format YYYY-MM-DD');
    }
    return v;
  });

const optionalTimeString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    if (!v || v === '') return null;
    if (!timeRegex.test(v)) {
      throw new Error('Format HH:MM');
    }
    return v;
  });

// ============================================================
// Enum
// ============================================================
export const announcementCategoryEnum = z.enum([
  'LELANG',
  'PEMBUKTIAN',
  'RAPAT',
  'PENGUMUMAN',
  'LAINNYA',
]);

// ============================================================
// Schema
// ============================================================
export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(300),
  description: optionalString(2000),
  category: z
    .union([announcementCategoryEnum, z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v)),
  referenceNo: optionalString(100),
  location: optionalString(200),
  startDate: z.string().regex(dateRegex, 'Format YYYY-MM-DD'),
  endDate: optionalDateString,
  startTime: optionalTimeString,
  endTime: optionalTimeString,
  priority: z.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const listQuerySchema = z.object({
  includeInactive: z.string().optional(),
  category: z.string().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;