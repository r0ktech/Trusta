import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useSaved } from '../../context/SavedContext';
import { cn } from '../../utils/format';

export function SaveButton({ artisan, className, withLabel = false }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(artisan.id);
  // Bumped on each save so the pop and burst replay.
  const [burst, setBurst] = useState(0);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) setBurst((n) => n + 1);
        toggleSaved(artisan);
      }}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? `Remove ${artisan.name} from saved` : `Save ${artisan.name}`}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-[color,background-color,border-color,transform] duration-150 active:scale-95',
        withLabel ? 'h-11 px-4 text-[15px]' : 'h-10 w-10',
        saved ? 'border-danger/30 bg-danger-soft text-danger' : 'border-line bg-surface text-muted hover:bg-surface2 hover:text-ink',
        className,
      )}
    >
      <span className="relative inline-flex">
        <Heart key={burst} className={cn('h-[18px] w-[18px]', burst > 0 && saved && 'animate-heart-pop')} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        {burst > 0 && saved && (
          <span key={`b${burst}`} className="pointer-events-none absolute inset-0 animate-burst rounded-full border-2 border-danger" aria-hidden="true" />
        )}
      </span>
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}
