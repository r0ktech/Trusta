import { ShieldCheck, Images, MessageSquareText } from 'lucide-react';
import { Notice } from '../ui/Notice';

// Two-column frame for sign-in / sign-up / reset screens.
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container-page flex flex-1 items-start justify-center py-10 sm:py-14 lg:items-center">
      <div className="grid grid-cols-1 w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface shadow-card lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-forest p-10 text-white lg:flex lg:flex-col">
          <svg className="absolute -bottom-24 -right-24 h-80 w-80 text-white/[0.06]" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="font-display text-2xl font-extrabold leading-tight text-white">Find skilled hands.<br />Hire with confidence.</p>
          <ul className="mt-10 space-y-6">
            {[
              [Images, 'See the work', 'Compare portfolios of real jobs before you call anyone.'],
              [MessageSquareText, 'Hear from customers', 'Ratings and reviews show how providers actually perform.'],
              [ShieldCheck, 'Stay in control', 'Track every request and keep your details private until you agree.'],
            ].map(([Icon, t, b]) => (
              <li key={t} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-[#8FD1AA]" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-white/70">{b}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
          <Notice className="mt-5">
            <span className="font-semibold text-ink">Demo sign-in.</span> No account is created on a server and your password is never stored. Any valid email and an 8+ character
            password will start a local demo session.
          </Notice>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
