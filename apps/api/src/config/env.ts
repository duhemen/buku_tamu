import 'dotenv/config';
import { z } from 'zod';

if (!process.env.TZ) process.env.TZ = 'Asia/Jakarta';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('8h'),
  ENCRYPTION_KEY: z.string().min(16),
  CORS_ORIGIN: z.string().default('*'),
  TZ: z.string().default('Asia/Jakarta'),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;