import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { uid } from '../utils/format';

// Reviews written in the demo are stored on this device only. The eligibility
// rules below (completed booking, one review per booking) are UX guard rails,
// not a secure or fraud-resistant reputation system — that needs a backend.

const ReviewsContext = createContext(null);

export const REVIEW_MIN_LENGTH = 20;

export function canReviewBooking(booking) {
  if (!booking) return { ok: false, reason: 'Booking not found.' };
  if (booking.origin !== 'customer') return { ok: false, reason: 'Only bookings you made can be reviewed.' };
  if (booking.status !== 'completed') return { ok: false, reason: 'You can review a booking once it is marked as completed.' };
  if (booking.reviewed) return { ok: false, reason: 'You have already reviewed this booking.' };
  return { ok: true };
}

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = usePersistentState(STORAGE_KEYS.reviews, []);

  const addReview = useCallback(
    ({ artisanId, bookingId, rating, text, service, author, photo }) => {
      const review = {
        id: uid('rv'),
        artisanId,
        bookingId,
        rating,
        text: text.trim(),
        service,
        author: author || 'You',
        photo: photo ?? null,
        date: new Date().toISOString().slice(0, 10),
        isSample: false,
        isLocal: true,
      };
      setReviews((list) => [review, ...list]);
      return review;
    },
    [setReviews],
  );

  const removeReview = useCallback((id) => setReviews((list) => list.filter((r) => r.id !== id)), [setReviews]);

  const value = useMemo(() => ({ reviews, addReview, removeReview }), [reviews, addReview, removeReview]);
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export const useReviews = () => useContext(ReviewsContext);
