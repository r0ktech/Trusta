import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, ButtonLink } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { Notice } from '../ui/Notice';
import { useBookings } from '../../context/BookingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProvider } from '../../context/ProviderContext';
import { TIME_WINDOWS, LOCAL_PROVIDER_ID } from '../../data/seeds';
import { formatDate, formatNaira, todayISO } from '../../utils/format';

const OTHER = '__other';

export function BookingModal({ artisan, open, onClose }) {
  const { createBooking } = useBookings();
  const { user } = useAuth();
  const { toast } = useToast();
  const { pushNotification } = useProvider();
  const [confirmed, setConfirmed] = useState(null);

  const serviceOptions = [...new Set([...(artisan.specialties ?? []), ...(artisan.services ?? []).map((s) => s.name)])];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      service: '',
      customService: '',
      description: '',
      date: '',
      time: '',
      address: '',
      budget: '',
      notes: '',
    },
  });

  const service = watch('service');
  const description = watch('description') ?? '';

  const close = () => {
    onClose();
    // Reset after the close animation so the confirmation doesn't flash.
    setTimeout(() => {
      setConfirmed(null);
      reset();
    }, 200);
  };

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 600)); // simulated request
    const booking = createBooking({
      artisanId: artisan.id,
      artisanName: artisan.name,
      artisanCategory: artisan.category,
      customerName: user?.name ?? 'Guest',
      service: values.service === OTHER ? values.customService.trim() : values.service,
      description: values.description.trim(),
      date: values.date,
      time: values.time,
      address: values.address.trim(),
      budget: values.budget ? Number(values.budget) : null,
      notes: values.notes.trim(),
    });
    if (artisan.id === LOCAL_PROVIDER_ID) {
      pushNotification({ title: 'New booking request', body: `${booking.customerName} requested “${booking.service}”.`, type: 'booking' });
    }
    setConfirmed(booking);
    toast({ title: 'Booking request saved', description: 'Track it from My bookings.' });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={confirmed ? undefined : `Request a booking`}
      description={confirmed ? undefined : `with ${artisan.name}`}
      hideClose={!!confirmed}
    >
      {confirmed ? (
        <div className="py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-brand">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Request saved</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Your request for <span className="font-medium text-ink">{confirmed.service}</span> on{' '}
            <span className="font-medium text-ink">{formatDate(confirmed.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span> is now
            listed as <span className="font-medium text-ink">Pending</span>.
          </p>
          <Notice className="mx-auto mt-5 max-w-md text-left">
            This is a simulation. {artisan.isLocal ? 'The request was added to your own provider dashboard.' : `${artisan.name} is a fictional demo provider and has not been contacted.`}
          </Notice>
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
            <ButtonLink to={`/bookings?id=${confirmed.id}`} onClick={close}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              View in my bookings
            </ButtonLink>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {artisan.availability?.status !== 'available' && (
            <Notice tone="warn">
              {artisan.name} lists limited availability{artisan.availability?.note ? ` — ${artisan.availability.note.toLowerCase()}` : ''}. You can still send a request.
            </Notice>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Service needed" required error={errors.service?.message} className="sm:col-span-2">
              <Select {...register('service', { required: 'Choose a service' })}>
                <option value="">Select a service</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value={OTHER}>Something else…</option>
              </Select>
            </Field>
            {service === OTHER && (
              <Field label="Describe the service" required error={errors.customService?.message} className="sm:col-span-2">
                <Input placeholder="e.g. Fix gate motor" {...register('customService', { validate: (v) => v.trim().length >= 3 || 'Tell us what service you need' })} />
              </Field>
            )}
            <Field
              label="Describe the work"
              required
              error={errors.description?.message}
              hint={`${description.trim().length}/20 minimum — include the problem, size of the job and any materials you have.`}
              className="sm:col-span-2"
            >
              <Textarea
                rows={4}
                placeholder="e.g. Two sockets in the kitchen stopped working after a power surge…"
                {...register('description', { validate: (v) => v.trim().length >= 20 || 'Please describe the work in at least 20 characters' })}
              />
            </Field>
            <Field label="Preferred date" required error={errors.date?.message}>
              <Input
                type="date"
                min={todayISO()}
                {...register('date', {
                  required: 'Choose a date',
                  validate: (v) => v >= todayISO() || 'Date can’t be in the past',
                })}
              />
            </Field>
            <Field label="Preferred time" required error={errors.time?.message}>
              <Select {...register('time', { required: 'Choose a time window' })}>
                <option value="">Select a time</option>
                {TIME_WINDOWS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Service address or area"
              required
              error={errors.address?.message}
              hint="A general area is enough for now — share your exact address only once you’ve agreed to the job."
              className="sm:col-span-2"
            >
              <Input
                placeholder={`e.g. ${artisan.serviceAreas?.[0] ?? 'Ifite'}, ${artisan.city}`}
                autoComplete="address-level3"
                {...register('address', { validate: (v) => v.trim().length >= 3 || 'Enter an address or area' })}
              />
            </Field>
            <Field label="Budget (₦)" optional error={errors.budget?.message} hint={artisan.startingPrice ? `Starting price listed: ${formatNaira(artisan.startingPrice)}` : 'This provider gives quotes.'}>
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                placeholder="e.g. 15000"
                {...register('budget', {
                  validate: (v) => !v || (Number(v) > 0 && Number(v) <= 50_000_000) || 'Enter a valid amount',
                })}
              />
            </Field>
            <Field label="Additional notes" optional className="sm:col-span-2">
              <Textarea rows={2} placeholder="Parking, gate instructions, best time to call…" {...register('notes')} />
            </Field>
          </div>

          <Notice>
            Booking is simulated. Your request is saved in this browser only and is not sent to {artisan.isLocal ? 'anyone' : 'the provider'}. No payment is taken.{' '}
            <Link to="/how-it-works#limits" className="link" onClick={close}>
              Learn more
            </Link>
          </Notice>

          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send booking request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
