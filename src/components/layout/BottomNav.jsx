import { NavLink } from 'react-router-dom';
import { CalendarCheck, Compass, Heart, Home, MessageCircle } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';
import { cn } from '../../utils/format';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Discover', icon: Compass },
  { to: '/saved', label: 'Saved', icon: Heart },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/messages', label: 'Messages', icon: MessageCircle, badge: 'messages' },
];

// Thumb-reachable navigation for phones.
export function BottomNav() {
  const { unreadCount } = useMessages();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium', isActive ? 'text-brand' : 'text-subtle')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                    {badge === 'messages' && unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" aria-label={`${unreadCount} unread`} />
                    )}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
