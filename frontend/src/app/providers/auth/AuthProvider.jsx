import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT, clearSession, getSession, saveSession } from '@/shared/auth/session';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getSession);

  const login = useCallback((session) => {
    setUser(session);
    saveSession(session);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
