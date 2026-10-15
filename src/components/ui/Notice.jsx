import { Info, FlaskConical, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/format';

const TONES = {
  demo: { icon: FlaskConical, cls: 'border-line bg-surface2 text-muted', iconCls: 'text-subtle' },
  info: { icon: Info, cls: 'border-info/20 bg-info-soft text-ink', iconCls: 'text-info' },
  warn: { icon: AlertTriangle, cls: 'border-warn/25 bg-warn-soft text-ink', iconCls: 'text-warn' },
};

// Inline notice used to be explicit about simulated behaviour.
export function Notice({ tone = 'demo', title, children, className }) {
  const { icon: Icon, cls, iconCls } = TONES[tone];
  return (
    <div className={cn('flex gap-3 rounded-xl border px-3.5 py-3 text-sm', cls, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconCls)} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold text-ink">{title}</p>}
        <div className={title ? 'mt-0.5' : undefined}>{children}</div>
      </div>
    </div>
  );
}
