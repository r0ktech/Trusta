import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';

const PreferencesContext = createContext(null);

const DEFAULT_PREFERENCES = {
  theme: 'system', // 'light' | 'dark' | 'system'
  notifications: {
    bookingUpdates: true,
    messages: true,
    reviewReminders: true,
    productNews: false,
    sms: false,
  },
  defaultLocation: '',
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = usePersistentState(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0D1211' : '#123F36');
  }, [resolvedTheme]);

  const setTheme = useCallback((theme) => setPrefs((p) => ({ ...p, theme })), [setPrefs]);
  const setNotification = useCallback(
    (key, value) => setPrefs((p) => ({ ...p, notifications: { ...DEFAULT_PREFERENCES.notifications, ...p.notifications, [key]: value } })),
    [setPrefs],
  );
  const setDefaultLocation = useCallback((defaultLocation) => setPrefs((p) => ({ ...p, defaultLocation })), [setPrefs]);

  const value = useMemo(
    () => ({
      theme: prefs.theme,
      resolvedTheme,
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...prefs.notifications },
      defaultLocation: prefs.defaultLocation ?? '',
      setTheme,
      setNotification,
      setDefaultLocation,
    }),
    [prefs, resolvedTheme, setTheme, setNotification, setDefaultLocation],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);
