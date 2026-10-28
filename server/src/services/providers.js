import { prisma } from '../db.js';
import { buildSearchText } from '../lib/search.js';
import { lagosToday, dateOnly } from '../lib/dates.js';

/** Recomputes the denormalised search text after a provider's details change. */
export async function refreshSearchText(providerId, db = prisma) {
  const p = await db.provider.findUnique({ where: { id: providerId }, include: { category: true, services: true } });
  if (!p) return;
  await db.provider.update({ where: { id: providerId }, data: { searchText: buildSearchText(p, p.category, p.services) } });
}

/** Recomputes the rating from visible reviews. Call inside the same transaction as the review change. */
export async function refreshRating(providerId, db = prisma) {
  const agg = await db.review.aggregate({ where: { providerId, hidden: false }, _avg: { rating: true }, _count: true });
  await db.provider.update({
    where: { id: providerId },
    data: { ratingAvg: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function reviewSummary(providerId) {
  const rows = await prisma.review.groupBy({ by: ['rating'], where: { providerId, hidden: false }, _count: true });
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    distribution[r.rating] = r._count;
    total += r._count;
    sum += r.rating * r._count;
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total, distribution };
}

/** Counts a profile view for today (Lagos time). Fire-and-forget. */
export function recordView(providerId) {
  const day = dateOnly(lagosToday());
  prisma.profileViewDay
    .upsert({
      where: { providerId_day: { providerId, day } },
      create: { providerId, day, count: 1 },
      update: { count: { increment: 1 } },
    })
    .catch(() => {});
}

/**
 * Removes a provider's listing when its owner leaves. Providers with booking
 * or review history are unlisted and detached instead of deleted, so their
 * customers keep their records.
 */
export async function retireProvider(providerId, db = prisma) {
  const history = await db.booking.count({ where: { providerId } });
  if (history === 0) {
    await db.provider.delete({ where: { id: providerId } });
    return 'deleted';
  }
  await db.provider.update({
    where: { id: providerId },
    data: { listed: false, userId: null, phone: null, email: null, availabilityStatus: 'UNAVAILABLE' },
  });
  return 'unlisted';
}
