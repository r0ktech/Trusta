import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/useInView';
import { CategoryIcon } from '../artisans/CategoryIcon';
import { tone } from '../ui/tones';
import { cn, pluralize } from '../../utils/format';

// A hand-painted shop sign, the way artisans advertise on Nigerian streets.
// Each board links to that category on the explore page.
// `settle`: 'load' hangs the board as the page opens; 'view' waits until it scrolls into sight.
// `iconDelay` staggers the looping icon when the board sits inside an `.icon-loop` wall.
export function Signboard({ category, count, tilt = 0, delay = 0, iconDelay = 0, size = 'md', settle, className, to }) {
  const t = tone(category.tone);
  const [ref, inView] = useInView({ threshold: 0.3 });
  const hang = settle === 'view' ? inView : !!settle;
  return (
    <Link
      ref={ref}
      to={to ?? `/explore?category=${category.id}`}
      aria-label={`${category.name}: ${category.board}${count != null ? `, ${pluralize(count, 'provider')}` : ''}`}
      style={{ '--r': `${tilt}deg`, '--icon-delay': `${iconDelay}ms`, backgroundColor: t.board, color: t.ink, animationDelay: `${delay}ms` }}
      className={cn(
        'signboard group relative flex flex-col rounded-md p-1.5 shadow-board',
        hang && 'animate-hang',
        settle === 'view' && !inView && 'opacity-0',
        className,
      )}
    >
      {/* nails */}
      <span className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" aria-hidden="true" />
      <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" aria-hidden="true" />
      {/* painted inner frame */}
      <div
        className={cn('flex flex-1 flex-col rounded-[3px] border-2', size === 'lg' ? 'px-4 pb-4 pt-6' : 'px-4 pb-4 pt-5')}
        style={{ borderColor: 'color-mix(in srgb, currentColor 28%, transparent)' }}
      >
        <span className="trade-icon" data-icon={category.icon}>
          <CategoryIcon category={category.id} className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2.4} />
        </span>
        <p className={cn('mt-3 font-sign font-extrabold uppercase leading-[0.95]', size === 'lg' ? 'text-[1.55rem]' : 'text-xl')}>{category.board}</p>
        <p className="mt-auto flex items-baseline justify-between gap-2 pt-3 text-[13px] font-medium">
          <span className="opacity-85">{category.provider}</span>
          {count != null && <span className="shrink-0 tabular-nums opacity-65">{pluralize(count, 'provider')}</span>}
        </p>
      </div>
    </Link>
  );
}
