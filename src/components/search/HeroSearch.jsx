import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ServiceSearchInput } from './ServiceSearchInput';
import { LocationSelect } from './LocationSelect';
import { Button } from '../ui/Button';
import { usePreferences } from '../../context/PreferencesContext';
import { filtersToParams, DEFAULT_FILTERS } from '../../utils/filters';

export function HeroSearch() {
  const navigate = useNavigate();
  const { defaultLocation } = usePreferences();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(defaultLocation);

  const go = (overrides = {}) => {
    const params = filtersToParams({ ...DEFAULT_FILTERS, q: query.trim(), category, location, ...overrides });
    navigate(`/explore${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
      className="rounded-2xl border border-line bg-surface p-2 shadow-lift"
    >
      {/* The button sits beside the service field so the suggestion list never covers it. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <ServiceSearchInput
          className="min-w-0 rounded-xl bg-surface2/70 sm:col-start-1 sm:row-start-1 [&_input]:h-[3.25rem] [&_input]:text-base"
          placeholder="What do you need done?"
          value={query}
          onChange={(v) => {
            setQuery(v);
            setCategory('');
          }}
          onSelect={(item) => {
            if (item.type === 'category') {
              setQuery('');
              setCategory(item.value);
              go({ q: '', category: item.value });
            } else {
              setQuery(item.value);
              setCategory('');
              go({ q: item.value, category: '' });
            }
          }}
        />
        <label className="sr-only" htmlFor="hero-location">
          Location
        </label>
        <LocationSelect
          id="hero-location"
          bare
          value={location}
          onChange={setLocation}
          className="h-12 rounded-xl bg-surface2/70 sm:col-span-2 sm:row-start-2"
          placeholder="Any location"
        />
        <Button type="submit" size="lg" className="h-[3.25rem] sm:col-start-2 sm:row-start-1 sm:px-7">
          <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          Find an Artisan
        </Button>
      </div>
    </form>
  );
}
