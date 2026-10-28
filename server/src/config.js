import { z } from 'zod';

// All configuration comes from environment variables, validated once at
// startup so a misconfigured deploy fails immediately and loudly.

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  /** Where the frontend lives. Used for CORS, origin checks and links in emails. */
  APP_URL: z.url().default('http://localhost:5173'),
  /** Extra comma-separated origins allowed to call the API with credentials. */
  CORS_ORIGINS: z.string().default(''),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: bool.optional(),
  /** Number of proxies in front of the app (for correct client IPs). */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(8),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${lines}`);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  ...env,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  cookieSecure: env.COOKIE_SECURE ?? env.NODE_ENV === 'production',
  allowedOrigins: [env.APP_URL, ...env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)].map((o) =>
    o.replace(/\/$/, ''),
  ),
  sessionCookie: 'trusta_session',
};
