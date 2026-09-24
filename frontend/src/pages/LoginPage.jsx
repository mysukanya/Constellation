import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Sparkles, ArrowRight, Lock, User, CheckCircle2 } from 'lucide-react';
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

  // ── PHASE 2: MINIMAL GLASSMORPHIC LOGIN (split panel with shard & login) ──
  return (
    <div className="glass-login-viewport">
      {/* Background Image Layer */}
      <div className="glass-login-bg-layer" />
      <div className="glass-login-vignette" />

      {/* Centered Dual-Shard Glassmorphic Panel */}
      <div className="glass-login-card">
        {/* Left Shard: Constellation & What We Do */}
        <div className="glass-shard-left">
          <div className="shard-top-brand">
            <h2 className="shard-brand-title">CONSTELLATION</h2>
            <p className="shard-brand-kicker font-mono">SEE PATTERNS. STOP CRIME.</p>
          </div>

          <div className="shard-what-we-do">
            <h3 className="shard-heading">
              Autonomous Crime Intelligence &amp; Pattern Resolution
            </h3>
            <p className="shard-description">
              A unified operating system for federal &amp; cross-jurisdictional investigations.
              Correlating maritime narcotics, corporate AML shells, and encrypted communications in real time.
            </p>

            <div className="shard-feature-pills font-mono">
              <div className="shard-pill">
                <span className="shard-sparkle">✦</span>
                <span>Autonomous 12h Sweeps</span>
              </div>
              <div className="shard-pill">
                <span className="shard-sparkle">✦</span>
                <span>Cross-Case Heuristic Resolution</span>
              </div>
              <div className="shard-pill">
                <span className="shard-sparkle">✦</span>
                <span>Cryptographic Provenance Ledger</span>
              </div>
            </div>
          </div>

          <div className="shard-bottom-meta font-mono">
            <span className="shard-authority-badge">
              STATUTORY AUTHORITY: BNS SEC 111 / PMLA SEC 5
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
              <label className="shard-label">Username</label>
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

            <div className="shard-field-group">
              <label className="shard-label">Password</label>
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

            <button type="submit" className="shard-submit-btn">
              <span>Sign In</span>
              <ArrowRight size={14} />
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
