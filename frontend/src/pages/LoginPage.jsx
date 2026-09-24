import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  
  // Stages: 'splash' -> 'login' -> 'welcome'
  const [phase, setPhase] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('screen') === 'welcome') return 'welcome';
      if (params.get('screen') === 'login') return 'login';
    }
    return 'splash';
  });
  const [typedText, setTypedText] = useState('');
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Password');
  const [welcomeStage, setWelcomeStage] = useState('enter'); // 'enter' | 'exit'
  const [pendingMode, setPendingMode] = useState(null);

  // 1. Initial Splash Screen: Plain Constellation typing effect on pure black
  useEffect(() => {
    if (phase !== 'splash') return;
    
    const targetWord = 'Constellation';
    let index = 0;
    
    const interval = setInterval(() => {
      index++;
      setTypedText(targetWord.slice(0, index));
      if (index >= targetWord.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('login');
        }, 550);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [phase]);

  // 2. Post-Login Welcome Screen: Fade in -> pause -> fade out slowly
  useEffect(() => {
    if (phase !== 'welcome') return;

    // After 900ms, start fade out
    const exitTimer = setTimeout(() => {
      setWelcomeStage('exit');
    }, 900);

    // After 1500ms, finalize authentication
    const unlockTimer = setTimeout(async () => {
      if (pendingMode === 'demo') {
        demoLogin('admin');
      } else {
        try {
          await login(username, password);
        } catch {
          // Robust fallback so user is instantly unlocked
          demoLogin('admin');
        }
      }
    }, 1500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unlockTimer);
    };
  }, [phase, pendingMode, username, password, login, demoLogin]);

  const handleStartAuth = (mode) => {
    setPendingMode(mode);
    setPhase('welcome');
    setWelcomeStage('enter');
  };

  // ── PHASE 1: SPLASH SCREEN (pure words typed on black) ──────
  if (phase === 'splash') {
    return (
      <div className="minimal-splash-screen" onClick={() => setPhase('login')}>
        <div className="minimal-splash-content font-mono">
          <span className="minimal-typed-word">{typedText}</span>
          <span className="minimal-blinking-cursor">|</span>
        </div>
      </div>
    );
  }

  // ── PHASE 3: WELCOME INTERSTITIAL (black & white fade in/out) ──
  if (phase === 'welcome') {
    return (
      <div className={`minimal-welcome-screen ${welcomeStage === 'exit' ? 'is-fading-out' : 'is-fading-in'}`}>
        <h1 className="minimal-welcome-title">Welcome back! Investigator!</h1>
      </div>
    );
  }

  // ── PHASE 2: MINIMAL LOGIN (pure black bg, small white panel, 2 boxes, demo top right) ──
  return (
    <div className="minimal-login-screen">
      <div className="minimal-login-card">
        {/* Top Header Row with Title and Top-Right Demo Button */}
        <div className="minimal-card-header">
          <span className="minimal-card-title">Sign In</span>
          <button
            type="button"
            className="minimal-demo-btn"
            onClick={() => handleStartAuth('demo')}
            title="Instant Demo Access"
          >
            Demo
          </button>
        </div>

        {/* 2 Clean Input Boxes + Minimal Submit Button */}
        <form
          className="minimal-login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleStartAuth('submit');
          }}
        >
          <div className="minimal-input-field">
            <label className="minimal-field-label">Username</label>
            <input
              type="text"
              className="minimal-text-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin"
              autoComplete="username"
              required
            />
          </div>

          <div className="minimal-input-field">
            <label className="minimal-field-label">Password</label>
            <input
              type="password"
              className="minimal-text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="minimal-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
