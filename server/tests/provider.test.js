import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, prisma, resetData, signUp, makeProvider, validProfile, pngBuffer } from './helpers.js';

before(resetData);
after(() => prisma.$disconnect());

test('profile creation validates pricing, city and category', async () => {
  const { agent } = await signUp();
  const noPrice = await agent.post('/api/provider/profile').send(validProfile({ startingPrice: null })).expect(400);
  assert.equal(noPrice.body.error.details[0].field, 'startingPrice');
  await agent.post('/api/provider/profile').send(validProfile({ city: 'Atlantis' })).expect(400);
  await agent.post('/api/provider/profile').send(validProfile({ city: 'Awka', state: 'Lagos' })).expect(400);
  await agent.post('/api/provider/profile').send(validProfile({ category: 'astronaut' })).expect(400);
  await agent.post('/api/provider/profile').send(validProfile({ phone: '123' })).expect(400);
  await agent.post('/api/provider/profile').send(validProfile({ pricingType: 'quote', startingPrice: null })).expect(201);
});

test('a new profile is searchable, unverified, and makes the user a provider', async () => {
  const { agent, provider } = await makeProvider({ name: 'Zubairu Distinctname' });
  assert.equal(provider.verificationStatus, 'unverified');
  assert.equal((await agent.get('/api/me')).body.user.role, 'provider');
  const found = await request(app).get('/api/artisans?q=distinctname').expect(200);
  assert.equal(found.body.results[0].id, provider.id);
  await agent.post('/api/provider/profile').send(validProfile()).expect(409);
});

test('providers cannot verify themselves', async () => {
  const { agent, provider } = await makeProvider();
  const res = await agent.patch('/api/provider/profile').send({ verificationStatus: 'verified', bio: 'x'.repeat(60) }).expect(200);
  assert.equal(res.body.profile.verificationStatus, 'unverified');
  const row = await prisma.provider.findUnique({ where: { id: provider.id } });
  assert.equal(row.verificationStatus, 'UNVERIFIED');
});

test('editing details, availability and listing', async () => {
  const { agent, provider } = await makeProvider();
  const res = await agent
    .patch('/api/provider/profile')
    .send({ availabilityStatus: 'busy', workDays: ['Mon', 'Sat'], listed: false, city: 'Enugu' })
    .expect(200);
  assert.equal(res.body.profile.availability.status, 'busy');
  assert.equal(res.body.profile.state, 'Enugu');
  await request(app).get(`/api/artisans/${provider.id}`).expect(404); // unlisted
  await agent.get(`/api/artisans/${provider.id}`).expect(200); // owner can still see it
});

test('services replace the whole list and feed search', async () => {
  const { agent } = await makeProvider();
  await agent.put('/api/provider/services').send({ services: [{ name: 'Fan fitting', pricingType: 'fixed', price: 100 }] }).expect(400);
  const res = await agent
    .put('/api/provider/services')
    .send({ services: [{ name: 'Chandelier hanging', pricingType: 'fixed', price: 9000 }, { name: 'Rewiring', pricingType: 'quote' }] })
    .expect(200);
  assert.equal(res.body.services.length, 2);
  const found = await request(app).get('/api/artisans?q=chandelier').expect(200);
  assert.equal(found.body.total, 1);
});

test('uploads are re-encoded, and only your own uploads can be attached', async () => {
  const owner = await makeProvider();
  const up = await owner.agent.post('/api/uploads').attach('image', await pngBuffer(), 'shop.png').expect(201);
  assert.match(up.body.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
  await request(app).get(up.body.url).expect(200).expect('content-type', /image\/webp/);

  await owner.agent.post('/api/uploads').attach('image', Buffer.from('<svg onload=alert(1)>'), 'x.png').expect(400);

  const stranger = await makeProvider();
  await stranger.agent.post('/api/provider/portfolio').send({ title: 'Not mine', imageUrl: up.body.url }).expect(400);
  await stranger.agent.post('/api/provider/portfolio').send({ title: 'Remote', imageUrl: 'https://evil.example/x.webp' }).expect(400);
  const ok = await owner.agent.post('/api/provider/portfolio').send({ title: 'Kitchen rewiring', imageUrl: up.body.url }).expect(201);
  await stranger.agent.delete(`/api/provider/portfolio/${ok.body.item.id}`).expect(404);
  await owner.agent.delete(`/api/provider/portfolio/${ok.body.item.id}`).expect(204);
});

test('provider endpoints need a provider profile', async () => {
  const { agent } = await signUp();
  await agent.get('/api/provider/profile').expect(404);
  await request(app).get('/api/provider/profile').expect(401);
});

test('deleting a profile with booking history unlists it instead', async () => {
  const pro = await makeProvider();
  const customer = await signUp();
  await customer.agent
    .post('/api/bookings')
    .send({ artisanId: pro.provider.id, service: 'House wiring', description: 'Sockets stopped working after a surge.', date: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10), time: 'Flexible — any time', address: 'Ifite' })
    .expect(201);
  const res = await pro.agent.delete('/api/provider/profile').expect(200);
  assert.equal(res.body.result, 'unlisted');
  const row = await prisma.provider.findUnique({ where: { id: pro.provider.id } });
  assert.equal(row.listed, false);
  assert.equal(row.userId, null);
  assert.equal((await customer.agent.get('/api/bookings')).body.total, 1); // customer keeps their history
});

test('dashboard stats count real views and bookings', async () => {
  const pro = await makeProvider();
  await request(app).get(`/api/artisans/${pro.provider.id}`).expect(200);
  await request(app).get(`/api/artisans/${pro.provider.id}`).expect(200);
  await pro.agent.get(`/api/artisans/${pro.provider.id}`).expect(200); // own views don't count
  await new Promise((r) => setTimeout(r, 100));
  const stats = await pro.agent.get('/api/provider/stats').expect(200);
  assert.equal(stats.body.views.total, 2);
  assert.equal(stats.body.views.weekly.length, 8);
  assert.equal(stats.body.bookings.pending, 0);
});
