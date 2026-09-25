import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Lock, User, Shield, Check } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();

  // Stages: 'splash' -> 'login' -> 'welcome'
  const [phase, setPhase] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('screen') === 'welcome') return 'welcome';
      if (params.get('screen') === 'login') return 'login';
      if (sessionStorage.getItem('constellation_splash_played') === 'true') return 'login';
    }
    return 'splash';
  });

  const [typedSplash, setTypedSplash] = useState('');
  const [welcomeTypedText, setWelcomeTypedText] = useState('');
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Password');
  const [welcomeStage, setWelcomeStage] = useState('enter'); // 'enter' | 'exit'
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 1. Splash Screen: Slow, even typing of 'Constellation' on pure black
  useEffect(() => {
    if (phase !== 'splash') return;

    const targetWord = 'Constellation';
    let index = 0;
    setTypedSplash('');

    const interval = setInterval(() => {
      index++;
      setTypedSplash(targetWord.slice(0, index));
      if (index >= targetWord.length) {
        clearInterval(interval);
        setTimeout(() => {
          sessionStorage.setItem('constellation_splash_played', 'true');
          setPhase('login');
        }, 700);
      }
    }, 110); // slow and even

    return () => clearInterval(interval);
  }, [phase]);

  // 2. Welcome Interstitial: Slow, even typing of 'Welcome back! Investigator!'
  useEffect(() => {
    if (phase !== 'welcome') return;

    const target = 'Welcome back! Investigator!';
    let idx = 0;
    setWelcomeTypedText('');
    setWelcomeStage('enter');

    const typeInterval = setInterval(() => {
      idx++;
      setWelcomeTypedText(target.slice(0, idx));
      if (idx >= target.length) {
        clearInterval(typeInterval);
        // Pause to appreciate, then fade out and unlock dashboard
        setTimeout(() => {
          setWelcomeStage('exit');
        }, 800);
      }
    }, 85); // slow, even, deliberate pace

    return () => clearInterval(typeInterval);
  }, [phase]);

  const handleStartAuth = async (mode) => {
    setAuthError(null);
    if (mode === 'demo') {
      demoLogin('admin');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(username, password);
      setPhase('welcome');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed: Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── PHASE 1: SPLASH SCREEN (slow even typed words on black) ──────
  if (phase === 'splash') {
    return (
      <div
        className="minimal-splash-screen"
        onClick={() => {
          sessionStorage.setItem('constellation_splash_played', 'true');
          setPhase('login');
        }}
        role="button"
        tabIndex={0}
        title="Click to skip"
      >
        <div className="minimal-splash-content font-mono">
          <span className="minimal-typed-word">{typedSplash}</span>
          <span className="minimal-blinking-cursor">|</span>
        </div>
      </div>
    );
  }

  // ── PHASE 3: WELCOME INTERSTITIAL (slow even typing on black) ──
  if (phase === 'welcome') {
    return (
      <div
        className={`minimal-welcome-screen ${welcomeStage === 'exit' ? 'is-fading-out' : 'is-fading-in'}`}
        onClick={() => {
          setWelcomeStage('exit');
          setTimeout(() => demoLogin('admin'), 200);
        }}
        role="button"
        tabIndex={0}
        title="Click to proceed"
        style={{ cursor: 'pointer' }}
      >
        <div className="minimal-welcome-content font-mono">
          <span className="minimal-welcome-title">{welcomeTypedText}</span>
          <span className="minimal-blinking-cursor">|</span>
        </div>
      </div>
    );
  }

  // ── PHASE 2: MINIMAL GLASSMORPHIC LOGIN (Linear Dual-Shard Panel) ──
  return (
    <div className="glass-login-viewport">
      {/* Background Image Layer */}
      <div className="glass-login-bg-layer" />
      <div className="glass-login-vignette" />

      {/* Centered Dual-Shard Glassmorphic Panel */}
      <div className="glass-login-card">
        {/* Left Shard: Clean, Linear Constellation Overview */}
        <div className="glass-shard-left">
          <div className="shard-brand-block">
            <h2 className="shard-brand-title font-mono">CONSTELLATION</h2>
            <p className="shard-brand-kicker font-mono">AUTONOMOUS CRIME INTELLIGENCE SYSTEM</p>
          </div>

          <div className="shard-linear-capabilities">
            <div className="shard-linear-item font-mono">
              <span className="shard-item-dot" />
              <span className="shard-item-text">Autonomous 12-Hour Cross-Jurisdiction Sweeps</span>
            </div>
            <div className="shard-linear-item font-mono">
              <span className="shard-item-dot" />
              <span className="shard-item-text">Heuristic Cross-Case Entity &amp; Hawala Resolution</span>
            </div>
            <div className="shard-linear-item font-mono">
              <span className="shard-item-dot" />
              <span className="shard-item-text">Cryptographic Tamper-Proof Audit Provenance</span>
            </div>
            <div className="shard-linear-item font-mono">
              <span className="shard-item-dot" />
              <span className="shard-item-text">Real-Time Maritime Contraband Correlation</span>
            </div>
          </div>

          <div className="shard-bottom-meta font-mono">
            <span className="shard-authority-badge">
              STATUTORY AUTHORITY: BNS SEC 111 &middot; PMLA SEC 5
            </span>
          </div>
        </div>

        {/* Right Shard: Minimal Authentication Form */}
        <div className="glass-shard-right">
          <div className="shard-form-header">
            <span className="shard-form-title">Investigator Access</span>
            <button
              type="button"
              className="shard-demo-btn font-mono"
              onClick={() => handleStartAuth('demo')}
              title="Instant Demo Access"
            >
              Demo Mode
            </button>
          </div>

          <form
            className="shard-login-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleStartAuth('submit');
            }}
          >
            <div className="shard-field-group">
              <label className="shard-label font-mono">USERNAME</label>
              <div className="shard-input-wrap">
                <input
                  type="text"
                  className="shard-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="shard-field-group">
              <label className="shard-label font-mono">PASSWORD</label>
              <div className="shard-input-wrap">
                <input
                  type="password"
                  className="shard-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="shard-error-banner font-mono" style={{ color: '#ef4444', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px' }}>
                ⚠ {authError}
              </div>
            )}

            <button type="submit" className="shard-submit-btn font-mono" disabled={isLoggingIn}>
              <span>{isLoggingIn ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <div className="shard-footer-credentials font-mono">
            <span>DEFAULT: ADMIN / PASSWORD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
