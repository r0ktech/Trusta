import { prisma } from '../db.js';
import { config } from '../config.js';
import { randomToken, sha256 } from '../lib/security.js';
import { forbidden, unauthorized } from '../lib/errors.js';

const DAY = 24 * 60 * 60 * 1000;
const TOUCH_EVERY = 10 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
  maxAge: config.SESSION_TTL_DAYS * DAY,
});

/** Starts a session, sets the cookie, and returns the raw token for non-browser clients. */
export async function startSession(req, res, userId) {
  const token = randomToken();
  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(Date.now() + config.SESSION_TTL_DAYS * DAY),
      userAgent: req.get('user-agent')?.slice(0, 300),
      ip: req.ip,
    },
  });
  res.cookie(config.sessionCookie, token, cookieOptions());
  return token;
}

export async function endSession(req, res) {
  if (req.sessionTokenHash) await prisma.session.deleteMany({ where: { tokenHash: req.sessionTokenHash } });
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(config.sessionCookie, opts);
}

function readToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.[config.sessionCookie];
}

/** Attaches `req.user` when a valid session token is present. Never rejects. */
export async function loadSession(req, _res, next) {
  const token = readToken(req);
  if (!token || token.length > 200) return next();
  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!session) return next();
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return next();
  }
  req.user = session.user;
  req.sessionTokenHash = tokenHash;
  if (Date.now() - session.lastUsedAt.getTime() > TOUCH_EVERY) {
    prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) throw unauthorized();
  next();
}

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
