import { useEffect, useState } from 'react';
import { readStorage, writeStorage, hasStorage } from '../utils/storage';

// useState that mirrors its value into localStorage under a namespaced key.
// `initial` may be a function; it runs only when nothing is stored yet, which
// is how first-visit seed data gets written.
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const fallback = typeof initial === 'function' ? initial : () => initial;
    return hasStorage(key) ? readStorage(key, fallback()) : fallback();
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
