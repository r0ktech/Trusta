import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import { refreshRating } from '../src/services/providers.js';

export const app = createApp();
export { prisma };

/** Clears everything tests create, keeping the seeded catalogue and demo providers. */
export async function resetData() {
  await prisma.review.deleteMany({ where: { isSample: false } });
  await prisma.provider.deleteMany({ where: { isDemo: false } });
  await prisma.user.deleteMany({});
  const touched = await prisma.provider.findMany({ where: { isDemo: true }, select: { id: true } });
  for (const p of touched) await refreshRating(p.id);
}

let n = 0;
/** Signs up a fresh user and returns a cookie-carrying agent. */
export async function signUp({ role = 'customer', name = 'Test User' } = {}) {
  const agent = request.agent(app);
  const email = `user${Date.now()}${n++}@example.com`;
  const res = await agent.post('/api/auth/signup').send({ name, email, password: 'correct-horse-9', role });
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user, email, password: 'correct-horse-9' };
}

export const validProfile = (overrides = {}) => ({
  name: 'Amaka Provider',
  phone: '0803 123 4567',
  category: 'electrician',
  specialties: ['House wiring', 'Inverter installation', 'Fault diagnosis'],
  state: 'Anambra',
  city: 'Awka',
  serviceAreas: ['Ifite', 'Amawbia'],
  yearsOfExperience: 6,
  bio: 'Electrician focused on safe home wiring and inverter setups. I label every breaker I touch.',
  pricingType: 'fixed',
  startingPrice: 7000,
  priceUnit: 'inspection visit',
  ...overrides,
});

/** Signs up a provider with a listed profile. */
export async function makeProvider(overrides) {
  const ctx = await signUp({ role: 'provider', name: 'Amaka Provider' });
  const res = await ctx.agent.post('/api/provider/profile').send(validProfile(overrides));
  if (res.status !== 201) throw new Error(`profile failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { ...ctx, provider: res.body.profile };
}

/** A date string `days` from today in Lagos. */
export function inDays(days) {
  const d = new Date(Date.now() + days * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(d);
}

export const bookingInput = (artisanId, overrides = {}) => ({
  artisanId,
  service: 'House wiring',
  description: 'Two sockets in the kitchen stopped working after a surge.',
  date: inDays(3),
  time: 'Morning (8 AM – 12 PM)',
  address: 'Ifite, Awka',
  budget: 15000,
  ...overrides,
});

export const pngBuffer = () =>
  sharp({ create: { width: 40, height: 30, channels: 3, background: { r: 200, g: 120, b: 30 } } }).png().toBuffer();
