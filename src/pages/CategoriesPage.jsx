import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useArtisans } from '../hooks/useArtisans';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CategoryCard, tiltFor } from '../components/home/CategoryCard';
import { Input } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/motion/Reveal';

export default function CategoriesPage() {
  useDocumentTitle('Service categories');
  const artisans = useArtisans();
  const [q, setQ] = useState('');

  const counts = useMemo(() => artisans.reduce((acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + 1 }), {}), [artisans]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.provider.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.keywords.some((k) => k.includes(term)),
    );
  }, [q]);

  return (
    <div className="container-page flex-1 py-10 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-5xl">Every kind of skilled hand</h1>
          <p className="mt-2 text-muted">From fixing a leaking pipe to sewing aso-ebi for the whole family. Pick a category to compare local providers.</p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="cat-search" className="sr-only">
            Filter categories
          </label>
          <Input
            id="cat-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter categories"
            leading={<Search className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </div>

      {list.length ? (
        <Reveal stagger className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {list.map((c, i) => (
            <CategoryCard key={c.id} category={c} count={counts[c.id] ?? 0} tilt={tiltFor(i)} />
          ))}
        </Reveal>
      ) : (
        <EmptyState icon={Search} className="mt-8" title="No matching category" description={`Nothing matches “${q}”. Try a broader word like “repair” or “clean”.`}>
          <Button variant="secondary" onClick={() => setQ('')}>
            Show all categories
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
