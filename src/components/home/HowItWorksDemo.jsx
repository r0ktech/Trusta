import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Images, MapPin, Search, Send, Star } from 'lucide-react';
import { getArtisanById } from '../../data/artisans';
import { Avatar } from '../ui/Avatar';
import { usePreferences } from '../../context/PreferencesContext';
import { prefersReducedMotion } from '../../hooks/useInView';
import { cn, formatPrice } from '../../utils/format';

const STEP_MS = 4600;

const STEPS = [
  { icon: Search, title: 'Search for a service in your area', body: 'Tell us what you need and where. No location permission required.' },
  { icon: Images, title: 'Compare profiles, work and feedback', body: 'Check past jobs, ratings, experience and starting prices side by side.' },
  { icon: Send, title: 'Request a booking', body: 'Pick a date and share a general area, then track it from your dashboard.' },
];

// Sample providers used by the demo — the three electricians in the demo data.
const PEOPLE = ['a01', 'a29', 'a15'].map(getArtisanById);

// Reports whether the element is on screen right now (not just once).
function useOnScreen() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setOn(true);
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}

// Runs callbacks at fixed offsets after mount; skipped entirely when `instant`.
function useTimeline(marks, instant) {
  const [reached, setReached] = useState(instant ? marks.length : 0);
  useEffect(() => {
    if (instant) return setReached(marks.length);
    const timers = marks.map((ms, i) => setTimeout(() => setReached(i + 1), ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant]);
  return reached;
}

const QUERY = 'Electrician';

function SearchScene({ instant }) {
  const [typed, setTyped] = useState(instant ? QUERY.length : 0);
  useEffect(() => {
    if (instant) return undefined;
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setTyped(n);
      if (n >= QUERY.length) clearInterval(t);
    }, 95);
    return () => clearInterval(t);
  }, [instant]);
  const shown = useTimeline([1300, 1500, 1700, 2500], instant);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border-2 border-accent bg-surface px-3 py-2.5 text-sm shadow-card">
        <Search className="h-4 w-4 text-subtle" aria-hidden="true" />
        <span className="text-ink">{QUERY.slice(0, typed)}</span>
        <span className="anim-caret -ml-1.5 h-4 w-px bg-ink" />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface2 px-3 py-2 text-sm text-muted">
        <MapPin className="h-4 w-4 text-subtle" aria-hidden="true" />
        Awka, Anambra
      </div>
      <p className={cn('mb-2 mt-5 text-xs font-medium text-subtle transition-opacity duration-300', shown >= 1 ? 'opacity-100' : 'opacity-0')}>
        3 electricians nearby
      </p>
      <ul className="space-y-2">
        {PEOPLE.map((p, i) =>
          shown >= i + 1 ? (
            <li key={p.id} className="flex animate-rise items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2">
              <Avatar name={p.name} size="xs" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
              <span className="text-xs text-muted">{p.city}</span>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}

function CompareScene({ instant }) {
  const shown = useTimeline([150, 450, 750, 2000], instant);
  return (
    <ul className="space-y-2.5">
      {PEOPLE.map((p, i) =>
        shown >= i + 1 ? (
          <li
            key={p.id}
            className={cn(
              'animate-rise rounded-2xl border bg-surface p-3 transition-[border-color,box-shadow,transform] duration-500',
              i === 0 && shown >= 4 ? 'scale-[1.02] border-accent shadow-lift ring-2 ring-accent/30' : 'border-line',
            )}
          >
            <div className="flex items-center gap-2.5">
              <Avatar name={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Star className="h-3 w-3 text-star" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  {p.rating.toFixed(1)} · {p.yearsOfExperience} yrs · {p.city}
                </p>
              </div>
              <span className="text-xs font-semibold text-ink">{formatPrice(p)}</span>
            </div>
            {i === 0 && shown >= 4 && (
              <p className="mt-2 animate-rise text-xs font-medium text-brand">Best match: highly rated, covers Amawbia</p>
            )}
          </li>
        ) : null,
      )}
    </ul>
  );
}

function BookScene({ instant }) {
  const shown = useTimeline([200, 650, 1100, 1800, 2300], instant);
  const p = PEOPLE[0];
  const rows = [
    ['Service', 'House wiring'],
    ['Date', 'Sat, 10:00 AM'],
    ['Area', 'Amawbia, Awka'],
  ];
  return (
    <div className="relative">
      <div className="flex items-center gap-2.5">
        <Avatar name={p.name} size="sm" />
        <div>
          <p className="text-sm font-semibold text-ink">{p.name}</p>
          <p className="text-xs text-muted">Request a booking</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2">
        {rows.map(([k, v], i) => (
          <div key={k} className="flex items-center justify-between rounded-xl bg-surface2 px-3 py-2.5 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className={cn('font-medium text-ink transition-opacity duration-300', shown >= i + 1 ? 'opacity-100' : 'opacity-0')}>{v}</dd>
          </div>
        ))}
      </dl>
      <div
        className={cn(
          'mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150',
          shown === 4 && 'scale-95',
        )}
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Send booking request
      </div>
      {shown >= 5 && (
        <div className="absolute inset-x-0 -bottom-2 flex animate-pop items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-pop">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-brand">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" className="animate-draw [--len:24] [animation-delay:150ms]" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Request sent</p>
            <p className="text-xs text-muted">Chinedu usually replies within a day (sample)</p>
          </div>
        </div>
      )}
    </div>
  );
}

const SCENES = [SearchScene, CompareScene, BookScene];

export function HowItWorksDemo() {
  const [ref, onScreen] = useOnScreen();
  const { motionPaused } = usePreferences();
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0); // bumps on manual selection to restart the timer
  const reduced = prefersReducedMotion();
  const playing = onScreen && !motionPaused && !reduced;

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, step, cycle]);

  const Scene = SCENES[step];

  return (
    <div ref={ref} className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
      <ol className="space-y-3" aria-label="How Trusta works">
        {STEPS.map(({ icon: Icon, title, body }, i) => {
          const active = i === step;
          return (
            <li key={title}>
              <button
                type="button"
                onClick={() => {
                  setStep(i);
                  setCycle((c) => c + 1);
                }}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-300',
                  active ? 'border-accent/40 bg-surface shadow-card' : 'border-transparent hover:bg-surface2/60',
                )}
              >
                <div className="flex gap-4">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      active ? 'bg-primary text-on-primary' : 'bg-surface2 text-muted',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-subtle">Step {i + 1}</p>
                    <h3 className={cn('text-lg font-bold transition-colors', active ? 'text-ink' : 'text-muted')}>{title}</h3>
                    <p className={cn('grid text-muted transition-[grid-template-rows,opacity] duration-300', active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                      <span className="overflow-hidden pt-1">{body}</span>
                    </p>
                  </div>
                </div>
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-line" aria-hidden="true">
                    <span
                      key={`${step}-${cycle}`}
                      className="block h-full origin-left bg-accent"
                      style={{
                        animation: playing ? `grow-x ${STEP_MS}ms linear forwards` : 'none',
                        transform: playing ? undefined : 'scaleX(1)',
                      }}
                    />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* The phone-sized demo */}
      <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
        <div className="absolute -inset-3 -z-10 rounded-[2.5rem] sm:-inset-6 bg-accent-soft/70 [mask-image:radial-gradient(closest-side,black,transparent)]" />
        <div className="rounded-[2rem] border border-line bg-canvas p-2.5 shadow-pop">
          <div className="rounded-[1.6rem] border border-line bg-canvas">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-display text-sm font-extrabold text-ink">Trusta</span>
              <span className="flex gap-1">
                {STEPS.map((_, i) => (
                  <span key={i} className={cn('h-1.5 rounded-full transition-all duration-300', i === step ? 'w-5 bg-accent' : 'w-1.5 bg-line')} />
                ))}
              </span>
            </div>
            <div className="h-[22rem] overflow-hidden p-5">
              <div key={`${step}-${cycle}`} className="animate-page-in">
                <Scene instant={reduced} />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-subtle">Animated preview with sample providers</p>
      </div>
    </div>
  );
}
