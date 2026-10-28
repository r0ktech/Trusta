import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, prisma, resetData } from './helpers.js';

before(resetData);
after(() => prisma.$disconnect());

const search = (qs) => request(app).get(`/api/artisans?${qs}`).expect(200);

test('lists listed providers with pagination', async () => {
  const res = await search('limit=9');
  assert.equal(res.body.total, 30);
  assert.equal(res.body.results.length, 9);
  assert.equal(res.body.hasMore, true);
  const page4 = await search('limit=9&page=4');
  assert.equal(page4.body.results.length, 3);
  assert.equal(page4.body.hasMore, false);
});

test('text search plus location ranks the best match first', async () => {
  const res = await search('q=inverter&location=Awka');
  assert.equal(res.body.results[0].name, 'Chinedu Okafor');
});

test('filters: category, verified, pricing, budget, availability, rating', async () => {
  assert.equal((await search('category=tailor')).body.total, 2);
  for (const a of (await search('verified=1&limit=50')).body.results) assert.equal(a.verificationStatus, 'verified');
  for (const a of (await search('pricing=quote&limit=50')).body.results) assert.equal(a.pricingType, 'quote');
  for (const a of (await search('maxPrice=5000&limit=50')).body.results) assert.ok(a.startingPrice <= 5000);
  for (const a of (await search('availability=weekends&limit=50')).body.results) {
    assert.ok(a.availability.days.includes('Sat') || a.availability.days.includes('Sun'));
  }
  for (const a of (await search('minRating=4.5&limit=50')).body.results) assert.ok(a.rating >= 4.5);
});

test('a city with no providers returns an empty page, not an error', async () => {
  const res = await search('location=Port%20Harcourt');
  assert.equal(res.body.total, 0);
  assert.deepEqual(res.body.results, []);
});

test('sorts are applied by the database', async () => {
  const exp = (await search('sort=experience&limit=5')).body.results.map((a) => a.yearsOfExperience);
  assert.deepEqual(exp, [...exp].sort((a, b) => b - a));
  const prices = (await search('sort=price-asc&limit=50')).body.results.map((a) => a.startingPrice);
  const priced = prices.filter((p) => p != null);
  assert.deepEqual(priced, [...priced].sort((a, b) => a - b));
  assert.ok(prices.indexOf(null) === -1 || prices.slice(prices.indexOf(null)).every((p) => p == null), 'quote-only providers come last');
});

test('invalid query parameters are rejected clearly', async () => {
  const res = await request(app).get('/api/artisans?sort=cheapest').expect(400);
  assert.equal(res.body.error.details[0].field, 'sort');
});

test('profile by id or slug, with review summary and no private fields', async () => {
  const byId = await request(app).get('/api/artisans/a02').expect(200);
  const bySlug = await request(app).get('/api/artisans/ngozi-eze').expect(200);
  assert.equal(byId.body.artisan.id, bySlug.body.artisan.id);
  const a = byId.body.artisan;
  assert.equal(a.reviewSummary.count, a.reviewCount);
  assert.equal('phone' in a, false);
  assert.equal('email' in a, false);
  await request(app).get('/api/artisans/zzz').expect(404);
});

test('unlisted providers disappear from search and their profile 404s', async () => {
  await prisma.provider.update({ where: { id: 'a03' }, data: { listed: false } });
  try {
    assert.equal((await search('q=adebayo')).body.total, 0);
    await request(app).get('/api/artisans/a03').expect(404);
  } finally {
    await prisma.provider.update({ where: { id: 'a03' }, data: { listed: true } });
  }
});

test('reviews are paginated and filterable by rating', async () => {
  const all = await request(app).get('/api/artisans/a01/reviews?limit=5').expect(200);
  assert.equal(all.body.reviews.length, 5);
  const fours = await request(app).get('/api/artisans/a01/reviews?rating=4&limit=50').expect(200);
  for (const r of fours.body.reviews) assert.equal(r.rating, 4);
});

test('viewing a profile counts a view', async () => {
  const before = await prisma.profileViewDay.aggregate({ where: { providerId: 'a05' }, _sum: { count: true } });
  await request(app).get('/api/artisans/a05').expect(200);
  await new Promise((r) => setTimeout(r, 100));
  const after = await prisma.profileViewDay.aggregate({ where: { providerId: 'a05' }, _sum: { count: true } });
  assert.equal((after._sum.count ?? 0) - (before._sum.count ?? 0), 1);
});

test('catalogue endpoints', async () => {
  const cats = await request(app).get('/api/categories').expect(200);
  assert.equal(cats.body.categories.length, 14);
  assert.equal(cats.body.categories.find((c) => c.id === 'electrician').providerCount, 3);
  const locs = await request(app).get('/api/locations').expect(200);
  assert.ok(locs.body.locations.some((l) => l.city === 'Awka' && l.areas.includes('Ifite')));
});
