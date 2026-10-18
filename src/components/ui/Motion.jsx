import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion, useInView } from '../../hooks/useInView';
import { cn } from '../../utils/format';

// Rises into place the first time it scrolls into view.
// The element is only hidden after the observer is armed (see index.css).
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...props }) {
  const [ref, inView] = useInView();
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    // Don't hide what's already on screen at mount — it would flash.
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) setArmed(true);
  }, [ref]);

  const state = armed ? (inView ? 'in' : 'armed') : undefined;
  return (
    <Tag ref={ref} data-reveal={state} style={{ '--reveal-delay': `${delay}ms` }} className={className} {...props}>
      {children}
    </Tag>
  );
}

// Counts up to `value` once visible. Non-numeric values render as-is.
export function CountUp({ value, duration = 900, className }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const target = Number(value);
  const numeric = Number.isFinite(target);
  const decimals = numeric && !Number.isInteger(target) ? String(value).split('.')[1]?.length ?? 1 : 0;
  const [shown, setShown] = useState(numeric ? 0 : value);
  const frame = useRef();

  useEffect(() => {
    if (!numeric) return setShown(value);
    if (!inView) return undefined;
    if (prefersReducedMotion()) return setShown(target);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(target * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [inView, target, numeric, value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {numeric ? (
        <>
          <span aria-hidden="true">{Number(shown).toFixed(decimals)}</span>
          <span className="sr-only">{value}</span>
        </>
      ) : (
        shown
      )}
    </span>
  );
}

// A circle that pops in, then a tick that draws itself.
export function SuccessCheck({ className }) {
  return (
    <span className={cn('mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-accent-soft text-brand', className)}>
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" className="animate-draw [--len:24] [animation-delay:220ms]" />
      </svg>
    </span>
  );
}

// A progress bar that fills from empty the first time it is seen.
export function GrowBar({ percent, delay = 0, className }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <span ref={ref} className="block h-full w-full">
      <span
        className={cn('block h-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)]', className)}
        style={{ width: `${percent}%`, transform: inView ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${delay}ms` }}
      />
    </span>
  );
}
