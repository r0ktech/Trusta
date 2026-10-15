import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useArtisans } from '../hooks/useArtisans';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  filtersFromParams,
  filtersToParams,
  filterArtisans,
  sortArtisans,
  getActiveFilterChips,
} from '../utils/filters';
import { getCategory } from '../data/categories';
import { getLocation } from '../data/locations';
import { readStorage, writeStorage } from '../utils/storage';
import { ArtisanCard } from '../components/artisans/ArtisanCard';
import { FilterPanel } from '../components/search/FilterPanel';
import { ServiceSearchInput } from '../components/search/ServiceSearchInput';
import { LocationSelect } from '../components/search/LocationSelect';
import { Drawer } from '../components/ui/Drawer';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { cn, pluralize } from '../utils/format';

const PAGE_SIZE = 9;

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const artisans = useArtisans();
  const [query, setQuery] = useState(filters.q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [layout, setLayout] = useState(() => readStorage('explore-layout', 'grid'));

  const category = getCategory(filters.category);
  useDocumentTitle(
    category ? `${category.name}${filters.location ? ` in ${filters.location}` : ''}` : filters.location ? `Artisans in ${filters.location}` : 'Discover artisans',
  );

  // Keep the text box in sync when the URL changes from elsewhere (chips, back button).
  useEffect(() => setQuery((q) => (q.trim() === filters.q ? q : filters.q)), [filters.q]);

  // Debounce typing into the URL so results update as you type.
  useEffect(() => {
    if (query.trim() === filters.q) return undefined;
    const t = setTimeout(() => update({ q: query.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const paramsKey = params.toString();
  useEffect(() => setVisible(PAGE_SIZE), [paramsKey]);

  const update = (patch) => {
    const next = filtersToParams({ ...filters, ...patch });
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setQuery('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const results = useMemo(() => sortArtisans(filterArtisans(artisans, filters), filters.sort, filters.q), [artisans, filters]);
  const chips = getActiveFilterChips(filters);
  const shown = results.slice(0, visible);
  const filterCount = chips.filter((c) => c.key !== 'q').length;

  const changeLayout = (l) => {
    setLayout(l);
    writeStorage('explore-layout', l);
  };

  const heading = category ? category.name : 'All services';
  const locationLabel = filters.location ? ` in ${filters.location}` : '';

  return (
    <div className="flex-1">
      {/* Search header */}
      <div className="border-b border-line bg-surface">
        <div className="container-page py-6 sm:py-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {heading}
            <span className="text-muted">{locationLabel}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {category ? category.description : 'Browse local professionals by service, location, rating and price.'}
          </p>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: query.trim() });
            }}
            className="mt-5 flex flex-col gap-2 sm:flex-row"
          >
            <ServiceSearchInput
              className="h-12 flex-[1.6] rounded-xl border border-line bg-canvas focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25"
              value={query}
              placeholder="Search by service or artisan name"
              onChange={setQuery}
              onSelect={(item) => {
                if (item.type === 'category') {
                  setQuery('');
                  update({ category: item.value, q: '' });
                } else {
                  setQuery(item.value);
                  update({ q: item.value });
                }
              }}
            />
            <label htmlFor="explore-location" className="sr-only">
              Location
            </label>
            <LocationSelect
              id="explore-location"
              bare
              value={filters.location}
              onChange={(v) => update({ location: v })}
              className="h-12 flex-1 rounded-xl border border-line bg-canvas focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25"
            />
            <Button type="submit" size="lg" className="sm:px-6">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container-page py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_1fr]">
          {/* Desktop filters */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold">Filters</h2>
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel filters={filters} onChange={update} idPrefix="desk" />
            </div>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="results-heading" className="mr-auto text-sm text-muted" aria-live="polite">
                <span className="font-semibold text-ink">{pluralize(results.length, 'provider')}</span> found
              </h2>
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {filterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-xs text-on-primary">{filterCount}</span>
                )}
              </Button>
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <Select id="sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className="h-9 w-auto rounded-lg py-1.5 text-sm">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <div className="hidden rounded-lg border border-line bg-surface p-0.5 sm:flex" role="group" aria-label="Layout">
                {[
                  ['grid', LayoutGrid, 'Grid view'],
                  ['list', List, 'List view'],
                ].map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeLayout(value)}
                    aria-pressed={layout === value}
                    aria-label={label}
                    className={cn('rounded-md p-1.5', layout === value ? 'bg-surface2 text-ink' : 'text-subtle hover:text-ink')}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active chips */}
            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      if (chip.key === 'q') setQuery('');
                      update({ [chip.key]: DEFAULT_FILTERS[chip.key] });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft py-1 pl-3 pr-2 text-sm font-medium text-brand hover:border-accent"
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    {chip.label}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="px-2 text-sm font-semibold text-muted hover:text-ink">
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            {results.length === 0 ? (
              <NoResults filters={filters} onClear={clearAll} onRemoveLocation={() => update({ location: '' })} />
            ) : (
              <>
                <div className={cn('mt-5 grid gap-4', layout === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                  {shown.map((a) => (
                    <ArtisanCard key={a.id} artisan={a} layout={layout === 'list' ? 'list' : 'grid'} />
                  ))}
                </div>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted">
                    Showing {shown.length} of {results.length}
                  </p>
                  {visible < results.length && (
                    <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                      Load more providers
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={clearAll}>
              Clear all
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Show {results.length}</Button>
          </div>
        }
      >
        <FilterPanel filters={filters} onChange={update} idPrefix="mob" />
      </Drawer>
    </div>
  );
}

function NoResults({ filters, onClear, onRemoveLocation }) {
  const loc = filters.location && getLocation(filters.location);
  const noProvidersInCity = loc && !filters.q && !filters.category;
  return (
    <EmptyState
      icon={SearchX}
      className="mt-6"
      title={noProvidersInCity ? `No providers in ${filters.location} yet` : 'No providers match these filters'}
      description={
        noProvidersInCity
          ? `We don’t have sample providers listed in ${filters.location} at the moment. Try a nearby city, or tell a skilled professional you know about Trusta.`
          : 'Try removing a filter, widening your location, or searching for a related service.'
      }
    >
      {filters.location && (
        <Button variant="secondary" onClick={onRemoveLocation}>
          Search all locations
        </Button>
      )}
      <Button onClick={onClear}>Reset all filters</Button>
      {noProvidersInCity && (
        <Link to="/become-a-provider" className="inline-flex h-11 items-center px-3 text-sm font-semibold text-brand hover:underline">
          Become a provider
        </Link>
      )}
    </EmptyState>
  );
}
