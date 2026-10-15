import { Heart } from 'lucide-react';
import { useSaved } from '../../context/SavedContext';
import { cn } from '../../utils/format';

export function SaveButton({ artisan, className, withLabel = false }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(artisan.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(artisan);
      }}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? `Remove ${artisan.name} from saved` : `Save ${artisan.name}`}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-colors',
        withLabel ? 'h-11 px-4 text-[15px]' : 'h-10 w-10',
        saved ? 'border-danger/30 bg-danger-soft text-danger' : 'border-line bg-surface text-muted hover:text-ink hover:bg-surface2',
        className,
      )}
    >
      <Heart className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}
