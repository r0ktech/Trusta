import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/format';

export function SectionHeading({ eyebrow, title, description, action, id, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className={cn(eyebrow && 'mt-2', 'text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[2.6rem]')}>
          {title}
        </h2>
        {description && <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && (
        <Link to={action.to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
