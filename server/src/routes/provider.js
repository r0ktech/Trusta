import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/security.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { lagosToday, dateOnly } from '../lib/dates.js';
import { refreshSearchText, reviewSummary, retireProvider } from '../services/providers.js';
import { bookingInclude, transitionBooking } from '../services/bookings.js';
import { assertOwnUploads } from './uploads.js';
import { CONTACT_IN, PRICING_IN, AVAILABILITY_IN } from '../lib/serialize.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const profileFields = {
  name: s.name,
  phone: s.ngPhone,
  email: z.union([s.email, z.literal('')]).optional(),
  category: z.string().trim().min(1).max(40),
  specialties: s.stringList(8).refine((l) => l.length > 0, 'Add at least one skill'),
  state: s.shortText(40).min(2),
  city: s.shortText(60).min(2),
  serviceAreas: s.stringList(8).refine((l) => l.length > 0, 'Add at least one community'),
  yearsOfExperience: z.coerce.number().int().min(0).max(60),
  bio: z.string().trim().min(50, 'Write at least 50 characters').max(2000),
  pricingType: z.enum(['fixed', 'hourly', 'quote']),
  startingPrice: s.naira.nullable().optional(),
  priceUnit: s.shortText(40).optional(),
  contactPreference: z.enum(['phone', 'whatsapp', 'in-app']).default('in-app'),
  profileImage: s.uploadUrl.nullable().optional(),
};

const listingFields = {
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']),
  workDays: z.array(z.enum(DAYS)).min(1).max(7),
  workHours: s.shortText(40).min(3),
  availabilityNote: s.shortText(120).nullable(),
  listed: z.boolean(),
  languages: s.stringList(6, 30),
};

const portfolioInput = z.object({ title: s.shortText(60).min(2), location: s.shortText(60).optional(), imageUrl: s.uploadUrl });

const requirePrice = (v, ctx) => {
  if (v.pricingType && v.pricingType !== 'quote' && (v.startingPrice == null || v.startingPrice < 500)) {
    ctx.addIssue({ code: 'custom', path: ['startingPrice'], message: 'Enter a starting price of at least ₦500' });
  }
};

const createBody = z
  .object({ ...profileFields, portfolio: z.array(portfolioInput).max(6).default([]) })
  .superRefine(requirePrice);

const updateBody = z
  .object(profileFields)
  .partial()
  .extend(Object.fromEntries(Object.entries(listingFields).map(([k, v]) => [k, v.optional()])))
  .superRefine(requirePrice);

async function assertCategoryAndPlace({ category, city, state }) {
  if (category && !(await prisma.category.findUnique({ where: { id: category } }))) {
    throw badRequest('Choose a valid service category.');
  }
  if (city) {
    const known = await prisma.city.findFirst({ where: { name: { equals: city, mode: 'insensitive' } } });
    if (!known) throw badRequest('Trusta isn’t available in that city yet.');
    if (state && known.state.toLowerCase() !== state.toLowerCase()) throw badRequest(`${known.name} is in ${known.state}, not ${state}.`);
    return known;
  }
  return null;
}

/** Maps validated API fields onto database columns. */
function toColumns(v) {
  const data = {};
  for (const k of ['name', 'phone', 'specialties', 'serviceAreas', 'yearsOfExperience', 'bio', 'priceUnit', 'profileImage', 'workDays', 'workHours', 'availabilityNote', 'listed', 'languages']) {
    if (v[k] !== undefined) data[k] = v[k];
  }
  if (v.email !== undefined) data.email = v.email || null;
  if (v.category) data.categoryId = v.category;
  if (v.pricingType) {
    data.pricingType = PRICING_IN[v.pricingType];
    data.startingPrice = v.pricingType === 'quote' ? null : v.startingPrice;
    if (v.pricingType === 'quote') data.priceUnit = null;
  } else if (v.startingPrice !== undefined) {
    data.startingPrice = v.startingPrice;
  }
  if (v.contactPreference) data.contactPreference = CONTACT_IN[v.contactPreference];
  if (v.availabilityStatus) data.availabilityStatus = AVAILABILITY_IN[v.availabilityStatus];
  return data;
}

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'provider';

const fullInclude = {
  category: true,
  services: { orderBy: { sortOrder: 'asc' } },
  portfolio: { orderBy: { sortOrder: 'asc' } },
};

async function myProvider(user, include = fullInclude) {
  const p = await prisma.provider.findUnique({ where: { userId: user.id }, include });
  if (!p) throw notFound('Provider profile');
  return p;
}

function completion(p) {
  const items = [
    { key: 'photo', label: 'Add a profile photo', done: Boolean(p.profileImage) },
    { key: 'bio', label: 'Write a description of at least 80 characters', done: p.bio.length >= 80 },
    { key: 'skills', label: 'List at least 3 skills', done: p.specialties.length >= 3 },
    { key: 'areas', label: 'Add the areas you cover', done: p.serviceAreas.length >= 1 },
    { key: 'services', label: 'Add services with pricing', done: p.services.length >= 1 },
    { key: 'portfolio', label: 'Upload at least 2 work samples', done: p.portfolio.length >= 2 },
  ];
  return { percent: Math.round((items.filter((i) => i.done).length / items.length) * 100), items };
}

// --- Profile ---------------------------------------------------------------

router.post('/profile', writeLimiter, validate({ body: createBody }), async (req, res) => {
  const v = req.valid.body;
  if (await prisma.provider.findUnique({ where: { userId: req.user.id } })) {
    throw conflict('You already have a provider profile.');
  }
  const city = await assertCategoryAndPlace(v);
  await assertOwnUploads(req.user.id, [v.profileImage, ...v.portfolio.map((p) => p.imageUrl)]);

  const provider = await prisma.$transaction(async (tx) => {
    const created = await tx.provider.create({
      data: {
        ...toColumns(v),
        city: city.name,
        state: city.state,
        userId: req.user.id,
        slug: `${slugify(v.name)}-${Math.random().toString(36).slice(2, 7)}`,
        portfolio: { create: v.portfolio.map((p, i) => ({ ...p, tone: i % 4, sortOrder: i })) },
      },
    });
    if (req.user.role === 'CUSTOMER') await tx.user.update({ where: { id: req.user.id }, data: { role: 'PROVIDER' } });
    await refreshSearchText(created.id, tx);
    return tx.provider.findUnique({ where: { id: created.id }, include: fullInclude });
  });

  res.status(201).json({ profile: out.providerPrivate(provider), completion: completion(provider) });
});

router.get('/profile', async (req, res) => {
  const p = await myProvider(req.user);
  res.json({ profile: out.providerPrivate(p), completion: completion(p) });
});

router.patch('/profile', validate({ body: updateBody }), async (req, res) => {
  const v = req.valid.body;
  const current = await myProvider(req.user);
  const city = await assertCategoryAndPlace({ ...v, state: v.state ?? (v.city ? undefined : current.state) });
  await assertOwnUploads(req.user.id, [v.profileImage]);

  await prisma.provider.update({
    where: { id: current.id },
    data: { ...toColumns(v), ...(city && { city: city.name, state: city.state }) },
  });
  await refreshSearchText(current.id);
  const p = await myProvider(req.user);
  res.json({ profile: out.providerPrivate(p), completion: completion(p) });
});

router.delete('/profile', async (req, res) => {
  const p = await myProvider(req.user, undefined);
  const result = await prisma.$transaction(async (tx) => {
    const r = await retireProvider(p.id, tx);
    if (req.user.role === 'PROVIDER') await tx.user.update({ where: { id: req.user.id }, data: { role: 'CUSTOMER' } });
    return r;
  });
  res.json({ result });
});

// --- Services and portfolio ------------------------------------------------

const servicesBody = z.object({
  services: z
    .array(
      z
        .object({ name: s.shortText(60).min(2), pricingType: z.enum(['fixed', 'hourly', 'quote']), price: s.naira.nullable().optional() })
        .refine((x) => x.pricingType === 'quote' || (x.price != null && x.price >= 500), {
          path: ['price'],
          message: 'Enter a price of at least ₦500, or choose quote',
        }),
    )
    .max(12),
});

router.put('/services', validate({ body: servicesBody }), async (req, res) => {
  const p = await myProvider(req.user, undefined);
  await prisma.$transaction([
    prisma.service.deleteMany({ where: { providerId: p.id } }),
    prisma.service.createMany({
      data: req.valid.body.services.map((x, i) => ({
        providerId: p.id,
        name: x.name,
        pricingType: PRICING_IN[x.pricingType],
        price: x.pricingType === 'quote' ? null : x.price,
        sortOrder: i,
      })),
    }),
  ]);
  await refreshSearchText(p.id);
  const services = await prisma.service.findMany({ where: { providerId: p.id }, orderBy: { sortOrder: 'asc' } });
  res.json({ services: services.map(out.service) });
});

router.post('/portfolio', validate({ body: portfolioInput }), async (req, res) => {
  const p = await myProvider(req.user, { portfolio: true });
  if (p.portfolio.length >= 6) throw badRequest('You can show up to 6 work samples. Remove one first.');
  await assertOwnUploads(req.user.id, [req.valid.body.imageUrl]);
  const item = await prisma.portfolioItem.create({
    data: { ...req.valid.body, providerId: p.id, tone: p.portfolio.length % 4, sortOrder: p.portfolio.length },
  });
  res.status(201).json({ item: out.portfolioItem(item) });
});

const portfolioPatch = z.object({ title: s.shortText(60).min(2).optional(), location: s.shortText(60).optional(), sortOrder: z.number().int().min(0).max(20).optional() });

router.patch('/portfolio/:id', validate({ params: s.idParams, body: portfolioPatch }), async (req, res) => {
  const p = await myProvider(req.user, undefined);
  const { count } = await prisma.portfolioItem.updateMany({ where: { id: req.valid.params.id, providerId: p.id }, data: req.valid.body });
  if (!count) throw notFound('Work sample');
  const item = await prisma.portfolioItem.findUnique({ where: { id: req.valid.params.id } });
  res.json({ item: out.portfolioItem(item) });
});

router.delete('/portfolio/:id', validate({ params: s.idParams }), async (req, res) => {
  const p = await myProvider(req.user, undefined);
  const { count } = await prisma.portfolioItem.deleteMany({ where: { id: req.valid.params.id, providerId: p.id } });
  if (!count) throw notFound('Work sample');
  res.status(204).end();
});

// --- Booking requests ------------------------------------------------------

const bookingsQuery = s.pagination.extend({ status: z.enum(['pending', 'accepted', 'completed', 'cancelled', 'all']).default('all') });

router.get('/bookings', validate({ query: bookingsQuery }), async (req, res) => {
  const p = await myProvider(req.user, undefined);
  const { status, page, limit } = req.valid.query;
  const where = { providerId: p.id, ...(status !== 'all' && { status: status.toUpperCase() }) };
  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, include: bookingInclude, orderBy: [{ date: 'asc' }, { createdAt: 'desc' }], skip: (page - 1) * limit, take: limit }),
  ]);
  res.json({ bookings: rows.map(out.booking), page, limit, total, hasMore: page * limit < total });
});

router.post(
  '/bookings/:id/:action',
  validate({
    params: z.object({ id: s.id, action: z.enum(['accept', 'decline', 'complete', 'cancel']) }),
    body: z.object({ reason: s.shortText(200).optional() }),
  }),
  async (req, res) => {
    const booking = await transitionBooking({
      bookingId: req.valid.params.id,
      user: req.user,
      as: 'provider',
      action: req.valid.params.action,
      reason: req.valid.body.reason,
    });
    res.json({ booking: out.booking(booking) });
  },
);

// --- Dashboard stats -------------------------------------------------------

router.get('/stats', async (req, res) => {
  const p = await myProvider(req.user);
  const today = dateOnly(lagosToday());
  const since = new Date(today.getTime() - 55 * 86400000); // 8 weeks incl. today

  const [views, byStatus, summary] = await Promise.all([
    prisma.profileViewDay.findMany({ where: { providerId: p.id, day: { gte: since } } }),
    prisma.booking.groupBy({ by: ['status'], where: { providerId: p.id }, _count: true }),
    reviewSummary(p.id),
  ]);

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(since.getTime() + i * 7 * 86400000);
    return { weekStart: start.toISOString().slice(0, 10), views: 0 };
  });
  for (const v of views) {
    const idx = Math.floor((v.day.getTime() - since.getTime()) / (7 * 86400000));
    if (weeks[idx]) weeks[idx].views += v.count;
  }
  const bookings = Object.fromEntries(['pending', 'accepted', 'completed', 'cancelled'].map((k) => [k, 0]));
  for (const row of byStatus) bookings[row.status.toLowerCase()] = row._count;

  res.json({
    views: { total: weeks.reduce((n, w) => n + w.views, 0), weekly: weeks },
    bookings,
    reviews: summary,
    completion: completion(p),
  });
});

export default router;
