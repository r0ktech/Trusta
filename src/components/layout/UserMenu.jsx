import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, ChevronDown, Heart, LayoutDashboard, LogOut, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../ui/Avatar';

const ITEMS = [
  { to: '/bookings', label: 'My bookings', icon: CalendarCheck },
  { to: '/saved', label: 'Saved artisans', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/provider/dashboard', label: 'Provider dashboard', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-surface2"
      >
        <Avatar name={user.name} size="xs" />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold lg:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className="h-4 w-4 text-subtle" aria-hidden="true" />
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-menu-in overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1.5 text-xs text-subtle">Demo session</p>
          </div>
          <div className="p-1.5">
            {ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface2"
              >
                <Icon className="h-4 w-4 text-subtle" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                signOut();
                setOpen(false);
                toast({ title: 'Signed out', description: 'Your demo session has ended.', variant: 'info' });
                navigate('/');
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
