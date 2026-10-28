import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, prisma, resetData, signUp, makeProvider, bookingInput, inDays } from './helpers.js';

before(resetData);
after(() => prisma.$disconnect());

async function setup() {
  const pro = await makeProvider();
  const customer = await signUp({ name: 'Chioma Customer' });
  const res = await customer.agent.post('/api/bookings').send(bookingInput(pro.provider.id)).expect(201);
  return { pro, customer, booking: res.body.booking };
}

test('booking input is validated', async () => {
  const pro = await makeProvider();
  const { agent } = await signUp();
  await request(app).post('/api/bookings').send(bookingInput(pro.provider.id)).expect(401);
  await agent.post('/api/bookings').send(bookingInput(pro.provider.id, { date: inDays(-1) })).expect(400);
  await agent.post('/api/bookings').send(bookingInput(pro.provider.id, { date: inDays(400) })).expect(400);
  await agent.post('/api/bookings').send(bookingInput(pro.provider.id, { description: 'too short' })).expect(400);
  await agent.post('/api/bookings').send(bookingInput(pro.provider.id, { time: 'Midnight' })).expect(400);
  await agent.post('/api/bookings').send(bookingInput('does-not-exist')).expect(404);
  await pro.agent.post('/api/bookings').send(bookingInput(pro.provider.id)).expect(403); // own listing
});

test('a new booking is pending, recorded, and notifies the provider', async () => {
  const { pro, booking } = await setup();
  assert.equal(booking.status, 'pending');
  assert.equal(booking.history.length, 1);
  const inbox = await pro.agent.get('/api/notifications').expect(200);
  assert.equal(inbox.body.notifications[0].type, 'booking.new');
  const requests = await pro.agent.get('/api/provider/bookings?status=pending').expect(200);
  assert.equal(requests.body.bookings[0].id, booking.id);
});

test('only the two parties can see a booking', async () => {
  const { pro, customer, booking } = await setup();
  await customer.agent.get(`/api/bookings/${booking.id}`).expect(200);
  await pro.agent.get(`/api/bookings/${booking.id}`).expect(200);
  const stranger = await signUp();
  await stranger.agent.get(`/api/bookings/${booking.id}`).expect(404);
});

test('full lifecycle: accept → complete → review, with rating recomputed', async () => {
  const { pro, customer, booking } = await setup();

  // The customer can't act as the provider, and another provider can't either.
  await customer.agent.post(`/api/provider/bookings/${booking.id}/accept`).expect(404);
  const other = await makeProvider();
  await other.agent.post(`/api/provider/bookings/${booking.id}/accept`).expect(404);

  // Can't review before completion.
  await customer.agent.post(`/api/bookings/${booking.id}/review`).send({ rating: 5, text: 'Great job, very neat and on time.' }).expect(409);
  await pro.agent.post(`/api/provider/bookings/${booking.id}/complete`).expect(409); // must accept first

  await pro.agent.post(`/api/provider/bookings/${booking.id}/accept`).expect(200);
  const done = await pro.agent.post(`/api/provider/bookings/${booking.id}/complete`).expect(200);
  assert.equal(done.body.booking.status, 'completed');
  assert.deepEqual(done.body.booking.history.map((h) => h.status), ['pending', 'accepted', 'completed']);

  // Only the customer may review, once.
  await pro.agent.post(`/api/bookings/${booking.id}/review`).send({ rating: 5, text: 'Reviewing myself, very nice work.' }).expect(404);
  await customer.agent.post(`/api/bookings/${booking.id}/review`).send({ rating: 4, text: 'short' }).expect(400);
  const rev = await customer.agent.post(`/api/bookings/${booking.id}/review`).send({ rating: 4, text: 'Fixed both sockets and explained the fault.' }).expect(201);
  assert.equal(rev.body.review.author, 'Chioma C.');
  await customer.agent.post(`/api/bookings/${booking.id}/review`).send({ rating: 1, text: 'Trying to review a second time.' }).expect(409);

  const profile = await request(app).get(`/api/artisans/${pro.provider.id}`).expect(200);
  assert.equal(profile.body.artisan.rating, 4);
  assert.equal(profile.body.artisan.reviewCount, 1);
  const mine = await customer.agent.get(`/api/bookings/${booking.id}`).expect(200);
  assert.equal(mine.body.booking.reviewed, true);
});

test('cancellation rules', async () => {
  const { pro, customer, booking } = await setup();
  const cancelled = await customer.agent.post(`/api/bookings/${booking.id}/cancel`).send({ reason: 'Fixed it myself' }).expect(200);
  assert.equal(cancelled.body.booking.status, 'cancelled');
  assert.equal(cancelled.body.booking.cancelledBy, 'customer');
  await customer.agent.post(`/api/bookings/${booking.id}/cancel`).expect(409);
  await pro.agent.post(`/api/provider/bookings/${booking.id}/accept`).expect(409);

  const second = await setup();
  const declined = await second.pro.agent.post(`/api/provider/bookings/${second.booking.id}/decline`).expect(200);
  assert.equal(declined.body.booking.cancelledBy, 'provider');
  const note = await second.customer.agent.get('/api/notifications').expect(200);
  assert.equal(note.body.notifications[0].type, 'booking.decline');
});

test('concurrent accept and cancel: exactly one wins', async () => {
  const { pro, customer, booking } = await setup();
  const [a, c] = await Promise.all([
    pro.agent.post(`/api/provider/bookings/${booking.id}/accept`),
    customer.agent.post(`/api/bookings/${booking.id}/cancel`),
  ]);
  const statuses = [a.status, c.status].sort();
  assert.ok(statuses[0] === 200, `one should succeed, got ${statuses}`);
  const final = await prisma.booking.findUnique({ where: { id: booking.id }, include: { events: true } });
  assert.equal(final.events.length, 2, 'only one transition recorded');
});

test('customer booking list scopes and counts', async () => {
  const { customer, booking, pro } = await setup();
  await pro.agent.post(`/api/provider/bookings/${booking.id}/decline`).expect(200);
  await customer.agent.post('/api/bookings').send(bookingInput(pro.provider.id)).expect(201);
  const upcoming = await customer.agent.get('/api/bookings?scope=upcoming').expect(200);
  const past = await customer.agent.get('/api/bookings?scope=past').expect(200);
  assert.equal(upcoming.body.total, 1);
  assert.equal(past.body.total, 1);
  assert.deepEqual(upcoming.body.counts, { pending: 1, accepted: 0, completed: 0, cancelled: 1 });
});
