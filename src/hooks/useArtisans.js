import { useMemo } from 'react';
import { ARTISANS } from '../data/artisans';
import { LOCAL_PROVIDER_ID } from '../data/seeds';
import { useProvider } from '../context/ProviderContext';
import { useReviews } from '../context/ReviewsContext';
import { summarizeReviews } from '../utils/filters';

// Single source for artisan listings. Today it merges static demo data with
// the visitor's locally created provider profile and locally written reviews;
// later this is where an API query would live.
export function useArtisans() {
  const { profile } = useProvider();
  const { reviews: userReviews } = useReviews();

  return useMemo(() => {
    const byArtisan = userReviews.reduce((acc, r) => {
      (acc[r.artisanId] ||= []).push(r);
      return acc;
    }, {});

    const withUserReviews = (artisan) => {
      const extra = byArtisan[artisan.id];
      if (!extra?.length) return artisan;
      const reviews = [...extra, ...artisan.reviews].sort((a, b) => b.date.localeCompare(a.date));
      const { average, count } = summarizeReviews(reviews);
      return { ...artisan, reviews, rating: average, reviewCount: count };
    };

    const list = ARTISANS.map(withUserReviews);

    if (profile && profile.listed !== false) {
      list.push(withUserReviews(profileToArtisan(profile)));
    }
    return list;
  }, [profile, userReviews]);
}

export function useArtisan(id) {
  const artisans = useArtisans();
  return useMemo(() => artisans.find((a) => a.id === id) ?? null, [artisans, id]);
}

export function profileToArtisan(profile) {
  return {
    id: LOCAL_PROVIDER_ID,
    slug: 'your-listing',
    name: profile.name,
    profileImage: profile.profileImage ?? null,
    category: profile.category,
    specialties: profile.specialties ?? [],
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    serviceAreas: profile.serviceAreas?.length ? profile.serviceAreas : [profile.city],
    yearsOfExperience: Number(profile.yearsOfExperience) || 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verificationStatus: 'unverified',
    pricingType: profile.pricingType,
    startingPrice: profile.pricingType === 'quote' ? null : Number(profile.startingPrice) || null,
    priceUnit: profile.priceUnit,
    services: profile.services ?? [],
    portfolio: (profile.portfolio ?? []).map((p, i) => ({ ...p, tone: i % 4 })),
    availability: {
      status: profile.available === false ? 'unavailable' : 'available',
      days: profile.days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      hours: profile.hours ?? '8:00 AM – 6:00 PM',
    },
    contactPreference: profile.contactPreference,
    languages: ['English'],
    joinedAt: profile.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    isDemo: true,
    isLocal: true,
  };
}
