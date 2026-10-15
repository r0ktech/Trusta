import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImagePlus, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Textarea } from '../ui/Field';
import { RatingInput } from '../ui/StarRating';
import { Notice } from '../ui/Notice';
import { useReviews, canReviewBooking, REVIEW_MIN_LENGTH } from '../../context/ReviewsContext';
import { useBookings } from '../../context/BookingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../utils/image';

export function ReviewModal({ booking, open, onClose }) {
  const { addReview } = useReviews();
  const { updateBooking } = useBookings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { rating: 0, text: '' } });

  const eligibility = canReviewBooking(booking);
  const textLength = watch('text')?.trim().length ?? 0;

  const close = () => {
    reset();
    setPhoto(null);
    setPhotoError('');
    onClose();
  };

  const onSubmit = async (values) => {
    // Re-check eligibility at submit time in case state changed.
    const check = canReviewBooking(booking);
    if (!check.ok) {
      toast({ title: 'Review not saved', description: check.reason, variant: 'error' });
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    addReview({
      artisanId: booking.artisanId,
      bookingId: booking.id,
      rating: values.rating,
      text: values.text,
      service: booking.service,
      author: user?.name ? `${user.name.split(' ')[0]} (you)` : 'You',
      photo,
    });
    updateBooking(booking.id, { reviewed: true });
    toast({ title: 'Review saved', description: 'It appears on the provider’s profile on this device only.' });
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Rate your experience" description={booking ? `${booking.service} with ${booking.artisanName}` : undefined}>
      {!eligibility.ok ? (
        <Notice tone="warn" title="This booking can’t be reviewed yet">
          {eligibility.reason}
        </Notice>
      ) : (
        <form id="review-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              Overall rating <span className="text-danger">*</span>
            </p>
            <Controller
              name="rating"
              control={control}
              rules={{ validate: (v) => v > 0 || 'Please choose a star rating' }}
              render={({ field }) => <RatingInput value={field.value} onChange={field.onChange} invalid={!!errors.rating} />}
            />
            {errors.rating && <p className="mt-1.5 text-xs font-medium text-danger">{errors.rating.message}</p>}
          </div>

          <Field
            label="Your review"
            required
            error={errors.text?.message}
            hint={`${textLength}/${REVIEW_MIN_LENGTH} characters minimum. Mention punctuality, quality and price.`}
          >
            <Textarea
              rows={5}
              placeholder="What was the job, and how did it go?"
              {...register('text', {
                validate: (v) => v.trim().length >= REVIEW_MIN_LENGTH || `Please write at least ${REVIEW_MIN_LENGTH} characters`,
              })}
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              Work photo <span className="text-xs font-normal text-subtle">(optional)</span>
            </p>
            {photo ? (
              <div className="relative inline-block">
                <img src={photo} alt="Selected work photo" className="h-28 w-36 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -right-2 -top-2 rounded-full bg-ink p-1 text-canvas"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-24 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-sm text-muted hover:border-accent hover:text-ink focus-within:ring-2 focus-within:ring-accent">
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
                Add photo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    setPhotoError('');
                    try {
                      setPhoto(await compressImage(e.target.files?.[0], 640));
                    } catch (err) {
                      setPhotoError(err.message);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            {photoError && <p className="mt-1.5 text-xs font-medium text-danger">{photoError}</p>}
          </div>

          <Notice>
            Demo reviews are stored only in this browser. The checks here (completed booking, one review per booking) are basic client-side rules — genuine,
            fraud-resistant reviews need the live platform.
          </Notice>
        </form>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={close}>
          {eligibility.ok ? 'Cancel' : 'Close'}
        </Button>
        {eligibility.ok && (
          <Button type="submit" form="review-form" loading={isSubmitting}>
            Submit review
          </Button>
        )}
      </div>
    </Modal>
  );
}
