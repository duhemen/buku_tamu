import { z } from 'zod';

export const handoverTypeEnum = z.enum([
  'SURAT',
  'JAMINAN_TENDER',
  'PAKET',
  'DOKUMEN',
  'LAINNYA',
]);

export const handoverStatusEnum = z.enum([
  'RECEIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'RETURNED',
]);

export const handoverCreateSchema = z.object({
  visitId: z.string().min(1),
  type: handoverTypeEnum,
  referenceNo: z.string().max(200).optional().nullable(),
  description: z.string().min(1).max(1000),
  recipient: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const handoverUpdateSchema = z.object({
  status: handoverStatusEnum.optional(),
  recipient: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type HandoverCreateInput = z.infer<typeof handoverCreateSchema>;
export type HandoverUpdateInput = z.infer<typeof handoverUpdateSchema>;