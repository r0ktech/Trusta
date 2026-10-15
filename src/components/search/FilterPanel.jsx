import { CATEGORIES } from '../../data/categories';
import { RATING_OPTIONS, PRICING_OPTIONS, MAX_PRICE_OPTIONS, AVAILABILITY_OPTIONS } from '../../utils/filters';
import { LocationSelect } from './LocationSelect';
import { Select } from '../ui/Field';
import { Toggle } from '../ui/Toggle';
import { Stars } from '../ui/StarRating';
import { cn } from '../../utils/format';

function Group({ title, children, htmlFor }) {
  return (
    <fieldset className="border-b border-line pb-5 last:border-0 last:pb-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-2.5 block text-sm font-semibold text-ink">
          {title}
        </label>
      ) : (
        <legend className="mb-2.5 text-sm font-semibold text-ink">{title}</legend>
      )}
      {children}
    </fieldset>
  );
}

function RadioList({ name, options, value, onChange, render }) {
  return (
    <div className="space-y-1">
      {options.map((o) => {
        const checked = String(value) === String(o.value);
        return (
          <label
            key={o.value}
            className={cn(
              'flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm transition-colors',
              checked ? 'bg-accent-soft font-medium text-brand' : 'text-ink hover:bg-surface2',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 accent-[rgb(var(--primary))]"
            />
            {render ? render(o) : o.label}
          </label>
        );
      })}
    </div>
  );
}

// Filter controls shared by the desktop sidebar and the mobile drawer.
export function FilterPanel({ filters, onChange, idPrefix = 'f' }) {
  const set = (key) => (value) => onChange({ [key]: value });
  return (
    <div className="space-y-5">
      <Group title="Location" htmlFor={`${idPrefix}-location`}>
        <LocationSelect id={`${idPrefix}-location`} value={filters.location} onChange={set('location')} />
      </Group>

      <Group title="Service category" htmlFor={`${idPrefix}-category`}>
        <Select id={`${idPrefix}-category`} value={filters.category} onChange={(e) => set('category')(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Group>

      <Group title="Trust">
        <Toggle
          checked={filters.verified}
          onChange={set('verified')}
          label="Verified profiles only"
          description="Demo flag — no real verification yet."
        />
      </Group>

      <Group title="Minimum rating">
        <RadioList
          name={`${idPrefix}-rating`}
          options={RATING_OPTIONS}
          value={filters.minRating}
          onChange={(v) => set('minRating')(Number(v))}
          render={(o) =>
            o.value ? (
              <span className="flex items-center gap-2">
                <Stars value={o.value} />
                <span>{o.label}</span>
              </span>
            ) : (
              o.label
            )
          }
        />
      </Group>

      <Group title="Pricing type">
        <RadioList name={`${idPrefix}-pricing`} options={PRICING_OPTIONS} value={filters.pricing} onChange={set('pricing')} />
      </Group>

      <Group title="Starting price" htmlFor={`${idPrefix}-max-price`}>
        <Select id={`${idPrefix}-max-price`} value={filters.maxPrice} onChange={(e) => set('maxPrice')(e.target.value)}>
          {MAX_PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">Quote-based providers are hidden when a budget is set.</p>
      </Group>

      <Group title="Availability">
        <RadioList name={`${idPrefix}-availability`} options={AVAILABILITY_OPTIONS} value={filters.availability} onChange={set('availability')} />
        <p className="mt-1.5 text-xs text-muted">Based on what providers state on their profile — not live availability.</p>
      </Group>
    </div>
  );
}
