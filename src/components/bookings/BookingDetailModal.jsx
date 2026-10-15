import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, FlaskConical, MessageCircle, PenLine, RotateCcw, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusBadge } from './StatusBadge';
import { BookingTimeline } from './BookingTimeline';
import { useBookings } from '../../context/BookingsContext';
import { useMessages } from '../../context/MessagesContext';
import { useToast } from '../../context/ToastContext';
import { useArtisans } from '../../hooks/useArtisans';
import { formatDate, formatNaira } from '../../utils/format';

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

export function BookingDetailModal({ booking, open, onClose, onReview }) {
  const { setStatus } = useBookings();
  const { startConversation } = useMessages();
  const { toast } = useToast();
  const artisans = useArtisans();
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!booking) return null;
  const artisan = artisans.find((a) => a.id === booking.artisanId);
  const isLocalProvider = booking.artisanId === 'local-provider';

  const simulate = (status, note, toastTitle) => {
    setStatus(booking.id, status, { note, by: 'provider' });
    toast({ title: toastTitle, description: 'Simulated provider response.', variant: 'info' });
  };

  const message = () => {
    if (!artisan) return;
    const id = startConversation(artisan);
    onClose();
    navigate(`/messages?c=${id}`);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="lg"
        title={booking.service}
        description={
          artisan ? (
            <>
              with{' '}
              <Link to={`/artisan/${artisan.id}`} className="link" onClick={onClose}>
                {booking.artisanName}
              </Link>
            </>
          ) : (
            `with ${booking.artisanName}`
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.status} />
          {booking.status === 'cancelled' && (
            <span className="text-sm text-muted">{booking.cancelledBy === 'provider' ? 'Declined by provider' : 'Cancelled by you'}</span>
          )}
          <span className="ml-auto text-xs text-subtle">Ref: {booking.id.slice(-6).toUpperCase()}</span>
        </div>

        <dl className="mt-4 divide-y divide-line border-y border-line">
          <Row label="Date">{formatDate(booking.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Row>
          <Row label="Time">{booking.time}</Row>
          <Row label="Area">{booking.address}</Row>
          <Row label="Budget">{booking.budget ? formatNaira(booking.budget) : 'Not specified'}</Row>
          <Row label="Description">{booking.description}</Row>
          {booking.notes && <Row label="Notes">{booking.notes}</Row>}
        </dl>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {booking.status === 'completed' && !booking.reviewed && (
            <Button onClick={() => onReview(booking)}>
              <PenLine className="h-4 w-4" aria-hidden="true" />
              Leave a review
            </Button>
          )}
          {booking.status === 'completed' && booking.reviewed && (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              You reviewed this booking
            </p>
          )}
          {artisan && (
            <Button variant="secondary" onClick={message}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Message provider
            </Button>
          )}
          {(booking.status === 'completed' || booking.status === 'cancelled') && artisan && (
            <Button variant="secondary" onClick={() => { onClose(); navigate(`/artisan/${artisan.id}`); }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Book again
            </Button>
          )}
          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <Button variant="danger-ghost" onClick={() => setConfirmCancel(true)}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancel booking
            </Button>
          )}
        </div>

        {/* Simulation controls */}
        {(booking.status === 'pending' || booking.status === 'accepted') && (
          <div className="mt-5 rounded-xl border border-dashed border-line bg-surface2/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FlaskConical className="h-4 w-4 text-subtle" aria-hidden="true" />
              Demo controls
            </p>
            <p className="mt-1 text-sm text-muted">
              {isLocalProvider
                ? 'This request went to your own provider listing — respond from the provider dashboard, or simulate it here.'
                : 'No real provider will respond. Use these buttons to move the booking through its stages.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {booking.status === 'pending' && (
                <>
                  <Button size="sm" variant="secondary" onClick={() => simulate('accepted', 'Accepted by provider (simulated)', 'Booking accepted')}>
                    Simulate: provider accepts
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => simulate('cancelled', 'Declined by provider (simulated)', 'Booking declined')}>
                    Simulate: provider declines
                  </Button>
                </>
              )}
              {booking.status === 'accepted' && (
                <Button size="sm" variant="secondary" onClick={() => simulate('completed', 'Marked as completed (simulated)', 'Booking completed')}>
                  Simulate: job completed
                </Button>
              )}
            </div>
          </div>
        )}

        <h3 className="mb-3 mt-6 text-sm font-bold">Activity</h3>
        <BookingTimeline history={booking.history} />
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this booking?"
        description={`Your ${booking.service.toLowerCase()} request with ${booking.artisanName} will be marked as cancelled. This can’t be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onConfirm={() => {
          setStatus(booking.id, 'cancelled', { note: 'Cancelled by you', by: 'customer' });
          toast({ title: 'Booking cancelled', variant: 'info' });
        }}
      />
    </>
  );
}
