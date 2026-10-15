import { ShieldCheck, Clock } from 'lucide-react';
import { cn } from '../../utils/format';

// Verification is NOT active on Trusta yet. Badges only reflect the
// `verificationStatus` field in demo data and always say so.
const COPY = {
  verified: {
    label: 'Verified',
    title: 'Demo data: this sample profile is marked as verified to preview the design. No real verification has taken place.',
  },
  pending: {
    label: 'Verification pending',
    title: 'Demo data: verification is shown as pending to preview the design. Verification is not yet active.',
  },
};

export function VerificationBadge({ status, size = 'sm', className, showDemo = true }) {
  const copy = COPY[status];
  if (!copy) return null;
  const Icon = status === 'verified' ? ShieldCheck : Clock;
  return (
    <span
      title={copy.title}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        status === 'verified' ? 'bg-accent-soft text-brand' : 'bg-surface2 text-muted',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      {copy.label}
      {showDemo && <span className="font-normal opacity-70">(demo)</span>}
      <span className="sr-only">. {copy.title}</span>
    </span>
  );
}
