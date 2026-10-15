import { useState } from 'react';
import { Check, CheckCheck, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useBookings } from '../../context/BookingsContext';
import { useToast } from '../../context/ToastContext';

// Accept / decline / complete controls for a request sent to the visitor's
// provider listing. All changes are local simulations.
export function RequestActions({ booking, size = 'sm' }) {
  const { setStatus } = useBookings();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(null);

  const accept = () => {
    setStatus(booking.id, 'accepted', { note: 'You accepted this request' });
    toast({ title: 'Request accepted', description: `${booking.customerName} — ${booking.service}` });
  };

  if (booking.status === 'pending') {
    return (
      <>
        <Button size={size} onClick={accept}>
          <Check className="h-4 w-4" aria-hidden="true" />
          Accept
        </Button>
        <Button size={size} variant="secondary" onClick={() => setConfirm('decline')}>
          <X className="h-4 w-4" aria-hidden="true" />
          Decline
        </Button>
        <ConfirmDialog
          open={confirm === 'decline'}
          onClose={() => setConfirm(null)}
          title="Decline this request?"
          description={`${booking.customerName} will see the request as declined.`}
          confirmLabel="Decline request"
          cancelLabel="Go back"
          onConfirm={() => {
            setStatus(booking.id, 'cancelled', { note: 'You declined this request', by: 'provider' });
            toast({ title: 'Request declined', variant: 'info' });
          }}
        />
      </>
    );
  }

  if (booking.status === 'accepted') {
    return (
      <>
        <Button size={size} variant="subtle" onClick={() => setConfirm('complete')}>
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          Mark completed
        </Button>
        <Button size={size} variant="danger-ghost" onClick={() => setConfirm('cancel')}>
          Cancel job
        </Button>
        <ConfirmDialog
          open={confirm === 'complete'}
          onClose={() => setConfirm(null)}
          destructive={false}
          title="Mark this job as completed?"
          description="The customer will then be able to leave a review."
          confirmLabel="Mark completed"
          cancelLabel="Not yet"
          onConfirm={() => {
            setStatus(booking.id, 'completed', { note: 'Marked as completed' });
            toast({ title: 'Job marked as completed' });
          }}
        />
        <ConfirmDialog
          open={confirm === 'cancel'}
          onClose={() => setConfirm(null)}
          title="Cancel this accepted job?"
          description="Cancelling after accepting can affect customer trust. Let the customer know why."
          confirmLabel="Cancel job"
          cancelLabel="Keep job"
          onConfirm={() => {
            setStatus(booking.id, 'cancelled', { note: 'Cancelled by you after accepting', by: 'provider' });
            toast({ title: 'Job cancelled', variant: 'info' });
          }}
        />
      </>
    );
  }

  return null;
}
