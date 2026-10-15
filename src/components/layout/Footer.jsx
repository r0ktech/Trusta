import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { Logo } from '../ui/Logo';

const COLUMNS = [
  {
    title: 'For customers',
    links: [
      { to: '/explore', label: 'Discover artisans' },
      { to: '/categories', label: 'Browse categories' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/saved', label: 'Saved artisans' },
    ],
  },
  {
    title: 'For providers',
    links: [
      { to: '/become-a-provider', label: 'Become a provider' },
      { to: '/provider/dashboard', label: 'Provider dashboard' },
      { to: '/how-it-works#artisans', label: 'How Trusta works for you' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/how-it-works#faq', label: 'FAQs' },
      { to: '/legal/terms', label: 'Terms of use' },
      { to: '/legal/privacy', label: 'Privacy policy' },
      { to: '/legal/safety', label: 'Safety tips' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">Find skilled hands. Hire with confidence. Helping people across Nigeria discover reliable local professionals.</p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-subtle" aria-hidden="true" />
                hello@trusta.example <span className="text-xs text-subtle">(placeholder)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-subtle" aria-hidden="true" />
                Awka, Anambra State
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-sm text-muted hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trusta. Preview build.</p>
          <p className="max-w-xl sm:text-right">
            All providers, reviews, prices and bookings shown are fictional sample data. Trusta does not yet verify providers, process payments or deliver messages.
          </p>
        </div>
      </div>
    </footer>
  );
}
