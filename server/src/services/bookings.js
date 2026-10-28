import { prisma } from '../db.js';
import { notify } from '../lib/notify.js';
import { conflict, forbidden, notFound } from '../lib/errors.js';

export const bookingInclude = {
  provider: { select: { id: true, name: true, categoryId: true, userId: true } },
  customer: { select: { id: true, name: true } },
  events: { orderBy: { createdAt: 'asc' } },
  review: { select: { id: true } },
};

// Who may move a booking from which status to which, and what it's recorded as.
const TRANSITIONS = {
  customer: {
    cancel: { from: ['PENDING', 'ACCEPTED'], to: 'CANCELLED', cancelledBy: 'CUSTOMER', note: 'Cancelled by the customer' },
  },
  provider: {
    accept: { from: ['PENDING'], to: 'ACCEPTED', note: 'Accepted by the provider' },
    decline: { from: ['PENDING'], to: 'CANCELLED', cancelledBy: 'PROVIDER', note: 'Declined by the provider' },
    complete: { from: ['ACCEPTED'], to: 'COMPLETED', note: 'Marked as completed by the provider' },
    cancel: { from: ['ACCEPTED'], to: 'CANCELLED', cancelledBy: 'PROVIDER', note: 'Cancelled by the provider after accepting' },
  },
};

const MESSAGES = {
  accept: (b) => ({ title: 'Booking accepted', body: `${b.provider.name} accepted your request for “${b.service}”.` }),
  decline: (b) => ({ title: 'Booking declined', body: `${b.provider.name} can’t take your request for “${b.service}”.` }),
  complete: (b) => ({ title: 'Job completed', body: `${b.provider.name} marked “${b.service}” as done. How did it go? Leave a review.` }),
  cancel: (b, as) =>
    as === 'customer'
      ? { title: 'Booking cancelled', body: `${b.customer.name} cancelled their request for “${b.service}”.` }
      : { title: 'Booking cancelled', body: `${b.provider.name} cancelled “${b.service}”.` },
};

/**
 * Applies `action` to a booking as `as` ('customer' | 'provider') for `user`.
 * The status check and the update happen atomically, so two people acting at
 * once can't both succeed (e.g. accept vs cancel).
 */
export async function transitionBooking({ bookingId, user, as, action, reason }) {
  const rule = TRANSITIONS[as]?.[action];
  if (!rule) throw notFound('Action');

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
    if (!booking) throw notFound('Booking');
    const isParty = as === 'customer' ? booking.customerId === user.id : booking.provider.userId === user.id;
    if (!isParty) throw notFound('Booking'); // don't reveal that it exists

    if (!rule.from.includes(booking.status)) {
      throw conflict(`This booking is ${booking.status.toLowerCase()} and can’t be changed that way.`);
    }

    const { count } = await tx.booking.updateMany({
      where: { id: bookingId, status: booking.status },
      data: { status: rule.to, ...(rule.cancelledBy && { cancelledBy: rule.cancelledBy }) },
    });
    if (count !== 1) throw conflict('This booking was just updated by someone else. Refresh and try again.');

    await tx.bookingEvent.create({
      data: { bookingId, status: rule.to, note: reason ? `${rule.note}: ${reason}` : rule.note, actorId: user.id },
    });

    const recipient = as === 'customer' ? booking.provider.userId : booking.customerId;
    const msg = MESSAGES[action](booking, as);
    await notify(
      recipient,
      { type: `booking.${action}`, ...msg, link: as === 'customer' ? '/provider/requests' : `/bookings?id=${bookingId}` },
      tx,
    );

    return tx.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  });
}

export function assertCustomerOf(booking, user) {
  if (!booking || booking.customerId !== user.id) throw notFound('Booking');
}

export function assertNotOwnListing(provider, user) {
  if (provider.userId && provider.userId === user.id) throw forbidden('You can’t book your own listing.');
}
