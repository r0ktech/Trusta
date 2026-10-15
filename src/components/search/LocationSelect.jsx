import { forwardRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { LOCATIONS, STATES } from '../../data/locations';
import { cn } from '../../utils/format';

// Native select grouped by state — fast, accessible and familiar on phones.
export const LocationSelect = forwardRef(function LocationSelect(
  { value, onChange, className, bare = false, placeholder = 'All locations', id, ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />
      <select
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none pl-10 pr-9 text-[15px] text-ink',
          bare ? 'h-full rounded-xl bg-transparent py-3 focus:outline-none' : 'input-base pl-10',
          !value && 'text-muted',
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {STATES.map((state) => (
          <optgroup key={state} label={state === 'FCT' ? 'FCT (Abuja)' : `${state} State`}>
            {LOCATIONS.filter((l) => l.state === state).map((l) => (
              <option key={l.city} value={l.city}>
                {l.city}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
    </div>
  );
});
