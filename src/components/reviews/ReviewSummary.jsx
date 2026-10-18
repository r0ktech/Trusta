import { Stars } from '../ui/StarRating';
import { GrowBar } from '../ui/Motion';
import { summarizeReviews } from '../../utils/filters';
import { cn } from '../../utils/format';

export function ReviewSummary({ reviews, activeRating, onSelectRating, className }) {
  const { average, count, distribution } = summarizeReviews(reviews);
  return (
    <div className={cn('flex flex-col gap-6 sm:flex-row sm:items-center', className)}>
      <div className="shrink-0 sm:w-40">
        <p className="font-display text-5xl font-extrabold text-ink">{count ? average.toFixed(1) : '–'}</p>
        <Stars value={average} size="md" className="mt-2" />
        <p className="mt-1.5 text-sm text-muted">{count ? `${count} ${count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</p>
      </div>
      <ul className="flex-1 space-y-1.5" aria-label="Rating distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = distribution[star] ?? 0;
          const pct = count ? Math.round((n / count) * 100) : 0;
          const active = activeRating === star;
          return (
            <li key={star}>
              <button
                type="button"
                disabled={!n || !onSelectRating}
                onClick={() => onSelectRating?.(active ? null : star)}
                aria-pressed={active}
                aria-label={`${star} star: ${n} ${n === 1 ? 'review' : 'reviews'}${onSelectRating && n ? '. Filter reviews' : ''}`}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-1.5 py-1 text-sm transition-colors enabled:hover:bg-surface2',
                  active && 'bg-accent-soft',
                )}
              >
                <span className="w-3 text-right font-medium text-muted">{star}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                  <GrowBar percent={pct} delay={(5 - star) * 70} className="bg-star" />
                </span>
                <span className="w-8 text-right tabular-nums text-subtle">{n}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
