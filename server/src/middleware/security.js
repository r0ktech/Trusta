import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { forbidden } from '../lib/errors.js';

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// CSRF defence in depth. Session cookies are SameSite=Lax, and on top of
// that any state-changing request that comes from a browser (and so carries
// an Origin header) must come from one of our own origins.
export function checkOrigin(req, _res, next) {
  if (!UNSAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients (curl, mobile apps) use bearer tokens
  const self = `${req.protocol}://${req.get('host')}`;
  if (origin === self || config.allowedOrigins.includes(origin)) return next();
  throw forbidden('Request origin not allowed.');
}

const limiter = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => config.isTest,
    handler: (_req, res) => res.status(429).json({ error: { code: 'rate_limited', message } }),
  });

export const authLimiter = limiter(15, 20, 'Too many attempts. Please wait a few minutes and try again.');
export const writeLimiter = limiter(1, 60, 'You’re doing that too often. Please slow down.');
export const apiLimiter = limiter(1, 300, 'Too many requests. Please slow down.');
