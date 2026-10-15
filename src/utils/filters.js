// Pure search / filter / sort helpers for the explore page. They operate on
// plain artisan objects so the same logic can run against API data later.

import { CATEGORY_MAP } from '../data/categories';

export const DEFAULT_FILTERS = {
  q: '',
  location: '',
  category: '',
  minRating: 0,
  verified: false,
  pricing: '',
  maxPrice: '',
  availability: '',
  sort: 'relevance',
};

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'price-asc', label: 'Lowest starting price' },
  { value: 'newest', label: 'Recently added' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 3.5, label: '3.5 and above' },
  { value: 4, label: '4.0 and above' },
  { value: 4.5, label: '4.5 and above' },
];

export const PRICING_OPTIONS = [
  { value: '', label: 'Any pricing' },
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Hourly rate' },
  { value: 'quote', label: 'Quote-based' },
];

export const MAX_PRICE_OPTIONS = [
  { value: '', label: 'Any budget' },
  { value: '5000', label: 'Up to ₦5,000' },
  { value: '10000', label: 'Up to ₦10,000' },
  { value: '25000', label: 'Up to ₦25,000' },
  { value: '50000', label: 'Up to ₦50,000' },
];

export const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Any availability' },
  { value: 'available', label: 'Taking new jobs' },
  { value: 'weekends', label: 'Works weekends' },
];

export function filtersFromParams(params) {
  const minRating = Number(params.get('minRating'));
  return {
    ...DEFAULT_FILTERS,
    q: params.get('q') ?? '',
    location: params.get('location') ?? '',
    category: CATEGORY_MAP[params.get('category')] ? params.get('category') : '',
    minRating: Number.isFinite(minRating) ? minRating : 0,
    verified: params.get('verified') === '1',
    pricing: params.get('pricing') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    availability: params.get('availability') ?? '',
    sort: SORT_OPTIONS.some((o) => o.value === params.get('sort')) ? params.get('sort') : 'relevance',
  };
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === DEFAULT_FILTERS[key] || value === '' || value == null) return;
    if (typeof value === 'boolean') params.set(key, value ? '1' : '0');
    else params.set(key, String(value));
  });
  return params;
}

const normalise = (s = '') => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

function searchableText(artisan) {
  const category = CATEGORY_MAP[artisan.category];
  return normalise(
    [
      artisan.name,
      category?.name,
      category?.provider,
      ...(category?.keywords ?? []),
      ...(artisan.specialties ?? []),
      artisan.bio,
      artisan.city,
      artisan.state,
      ...(artisan.serviceAreas ?? []),
    ].join(' '),
  );
}

// Returns a score > 0 when every query term matches; 0 when not a match.
export function matchScore(artisan, query) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  const haystack = searchableText(artisan);
  const name = normalise(artisan.name);
  const specialties = normalise((artisan.specialties ?? []).join(' '));
  const category = CATEGORY_MAP[artisan.category];
  const categoryText = normalise(`${category?.name} ${category?.provider} ${(category?.keywords ?? []).join(' ')}`);

  let score = 0;
  for (const term of terms) {
    if (!haystack.includes(term)) return 0;
    if (name.includes(term)) score += 5;
    if (categoryText.includes(term)) score += 4;
    if (specialties.includes(term)) score += 3;
    score += 1;
  }
  return score;
}

export function matchesLocation(artisan, location) {
  if (!location) return true;
  const loc = normalise(location);
  return (
    normalise(artisan.city) === loc ||
    normalise(artisan.state) === loc ||
    (artisan.serviceAreas ?? []).some((a) => normalise(a) === loc)
  );
}

export function filterArtisans(artisans, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  return artisans.filter((a) => {
    if (f.category && a.category !== f.category) return false;
    if (!matchesLocation(a, f.location)) return false;
    if (f.minRating && a.rating < f.minRating) return false;
    if (f.verified && a.verificationStatus !== 'verified') return false;
    if (f.pricing && a.pricingType !== f.pricing) return false;
    if (f.maxPrice) {
      if (a.startingPrice == null || a.startingPrice > Number(f.maxPrice)) return false;
    }
    if (f.availability === 'available' && a.availability?.status !== 'available') return false;
    if (f.availability === 'weekends') {
      const days = a.availability?.days ?? [];
      if (!days.includes('Sat') && !days.includes('Sun')) return false;
    }
    if (f.q && matchScore(a, f.q) === 0) return false;
    return true;
  });
}

// Bayesian-style weighting so 5.0 from 3 reviews doesn't beat 4.8 from 20.
const weightedRating = (a) => (a.rating * a.reviewCount + 4 * 5) / (a.reviewCount + 5);

export function sortArtisans(artisans, sort = 'relevance', query = '') {
  const list = [...artisans];
  switch (sort) {
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'reviews':
      return list.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    case 'experience':
      return list.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
    case 'price-asc':
      return list.sort((a, b) => (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));
    case 'newest':
      return list.sort((a, b) => (b.joinedAt ?? '').localeCompare(a.joinedAt ?? ''));
    case 'relevance':
    default:
      return list.sort((a, b) => {
        const rel = matchScore(b, query) - matchScore(a, query);
        if (rel !== 0) return rel;
        const avail = (b.availability?.status === 'available') - (a.availability?.status === 'available');
        if (avail !== 0) return avail;
        return weightedRating(b) - weightedRating(a);
      });
  }
}

export function getActiveFilterChips(filters) {
  const chips = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”` });
  if (filters.location) chips.push({ key: 'location', label: filters.location });
  if (filters.category) chips.push({ key: 'category', label: CATEGORY_MAP[filters.category]?.name ?? filters.category });
  if (filters.minRating) chips.push({ key: 'minRating', label: `${filters.minRating}+ stars` });
  if (filters.verified) chips.push({ key: 'verified', label: 'Verified (demo)' });
  if (filters.pricing) chips.push({ key: 'pricing', label: PRICING_OPTIONS.find((o) => o.value === filters.pricing)?.label });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: MAX_PRICE_OPTIONS.find((o) => o.value === filters.maxPrice)?.label });
  if (filters.availability)
    chips.push({ key: 'availability', label: AVAILABILITY_OPTIONS.find((o) => o.value === filters.availability)?.label });
  return chips;
}

export function summarizeReviews(reviews = []) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  });
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10, distribution };
}
