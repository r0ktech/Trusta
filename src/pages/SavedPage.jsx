import { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { useArtisans } from '../hooks/useArtisans';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArtisanCard } from '../components/artisans/ArtisanCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { pluralize } from '../utils/format';

export default function SavedPage() {
  useDocumentTitle('Saved artisans');
  const { savedIds, clearSaved } = useSaved();
  const { toast } = useToast();
  const artisans = useArtisans();
  const [confirm, setConfirm] = useState(false);

  const saved = savedIds.map((id) => artisans.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className="container-page flex-1 py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Saved artisans</h1>
          <p className="mt-1 text-muted">
            {saved.length ? `${pluralize(saved.length, 'provider')} saved on this device.` : 'Keep track of providers you want to compare or contact later.'}
          </p>
        </div>
        {saved.length > 0 && (
          <Button variant="danger-ghost" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </div>

      {saved.length ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={Heart}
          title="No saved artisans yet"
          description="Tap the heart on any provider to save them here. Saved providers stay on this device even after you refresh."
        >
          <ButtonLink to="/explore">Discover artisans</ButtonLink>
        </EmptyState>
      )}

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Remove all saved artisans?"
        description={`This removes ${pluralize(saved.length, 'provider')} from your saved list.`}
        confirmLabel="Remove all"
        onConfirm={() => {
          clearSaved();
          toast({ title: 'Saved list cleared', variant: 'info' });
        }}
      />
    </div>
  );
}
