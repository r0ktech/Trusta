import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, CalendarX2, Heart, MessageCircle, Settings, ChevronRight } from 'lucide-react';
import { useBookings } from '../context/BookingsContext';
import { useSaved } from '../context/SavedContext';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { useArtisans } from '../hooks/useArtisans';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BookingCard } from '../components/bookings/BookingCard';
import { BookingDetailModal } from '../components/bookings/BookingDetailModal';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { STATUS_META } from '../components/bookings/StatusBadge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Notice } from '../components/ui/Notice';
import { getCategory } from '../data/categories';
import { cn, formatRelative, todayISO } from '../utils/format';

const isUpcoming = (b) => b.status === 'pending' || b.status === 'accepted';

export default function BookingsPage() {
  useDocumentTitle('My bookings');
  const { customerBookings } = useBookings();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('upcoming');
  const [reviewBooking, setReviewBooking] = useState(null);

  const openId = params.get('id');
  const openBooking = customerBookings.find((b) => b.id === openId) ?? null;
  const setOpen = (b) => {
    const next = new URLSearchParams(params);
    if (b) next.set('id', b.id);
    else next.delete('id');
    setParams(next, { replace: true });
  };

  const counts = useMemo(
    () => customerBookings.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {}),
    [customerBookings],
  );

  const lists = useMemo(() => {
    const upcoming = customerBookings.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
    const past = customerBookings.filter((b) => !isUpcoming(b)).sort((a, b) => b.date.localeCompare(a.date));
    const all = [...customerBookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { upcoming, past, all };
  }, [customerBookings]);

  const awaitingReview = customerBookings.filter((b) => b.status === 'completed' && !b.reviewed);
  const shown = lists[tab];
  const today = todayISO();

  return (
    <div className="container-page flex-1 py-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{user ? `Welcome back, ${user.name.split(' ')[0]}` : 'My bookings'}</h1>
        <p className="text-muted">Track your booking requests, saved providers and conversations.</p>
      </div>

      {!user && (
        <Notice className="mt-5" tone="info">
          You’re browsing as a guest — bookings are kept in this browser.{' '}
          <Link to="/auth/sign-in" state={{ from: '/bookings' }} className="link">
            Start a demo session
          </Link>{' '}
          to personalise the dashboard.
        </Notice>
      )}

      {/* Overview */}
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Booking overview">
        {Object.entries(STATUS_META).map(([status, meta]) => (
          <li key={status} className="card p-4">
            <p className="text-sm text-muted">{meta.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{counts[status] ?? 0}</p>
          </li>
        ))}
      </ul>

      {awaitingReview.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-ink">
            <span className="font-semibold">How did it go?</span> {awaitingReview[0].service} with {awaitingReview[0].artisanName} is complete — share a review.
          </p>
          <button type="button" onClick={() => setReviewBooking(awaitingReview[0])} className="text-sm font-semibold text-brand hover:underline">
            Write a review
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="bookings-heading" className="min-w-0">
          <h2 id="bookings-heading" className="sr-only">
            Bookings
          </h2>
          <Tabs
            label="Booking filter"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'upcoming', label: 'Upcoming', count: lists.upcoming.length },
              { value: 'past', label: 'Past', count: lists.past.length },
              { value: 'all', label: 'All', count: lists.all.length },
            ]}
          />
          <div className="mt-5 space-y-3">
            {shown.length ? (
              shown.map((b) => (
                <div key={b.id} className="relative">
                  {tab === 'upcoming' && b.date < today && b.status === 'accepted' && (
                    <p className="mb-1 text-xs font-medium text-warn">Date has passed — mark it completed from the booking details.</p>
                  )}
                  <BookingCard booking={b} onOpen={setOpen} />
                </div>
              ))
            ) : (
              <EmptyState
                icon={tab === 'upcoming' ? CalendarCheck : CalendarX2}
                title={tab === 'upcoming' ? 'No upcoming bookings' : tab === 'past' ? 'No past bookings yet' : 'No bookings yet'}
                description="Find a provider and send a booking request — it will show up here."
              >
                <ButtonLink to="/explore">Find an artisan</ButtonLink>
              </EmptyState>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <SavedPreview />
          <ConversationsPreview />
          <Link to="/settings" className="card flex items-center gap-3 p-4 text-sm font-semibold hover:bg-surface2/50">
            <Settings className="h-5 w-5 text-subtle" aria-hidden="true" />
            Account settings
            <ChevronRight className="ml-auto h-4 w-4 text-subtle" aria-hidden="true" />
          </Link>
        </aside>
      </div>

      <BookingDetailModal
        booking={openBooking}
        open={!!openBooking}
        onClose={() => setOpen(null)}
        onReview={(b) => {
          setOpen(null);
          setReviewBooking(b);
        }}
      />
      <ReviewModal booking={reviewBooking} open={!!reviewBooking} onClose={() => setReviewBooking(null)} />
    </div>
  );
}

function PanelHeader({ icon: Icon, title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4 text-subtle" aria-hidden="true" />
        {title}
      </h2>
      <Link to={to} className="text-sm font-semibold text-brand hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function SavedPreview() {
  const { savedIds } = useSaved();
  const artisans = useArtisans();
  const saved = savedIds.map((id) => artisans.find((a) => a.id === id)).filter(Boolean);
  return (
    <section className="card overflow-hidden">
      <PanelHeader icon={Heart} title="Saved artisans" to="/saved" linkLabel="View all" />
      {saved.length ? (
        <ul className="divide-y divide-line">
          {saved.slice(0, 3).map((a) => (
            <li key={a.id}>
              <Link to={`/artisan/${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface2/50">
                <Avatar name={a.name} size="xs" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {getCategory(a.category)?.provider} · {a.city}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-muted">Tap the heart on any profile to keep it here.</p>
      )}
    </section>
  );
}

function ConversationsPreview() {
  const { conversations } = useMessages();
  return (
    <section className="card overflow-hidden">
      <PanelHeader icon={MessageCircle} title="Recent conversations" to="/messages" linkLabel="Open" />
      {conversations.length ? (
        <ul className="divide-y divide-line">
          {conversations.slice(0, 3).map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <Link to={`/messages?c=${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface2/50">
                  <Avatar name={c.participantName} size="xs" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm text-ink', c.unread ? 'font-bold' : 'font-medium')}>{c.participantName}</span>
                      <span className="shrink-0 text-[11px] text-subtle">{formatRelative(c.updatedAt)}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">{last ? `${last.sender === 'me' ? 'You: ' : ''}${last.text}` : 'No messages yet'}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-muted">No conversations yet.</p>
      )}
    </section>
  );
}
