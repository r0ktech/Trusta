import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, endSession } from '../middleware/auth.js';
import { verifyPassword } from '../lib/security.js';
import { badRequest, conflict } from '../lib/errors.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_PREFS = {
  notifications: { bookingUpdates: true, messages: true, reviewReminders: true, productNews: false, sms: false },
  defaultLocation: '',
};

const prefsOf = (u) => {
  const p = u.preferences ?? {};
  return { ...DEFAULT_PREFS, ...p, notifications: { ...DEFAULT_PREFS.notifications, ...(p.notifications ?? {}) } };
};

router.get('/', (req, res) => res.json({ user: out.user(req.user), preferences: prefsOf(req.user) }));

const updateBody = z.object({
  name: s.name.optional(),
  email: s.email.optional(),
  phone: z.union([s.ngPhone, z.literal('')]).optional(),
  city: s.shortText(60).optional(),
});

router.patch('/', validate({ body: updateBody }), async (req, res) => {
  const data = req.valid.body;
  if (data.email && data.email !== req.user.email) {
    const taken = await prisma.user.findUnique({ where: { email: data.email } });
    if (taken) throw conflict('That email is already used by another account.');
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...data, phone: data.phone === '' ? null : data.phone },
  });
  res.json({ user: out.user(user) });
});

const prefsBody = z.object({
  notifications: z
    .object({
      bookingUpdates: z.boolean(),
      messages: z.boolean(),
      reviewReminders: z.boolean(),
      productNews: z.boolean(),
      sms: z.boolean(),
    })
    .partial()
    .optional(),
  defaultLocation: s.shortText(60).optional(),
});

router.get('/preferences', (req, res) => res.json({ preferences: prefsOf(req.user) }));

router.patch('/preferences', validate({ body: prefsBody }), async (req, res) => {
  const current = prefsOf(req.user);
  const { notifications, defaultLocation } = req.valid.body;
  const next = {
    ...current,
    ...(defaultLocation !== undefined && { defaultLocation }),
    notifications: { ...current.notifications, ...(notifications ?? {}) },
  };
  await prisma.user.update({ where: { id: req.user.id }, data: { preferences: next } });
  res.json({ preferences: next });
});

/** Account deletion. Requires the password; cascades to the user's data. */
router.delete('/', validate({ body: z.object({ password: z.string().min(1).max(200) }) }), async (req, res) => {
  if (!(await verifyPassword(req.user.passwordHash, req.valid.body.password))) throw badRequest('Password is incorrect.');
  await prisma.user.delete({ where: { id: req.user.id } });
  await endSession(req, res);
  res.status(204).end();
});

export default router;
