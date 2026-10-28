// Text search and ranking for provider listings. Mirrors the client-side
// logic the web app used with mock data, so results feel the same.

export const normalise = (s = '') => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

/** Denormalised, lower-cased text stored on each provider for substring search. */
export function buildSearchText(p, category, services = []) {
  return normalise(
    [
      p.name,
      category?.name,
      category?.provider,
      ...(category?.keywords ?? []),
      ...(p.specialties ?? []),
      ...services.map((s) => s.name),
      p.bio,
      p.city,
      p.state,
      ...(p.serviceAreas ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export const queryTerms = (q) => normalise(q).split(/\s+/).filter(Boolean).slice(0, 8);

/** Higher is better; 0 means not every term matched. */
export function matchScore(p, terms) {
  if (!terms.length) return 1;
  const name = normalise(p.name);
  const specialties = normalise(p.specialties.join(' '));
  const category = normalise(`${p.category?.name ?? ''} ${p.category?.provider ?? ''} ${(p.category?.keywords ?? []).join(' ')}`);
  let score = 0;
  for (const t of terms) {
    if (!p.searchText.includes(t)) return 0;
    if (name.includes(t)) score += 5;
    if (category.includes(t)) score += 4;
    if (specialties.includes(t)) score += 3;
    score += 1;
  }
  return score;
}

// Bayesian average so 5.0 from 2 reviews doesn't outrank 4.8 from 20.
const weighted = (p) => (p.ratingAvg * p.reviewCount + 4 * 5) / (p.reviewCount + 5);

export function rankByRelevance(providers, terms) {
  return providers
    .map((p) => ({ p, s: matchScore(p, terms) }))
    .sort(
      (a, b) =>
        b.s - a.s ||
        (b.p.availabilityStatus === 'AVAILABLE') - (a.p.availabilityStatus === 'AVAILABLE') ||
        weighted(b.p) - weighted(a.p),
    )
    .map((x) => x.p);
}
