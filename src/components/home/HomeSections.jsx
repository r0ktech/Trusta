import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, MapPin } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { useArtisans } from '../../hooks/useArtisans';
import { ArtisanCard } from '../artisans/ArtisanCard';
import { CategoryCard, tiltFor } from './CategoryCard';
import { SectionHeading } from './SectionHeading';
import { ButtonLink } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tabs } from '../ui/Tabs';
import { CategoryIcon } from '../artisans/CategoryIcon';
import { AdirePattern } from '../ui/AdirePattern';
import { HowItWorksDemo } from './HowItWorksDemo';
import { Reveal } from '../ui/Motion';
import { VerificationBadge } from '../artisans/VerificationBadge';
import { getCategory } from '../../data/categories';
import { cn, formatDate, pluralize } from '../../utils/format';

export function PopularCategories() {
  const artisans = useArtisans();
  const counts = useMemo(
    () => artisans.reduce((acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + 1 }), {}),
    [artisans],
  );
  const popular = [...CATEGORIES.filter((c) => c.popular), ...CATEGORIES.filter((c) => !c.popular)];
  return (
    <section aria-labelledby="categories-heading" className="container-page py-16 sm:py-24">
      <SectionHeading
        id="categories-heading"
        title="Every trade on one street"
        description="Pick a trade to see who covers your area, the jobs they’ve done and what customers say."
        action={{ to: '/categories', label: 'All categories' }}
      />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {popular.slice(0, 8).map((c, i) => (
          <CategoryCard key={c.id} category={c} count={counts[c.id] ?? 0} tilt={tiltFor(i)} delay={(i % 4) * 90} />
        ))}
      </div>
    </section>
  );
}

export function RecommendedArtisans() {
  const artisans = useArtisans();
  const picks = useMemo(
    () =>
      artisans
        .filter((a) => !a.isLocal && a.availability?.status !== 'unavailable')
        .sort((a, b) => b.rating * Math.log(b.reviewCount + 1) - a.rating * Math.log(a.reviewCount + 1))
        .slice(0, 6),
    [artisans],
  );
  return (
    <section aria-labelledby="recommended-heading" className="border-y border-line bg-surface2/50 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          id="recommended-heading"
            title="Highly rated in sample reviews"
          description="These are fictional demo profiles that show how Trusta presents a provider. Names, ratings and verification states are sample data."
          action={{ to: '/explore?sort=rating', label: 'See all providers' }}
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 90} className="flex">
              <ArtisanCard artisan={a} className="w-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


export function HowItWorksSteps() {
  return (
    <section aria-labelledby="how-heading" className="container-page py-16 sm:py-24">
      <SectionHeading id="how-heading" title="Hiring without the guesswork" action={{ to: '/how-it-works', label: 'Learn more' }} />
      <HowItWorksDemo />
    </section>
  );
}

const PROVIDER_BENEFITS = [
  'Build a digital professional profile',
  'Showcase completed projects with photos',
  'Reach customers in nearby communities',
  'Develop a public reputation through customer feedback',
];

export function ProviderCTA() {
  return (
    <section aria-labelledby="provider-cta-heading" className="container-page pb-16 sm:pb-20">
      <Reveal className="relative overflow-hidden rounded-3xl bg-forest px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute inset-0 overflow-hidden opacity-60 [mask-image:linear-gradient(100deg,transparent_35%,black_85%)]" aria-hidden="true">
          {/* drifts exactly one 48px tile per loop, so it never jumps */}
          <div className="anim-drift absolute -bottom-12 -right-12 left-0 top-0">
            <AdirePattern color="#1D5446" motif="stitch" scale={1.2} />
          </div>
        </div>
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 id="provider-cta-heading" className="text-[2rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl">
              Your skill deserves a bigger signboard.
            </h2>
            <p className="mt-4 max-w-lg text-white/75">
              Create a Trusta profile that shows customers what you do, where you work and the quality of jobs you have completed.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROVIDER_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4E9F70]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/become-a-provider" variant="inverse" size="lg">
                Create your provider profile
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <Link to="/how-it-works#artisans" className="inline-flex h-12 items-center px-2 text-sm font-semibold text-white/80 hover:text-white">
                How it works for providers
              </Link>
            </div>
          </div>
          <div className="hidden rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 lg:block" aria-hidden="true">
            <p className="text-sm font-medium text-white/60">Provider dashboard preview</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['Profile views', '—'],
                ['Requests', '4'],
                ['Reviews', '0'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/[0.07] p-3">
                  <p className="text-[11px] text-white/60">{k}</p>
                  <p className="mt-1 font-display text-xl font-bold text-white">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {['New booking request', 'Profile 67% complete'].map((t, i) => (
                <div key={t} className="flex items-center justify-between rounded-xl bg-white/[0.07] px-3.5 py-3 text-sm">
                  <span className="text-white/85">{t}</span>
                  {i === 0 ? (
                    <span className="relative flex">
                      <span className="anim-ping absolute inset-0 rounded-full bg-[#4E9F70]" />
                      <span className="relative rounded-full bg-[#4E9F70] px-2 py-0.5 text-[11px] font-semibold">New</span>
                    </span>
                  ) : (
                    <span className="text-xs text-white/50">Continue</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const NEARBY_CITIES = ['Awka', 'Enugu', 'Lagos', 'Abuja'];

export function NearbyServices() {
  const artisans = useArtisans();
  const [city, setCity] = useState('Awka');
  const services = useMemo(() => {
    const inCity = artisans.filter((a) => a.city === city);
    const byCat = inCity.reduce((acc, a) => {
      (acc[a.category] ||= []).push(a);
      return acc;
    }, {});
    return Object.entries(byCat)
      .map(([cat, list]) => ({ category: getCategory(cat), count: list.length, top: list.sort((a, b) => b.rating - a.rating)[0] }))
      .sort((a, b) => b.count - a.count || b.top.rating - a.top.rating);
  }, [artisans, city]);

  return (
    <section aria-labelledby="nearby-heading" className="border-t border-line bg-surface py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading id="nearby-heading" title="Popular services in nearby communities" />
        <Tabs
          className="mt-6"
          label="Choose a city"
          tabs={NEARBY_CITIES.map((c) => ({ value: c, label: c }))}
          value={city}
          onChange={setCity}
        />
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel" aria-label={`Services in ${city}`}>
          {services.map(({ category, count, top }, i) => (
            <li key={`${city}-${category.id}`} className="animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
              <Link
                to={`/explore?category=${category.id}&location=${encodeURIComponent(city)}`}
                className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:border-accent/40 hover:bg-surface2/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface2 text-brand">
                  <CategoryIcon category={category.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">
                    {category.name} in {city}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {pluralize(count, 'provider')} · top rated: {top.name}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <MapPin className="h-4 w-4 text-subtle" aria-hidden="true" />
          Not in these cities?{' '}
          <Link to="/explore" className="link">
            Browse all locations
          </Link>
        </p>
      </div>
    </section>
  );
}

export function RecentlyAdded() {
  const artisans = useArtisans();
  const recent = useMemo(
    () => [...artisans].filter((a) => !a.isLocal).sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 4),
    [artisans],
  );
  return (
    <section aria-labelledby="recent-heading" className="container-page py-16 sm:py-20">
      <SectionHeading
        id="recent-heading"
        title="Recently added providers"
        description="Demo profiles that joined most recently."
        action={{ to: '/explore?sort=newest', label: 'See newest' }}
      />
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((a, i) => (
          <Reveal as="li" key={a.id} delay={i * 80}>
            <Link to={`/artisan/${a.id}`} className="card flex h-full flex-col p-4 transition-shadow hover:shadow-lift">
              <div className="flex items-center gap-3">
                <Avatar name={a.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{a.name}</p>
                  <p className="truncate text-xs text-muted">
                    {getCategory(a.category).provider} · {a.city}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-1 flex-wrap items-end justify-between gap-2">
                <VerificationBadge status={a.verificationStatus} />
                <span className="text-xs text-subtle">Joined {formatDate(a.joinedAt, { month: 'short', year: 'numeric' })}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
