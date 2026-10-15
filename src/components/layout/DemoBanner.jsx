import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { readStorage, writeStorage, STORAGE_KEYS } from '../../utils/storage';

export function DemoBanner() {
  const [hidden, setHidden] = useState(() => readStorage(STORAGE_KEYS.banner, false));
  if (hidden) return null;
  return (
    <div className="bg-forest text-[13px] text-white/90">
      <div className="container-page flex items-center gap-3 py-2">
        <p className="flex-1">
          <span className="font-semibold text-white">Preview build.</span> Providers, reviews and bookings are sample data and nothing is sent to real people.{' '}
          <Link to="/how-it-works#limits" className="font-medium text-white underline underline-offset-2">
            What’s simulated?
          </Link>
        </p>
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            writeStorage(STORAGE_KEYS.banner, true);
          }}
          className="-mr-2 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss preview notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
