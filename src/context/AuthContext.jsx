import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { uid } from '../utils/format';

// DEMO SESSION ONLY.
// There is no authentication server. Signing in simply stores a profile
// object in localStorage so the UI can behave as if a user is present.
// Passwords are never stored or transmitted. Replace `signIn` / `signUp`
// with calls to a real auth API when one exists.

const AuthContext = createContext(null);

const nameFromEmail = (email) => {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  if (!local) return 'Demo user';
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
};

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState(STORAGE_KEYS.session, null);

  // Simulates a network round-trip so loading states can be seen.
  const simulate = (fn) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(fn()), 650);
    });

  const signIn = useCallback(
    ({ email }) =>
      simulate(() => {
        const next = {
          id: uid('user'),
          name: nameFromEmail(email),
          email: email.trim().toLowerCase(),
          role: 'customer',
          phone: '',
          city: '',
          isDemo: true,
          signedInAt: new Date().toISOString(),
        };
        setUser((prev) => (prev && prev.email === next.email ? { ...prev, signedInAt: next.signedInAt } : next));
        return next;
      }),
    [setUser],
  );

  const signUp = useCallback(
    ({ name, email, role }) =>
      simulate(() => {
        const next = {
          id: uid('user'),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: '',
          city: '',
          isDemo: true,
          signedInAt: new Date().toISOString(),
        };
        setUser(next);
        return next;
      }),
    [setUser],
  );

  const signOut = useCallback(() => setUser(null), [setUser]);

  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [setUser]);

  const value = useMemo(() => ({ user, isSignedIn: !!user, signIn, signUp, signOut, updateUser }), [user, signIn, signUp, signOut, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
