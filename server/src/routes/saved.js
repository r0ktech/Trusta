import { Router } from 'express';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound } from '../lib/errors.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await prisma.savedProvider.findMany({
    where: { userId: req.user.id, provider: { listed: true } },
    orderBy: { createdAt: 'desc' },
    include: { provider: { include: { portfolio: { orderBy: { sortOrder: 'asc' }, take: 3 } } } },
  });
  res.json({ saved: rows.map((r) => out.providerCard(r.provider)), ids: rows.map((r) => r.providerId) });
});

// PUT/DELETE are idempotent, so double taps and retries are harmless.
router.put('/:id', validate({ params: s.idParams }), async (req, res) => {
  const provider = await prisma.provider.findFirst({ where: { id: req.valid.params.id, listed: true }, select: { id: true } });
  if (!provider) throw notFound('Provider');
  await prisma.savedProvider.upsert({
    where: { userId_providerId: { userId: req.user.id, providerId: provider.id } },
    create: { userId: req.user.id, providerId: provider.id },
    update: {},
  });
  res.status(204).end();
});

router.delete('/:id', validate({ params: s.idParams }), async (req, res) => {
  await prisma.savedProvider.deleteMany({ where: { userId: req.user.id, providerId: req.valid.params.id } });
  res.status(204).end();
});

router.delete('/', async (req, res) => {
  await prisma.savedProvider.deleteMany({ where: { userId: req.user.id } });
  res.status(204).end();
});

export default router;
