import { z } from 'zod';

export const publicCheckInSchema = z.object({
  guest: z.object({
    fullName: z.string().min(1).max(200),
    company: z.string().max(200).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    nik: z.string().max(50).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    email: z.string().email().optional().nullable(),
    consentAt: z.string().datetime(),
    faceImage: z.string().max(5_000_000).optional().nullable(),
    matchedGuestId: z.string().optional().nullable(),
  }),
  visit: z.object({
    purpose: z.string().min(1).max(500),
    destination: z.string().min(1).max(200),
    notes: z.string().max(500).optional().nullable(),
  }),
  handover: z
    .object({
      type: z.enum(['SURAT', 'JAMINAN_TENDER', 'PAKET', 'DOKUMEN', 'LAINNYA']),
      referenceNo: z.string().max(200).optional().nullable(),
      description: z.string().min(1).max(1000),
      recipient: z.string().max(200).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export const publicFaceMatchSchema = z.object({
  image: z.string().min(50).max(5_000_000),
});

export type PublicCheckInInput = z.infer<typeof publicCheckInSchema>;
export type PublicFaceMatchInput = z.infer<typeof publicFaceMatchSchema>;