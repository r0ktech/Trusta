import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm',
  accent: 'bg-accent text-white hover:brightness-95 shadow-sm dark:text-on-primary',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface2 hover:border-subtle/40',
  ghost: 'text-ink hover:bg-surface2',
  subtle: 'bg-accent-soft text-brand hover:brightness-[0.97]',
  danger: 'bg-danger text-white hover:brightness-95',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
  inverse: 'bg-white text-forest hover:bg-white/90',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-xl',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-9 w-9 rounded-lg',
};

export const buttonClasses = ({ variant = 'primary', size = 'md', block = false, className } = {}) =>
  cn(
    'inline-flex shrink-0 items-center justify-center font-semibold transition-[background-color,color,border-color,filter,box-shadow,transform] duration-150 active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
    className,
  );

export const Button = forwardRef(function Button(
  { variant, size, block, className, loading = false, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, block, className })}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export function ButtonLink({ to, variant, size, block, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, block, className })} {...props}>
      {children}
    </Link>
  );
}
