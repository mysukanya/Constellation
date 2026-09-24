import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register, demoLogin, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, fullName);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setLocalError(err.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role = 'admin') => {
    setLoading(true);
    try {
      demoLogin(role);
    } catch (err) {
      setLocalError('Failed to initialize demo session');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#lg)" strokeWidth="2" fill="none" />
              <circle cx="20" cy="8" r="3" fill="#60a5fa" />
              <circle cx="8" cy="28" r="3" fill="#a78bfa" />
              <circle cx="32" cy="28" r="3" fill="#34d399" />
              <line x1="20" y1="11" x2="10" y2="26" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
              <line x1="20" y1="11" x2="30" y2="26" stroke="#34d399" strokeWidth="1" opacity="0.6" />
              <line x1="11" y1="28" x2="29" y2="28" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <h1>Constellation</h1>
          </div>
          <p className="login-subtitle">Intelligence Investigation Platform</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>

          {displayError && (
            <div className="login-error">{displayError}</div>
          )}

          {isRegister && (
            <div className="login-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. System Administrator"
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>

          {!isRegister && (
            <button
              type="button"
              className="login-quick-btn"
              onClick={() => handleQuickDemo('admin')}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(96, 165, 250, 0.12)',
                border: '1px solid rgba(96, 165, 250, 0.35)',
                borderRadius: '8px',
                color: '#93c5fd',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>⚡ Quick Launch — Admin Access</span>
            </button>
          )}

          <div className="login-toggle">
            {isRegister ? (
              <span>Already have an account? <button type="button" onClick={() => { setIsRegister(false); setLocalError(''); }}>Sign In</button></span>
            ) : (
              <span>New investigator? <button type="button" onClick={() => { setIsRegister(true); setLocalError(''); }}>Create Account</button></span>
            )}
          </div>

          {!isRegister && (
            <div className="login-defaults">
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Default Credentials: <strong style={{ color: '#fff' }}>admin</strong> / <strong style={{ color: '#fff' }}>password</strong>
              </p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('password'); }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#60a5fa', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('investigator'); setPassword('password'); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Investigator
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('analyst'); setPassword('password'); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Analyst
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
