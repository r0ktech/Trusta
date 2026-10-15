import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, MessageCircle } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ButtonLink } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useMessages } from '../../context/MessagesContext';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { cn } from '../../utils/format';

export const PRIMARY_NAV = [
  { to: '/explore', label: 'Discover' },
  { to: '/categories', label: 'Categories' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/become-a-provider', label: 'Become a Provider' },
];

function CountDot({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white dark:text-on-primary">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export function Navbar() {
  const { isSignedIn } = useAuth();
  const { savedIds } = useSaved();
  const { unreadCount } = useMessages();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-surface2 text-ink' : 'text-muted hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/saved"
            className="relative hidden rounded-xl p-2.5 text-muted hover:bg-surface2 hover:text-ink sm:inline-flex"
            aria-label={`Saved artisans${savedIds.length ? `, ${savedIds.length} saved` : ''}`}
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <CountDot count={savedIds.length} />
          </Link>
          <Link
            to="/messages"
            className="relative hidden rounded-xl p-2.5 text-muted hover:bg-surface2 hover:text-ink sm:inline-flex"
            aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <CountDot count={unreadCount} />
          </Link>

          {isSignedIn ? (
            <div className="hidden md:block">
              <UserMenu />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/auth/sign-in"
                state={{ from: location.pathname }}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface2"
              >
                Sign in
              </Link>
              <ButtonLink to="/auth/sign-up" size="sm">
                Get started
              </ButtonLink>
            </div>
          )}

          <button
            type="button"
            className="inline-flex rounded-xl p-2.5 text-ink hover:bg-surface2 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
