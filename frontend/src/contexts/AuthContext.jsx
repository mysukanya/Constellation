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
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // On mount, if ?demo=1 or ?auth=admin is explicitly provided, bypass directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || params.get('auth') === 'admin') {
      demoLogin('admin');
      return;
    }

    const token = localStorage.getItem('constellation_token');
    if (!token || token.startsWith('demo_token')) {
      return;
    }

    const verifySession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session verify timeout')), 1500)
        );
        const userData = await Promise.race([api.getMe(), timeoutPromise]);
        if (userData) {
          setUser(userData);
          localStorage.setItem('constellation_user', JSON.stringify(userData));
        }
      } catch {
        const cached = localStorage.getItem('constellation_user');
        if (!cached) {
          api.clearToken();
          setUser(null);
        }
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
      throw new Error('Authentication response did not contain user profile.');
    } catch (err) {
      const msg = err.detail || err.message || 'Incorrect username or password';
      setError(msg);
      throw new Error(msg);
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

  const getDemoUser = useCallback((role = 'admin') => {
    const defaultUsers = {
      admin: { id: 'usr_admin', username: 'admin', full_name: 'Chief Intelligence Director', role: 'admin' },
      investigator: { id: 'usr_investigator', username: 'investigator', full_name: 'Lead Intelligence Officer', role: 'investigator' },
      analyst: { id: 'usr_analyst', username: 'analyst', full_name: 'Senior Intelligence Analyst', role: 'read_only' }
    };
    return defaultUsers[role] || defaultUsers.admin;
  }, []);

  const verifyCredentials = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await api.login(username, password);
      if (data?.user) {
        return data.user;
      }
      throw new Error('Authentication response did not contain user profile.');
    } catch (err) {
      const msg = err.detail || err.message || 'Incorrect username or password';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const commitUser = useCallback((userObj) => {
    localStorage.removeItem('constellation_logged_out');
    setUser(userObj);
    if (!localStorage.getItem('constellation_token')) {
      localStorage.setItem('constellation_token', `demo_token_${userObj.username}`);
    }
    localStorage.setItem('constellation_user', JSON.stringify(userObj));
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem('constellation_user');
    localStorage.removeItem('constellation_token');
    localStorage.setItem('constellation_logged_out', 'true');
    sessionStorage.removeItem('constellation_splash_played');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, demoLogin, getDemoUser, verifyCredentials, commitUser, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
