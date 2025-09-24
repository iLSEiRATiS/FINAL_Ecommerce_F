import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'auth_user';

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
    } catch {
      /* no-op */
    }
  }, [user]);

  const login = ({ email }) => {
    // Mock de login
    setUser({ name: email.split('@')[0] || 'Usuario', email });
  };

  const register = ({ name, email }) => {
    setUser({ name: name || email.split('@')[0] || 'Usuario', email });
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
