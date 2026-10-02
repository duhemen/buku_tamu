import { z } from 'zod';

export const guestCreateSchema = z.object({
  fullName: z.string().min(1).max(200),
  company: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  nik: z.string().max(50).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  consentAt: z.string().datetime().optional().nullable(),
  faceImage: z.string().max(5_000_000).optional().nullable(),
});

export const guestUpdateSchema = guestCreateSchema.partial();

export const guestListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type GuestCreateInput = z.infer<typeof guestCreateSchema>;
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;
export type GuestListQuery = z.infer<typeof guestListQuerySchema>;