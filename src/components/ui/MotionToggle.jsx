import { Pause, Play } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../utils/format';

// Pause/resume for the looping landing-page animations. Hidden for
// reduced-motion users, who never see the loops in the first place.
export function MotionToggle({ className }) {
  const { motionPaused, setMotionPaused } = usePreferences();
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!motionPaused)}
      aria-pressed={motionPaused}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 border-line bg-surface/90 py-1.5 text-xs font-medium text-muted shadow-card backdrop-blur hover:text-ink motion-reduce:hidden',
        className,
      )}
    >
      {motionPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
      <span className="sr-only sm:not-sr-only">{motionPaused ? 'Play animation' : 'Pause animation'}</span>
    </button>
  );
}
