import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/format';

// Segmented tab bar with an underline that slides to the active tab.
// Content rendering is left to the caller.
export function Tabs({ tabs, value, onChange, className, label = 'Sections' }) {
  const listRef = useRef(null);
  const [bar, setBar] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const active = list?.querySelector('[aria-selected="true"]');
      if (!active) return;
      setBar({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [value, tabs]);

  const onKeyDown = (e, index) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    e.currentTarget.parentElement.children[next]?.focus();
  };

  return (
    <div className={cn('relative border-b border-line', className)}>
      <div ref={listRef} role="tablist" aria-label={label} className="scrollbar-none relative flex gap-1 overflow-x-auto">
        {tabs.map((t, i) => {
          const active = t.value === value;
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors',
                active ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {t.label}
              {t.count != null && (
                <span className={cn('rounded-full px-1.5 py-px text-xs transition-colors', active ? 'bg-accent-soft text-brand' : 'bg-surface2 text-subtle')}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
        {bar && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-[transform,width] duration-300 ease-[cubic-bezier(0.3,0.7,0.4,1)]"
            style={{ width: bar.width, transform: `translateX(${bar.left}px)`, left: 0 }}
          />
        )}
      </div>
    </div>
  );
}
