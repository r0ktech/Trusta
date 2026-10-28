import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound } from '../lib/errors.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

router.get('/', validate({ query: z.object({ unread: z.enum(['1', 'true']).optional() }) }), async (req, res) => {
  const where = { userId: req.user.id, ...(req.valid.query.unread && { readAt: null }) };
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
  ]);
  res.json({ notifications: items.map(out.notification), unread });
});

router.post('/read-all', async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, readAt: null }, data: { readAt: new Date() } });
  res.status(204).end();
});

router.post('/:id/read', validate({ params: s.idParams }), async (req, res) => {
  const { count } = await prisma.notification.updateMany({ where: { id: req.valid.params.id, userId: req.user.id }, data: { readAt: new Date() } });
  if (!count) throw notFound('Notification');
  res.status(204).end();
});

export default router;
