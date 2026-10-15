import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export function LogoMark({ className, inverse = false }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={inverse ? '#F8F8F4' : 'rgb(var(--primary))'} className={inverse ? '' : 'dark:fill-[#1A5246]'} />
      <path d="M9 10h14M16 10v7.5" stroke={inverse ? '#123F36' : '#F8F8F4'} strokeWidth="3" strokeLinecap="round" />
      <path d="M11.5 19.5l3.2 3.2 6-6" stroke="#4E9F70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ className, inverse = false, to = '/' }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2 rounded-lg', className)} aria-label="Trusta home">
      <LogoMark inverse={inverse} />
      <span className={cn('font-display text-xl font-extrabold tracking-tight', inverse ? 'text-white' : 'text-ink')}>Trusta</span>
    </Link>
  );
}
