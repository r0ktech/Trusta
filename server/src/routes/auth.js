import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, startSession, endSession } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { hashPassword, verifyPassword, burnPasswordCheck, randomToken, sha256 } from '../lib/security.js';
import { sendEmail } from '../lib/mailer.js';
import { badRequest, conflict, unauthorized } from '../lib/errors.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
const RESET_TTL_MS = 60 * 60 * 1000;

// Admin accounts can't be created through sign-up; promote users in the database.
const signupBody = z.object({
  name: s.name,
  email: s.email,
  password: s.password,
  role: z.enum(['customer', 'provider']).default('customer'),
});

router.post('/signup', authLimiter, validate({ body: signupBody }), async (req, res) => {
  const { name, email, password, role } = req.valid.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('An account with this email already exists. Try signing in.');
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: role.toUpperCase() },
  });
  const token = await startSession(req, res, user.id);
  res.status(201).json({ user: out.user(user), token });
});

const loginBody = z.object({ email: s.email, password: z.string().min(1).max(200) });

router.post('/login', authLimiter, validate({ body: loginBody }), async (req, res) => {
  const { email, password } = req.valid.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await burnPasswordCheck(password);
    throw unauthorized('Email or password is incorrect.');
  }
  if (!(await verifyPassword(user.passwordHash, password))) throw unauthorized('Email or password is incorrect.');
  const token = await startSession(req, res, user.id);
  res.json({ user: out.user(user), token });
});

router.post('/logout', async (req, res) => {
  await endSession(req, res);
  res.status(204).end();
});

/** Ends every session for the account except the current one. */
router.post('/logout-others', requireAuth, async (req, res) => {
  const { count } = await prisma.session.deleteMany({ where: { userId: req.user.id, NOT: { tokenHash: req.sessionTokenHash } } });
  res.json({ ended: count });
});

// Always answers the same way, so it can't be used to discover which
// emails have accounts.
router.post('/password/forgot', authLimiter, validate({ body: z.object({ email: s.email }) }), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.valid.body.email } });
  if (user) {
    const token = randomToken();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });
    await sendEmail({
      to: user.email,
      subject: 'Reset your Trusta password',
      text: `Hi ${user.name},\n\nUse this link to choose a new password. It expires in 1 hour.\n\n${config.APP_URL}/auth/reset-password?token=${token}\n\nIf you didn’t ask for this, you can ignore this email.`,
    });
  }
  res.status(202).json({ message: 'If an account exists for that email, a reset link has been sent.' });
});

const resetBody = z.object({ token: z.string().min(20).max(200), password: s.password });

router.post('/password/reset', authLimiter, validate({ body: resetBody }), async (req, res) => {
  const { token, password } = req.valid.body;
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw badRequest('This reset link is invalid or has expired. Request a new one.');
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Sign out everywhere: whoever had the old password shouldn't stay in.
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  res.json({ message: 'Password updated. Sign in with your new password.' });
});

const changeBody = z.object({ currentPassword: z.string().min(1).max(200), newPassword: s.password });

router.post('/password/change', requireAuth, authLimiter, validate({ body: changeBody }), async (req, res) => {
  const { currentPassword, newPassword } = req.valid.body;
  if (!(await verifyPassword(req.user.passwordHash, currentPassword))) throw badRequest('Current password is incorrect.');
  await prisma.$transaction([
    prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.session.deleteMany({ where: { userId: req.user.id, NOT: { tokenHash: req.sessionTokenHash } } }),
  ]);
  res.json({ message: 'Password changed. Other devices have been signed out.' });
});

export default router;
