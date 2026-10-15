import { Modal } from '../ui/Modal';
import { StatusBadge } from '../bookings/StatusBadge';
import { BookingTimeline } from '../bookings/BookingTimeline';
import { RequestActions } from './RequestActions';
import { DemoTag } from '../ui/Badge';
import { formatDate, formatNaira } from '../../utils/format';

export function ProviderRequestModal({ booking, onClose }) {
  return (
    <Modal open={!!booking} onClose={onClose} size="lg" title={booking?.service} description={booking ? `Request from ${booking.customerName}` : undefined}>
      {booking && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.isSample && <DemoTag>Sample request</DemoTag>}
          </div>
          <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
            {[
              ['Date', formatDate(booking.date, { weekday: 'long', day: 'numeric', month: 'long' })],
              ['Time', booking.time],
              ['Area', booking.address],
              ['Budget', booking.budget ? formatNaira(booking.budget) : 'Not specified'],
              ['Details', booking.description],
              ...(booking.notes ? [['Notes', booking.notes]] : []),
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0 break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <RequestActions booking={booking} size="md" />
          </div>
          <h3 className="mb-3 mt-6 text-sm font-bold">Activity</h3>
          <BookingTimeline history={booking.history} />
        </>
      )}
    </Modal>
  );
}
