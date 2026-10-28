import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/security.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { lagosToday, dateOnly } from '../lib/dates.js';
import { notify } from '../lib/notify.js';
import { bookingInclude, transitionBooking, assertCustomerOf, assertNotOwnListing } from '../services/bookings.js';
import { refreshRating } from '../services/providers.js';
import { assertOwnUploads } from './uploads.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

const TIME_WINDOWS = ['Morning (8 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 7 PM)', 'Flexible — any time'];
const MAX_DAYS_AHEAD = 180;
const REVIEW_MIN = 20;

const createBody = z.object({
  artisanId: s.id,
  service: s.shortText(80).min(3),
  description: z.string().trim().min(20, 'Describe the work in at least 20 characters').max(2000),
  date: s.ymd,
  time: z.enum(TIME_WINDOWS),
  address: s.shortText(160).min(3),
  budget: s.naira.nullable().optional(),
  notes: s.shortText(500).default(''),
});

router.post('/', writeLimiter, validate({ body: createBody }), async (req, res) => {
  const v = req.valid.body;
  const today = lagosToday();
  if (v.date < today) throw badRequest('The date can’t be in the past.');
  const max = new Date(dateOnly(today).getTime() + MAX_DAYS_AHEAD * 86400000).toISOString().slice(0, 10);
  if (v.date > max) throw badRequest(`Choose a date within the next ${MAX_DAYS_AHEAD} days.`);

  const provider = await prisma.provider.findFirst({ where: { id: v.artisanId, listed: true } });
  if (!provider) throw notFound('Provider');
  assertNotOwnListing(provider, req.user);

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        customerId: req.user.id,
        providerId: provider.id,
        service: v.service,
        description: v.description,
        date: dateOnly(v.date),
        timeWindow: v.time,
        address: v.address,
        budget: v.budget ?? null,
        notes: v.notes,
        events: { create: { status: 'PENDING', note: 'Booking request sent', actorId: req.user.id } },
      },
      include: bookingInclude,
    });
    await notify(
      provider.userId,
      { type: 'booking.new', title: 'New booking request', body: `${req.user.name} requested “${v.service}” on ${v.date}.`, link: '/provider/requests' },
      tx,
    );
    return b;
  });

  res.status(201).json({ booking: out.booking(booking) });
});

const listQuery = s.pagination.extend({ scope: z.enum(['upcoming', 'past', 'all']).default('all') });

router.get('/', validate({ query: listQuery }), async (req, res) => {
  const { scope, page, limit } = req.valid.query;
  const statuses = { upcoming: ['PENDING', 'ACCEPTED'], past: ['COMPLETED', 'CANCELLED'], all: undefined }[scope];
  const where = { customerId: req.user.id, ...(statuses && { status: { in: statuses } }) };
  const orderBy = scope === 'upcoming' ? [{ date: 'asc' }] : [{ createdAt: 'desc' }];
  const [total, rows, counts] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, include: bookingInclude, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.booking.groupBy({ by: ['status'], where: { customerId: req.user.id }, _count: true }),
  ]);
  const summary = Object.fromEntries(['pending', 'accepted', 'completed', 'cancelled'].map((k) => [k, 0]));
  for (const c of counts) summary[c.status.toLowerCase()] = c._count;
  res.json({ bookings: rows.map(out.booking), counts: summary, page, limit, total, hasMore: page * limit < total });
});

router.get('/:id', validate({ params: s.idParams }), async (req, res) => {
  const b = await prisma.booking.findUnique({ where: { id: req.valid.params.id }, include: bookingInclude });
  // Either party may read it; anyone else gets a 404.
  if (!b || (b.customerId !== req.user.id && b.provider.userId !== req.user.id)) throw notFound('Booking');
  res.json({ booking: out.booking(b) });
});

router.post(
  '/:id/cancel',
  validate({ params: s.idParams, body: z.object({ reason: s.shortText(200).optional() }) }),
  async (req, res) => {
    const booking = await transitionBooking({ bookingId: req.valid.params.id, user: req.user, as: 'customer', action: 'cancel', reason: req.valid.body.reason });
    res.json({ booking: out.booking(booking) });
  },
);

// --- Reviews ---------------------------------------------------------------
// Only the customer of a completed booking can review it, once. The rating
// aggregate is recomputed in the same transaction.

const reviewBody = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(REVIEW_MIN, `Write at least ${REVIEW_MIN} characters`).max(2000),
  photo: s.uploadUrl.nullable().optional(),
});

const authorName = (name) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

router.post('/:id/review', writeLimiter, validate({ params: s.idParams, body: reviewBody }), async (req, res) => {
  const { rating, text, photo } = req.valid.body;
  const booking = await prisma.booking.findUnique({ where: { id: req.valid.params.id }, include: { review: true } });
  assertCustomerOf(booking, req.user);
  if (booking.status !== 'COMPLETED') throw conflict('You can review a booking once it’s marked as completed.');
  if (booking.review) throw conflict('You’ve already reviewed this booking.');
  await assertOwnUploads(req.user.id, [photo]);

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        providerId: booking.providerId,
        bookingId: booking.id,
        authorId: req.user.id,
        authorName: authorName(req.user.name),
        rating,
        text,
        service: booking.service,
        photoUrl: photo ?? null,
      },
    });
    await refreshRating(booking.providerId, tx);
    const provider = await tx.provider.findUnique({ where: { id: booking.providerId }, select: { userId: true } });
    await notify(provider.userId, { type: 'review.new', title: 'New review', body: `${r.authorName} rated you ${rating}/5.`, link: '/provider/dashboard' }, tx);
    return r;
  });

  res.status(201).json({ review: out.review(review) });
});

export default router;
