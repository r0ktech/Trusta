import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

export function Accordion({ items, className, defaultOpen = null }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();
  return (
    <div className={cn('divide-y divide-line rounded-2xl border border-line bg-surface', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const btnId = `${baseId}-${item.id}-btn`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-surface2/50 sm:px-6"
              >
                {item.q}
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-subtle transition-transform duration-300', isOpen && 'rotate-180')} aria-hidden="true" />
              </button>
            </h3>
            {/* grid-rows 0fr→1fr animates to the content's natural height. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              aria-hidden={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out',
                isOpen ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-muted sm:px-6">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
