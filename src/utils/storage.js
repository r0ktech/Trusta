// Thin wrapper around localStorage. Every key is namespaced so the demo can
// be reset cleanly, and every access is guarded because storage can be
// unavailable (private browsing, full quota, blocked site data).

const PREFIX = 'trusta:v1:';

export const STORAGE_KEYS = {
  session: 'session',
  saved: 'saved',
  bookings: 'bookings',
  reviews: 'reviews',
  conversations: 'conversations',
  provider: 'provider',
  notifications: 'notifications',
  preferences: 'preferences',
  recentSearches: 'recent-searches',
  banner: 'demo-banner-dismissed',
};

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function hasStorage(key) {
  try {
    return window.localStorage.getItem(PREFIX + key) != null;
  } catch {
    return false;
  }
}

export function clearAllStorage() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
