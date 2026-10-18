import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

// Panels open by animating grid rows from 0fr to 1fr, so height is smooth
// without measuring. Closed panels are `invisible`, which keeps their content
// out of the tab order and away from screen readers.
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
                <ChevronDown
                  className={cn('h-5 w-5 shrink-0 text-subtle transition-transform duration-300', isOpen && 'rotate-180 text-brand')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={cn(
                'grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.3,0.7,0.4,1)]',
                isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p
                  className={cn(
                    'px-5 pb-5 text-[15px] leading-relaxed text-muted transition-opacity duration-300 sm:px-6',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
