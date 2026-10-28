import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, prisma, resetData, signUp, makeProvider } from './helpers.js';

before(resetData);
after(() => prisma.$disconnect());

test('saved providers: idempotent save and remove', async () => {
  const { agent } = await signUp();
  await agent.put('/api/saved/a01').expect(204);
  await agent.put('/api/saved/a01').expect(204);
  await agent.put('/api/saved/a02').expect(204);
  const list = await agent.get('/api/saved').expect(200);
  assert.deepEqual(new Set(list.body.ids), new Set(['a01', 'a02']));
  await agent.delete('/api/saved/a01').expect(204);
  assert.deepEqual((await agent.get('/api/saved')).body.ids, ['a02']);
  await agent.put('/api/saved/nope').expect(404);
  await request(app).get('/api/saved').expect(401);
});

test('messaging between a customer and a provider', async () => {
  const pro = await makeProvider();
  const customer = await signUp({ name: 'Bayo Customer' });

  const open = await customer.agent.post('/api/conversations').send({ artisanId: pro.provider.id }).expect(201);
  const again = await customer.agent.post('/api/conversations').send({ artisanId: pro.provider.id }).expect(201);
  assert.equal(open.body.conversation.id, again.body.conversation.id, 'reuses the conversation');
  const id = open.body.conversation.id;

  const sent = await customer.agent.post(`/api/conversations/${id}/messages`).send({ text: 'Are you free on Saturday?' }).expect(201);
  assert.equal(sent.body.message.sender, 'me');

  // Provider sees it as unread, from "them", with a notification.
  const list = await pro.agent.get('/api/conversations').expect(200);
  assert.equal(list.body.conversations[0].unread, 1);
  assert.equal(list.body.conversations[0].as, 'provider');
  const msgs = await pro.agent.get(`/api/conversations/${id}/messages`).expect(200);
  assert.equal(msgs.body.messages[0].sender, 'them');
  assert.equal((await pro.agent.get('/api/notifications')).body.notifications[0].type, 'message.new');

  await pro.agent.post(`/api/conversations/${id}/read`).expect(204);
  assert.equal((await pro.agent.get('/api/conversations')).body.conversations[0].unread, 0);

  // Polling for new messages only.
  const since = sent.body.message.sentAt;
  await pro.agent.post(`/api/conversations/${id}/messages`).send({ text: 'Yes, from 10am.' }).expect(201);
  const fresh = await customer.agent.get(`/api/conversations/${id}/messages?after=${encodeURIComponent(since)}`).expect(200);
  assert.deepEqual(fresh.body.messages.map((m) => m.text), ['Yes, from 10am.']);

  // Outsiders can't read or write.
  const stranger = await signUp();
  await stranger.agent.get(`/api/conversations/${id}/messages`).expect(404);
  await stranger.agent.post(`/api/conversations/${id}/messages`).send({ text: 'hi' }).expect(404);
  await customer.agent.post(`/api/conversations/${id}/messages`).send({ text: '' }).expect(400);
});

test('demo providers have no inbox, and you cannot message yourself', async () => {
  const customer = await signUp();
  const conv = await customer.agent.post('/api/conversations').send({ artisanId: 'a01' }).expect(201);
  await customer.agent.post(`/api/conversations/${conv.body.conversation.id}/messages`).send({ text: 'Hello?' }).expect(403);
  const pro = await makeProvider();
  await pro.agent.post('/api/conversations').send({ artisanId: pro.provider.id }).expect(403);
});

test('notifications: mark one and all as read', async () => {
  const pro = await makeProvider();
  const customer = await signUp();
  const conv = await customer.agent.post('/api/conversations').send({ artisanId: pro.provider.id }).expect(201);
  for (const t of ['one', 'two']) await customer.agent.post(`/api/conversations/${conv.body.conversation.id}/messages`).send({ text: t }).expect(201);
  const inbox = await pro.agent.get('/api/notifications').expect(200);
  assert.equal(inbox.body.unread, 2);
  await pro.agent.post(`/api/notifications/${inbox.body.notifications[0].id}/read`).expect(204);
  await customer.agent.post(`/api/notifications/${inbox.body.notifications[1].id}/read`).expect(404); // not theirs
  await pro.agent.post('/api/notifications/read-all').expect(204);
  assert.equal((await pro.agent.get('/api/notifications')).body.unread, 0);
});

test('admin: only admins can verify providers and hide reviews', async () => {
  const pro = await makeProvider();
  const customer = await signUp();
  await customer.agent.patch(`/api/admin/providers/${pro.provider.id}/verification`).send({ status: 'verified' }).expect(403);

  const admin = await signUp({ name: 'Admin Person' });
  await prisma.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const queue = await admin.agent.get('/api/admin/providers?verification=unverified').expect(200);
  assert.ok(queue.body.providers.some((p) => p.id === pro.provider.id));
  await admin.agent.patch(`/api/admin/providers/${pro.provider.id}/verification`).send({ status: 'verified' }).expect(200);
  assert.equal((await request(app).get(`/api/artisans/${pro.provider.id}`)).body.artisan.verificationStatus, 'verified');
  assert.equal((await pro.agent.get('/api/notifications')).body.notifications[0].type, 'verification.approved');

  // Hiding a review removes it from the rating.
  const before = (await request(app).get('/api/artisans/a07')).body.artisan.reviewCount;
  const review = await prisma.review.findFirst({ where: { providerId: 'a07' } });
  await admin.agent.patch(`/api/admin/reviews/${review.id}`).send({ hidden: true }).expect(200);
  assert.equal((await request(app).get('/api/artisans/a07')).body.artisan.reviewCount, before - 1);
  await admin.agent.patch(`/api/admin/reviews/${review.id}`).send({ hidden: false }).expect(200);
});
