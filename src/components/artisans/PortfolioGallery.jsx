import { useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { WorkSampleTile } from './WorkSampleTile';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

export function PortfolioGallery({ items = [], category }) {
  const [index, setIndex] = useState(null);

  if (!items.length) {
    return <EmptyState compact icon={Images} title="No work samples yet" description="This provider hasn’t added photos of completed jobs." />;
  }

  const current = index != null ? items[index] : null;
  const go = (delta) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => (
          <WorkSampleTile key={item.id} item={item} category={category} onClick={() => setIndex(i)} />
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">Sample work entries use illustrated placeholders in this preview.</p>

      <Modal open={!!current} onClose={() => setIndex(null)} size="lg" title={current?.title} description={current?.location}>
        {current && (
          <div onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : null)}>
            <WorkSampleTile item={current} category={category} showCaption={false} className="rounded-2xl" />
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-subtle" aria-live="polite">
                {index + 1} of {items.length}
              </span>
              <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface2 hover:text-ink">
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
