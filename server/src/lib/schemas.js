import { z } from 'zod';

// Reusable request-validation pieces. Limits are generous for real use but
// bounded, so oversized payloads are rejected before they reach the database.

export const id = z.string().trim().min(1).max(64);
export const idParams = z.object({ id });

export const email = z.email('Enter a valid email address').trim().toLowerCase().max(254);
export const password = z.string().min(8, 'Use at least 8 characters').max(200, 'Use at most 200 characters');
export const name = z.string().trim().min(2, 'Enter your name').max(80);

// Nigerian mobile numbers: 080…, 081…, 070…, 090…, 091… and +234 variants.
export const ngPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-()]/g, ''))
  .pipe(z.string().regex(/^(\+234|234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'));

export const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

export const naira = z.coerce.number().int('Use a whole naira amount').min(0).max(100_000_000);

export const shortText = (max = 120) => z.string().trim().max(max);

export const stringList = (maxItems, maxLen = 60) =>
  z
    .array(z.string().trim().min(1).max(maxLen))
    .max(maxItems)
    .transform((list) => [...new Map(list.map((s) => [s.toLowerCase(), s])).values()]);

export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/** Our own uploaded files only — never arbitrary external URLs. */
export const uploadUrl = z.string().regex(/^\/uploads\/[a-z0-9-]+\.webp$/i, 'Upload the image first');
