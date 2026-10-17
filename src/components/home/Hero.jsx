import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroSearch } from '../search/HeroSearch';
import { ButtonLink } from '../ui/Button';
import { Signboard } from './Signboard';
import { CATEGORY_MAP } from '../../data/categories';
import { useArtisans } from '../../hooks/useArtisans';

// The boards on the wall, with how crooked each one hangs.
const WALL = [
  ['electrician', -2.2],
  ['tailor', 1.6],
  ['plumber', 1.1],
  ['hair', -1.5],
  ['mechanic', -0.8],
  ['makeup', 2],
];

export function Hero() {
  const artisans = useArtisans();
  const counts = useMemo(() => artisans.reduce((acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + 1 }), {}), [artisans]);
  const boards = WALL.map(([id, tilt]) => ({ category: CATEGORY_MAP[id], tilt }));

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] animate-drift rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-20 lg:pt-16">
        <div>
          <h1 className="animate-rise text-balance font-display text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
            Find trusted artisans near you.
          </h1>
          <p className="mt-6 max-w-[34rem] animate-rise text-lg leading-relaxed text-muted [animation-delay:120ms]">
            Compare electricians, plumbers, tailors, mechanics and more in Awka, Enugu, Lagos and Abuja by their past work, what customers say and what they
            charge.
          </p>

          <div className="mt-8 animate-rise [animation-delay:240ms]">
            <HeroSearch />
          </div>

          <div className="mt-5 flex animate-rise flex-wrap items-center gap-x-3 gap-y-1 [animation-delay:360ms]">
            <p className="text-sm text-muted">Do you work with your hands?</p>
            <ButtonLink to="/become-a-provider" variant="ghost" size="sm" className="group -ml-1 text-brand">
              Become a Provider
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>

        {/* Signboard wall */}
        <div aria-label="Popular trades" role="group" className="relative min-w-0">
          <div className="hidden grid-cols-2 gap-x-5 lg:grid">
            {[0, 1].map((col) => (
              <div key={col} className={col === 1 ? 'mt-10 space-y-5' : 'space-y-5'}>
                {boards
                  .map((b, i) => ({ ...b, i }))
                  .filter(({ i }) => i % 2 === col)
                  .map(({ category, tilt, i }) => (
                    <Signboard
                      key={category.id}
                      category={category}
                      count={counts[category.id] ?? 0}
                      tilt={tilt}
                      size="lg"
                      settle
                      delay={120 + i * 90}
                      className="min-h-[9.5rem]"
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* Phones: a swipeable row of boards */}
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-2 sm:-mx-6 sm:px-6 lg:hidden">
            {boards.map(({ category, tilt }, i) => (
              <Signboard
                key={category.id}
                category={category}
                count={counts[category.id] ?? 0}
                tilt={tilt * 0.6}
                settle
                delay={80 + i * 70}
                className="min-h-[8.5rem] w-44 shrink-0 snap-start"
              />
            ))}
          </div>

          <Link to="/categories" className="group mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline lg:mt-8">
            See all 14 trades
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
