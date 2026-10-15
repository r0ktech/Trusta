import { useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { compressImage } from '../../utils/image';
import { uid } from '../../utils/format';

// Images are resized in the browser and kept as data URLs so the preview
// survives a refresh. A production build would upload to object storage.

export function ProfilePhotoInput({ value, onChange, name }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || 'You'} src={value} size="lg" rounded="xl" />
      <div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-semibold hover:bg-surface2 focus-within:ring-2 focus-within:ring-accent">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
            {value ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                setError('');
                setBusy(true);
                try {
                  onChange(await compressImage(e.target.files?.[0], 320, 0.8));
                } catch (err) {
                  setError(err.message);
                } finally {
                  setBusy(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger-soft">
              Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">A clear photo of your face. JPG or PNG, resized on your device.</p>
        {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
      </div>
    </div>
  );
}

export function PortfolioInput({ value = [], onChange, max = 6, defaultLocation = '' }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const addFiles = async (files) => {
    setError('');
    const slots = max - value.length;
    const list = [...files].slice(0, slots);
    if (!list.length) return;
    setBusy(true);
    const added = [];
    for (const file of list) {
      try {
        added.push({ id: uid('p'), title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 60), image: await compressImage(file, 560, 0.7), location: defaultLocation });
      } catch (err) {
        setError(err.message);
      }
    }
    if (files.length > slots) setError(`Only ${max} work samples can be added.`);
    onChange([...value, ...added]);
    setBusy(false);
  };

  const update = (id, patch) => onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="relative">
              <img src={p.image} alt={p.title || 'Work sample'} className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.id !== p.id))}
                className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/75"
                aria-label={`Remove ${p.title || 'work sample'}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <label className="sr-only" htmlFor={`title-${p.id}`}>
              Caption
            </label>
            <input
              id={`title-${p.id}`}
              value={p.title}
              onChange={(e) => update(p.id, { title: e.target.value })}
              placeholder="Caption, e.g. Kitchen rewiring"
              maxLength={60}
              className="w-full border-t border-line bg-transparent px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40"
            />
          </div>
        ))}
        {value.length < max && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-sm text-muted hover:border-accent hover:text-ink focus-within:ring-2 focus-within:ring-accent">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-6 w-6" aria-hidden="true" />}
            <span className="font-medium">Add photos</span>
            <span className="text-xs text-subtle">
              {value.length}/{max}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files ?? []);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
