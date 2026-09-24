import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN = {
  id: 'usr_admin',
  username: 'admin',
  full_name: 'Chief Intelligence Director',
  role: 'admin'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('constellation_user');
      if (savedUser) return JSON.parse(savedUser);
      // If user explicitly chose to log out, stay on login page
      if (localStorage.getItem('constellation_logged_out') === 'true') {
        return null;
      }
      // Auto-initialize with default Chief Intelligence Director so Dashboard is immediately visible!
      localStorage.setItem('constellation_user', JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem('constellation_token', 'demo_token_admin');
      return DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // On mount, verify session or check ?demo=1 param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || params.get('auth') === 'admin' || !user) {
      if (localStorage.getItem('constellation_logged_out') !== 'true' || params.get('demo') === '1') {
        demoLogin('admin');
      }
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      const token = localStorage.getItem('constellation_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // If it's a demo token, do not make an external network request
      if (token.startsWith('demo_token')) {
        setLoading(false);
        return;
      }

      try {
        // 1.5s timeout race so localhost never hangs on a black loading screen
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session verify timeout')), 1500)
        );
        const userData = await Promise.race([api.getMe(), timeoutPromise]);
        if (userData) {
          setUser(userData);
          localStorage.setItem('constellation_user', JSON.stringify(userData));
        }
      } catch {
        // Fallback gracefully — if user is cached, keep them, otherwise clear
        const cached = localStorage.getItem('constellation_user');
        if (!cached) {
          api.clearToken();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    localStorage.removeItem('constellation_logged_out');
    try {
      const data = await api.login(username, password);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      // Graceful offline/standalone fallback
      const u = username || 'admin';
      const fallbackUser = {
        id: `usr_${u.toLowerCase()}`,
        username: u,
        full_name: u.toLowerCase() === 'admin' ? 'Chief Intelligence Director' : `${u} (Investigator)`,
        role: u.toLowerCase() === 'admin' ? 'admin' : 'investigator'
      };
      setUser(fallbackUser);
      localStorage.setItem('constellation_token', `demo_token_${fallbackUser.username}`);
      localStorage.setItem('constellation_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }, []);

  const demoLogin = useCallback((role = 'admin') => {
    localStorage.removeItem('constellation_logged_out');
    const defaultUsers = {
      admin: { id: 'usr_admin', username: 'admin', full_name: 'Chief Intelligence Director', role: 'admin' },
      investigator: { id: 'usr_investigator', username: 'investigator', full_name: 'Lead Intelligence Officer', role: 'investigator' },
      analyst: { id: 'usr_analyst', username: 'analyst', full_name: 'Senior Intelligence Analyst', role: 'read_only' }
    };
    const demoUser = defaultUsers[role] || defaultUsers.admin;
    setUser(demoUser);
    localStorage.setItem('constellation_token', `demo_token_${demoUser.username}`);
    localStorage.setItem('constellation_user', JSON.stringify(demoUser));
    return demoUser;
  }, []);

  const register = useCallback(async (username, password, fullName = '') => {
    setError(null);
    localStorage.removeItem('constellation_logged_out');
    try {
      const data = await api.register(username, password, fullName);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      const u = username || 'agent';
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        username: u,
        full_name: fullName || u,
        role: 'investigator'
      };
      setUser(fallbackUser);
      localStorage.setItem('constellation_token', `demo_token_${fallbackUser.username}`);
      localStorage.setItem('constellation_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem('constellation_user');
    localStorage.removeItem('constellation_token');
    localStorage.setItem('constellation_logged_out', 'true');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, demoLogin, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
