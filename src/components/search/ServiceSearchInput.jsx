import { useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES, SERVICE_SUGGESTIONS } from '../../data/categories';
import { CategoryIcon } from '../artisans/CategoryIcon';
import { cn } from '../../utils/format';

// Combobox with category + service suggestions.
// `onSelect` receives { type: 'category' | 'query', value }.
export function ServiceSearchInput({ value, onChange, onSelect, placeholder = 'What do you need done?', className, inputClassName, autoFocus }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const blurTimer = useRef();

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const cats = CATEGORIES.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q) || q.includes(k)),
    )
      .slice(0, q ? 4 : 5)
      .map((c) => ({ type: 'category', value: c.id, label: c.name, hint: c.provider }));
    const services = SERVICE_SUGGESTIONS.filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, q ? 4 : 4)
      .map((s) => ({ type: 'query', value: s, label: s }));
    return [...cats, ...services];
  }, [value]);

  const choose = (item) => {
    setOpen(false);
    setActive(-1);
    onSelect?.(item);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && open && active >= 0 && suggestions[active]) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        type="search"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label="Service or artisan"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'h-full w-full bg-transparent py-3 pl-10 pr-9 text-[15px] text-ink placeholder:text-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-pop sm:min-w-[22rem]"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.value}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s)}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5', i === active && 'bg-surface2')}
            >
              {s.type === 'category' ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-brand">
                  <CategoryIcon category={s.value} className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface2 text-subtle">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{s.label}</span>
                <span className="block text-xs text-subtle">{s.type === 'category' ? 'Category' : 'Popular search'}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
