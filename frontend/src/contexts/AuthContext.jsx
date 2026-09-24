import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('constellation_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    // Only start in loading state if there's an actual non-demo token to verify
    try {
      const token = localStorage.getItem('constellation_token');
      return !!token && !token.startsWith('demo_token');
    } catch {
      return false;
    }
  });
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // On mount, verify session or check ?demo=1 param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || params.get('auth') === 'admin') {
      demoLogin('admin');
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
    try {
      const data = await api.login(username, password);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {

      const msg = err.detail || err.message || 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const demoLogin = useCallback((role = 'investigator') => {
    const defaultUsers = {
      admin: { id: 'usr_admin', username: 'admin', full_name: 'Chief Intelligence Director', role: 'admin' },
      investigator: { id: 'usr_investigator', username: 'investigator', full_name: 'Lead Intelligence Officer', role: 'investigator' },
      analyst: { id: 'usr_analyst', username: 'analyst', full_name: 'Senior Intelligence Analyst', role: 'read_only' }
    };
    const demoUser = defaultUsers[role] || defaultUsers.investigator;
    setUser(demoUser);
    localStorage.setItem('constellation_token', `demo_token_${demoUser.username}`);
    localStorage.setItem('constellation_user', JSON.stringify(demoUser));
    return demoUser;
  }, []);

  const register = useCallback(async (username, password, fullName = '') => {
    setError(null);
    try {
      const data = await api.register(username, password, fullName);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      const msg = err.detail || err.message || 'Registration failed';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
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
