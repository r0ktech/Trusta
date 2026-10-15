import { CalendarDays, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { DemoTag } from '../ui/Badge';
import { StatusBadge } from './StatusBadge';
import { getCategory } from '../../data/categories';
import { formatDate } from '../../utils/format';

// `perspective` controls whose name is shown: the provider (customer view)
// or the customer (provider view).
export function BookingCard({ booking, onOpen, perspective = 'customer', actions }) {
  const name = perspective === 'customer' ? booking.artisanName : booking.customerName;
  const sub = perspective === 'customer' ? getCategory(booking.artisanCategory)?.provider : booking.service;
  return (
    <article className="card p-4 transition-shadow hover:shadow-lift sm:p-5">
      <button type="button" onClick={() => onOpen(booking)} className="group flex w-full items-start gap-3.5 text-left" aria-label={`Open booking: ${booking.service} with ${name}`}>
        <Avatar name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{perspective === 'customer' ? booking.service : name}</p>
            <StatusBadge status={booking.status} />
            {booking.isSample && <DemoTag>Sample</DemoTag>}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">{perspective === 'customer' ? `${name} · ${sub ?? ''}` : sub}</p>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-subtle" aria-hidden="true" />
              {formatDate(booking.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-subtle" aria-hidden="true" />
              {booking.time?.split(' (')[0]}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
              <span className="truncate">{booking.address}</span>
            </span>
          </div>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">{actions}</div>}
    </article>
  );
}
