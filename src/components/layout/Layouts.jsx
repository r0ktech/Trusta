import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { DemoBanner } from './DemoBanner';
import { PageLoader } from '../ui/Skeleton';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
  );
}

export function MainLayout({ hideFooter = false }) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SkipLink />
      <DemoBanner />
      <Navbar />
      <main id="main" className="flex flex-1 flex-col">
        <Suspense fallback={<PageLoader />}>
          {/* Keyed by path so each page eases in on navigation. */}
          <div key={pathname} className="flex flex-1 animate-page-in flex-col">
            <Outlet />
          </div>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}
