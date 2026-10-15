import { cn } from '../../utils/format';

const STATES = {
  available: { label: 'Taking new jobs', dot: 'bg-accent', text: 'text-brand' },
  busy: { label: 'Limited availability', dot: 'bg-star', text: 'text-warn' },
  unavailable: { label: 'Not taking jobs', dot: 'bg-subtle', text: 'text-muted' },
};

export function AvailabilityBadge({ status = 'available', className }) {
  const s = STATES[status] ?? STATES.available;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.text, className)}>
      <span className={cn('h-2 w-2 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export const AVAILABILITY_LABELS = Object.fromEntries(Object.entries(STATES).map(([k, v]) => [k, v.label]));
