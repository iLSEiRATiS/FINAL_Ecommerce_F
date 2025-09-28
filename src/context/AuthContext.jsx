import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [user]);

  const login = (payload) => {
    // Respuesta real del backend: { token, user: { id, name, email, role } }
    if (payload?.token && payload?.user) {
      try { localStorage.setItem(TOKEN_KEY, payload.token); } catch {}
      const u = payload.user;
      setUser({
        id: u.id,
        name: u.name || (u.email?.split('@')[0] ?? 'Usuario'),
        email: u.email || '',
        role: u.role || 'user'
      });
      return;
    }
    // Mock actual
    const email = payload?.email || '';
    setUser({ name: email.split('@')[0] || 'Usuario', email });
  };

  const register = ({ name, email }) => {
    setUser({ name: name || email.split('@')[0] || 'Usuario', email });
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  };

  const getToken = () => {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  };

  const value = useMemo(() => ({ user, login, register, logout, getToken }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
