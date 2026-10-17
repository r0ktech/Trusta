import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Images, MapPin, Search, Send } from 'lucide-react';
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
import { Reveal } from '../motion/Reveal';
import { VerificationBadge } from '../artisans/VerificationBadge';
import { getCategory } from '../../data/categories';
import { formatDate, pluralize } from '../../utils/format';

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
      <Reveal stagger className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {popular.slice(0, 8).map((c, i) => (
          <CategoryCard key={c.id} category={c} count={counts[c.id] ?? 0} tilt={tiltFor(i)} />
        ))}
      </Reveal>
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
        <Reveal stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Search,
    title: 'Search for a service in your area',
    body: 'Tell us what you need and where. Pick your city — no location permission required.',
  },
  {
    icon: Images,
    title: 'Compare profiles, work samples and feedback',
    body: 'Look at past jobs, read what customers said, check experience and starting prices side by side.',
  },
  {
    icon: Send,
    title: 'Contact or request a booking',
    body: 'Send a message or a booking request with your preferred date, then track it from your dashboard.',
  },
];

export function HowItWorksSteps() {
  return (
    <section aria-labelledby="how-heading" className="container-page py-16 sm:py-20">
      <SectionHeading
        id="how-heading"
        title="Hiring without the guesswork"
        action={{ to: '/how-it-works', label: 'Learn more' }}
      />
      <Reveal as="ol" stagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="group relative md:px-6 md:first:pl-0 md:last:pr-0">
            {i < STEPS.length - 1 && <div className="absolute left-[3.25rem] right-0 top-6 hidden h-px bg-line md:block step-line" aria-hidden="true" />}
            <div className="flex items-start gap-4 md:block">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-card transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
                  {i + 1}
                </span>
              </span>
              <div className="md:mt-5">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-muted">{body}</p>
              </div>
            </div>
          </li>
        ))}
      </Reveal>
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
      <Reveal variant="scale" className="relative overflow-hidden rounded-3xl bg-forest px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute inset-0 opacity-60 [mask-image:linear-gradient(100deg,transparent_35%,black_85%)]" aria-hidden="true">
          <AdirePattern color="#1D5446" motif="stitch" scale={1.2} />
        </div>
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 id="provider-cta-heading" className="text-[2rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl">
              Your skill deserves a bigger signboard.
            </h2>
            <p className="mt-4 max-w-lg text-white/75">
              Create a Trusta profile that shows customers what you do, where you work and the quality of jobs you have completed.
            </p>
            <Reveal as="ul" stagger delay={200} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROVIDER_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4E9F70]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </Reveal>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/become-a-provider" variant="inverse" size="lg" className="group">
                Create your provider profile
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </ButtonLink>
              <Link to="/how-it-works#artisans" className="inline-flex h-12 items-center px-2 text-sm font-semibold text-white/80 hover:text-white">
                How it works for providers
              </Link>
            </div>
          </div>
          <div className="hidden animate-float rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 lg:block" aria-hidden="true">
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
                  <span className={i === 0 ? 'animate-pulse-ring rounded-full bg-[#4E9F70] px-2 py-0.5 text-[11px] font-semibold' : 'text-xs text-white/50'}>
                    {i === 0 ? 'New' : 'Continue'}
                  </span>
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
        <Reveal
          as="ul"
          stagger
          key={city}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
          aria-label={`Services in ${city}`}
        >
          {services.map(({ category, count, top }) => (
            <li key={category.id}>
              <Link
                to={`/explore?category=${category.id}&location=${encodeURIComponent(city)}`}
                className="card-lift group flex items-center gap-4 rounded-2xl border border-line p-4 hover:border-accent/40 hover:bg-surface2/50 hover:shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface2 text-brand transition-colors duration-300 group-hover:bg-accent-soft">
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
        </Reveal>
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
      <Reveal as="ul" stagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((a) => (
          <li key={a.id}>
            <Link to={`/artisan/${a.id}`} className="card card-lift flex h-full flex-col p-4 hover:shadow-lift">
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
          </li>
        ))}
      </Reveal>
    </section>
  );
}
