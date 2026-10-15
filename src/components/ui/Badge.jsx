import { cn } from '../../utils/format';

const TONES = {
  neutral: 'bg-surface2 text-muted border-line',
  green: 'bg-accent-soft text-brand border-accent/20',
  amber: 'bg-warn-soft text-warn border-warn/20',
  red: 'bg-danger-soft text-danger border-danger/20',
  blue: 'bg-info-soft text-info border-info/20',
  outline: 'bg-transparent text-muted border-line',
};

export function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DemoTag({ className, children = 'Demo' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-dashed border-subtle/50 px-1.5 py-px text-[11px] font-medium text-subtle',
        className,
      )}
    >
      {children}
    </span>
  );
}
