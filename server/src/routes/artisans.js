import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { notFound } from '../lib/errors.js';
import { queryTerms, rankByRelevance } from '../lib/search.js';
import { reviewSummary, recordView } from '../services/providers.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

const router = Router();

const SORTS = ['relevance', 'rating', 'reviews', 'experience', 'price-asc', 'newest'];

const listQuery = s.pagination.extend({
  q: z.string().trim().max(100).default(''),
  location: z.string().trim().max(60).default(''),
  category: z.string().trim().max(40).default(''),
  minRating: z.coerce.number().min(0).max(5).default(0),
  verified: z.enum(['1', 'true', '0', 'false']).optional().transform((v) => v === '1' || v === 'true'),
  pricing: z.enum(['fixed', 'hourly', 'quote', '']).default(''),
  maxPrice: z.coerce.number().int().positive().max(100_000_000).optional(),
  availability: z.enum(['available', 'weekends', '']).default(''),
  sort: z.enum(SORTS).default('relevance'),
});

// Ranking by text relevance happens in memory, so cap the candidate set.
const RELEVANCE_CAP = 500;

const ORDER = {
  rating: [{ ratingAvg: 'desc' }, { reviewCount: 'desc' }],
  reviews: [{ reviewCount: 'desc' }, { ratingAvg: 'desc' }],
  experience: [{ yearsOfExperience: 'desc' }, { ratingAvg: 'desc' }],
  'price-asc': [{ startingPrice: { sort: 'asc', nulls: 'last' } }, { ratingAvg: 'desc' }],
  newest: [{ createdAt: 'desc' }],
};

const cardInclude = { category: true, portfolio: { orderBy: { sortOrder: 'asc' }, take: 3 } };

router.get('/', validate({ query: listQuery }), async (req, res) => {
  const f = req.valid.query;
  const terms = queryTerms(f.q);

  const where = {
    listed: true,
    ...(f.category && { categoryId: f.category }),
    ...(f.minRating && { ratingAvg: { gte: f.minRating } }),
    ...(f.verified && { verificationStatus: 'VERIFIED' }),
    ...(f.pricing && { pricingType: f.pricing.toUpperCase() }),
    ...(f.maxPrice && { startingPrice: { not: null, lte: f.maxPrice } }),
    ...(f.availability === 'available' && { availabilityStatus: 'AVAILABLE' }),
    ...(f.availability === 'weekends' && { workDays: { hasSome: ['Sat', 'Sun'] } }),
    AND: [
      ...terms.map((t) => ({ searchText: { contains: t } })),
      ...(f.location
        ? [
            {
              OR: [
                { city: { equals: f.location, mode: 'insensitive' } },
                { state: { equals: f.location, mode: 'insensitive' } },
                { serviceAreas: { has: f.location } },
              ],
            },
          ]
        : []),
    ],
  };

  const skip = (f.page - 1) * f.limit;
  let total;
  let page;

  if (f.sort === 'relevance') {
    const candidates = await prisma.provider.findMany({ where, include: cardInclude, take: RELEVANCE_CAP });
    total = candidates.length;
    page = rankByRelevance(candidates, terms).slice(skip, skip + f.limit);
  } else {
    [total, page] = await Promise.all([
      prisma.provider.count({ where }),
      prisma.provider.findMany({ where, include: cardInclude, orderBy: ORDER[f.sort], skip, take: f.limit }),
    ]);
  }

  res.json({
    results: page.map(out.providerCard),
    page: f.page,
    limit: f.limit,
    total,
    hasMore: skip + page.length < total,
  });
});

const detailInclude = {
  category: true,
  services: { orderBy: { sortOrder: 'asc' } },
  portfolio: { orderBy: { sortOrder: 'asc' } },
};

// Accepts either the id or the slug.
async function findProvider(idOrSlug) {
  return prisma.provider.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, include: detailInclude });
}

router.get('/:id', validate({ params: s.idParams }), async (req, res) => {
  const p = await findProvider(req.valid.params.id);
  const isOwner = Boolean(p && req.user && p.userId === req.user.id);
  // Unlisted profiles are visible only to their owner.
  if (!p || (!p.listed && !isOwner)) throw notFound('Provider');
  if (!isOwner) recordView(p.id);
  res.json({ artisan: out.providerDetail(p, { reviewSummary: await reviewSummary(p.id), isOwner }) });
});

const reviewsQuery = s.pagination.extend({ rating: z.coerce.number().int().min(1).max(5).optional() });

router.get('/:id/reviews', validate({ params: s.idParams, query: reviewsQuery }), async (req, res) => {
  const { page, limit, rating } = req.valid.query;
  const p = await prisma.provider.findFirst({ where: { OR: [{ id: req.valid.params.id }, { slug: req.valid.params.id }], listed: true } });
  if (!p) throw notFound('Provider');
  const where = { providerId: p.id, hidden: false, ...(rating && { rating }) };
  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ]);
  res.json({ reviews: reviews.map(out.review), page, limit, total, hasMore: page * limit < total });
});

export default router;
