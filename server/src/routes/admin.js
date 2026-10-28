import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';
import { notify } from '../lib/notify.js';
import { refreshRating } from '../services/providers.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

// Moderation endpoints. Admin accounts are created by setting role = ADMIN
// directly in the database; there is no way to self-assign it.

const router = Router();
router.use(requireRole('ADMIN'));

const providersQuery = s.pagination.extend({ verification: z.enum(['unverified', 'pending', 'verified', 'all']).default('pending') });

router.get('/providers', validate({ query: providersQuery }), async (req, res) => {
  const { verification, page, limit } = req.valid.query;
  const where = { isDemo: false, ...(verification !== 'all' && { verificationStatus: verification.toUpperCase() }) };
  const [total, rows] = await Promise.all([
    prisma.provider.count({ where }),
    prisma.provider.findMany({ where, include: { portfolio: true }, orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }),
  ]);
  res.json({ providers: rows.map(out.providerCard), page, limit, total });
});

router.patch(
  '/providers/:id/verification',
  validate({ params: s.idParams, body: z.object({ status: z.enum(['unverified', 'pending', 'verified']), note: s.shortText(300).optional() }) }),
  async (req, res) => {
    const p = await prisma.provider.update({ where: { id: req.valid.params.id }, data: { verificationStatus: req.valid.body.status.toUpperCase() } });
    req.log?.info({ admin: req.user.id, provider: p.id, status: p.verificationStatus }, 'Verification status changed');
    if (req.valid.body.status === 'verified') {
      await notify(p.userId, { type: 'verification.approved', title: 'Your profile is verified', body: 'Customers will now see the verified badge on your profile.', link: '/provider/dashboard' });
    }
    res.json({ id: p.id, verificationStatus: req.valid.body.status });
  },
);

router.patch('/reviews/:id', validate({ params: s.idParams, body: z.object({ hidden: z.boolean() }) }), async (req, res) => {
  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.update({ where: { id: req.valid.params.id }, data: { hidden: req.valid.body.hidden } });
    await refreshRating(r.providerId, tx);
    return r;
  });
  req.log?.info({ admin: req.user.id, review: review.id, hidden: review.hidden }, 'Review moderation');
  res.json({ id: review.id, hidden: review.hidden });
});

export default router;
