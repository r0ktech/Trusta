// Seeds categories, cities and the fictional demo providers, reusing the
// web app's demo data so the API serves exactly what the UI was built with.
// Safe to run repeatedly: catalogue rows are upserted and demo providers'
// sample reviews and portfolios are replaced. Real users' data is untouched.

import { prisma } from '../src/db.js';
import { buildSearchText } from '../src/lib/search.js';
import { CATEGORIES } from '../../src/data/categories.js';
import { LOCATIONS } from '../../src/data/locations.js';
import { ARTISANS } from '../../src/data/artisans.js';

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const CONTACT = { phone: 'PHONE', whatsapp: 'WHATSAPP', 'in-app': 'IN_APP' };

async function main() {
  for (const [i, c] of CATEGORIES.entries()) {
    const data = {
      name: c.name,
      provider: c.provider,
      icon: c.icon,
      tone: c.tone,
      board: c.board,
      description: c.description,
      keywords: c.keywords,
      popular: Boolean(c.popular),
      sortOrder: i,
    };
    await prisma.category.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data });
  }

  for (const l of LOCATIONS) {
    const data = { name: l.city, state: l.state, areas: l.areas };
    await prisma.city.upsert({ where: { id: slug(l.city) }, create: { id: slug(l.city), ...data }, update: data });
  }

  const categories = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.id, c]));

  for (const a of ARTISANS) {
    const data = {
      slug: a.slug,
      name: a.name,
      categoryId: a.category,
      specialties: a.specialties,
      bio: a.bio,
      city: a.city,
      state: a.state,
      serviceAreas: a.serviceAreas,
      yearsOfExperience: a.yearsOfExperience,
      verificationStatus: a.verificationStatus.toUpperCase(),
      pricingType: a.pricingType.toUpperCase(),
      startingPrice: a.startingPrice,
      priceUnit: a.priceUnit ?? null,
      contactPreference: CONTACT[a.contactPreference],
      languages: a.languages,
      availabilityStatus: a.availability.status.toUpperCase(),
      workDays: a.availability.days,
      workHours: a.availability.hours,
      availabilityNote: a.availability.note ?? null,
      listed: true,
      isDemo: true,
      ratingAvg: a.rating,
      reviewCount: a.reviewCount,
      searchText: buildSearchText(a, categories[a.category]),
      createdAt: new Date(`${a.joinedAt}T09:00:00.000Z`),
    };

    await prisma.$transaction([
      prisma.provider.upsert({ where: { id: a.id }, create: { id: a.id, ...data }, update: data }),
      prisma.review.deleteMany({ where: { providerId: a.id, isSample: true } }),
      prisma.portfolioItem.deleteMany({ where: { providerId: a.id } }),
      prisma.review.createMany({
        data: a.reviews.map((r) => ({
          providerId: a.id,
          authorName: r.author,
          rating: r.rating,
          text: r.text,
          service: r.service,
          isSample: true,
          createdAt: new Date(`${r.date}T12:00:00.000Z`),
        })),
      }),
      prisma.portfolioItem.createMany({
        data: a.portfolio.map((p, i) => ({ providerId: a.id, title: p.title, location: p.location, tone: p.tone, sortOrder: i })),
      }),
    ]);
  }

  const counts = await Promise.all([prisma.category.count(), prisma.city.count(), prisma.provider.count({ where: { isDemo: true } }), prisma.review.count({ where: { isSample: true } })]);
  console.log(`Seeded ${counts[0]} categories, ${counts[1]} cities, ${counts[2]} demo providers, ${counts[3]} sample reviews.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
