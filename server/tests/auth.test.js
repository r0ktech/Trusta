import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, prisma, resetData, signUp } from './helpers.js';
import { outbox } from '../src/lib/mailer.js';

before(resetData);
after(() => prisma.$disconnect());

test('sign up starts a session and stores only a password hash', async () => {
  const { agent, email, user } = await signUp();
  assert.equal(user.role, 'customer');
  const me = await agent.get('/api/me').expect(200);
  assert.equal(me.body.user.email, email);
  const row = await prisma.user.findUnique({ where: { email } });
  assert.match(row.passwordHash, /^\$argon2id\$/);
  assert.equal(JSON.stringify(me.body).includes('passwordHash'), false);
});

test('session cookie is httpOnly and SameSite=Lax', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Cookie Check', email: `c${Date.now()}@example.com`, password: 'correct-horse-9' })
    .expect(201);
  const cookie = res.headers['set-cookie'].find((c) => c.startsWith('trusta_session='));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
});

test('sign-up cannot create an admin', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Sneaky', email: `s${Date.now()}@example.com`, password: 'correct-horse-9', role: 'admin' })
    .expect(400);
  assert.equal(res.body.error.code, 'validation_failed');
});

test('duplicate email is rejected', async () => {
  const { email } = await signUp();
  await request(app).post('/api/auth/signup').send({ name: 'Again', email, password: 'correct-horse-9' }).expect(409);
});

test('login with a wrong password or unknown email gives the same error', async () => {
  const { email } = await signUp();
  const wrong = await request(app).post('/api/auth/login').send({ email, password: 'nope-nope-nope' }).expect(401);
  const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'nope-nope-nope' }).expect(401);
  assert.equal(wrong.body.error.message, unknown.body.error.message);
});

test('bearer tokens work for non-browser clients', async () => {
  const { email, password } = await signUp();
  const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
  await request(app).get('/api/me').set('Authorization', `Bearer ${login.body.token}`).expect(200);
});

test('logout ends the session', async () => {
  const { agent } = await signUp();
  await agent.post('/api/auth/logout').expect(204);
  await agent.get('/api/me').expect(401);
});

test('requests from a foreign origin are refused', async () => {
  const { agent } = await signUp();
  await agent.patch('/api/me').set('Origin', 'https://evil.example').send({ city: 'Awka' }).expect(403);
  await agent.patch('/api/me').set('Origin', 'http://localhost:5173').send({ city: 'Awka' }).expect(200);
});

test('password reset: single-use token, signs out everywhere', async () => {
  const { agent, email } = await signUp();
  await request(app).post('/api/auth/password/forgot').send({ email }).expect(202);
  // Unknown emails get the same response.
  await request(app).post('/api/auth/password/forgot').send({ email: 'ghost@example.com' }).expect(202);

  const mail = outbox.findLast((m) => m.to === email);
  const token = mail.text.match(/token=([\w-]+)/)[1];
  await request(app).post('/api/auth/password/reset').send({ token, password: 'brand-new-pass-1' }).expect(200);
  await request(app).post('/api/auth/password/reset').send({ token, password: 'another-pass-22' }).expect(400);

  await agent.get('/api/me').expect(401); // old session revoked
  await request(app).post('/api/auth/login').send({ email, password: 'brand-new-pass-1' }).expect(200);
});

test('changing password needs the current one', async () => {
  const { agent } = await signUp();
  await agent.post('/api/auth/password/change').send({ currentPassword: 'wrong-one-123', newPassword: 'new-pass-1234' }).expect(400);
  await agent.post('/api/auth/password/change').send({ currentPassword: 'correct-horse-9', newPassword: 'new-pass-1234' }).expect(200);
  await agent.get('/api/me').expect(200); // current session survives
});

test('profile and preference updates are validated', async () => {
  const { agent } = await signUp();
  await agent.patch('/api/me').send({ phone: '12345' }).expect(400);
  const ok = await agent.patch('/api/me').send({ phone: '0803 123 4567', city: 'Enugu' }).expect(200);
  assert.equal(ok.body.user.phone, '08031234567');
  const prefs = await agent.patch('/api/me/preferences').send({ notifications: { sms: true } }).expect(200);
  assert.equal(prefs.body.preferences.notifications.sms, true);
  assert.equal(prefs.body.preferences.notifications.messages, true);
});

test('account deletion requires the password', async () => {
  const { agent, email } = await signUp();
  await agent.delete('/api/me').send({ password: 'wrong-pass-123' }).expect(400);
  await agent.delete('/api/me').send({ password: 'correct-horse-9' }).expect(204);
  assert.equal(await prisma.user.findUnique({ where: { email } }), null);
});
