import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { useToast } from './ToastContext';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [savedIds, setSavedIds] = usePersistentState(STORAGE_KEYS.saved, []);
  const { toast } = useToast();

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const toggleSaved = useCallback(
    (artisan) => {
      const wasSaved = savedIds.includes(artisan.id);
      setSavedIds((ids) => (wasSaved ? ids.filter((x) => x !== artisan.id) : [artisan.id, ...ids]));
      toast(
        wasSaved
          ? {
              title: 'Removed from saved',
              description: artisan.name,
              variant: 'info',
              action: { label: 'Undo', onClick: () => setSavedIds((ids) => (ids.includes(artisan.id) ? ids : [artisan.id, ...ids])) },
            }
          : { title: 'Saved', description: `${artisan.name} was added to your saved list.` },
      );
    },
    [savedIds, setSavedIds, toast],
  );

  const clearSaved = useCallback(() => setSavedIds([]), [setSavedIds]);

  const value = useMemo(() => ({ savedIds, isSaved, toggleSaved, clearSaved }), [savedIds, isSaved, toggleSaved, clearSaved]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export const useSaved = () => useContext(SavedContext);
