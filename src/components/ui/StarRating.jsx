import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/format';

export function Stars({ value = 0, size = 'sm', className }) {
  const px = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn('relative inline-block', px)}>
            <Star className={cn('absolute inset-0 text-line', px)} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn('text-star', px)} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingSummaryInline({ rating, count, className }) {
  if (!count) return <span className={cn('text-sm text-subtle', className)}>No reviews yet</span>;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <Star className="h-4 w-4 text-star" fill="currentColor" strokeWidth={0} aria-hidden="true" />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      <span className="text-muted">({count} sample {count === 1 ? 'review' : 'reviews'})</span>
    </span>
  );
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export function RatingInput({ value, onChange, invalid, name = 'rating' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Rating"
        aria-invalid={invalid || undefined}
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <label
            key={i}
            className="cursor-pointer rounded-lg p-1 focus-within:ring-2 focus-within:ring-accent"
            onMouseEnter={() => setHover(i)}
          >
            <input
              type="radio"
              name={name}
              value={i}
              checked={value === i}
              onChange={() => onChange(i)}
              className="sr-only"
              aria-label={`${i} star${i > 1 ? 's' : ''} — ${LABELS[i]}`}
            />
            <Star
              key={value === i ? `on-${i}` : `off-${i}`}
              className={cn('h-8 w-8 transition-colors', i <= shown ? 'text-star' : 'text-line', value === i && 'animate-pop')}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden="true"
            />
          </label>
        ))}
        <span className="ml-2 text-sm font-medium text-muted" aria-live="polite">
          {LABELS[shown]}
        </span>
      </div>
    </div>
  );
}
