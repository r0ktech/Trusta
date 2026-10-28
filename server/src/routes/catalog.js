import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Small, rarely-changing lists: let browsers and CDNs cache them briefly.
const cacheFor = (seconds) => (_req, res, next) => {
  res.set('Cache-Control', `public, max-age=${seconds}`);
  next();
};

router.get('/categories', cacheFor(300), async (_req, res) => {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.provider.groupBy({ by: ['categoryId'], where: { listed: true }, _count: true }),
  ]);
  const byId = Object.fromEntries(counts.map((c) => [c.categoryId, c._count]));
  res.json({ categories: categories.map(({ sortOrder, ...c }) => ({ ...c, providerCount: byId[c.id] ?? 0 })) });
});

router.get('/locations', cacheFor(3600), async (_req, res) => {
  const cities = await prisma.city.findMany({ orderBy: [{ state: 'asc' }, { name: 'asc' }] });
  res.json({ locations: cities.map((c) => ({ city: c.name, state: c.state, areas: c.areas })) });
});

export default router;
