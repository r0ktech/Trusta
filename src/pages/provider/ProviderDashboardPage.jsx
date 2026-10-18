import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, Circle, Eye, Inbox, Star, ChevronRight } from 'lucide-react';
import { useProvider, getProfileCompletion } from '../../context/ProviderContext';
import { useBookings } from '../../context/BookingsContext';
import { useReviews } from '../../context/ReviewsContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LOCAL_PROVIDER_ID } from '../../data/seeds';
import { Toggle } from '../../components/ui/Toggle';
import { CountUp, GrowBar } from '../../components/ui/Motion';
import { DemoTag } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookingCard } from '../../components/bookings/BookingCard';
import { RequestActions } from '../../components/provider/RequestActions';
import { ProviderRequestModal } from '../../components/provider/ProviderRequestModal';
import { ReviewSummary } from '../../components/reviews/ReviewSummary';
import { ReviewItem } from '../../components/reviews/ReviewItem';
import { cn, formatRelative } from '../../utils/format';

const ViewsChart = lazy(() => import('../../components/provider/ViewsChart').then((m) => ({ default: m.ViewsChart })));

// Illustrative numbers derived from the profile id so they stay stable.
function illustrativeViews(seedText) {
  let h = [...seedText].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const rand = () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  const out = [];
  const now = new Date();
  let base = 12 + Math.round(rand() * 10);
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    base = Math.max(4, Math.round(base + (rand() - 0.35) * 9));
    out.push({ week: d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }), views: base });
  }
  return out;
}

function Metric({ icon: Icon, label, value, note, demo }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface2 text-muted">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        {demo && <DemoTag>Illustrative</DemoTag>}
      </div>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold text-ink">
        <CountUp value={value} />
      </p>
      {note && <p className="mt-0.5 text-xs text-subtle">{note}</p>}
    </div>
  );
}

export default function ProviderDashboardPage() {
  useDocumentTitle('Provider dashboard');
  const { profile, updateProfile, notifications, markAllRead } = useProvider();
  const { providerRequests } = useBookings();
  const { reviews } = useReviews();
  const { toast } = useToast();
  const [openRequest, setOpenRequest] = useState(null);

  const views = useMemo(() => illustrativeViews(profile.createdAt ?? profile.name), [profile.createdAt, profile.name]);
  const totalViews = views.reduce((s, v) => s + v.views, 0);
  const myReviews = reviews.filter((r) => r.artisanId === LOCAL_PROVIDER_ID);
  const completion = getProfileCompletion(profile);
  const pending = providerRequests.filter((b) => b.status === 'pending');
  const upcoming = providerRequests.filter((b) => b.status === 'accepted');
  const recent = [...pending, ...upcoming].slice(0, 4);
  const unread = notifications.filter((n) => !n.read).length;
  const available = profile.available !== false;
  const firstName = profile.name.replace(/\(.*?\)/, '').trim().split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-muted">Here’s what’s happening with your listing.</p>
        </div>
        <div className={cn('card flex items-center gap-4 px-4 py-3', available ? 'border-accent/40' : '')}>
          <Toggle
            checked={available}
            onChange={(v) => {
              updateProfile({ available: v });
              toast({ title: v ? 'You’re taking new jobs' : 'You’re marked as unavailable', variant: v ? 'success' : 'info' });
            }}
            label={available ? 'Taking new jobs' : 'Not taking jobs'}
            description="Shown on your profile"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Eye} label="Profile views (8 weeks)" value={totalViews} note="Sample figure — tracking isn’t live" demo />
        <Metric icon={Inbox} label="Booking requests" value={providerRequests.length} note={`${pending.length} awaiting your reply`} />
        <Metric icon={CalendarClock} label="Upcoming jobs" value={upcoming.length} note="Accepted requests" />
        <Metric
          icon={Star}
          label="Reviews"
          value={myReviews.length ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : '—'}
          note={myReviews.length ? `${myReviews.length} review${myReviews.length > 1 ? 's' : ''}` : 'No reviews yet'}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <section className="card p-5" aria-labelledby="views-h">
            <div className="flex items-center justify-between gap-3">
              <h2 id="views-h" className="font-bold">
                Weekly profile views
              </h2>
              <DemoTag>Illustrative data</DemoTag>
            </div>
            <p className="mt-0.5 text-sm text-muted">View tracking will be available when the live platform launches.</p>
            <div className="mt-4">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <ViewsChart data={views} />
              </Suspense>
            </div>
          </section>

          <section aria-labelledby="req-h">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="req-h" className="font-bold">
                Requests needing attention
              </h2>
              <Link to="/provider/requests" className="text-sm font-semibold text-brand hover:underline">
                View all
              </Link>
            </div>
            {recent.length ? (
              <div className="space-y-3">
                {recent.map((b) => (
                  <BookingCard key={b.id} booking={b} perspective="provider" onOpen={setOpenRequest} actions={<RequestActions booking={b} />} />
                ))}
              </div>
            ) : (
              <EmptyState compact icon={Inbox} title="You’re all caught up" description="New booking requests will appear here." />
            )}
          </section>

          <section className="card p-5" aria-labelledby="rev-h">
            <h2 id="rev-h" className="mb-4 font-bold">
              Review overview
            </h2>
            {myReviews.length ? (
              <>
                <ReviewSummary reviews={myReviews} />
                <div className="mt-5 divide-y divide-line border-t border-line pt-5">
                  {myReviews.slice(0, 2).map((r) => (
                    <ReviewItem key={r.id} review={r} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                compact
                icon={Star}
                className="border-0 bg-surface2/50"
                title="No reviews yet"
                description="Reviews come from customers after a booking is completed. To try it, book your own listing from its public profile, complete it, then review it from My bookings."
              />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5" aria-labelledby="complete-h">
            <div className="flex items-center justify-between">
              <h2 id="complete-h" className="font-bold">
                Profile strength
              </h2>
              <span className="font-display text-lg font-extrabold text-brand">{completion.percent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100} aria-labelledby="complete-h">
              <GrowBar percent={completion.percent} className="bg-accent" />
            </div>
            <ul className="mt-4 space-y-2.5">
              {completion.items.map((item) => (
                <li key={item.key} className="flex items-start gap-2.5 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-px h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
                  )}
                  <span className={item.done ? 'text-muted line-through decoration-line' : 'text-ink'}>
                    <span className="sr-only">{item.done ? 'Done: ' : 'To do: '}</span>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {completion.percent < 100 && (
              <Link to="/provider/profile" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                Complete your profile
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </section>

          <section className="card overflow-hidden" aria-labelledby="notif-h">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 id="notif-h" className="flex items-center gap-2 font-bold">
                <Bell className="h-4 w-4 text-subtle" aria-hidden="true" />
                Notifications
                {unread > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-white dark:text-on-primary">{unread}</span>}
              </h2>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs font-semibold text-brand hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length ? (
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={cn('flex gap-3 px-5 py-3.5', !n.read && 'bg-accent-soft/40')}>
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-accent')} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className={cn('text-sm', n.read ? 'text-ink' : 'font-semibold text-ink')}>
                        {!n.read && <span className="sr-only">Unread: </span>}
                        {n.title}
                      </p>
                      <p className="text-sm text-muted">{n.body}</p>
                      <p className="mt-0.5 text-xs text-subtle">{formatRelative(n.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted">No notifications.</p>
            )}
            <p className="border-t border-line px-5 py-3 text-xs text-subtle">In-app only. SMS and email alerts are planned.</p>
          </section>
        </aside>
      </div>

      <ProviderRequestModal booking={openRequest ? providerRequests.find((b) => b.id === openRequest.id) : null} onClose={() => setOpenRequest(null)} />
    </div>
  );
}
