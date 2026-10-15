import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { createSeedBookings, LOCAL_PROVIDER_ID } from '../data/seeds';
import { uid } from '../utils/format';

// Booking requests are simulated: they live in localStorage and never reach
// a real provider. Status changes that a provider would normally make are
// triggered from the UI and clearly labelled as simulations.

const BookingsContext = createContext(null);

export const BOOKING_STATUSES = ['pending', 'accepted', 'completed', 'cancelled'];

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = usePersistentState(STORAGE_KEYS.bookings, createSeedBookings);

  const createBooking = useCallback(
    (data) => {
      const now = new Date().toISOString();
      const booking = {
        id: uid('bk'),
        origin: 'customer',
        isSample: false,
        reviewed: false,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        history: [{ status: 'pending', at: now, note: 'Booking request sent' }],
        ...data,
      };
      setBookings((list) => [booking, ...list]);
      return booking;
    },
    [setBookings],
  );

  const updateBooking = useCallback(
    (id, patch, note) => {
      const now = new Date().toISOString();
      setBookings((list) =>
        list.map((b) => {
          if (b.id !== id) return b;
          const history = patch.status && patch.status !== b.status ? [...(b.history ?? []), { status: patch.status, at: now, note }] : b.history;
          return { ...b, ...patch, history, updatedAt: now };
        }),
      );
    },
    [setBookings],
  );

  const setStatus = useCallback(
    (id, status, { note, by } = {}) => updateBooking(id, { status, ...(status === 'cancelled' ? { cancelledBy: by } : {}) }, note),
    [updateBooking],
  );

  const addBookings = useCallback(
    (items) =>
      setBookings((list) => {
        const ids = new Set(list.map((b) => b.id));
        return [...items.filter((i) => !ids.has(i.id)), ...list];
      }),
    [setBookings],
  );

  const removeSampleProviderRequests = useCallback(
    () => setBookings((list) => list.filter((b) => b.origin !== 'sample-provider')),
    [setBookings],
  );

  const customerBookings = useMemo(() => bookings.filter((b) => b.origin === 'customer'), [bookings]);
  const providerRequests = useMemo(() => bookings.filter((b) => b.artisanId === LOCAL_PROVIDER_ID), [bookings]);

  const value = useMemo(
    () => ({
      bookings,
      customerBookings,
      providerRequests,
      createBooking,
      updateBooking,
      setStatus,
      addBookings,
      removeSampleProviderRequests,
    }),
    [bookings, customerBookings, providerRequests, createBooking, updateBooking, setStatus, addBookings, removeSampleProviderRequests],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);
