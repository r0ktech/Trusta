import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { createSampleProviderRequests, PROVIDER_NOTIFICATIONS_SEED, SAMPLE_PROVIDER_PROFILE } from '../data/seeds';
import { useBookings } from './BookingsContext';
import { uid } from '../utils/format';

// The visitor's own provider profile, created through "Become a Provider".
// Stored locally; it is never published beyond this browser and is never
// marked as verified.

const ProviderContext = createContext(null);

export function ProviderProvider({ children }) {
  const [profile, setProfile] = usePersistentState(STORAGE_KEYS.provider, null);
  const [notifications, setNotifications] = usePersistentState(STORAGE_KEYS.notifications, []);
  const { addBookings, removeSampleProviderRequests } = useBookings();

  const createProfile = useCallback(
    (data) => {
      const now = new Date().toISOString();
      const next = {
        services: [],
        portfolio: [],
        available: true,
        listed: true,
        ...data,
        id: 'local-provider',
        createdAt: now,
        updatedAt: now,
      };
      setProfile(next);
      addBookings(createSampleProviderRequests(next));
      setNotifications(PROVIDER_NOTIFICATIONS_SEED);
      return next;
    },
    [setProfile, addBookings, setNotifications],
  );

  const loadSampleProfile = useCallback(() => createProfile(SAMPLE_PROVIDER_PROFILE), [createProfile]);

  const updateProfile = useCallback(
    (patch) => setProfile((p) => (p ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    [setProfile],
  );

  const deleteProfile = useCallback(() => {
    setProfile(null);
    setNotifications([]);
    removeSampleProviderRequests();
  }, [setProfile, setNotifications, removeSampleProviderRequests]);

  const pushNotification = useCallback(
    (n) => setNotifications((list) => [{ id: uid('n'), at: new Date().toISOString(), read: false, type: 'info', ...n }, ...list].slice(0, 20)),
    [setNotifications],
  );

  const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, read: true }))), [setNotifications]);

  const value = useMemo(
    () => ({
      profile,
      notifications,
      createProfile,
      loadSampleProfile,
      updateProfile,
      deleteProfile,
      pushNotification,
      markAllRead,
    }),
    [profile, notifications, createProfile, loadSampleProfile, updateProfile, deleteProfile, pushNotification, markAllRead],
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export const useProvider = () => useContext(ProviderContext);

// Profile completion is derived, so it stays accurate after edits.
export function getProfileCompletion(profile) {
  if (!profile) return { percent: 0, items: [] };
  const items = [
    { key: 'photo', label: 'Add a profile photo', done: !!profile.profileImage },
    { key: 'bio', label: 'Write a description of at least 80 characters', done: (profile.bio ?? '').length >= 80 },
    { key: 'skills', label: 'List at least 3 skills', done: (profile.specialties ?? []).length >= 3 },
    { key: 'areas', label: 'Add the areas you cover', done: (profile.serviceAreas ?? []).length >= 1 },
    { key: 'services', label: 'Add services with pricing', done: (profile.services ?? []).length >= 1 },
    { key: 'portfolio', label: 'Upload at least 2 work samples', done: (profile.portfolio ?? []).length >= 2 },
  ];
  const done = items.filter((i) => i.done).length;
  return { percent: Math.round((done / items.length) * 100), items };
}
