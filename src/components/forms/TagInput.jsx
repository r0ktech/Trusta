import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../utils/format';

// Chip-style multi-value input. Enter or comma adds a tag.
export function TagInput({ value = [], onChange, suggestions = [], placeholder = 'Type and press Enter', max = 10, invalid, id, ...aria }) {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const tag = raw.trim().replace(/,$/, '');
    if (!tag || value.length >= max) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag) => onChange(value.filter((v) => v !== tag));
  const remaining = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 8);

  return (
    <div>
      <div
        className={cn(
          'flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface px-2 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
          invalid && 'border-danger',
        )}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-accent-soft py-1 pl-2.5 pr-1 text-sm font-medium text-brand">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="rounded p-0.5 hover:bg-black/5" aria-label={`Remove ${tag}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          {...aria}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(',')) add(v);
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length >= max ? `Maximum of ${max}` : placeholder}
          disabled={value.length >= max}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[15px] text-ink placeholder:text-subtle focus:outline-none"
        />
      </div>
      {remaining.length > 0 && value.length < max && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-ink"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
