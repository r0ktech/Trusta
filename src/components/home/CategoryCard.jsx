import { Signboard } from './Signboard';
import { cn } from '../../utils/format';

// A signboard with a plain-language caption underneath.
export function CategoryCard({ category, count, tilt = 0, delay = 0, className }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <Signboard category={category} count={count} tilt={tilt} settle="view" delay={delay} className="min-h-[8.75rem]" />
      <p className="mt-3 px-0.5 text-sm leading-relaxed text-muted">{category.description}</p>
    </div>
  );
}

// Small, repeatable tilt so a grid of boards looks hung by hand, not stamped.
export const tiltFor = (i) => [-1.2, 0.8, -0.5, 1.1, 0.4, -0.9, 1.3, -0.3][i % 8];
