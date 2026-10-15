import { forwardRef, useId, cloneElement, isValidElement } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

// Wraps a single control with a label, hint and error message, and wires up
// id / aria attributes automatically.
export function Field({ label, hint, error, required, optional, className, children, id: idProp }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        invalid: !!error,
      })
    : children;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
          {optional && <span className="text-xs font-normal text-subtle">(optional)</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, invalid, leading, ...props }, ref) {
  if (leading) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle">{leading}</span>
        <input ref={ref} className={cn('input-base pl-10', invalid && 'input-error', className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cn('input-base', invalid && 'input-error', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn('input-base resize-y', invalid && 'input-error', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn('input-base appearance-none pr-10', invalid && 'input-error', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, description, className, invalid, ...props }, ref) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-line accent-[rgb(var(--primary))]',
          invalid && 'outline outline-1 outline-danger',
        )}
        {...props}
      />
      <span className="text-sm">
        <span className="font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-muted">{description}</span>}
      </span>
    </label>
  );
});
