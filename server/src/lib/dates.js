// Booking dates are calendar dates in Nigeria (WAT, UTC+1, no DST).

const LAGOS = 'Africa/Lagos';

/** Today's date in Lagos as YYYY-MM-DD. */
export function lagosToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LAGOS, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** A YYYY-MM-DD string as a Date at UTC midnight, matching how Postgres DATE values round-trip. */
export const dateOnly = (ymd) => new Date(`${ymd}T00:00:00.000Z`);

/** A Postgres DATE (Date at UTC midnight) back to YYYY-MM-DD. */
export const toYmd = (date) => date.toISOString().slice(0, 10);
