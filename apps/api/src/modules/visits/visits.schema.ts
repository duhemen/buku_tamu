import { z } from 'zod';

export const visitCheckInSchema = z.object({
  guestId: z.string().min(1),
  purpose: z.string().min(1).max(500),
  destination: z.string().min(1).max(200),
  notes: z.string().max(500).optional().nullable(),
  letter: z
    .object({
      letterNumber: z.string().max(100).optional().nullable(),
      subject: z.string().min(1).max(500),
      sender: z.string().max(200).optional().nullable(),
      recipient: z.string().max(200).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export const visitListQuerySchema = z.object({
  status: z.enum(['WAITING', 'IN_PROGRESS', 'DONE', 'CANCELED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type VisitCheckInInput = z.infer<typeof visitCheckInSchema>;
export type VisitListQuery = z.infer<typeof visitListQuerySchema>;