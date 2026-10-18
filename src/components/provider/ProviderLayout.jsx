import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Inbox, LayoutDashboard, MessageCircle, Settings, UserRoundPen, FlaskConical } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { PageLoader } from '../ui/Skeleton';
import { SkipLink, PageTransition } from '../layout/Layouts';
import { useProvider } from '../../context/ProviderContext';
import { useBookings } from '../../context/BookingsContext';
import { getCategory } from '../../data/categories';
import { NoProviderProfile } from './NoProviderProfile';
import { cn } from '../../utils/format';

export default function ProviderLayout() {
  const { profile } = useProvider();
  const { providerRequests } = useBookings();
  const pending = providerRequests.filter((b) => b.status === 'pending').length;

  const NAV = [
    { to: '/provider/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/provider/requests', label: 'Booking requests', icon: Inbox, count: pending },
    { to: '/provider/profile', label: 'Profile & services', icon: UserRoundPen },
    { to: '/messages', label: 'Messages', icon: MessageCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Logo to="/provider/dashboard" />
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold text-brand">Provider</span>
          <span className="ml-1 hidden items-center gap-1 text-xs text-subtle sm:inline-flex">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Demo dashboard
          </span>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to Trusta</span>
            <span className="sm:hidden">Exit</span>
          </Link>
        </div>
        {/* Mobile tabs */}
        <nav aria-label="Provider sections" className="scrollbar-none flex gap-1 overflow-x-auto border-t border-line px-3 lg:hidden">
          {NAV.slice(0, 3).map(({ to, label, count }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn('flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold', isActive ? 'border-primary text-ink' : 'border-transparent text-muted')
              }
            >
              {label}
              {count > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] text-white dark:text-on-primary">{count}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
            {profile && (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface2 p-3">
                <Avatar name={profile.name} src={profile.profileImage} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{profile.name}</p>
                  <p className="truncate text-xs text-muted">{getCategory(profile.category)?.provider}</p>
                </div>
              </div>
            )}
            <nav aria-label="Provider" className="space-y-1">
              {NAV.map(({ to, label, icon: Icon, count }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-accent-soft text-brand' : 'text-muted hover:bg-surface2 hover:text-ink',
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {label}
                  {count > 0 && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white dark:text-on-primary">{count}</span>}
                </NavLink>
              ))}
            </nav>
            {profile && (
              <Link
                to="/artisan/local-provider"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface2"
              >
                <ExternalLink className="h-4 w-4 text-subtle" aria-hidden="true" />
                View public profile
              </Link>
            )}
            <p className="mt-auto text-xs leading-relaxed text-subtle">
              This dashboard runs on demo data stored in your browser. Metrics marked “illustrative” are not real.
            </p>
          </div>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <Suspense fallback={<PageLoader />}>{profile ? (
              <PageTransition>
                <Outlet />
              </PageTransition>
            ) : (
              <NoProviderProfile />
            )}</Suspense>
        </main>
      </div>
    </div>
  );
}
