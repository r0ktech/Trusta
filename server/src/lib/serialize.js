import { toYmd } from './dates.js';

// Database rows → API JSON. Shapes deliberately match the objects the
// frontend already renders (see src/data/artisans.js in the web app), so the
// UI can move from mock data to the API without reshaping anything.

const lower = (v) => (v == null ? v : String(v).toLowerCase());

const CONTACT = { PHONE: 'phone', WHATSAPP: 'whatsapp', IN_APP: 'in-app' };
export const CONTACT_IN = { phone: 'PHONE', whatsapp: 'WHATSAPP', 'in-app': 'IN_APP' };
export const PRICING_IN = { fixed: 'FIXED', hourly: 'HOURLY', quote: 'QUOTE' };
export const AVAILABILITY_IN = { available: 'AVAILABLE', busy: 'BUSY', unavailable: 'UNAVAILABLE' };

export function user(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    city: u.city ?? '',
    role: lower(u.role),
    createdAt: u.createdAt,
  };
}

export const portfolioItem = (p) => ({
  id: p.id,
  title: p.title,
  location: p.location ?? null,
  image: p.imageUrl ?? null,
  tone: p.tone,
});

export const service = (s) => ({ id: s.id, name: s.name, pricingType: lower(s.pricingType), price: s.price });

/** Compact form used in search results and lists. */
export function providerCard(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    profileImage: p.profileImage,
    category: p.categoryId,
    specialties: p.specialties,
    city: p.city,
    state: p.state,
    serviceAreas: p.serviceAreas,
    yearsOfExperience: p.yearsOfExperience,
    rating: Math.round(p.ratingAvg * 10) / 10,
    reviewCount: p.reviewCount,
    verificationStatus: lower(p.verificationStatus),
    pricingType: lower(p.pricingType),
    startingPrice: p.startingPrice,
    priceUnit: p.priceUnit,
    availability: {
      status: lower(p.availabilityStatus),
      days: p.workDays,
      hours: p.workHours,
      ...(p.availabilityNote && { note: p.availabilityNote }),
    },
    contactPreference: CONTACT[p.contactPreference],
    joinedAt: toYmd(p.createdAt),
    isDemo: p.isDemo,
    listed: p.listed,
    portfolio: (p.portfolio ?? []).map(portfolioItem),
  };
}

/** Full public profile. Private contact details are never included. */
export function providerDetail(p, { reviewSummary, isOwner = false } = {}) {
  return {
    ...providerCard(p),
    bio: p.bio,
    languages: p.languages,
    services: (p.services ?? []).map(service),
    reviewSummary,
    isOwner,
  };
}

/** The owner's own view, including private fields. */
export const providerPrivate = (p) => ({ ...providerDetail(p, { isOwner: true }), phone: p.phone ?? '', email: p.email ?? '' });

export const review = (r) => ({
  id: r.id,
  author: r.authorName,
  rating: r.rating,
  text: r.text,
  service: r.service,
  date: toYmd(r.createdAt),
  photo: r.photoUrl,
  isSample: r.isSample,
});

export function booking(b) {
  return {
    id: b.id,
    artisanId: b.providerId,
    artisanName: b.provider?.name,
    artisanCategory: b.provider?.categoryId,
    customerName: b.customer?.name,
    service: b.service,
    description: b.description,
    date: toYmd(b.date),
    time: b.timeWindow,
    address: b.address,
    budget: b.budget,
    notes: b.notes,
    status: lower(b.status),
    cancelledBy: lower(b.cancelledBy) ?? undefined,
    reviewed: Boolean(b.review),
    history: (b.events ?? []).map((e) => ({ status: lower(e.status), at: e.createdAt, note: e.note })),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export const notification = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  link: n.link,
  read: Boolean(n.readAt),
  at: n.createdAt,
});

export const message = (m, viewerId) => ({
  id: m.id,
  sender: m.senderId === viewerId ? 'me' : 'them',
  text: m.body,
  sentAt: m.createdAt,
});
