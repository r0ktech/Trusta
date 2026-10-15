import { Badge } from '../ui/Badge';

export const STATUS_META = {
  pending: { label: 'Pending', tone: 'amber' },
  accepted: { label: 'Accepted', tone: 'blue' },
  completed: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <Badge tone={meta.tone} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}
