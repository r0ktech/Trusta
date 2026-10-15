import { useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ButtonLink } from '../components/ui/Button';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-brand">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-6 font-display text-lg font-bold text-subtle">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This page took a wrong turn</h1>
      <p className="mt-3 max-w-md text-muted">
        We couldn’t find <code className="rounded bg-surface2 px-1.5 py-0.5 text-sm">{pathname}</code>. It may have moved, or the link may be incorrect.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Go to homepage</ButtonLink>
        <ButtonLink to="/explore" variant="secondary">
          Discover artisans
        </ButtonLink>
      </div>
    </div>
  );
}
