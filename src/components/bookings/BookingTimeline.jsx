import { STATUS_META } from './StatusBadge';
import { formatDate, formatTime, cn } from '../../utils/format';

const DOT = {
  pending: 'bg-star',
  accepted: 'bg-info',
  completed: 'bg-accent',
  cancelled: 'bg-subtle',
};

export function BookingTimeline({ history = [] }) {
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {history.map((h, i) => (
        <li key={`${h.status}-${h.at}-${i}`} className="relative">
          <span className={cn('absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface', DOT[h.status])} aria-hidden="true" />
          <p className="text-sm font-semibold text-ink">{STATUS_META[h.status]?.label}</p>
          <p className="text-sm text-muted">{h.note}</p>
          <p className="text-xs text-subtle">
            {formatDate(h.at)} · {formatTime(h.at)}
          </p>
        </li>
      ))}
    </ol>
  );
}
