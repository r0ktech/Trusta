import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck, Compass, Grid2X2, Hammer, HelpCircle, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { ButtonLink } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/format';

const LINKS = [
  { to: '/explore', label: 'Discover artisans', icon: Compass },
  { to: '/categories', label: 'Categories', icon: Grid2X2 },
  { to: '/how-it-works', label: 'How it works', icon: HelpCircle },
  { to: '/become-a-provider', label: 'Become a provider', icon: Hammer },
];

const ACCOUNT_LINKS = [
  { to: '/bookings', label: 'My bookings', icon: CalendarCheck },
  { to: '/provider/dashboard', label: 'Provider dashboard', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Item({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn('flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium', isActive ? 'bg-accent-soft text-brand' : 'text-ink hover:bg-surface2')
      }
    >
      <Icon className="h-5 w-5 text-subtle" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

export function MobileMenu({ open, onClose }) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      footer={
        user ? (
          <button
            type="button"
            onClick={() => {
              signOut();
              onClose();
              toast({ title: 'Signed out', description: 'Your demo session has ended.', variant: 'info' });
              navigate('/');
            }}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <ButtonLink to="/auth/sign-in" variant="secondary" onClick={onClose}>
              Sign in
            </ButtonLink>
            <ButtonLink to="/auth/sign-up" onClick={onClose}>
              Get started
            </ButtonLink>
          </div>
        )
      }
    >
      {user && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-surface2 p-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">Demo session · {user.email}</p>
          </div>
        </div>
      )}
      <nav aria-label="Mobile" className="space-y-1">
        {LINKS.map((l) => (
          <Item key={l.to} {...l} onClick={onClose} />
        ))}
      </nav>
      <p className="mb-2 mt-6 px-3 text-sm font-medium text-muted">Your account</p>
      <nav aria-label="Account" className="space-y-1">
        {ACCOUNT_LINKS.map((l) => (
          <Item key={l.to} {...l} onClick={onClose} />
        ))}
      </nav>
    </Drawer>
  );
}
