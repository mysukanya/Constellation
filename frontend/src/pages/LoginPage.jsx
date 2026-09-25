import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Shield, Lock, User, Terminal, Sparkles, KeyRound, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { verifyCredentials, getDemoUser, commitUser } = useAuth();

  // Stages: 'splash' -> 'login' -> 'welcome'
  const [phase, setPhase] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('screen') === 'splash') return 'splash';
      if (params.get('screen') === 'welcome') return 'welcome';
      if (params.get('screen') === 'login') return 'login';
      if (sessionStorage.getItem('constellation_splash_played') === 'true') return 'login';
    }
    return 'splash';
  });

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const [typedSplash, setTypedSplash] = useState('');
  const [welcomeTypedText, setWelcomeTypedText] = useState('');
  const [welcomeStage, setWelcomeStage] = useState('enter'); // 'enter' | 'exit'

  // ── 1. SPLASH SCREEN: Plain Neobrutal Background with Black Typing ──
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
        }, 900);
      }
    }, 110);

    return () => clearInterval(interval);
  }, [phase]);

  const handleSkipSplash = () => {
    sessionStorage.setItem('constellation_splash_played', 'true');
    setPhase('login');
  };

  // ── 2. POST-LOGIN WELCOME INTERSTITIAL: Plain Background & Slow Typing ──
  useEffect(() => {
    if (phase !== 'welcome') return;

    const targetText = 'Welcome Back Investigator';
    let charIdx = 0;
    setWelcomeTypedText('');
    setWelcomeStage('enter');

    // Deliberate, cinematic slow typing: ~80ms per character
    const typingInterval = setInterval(() => {
      charIdx++;
      setWelcomeTypedText(targetText.slice(0, charIdx));

      if (charIdx >= targetText.length) {
        clearInterval(typingInterval);
        // Pause to let the user read, then trigger smooth fade-out
        const holdTimeout = setTimeout(() => {
          setWelcomeStage('exit');
          // Complete transition to desktop workspace once fade-out completes
          const commitTimeout = setTimeout(() => {
            if (pendingUser) {
              commitUser(pendingUser);
            } else {
              commitUser(getDemoUser('admin'));
            }
          }, 700);
          return () => clearTimeout(commitTimeout);
        }, 1200);
        return () => clearTimeout(holdTimeout);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [phase, pendingUser, commitUser, getDemoUser]);

  const handleSkipWelcome = () => {
    setWelcomeStage('exit');
    setTimeout(() => {
      if (pendingUser) {
        commitUser(pendingUser);
      } else {
        commitUser(getDemoUser('admin'));
      }
    }, 150);
  };

  // ── Handle Authentication ──────────────────────────────────────
  const handleStartAuth = async (mode) => {
    setAuthError(null);

    if (mode === 'demo') {
      const demoUsr = getDemoUser('admin');
      setPendingUser(demoUsr);
      setPhase('welcome');
      return;
    }

    setIsLoggingIn(true);
    try {
      const user = await verifyCredentials(username, password);
      setPendingUser(user);
      setPhase('welcome');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed: Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: PLAIN TYPING SPLASH SCREEN (Neobrutal Cream / Black Text)
  // ═══════════════════════════════════════════════════════════════
  if (phase === 'splash') {
    return (
      <div
        className="nb-plain-splash-screen"
        onClick={handleSkipSplash}
        role="button"
        tabIndex={0}
        title="Click to proceed"
      >
        <div className="nb-plain-splash-content font-mono">
          <span className="nb-plain-typed-word">{typedSplash}</span>
          <span className="nb-plain-cursor">█</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: PLAIN TYPING WELCOME ("Welcome Back Investigator")
  // ═══════════════════════════════════════════════════════════════
  if (phase === 'welcome') {
    return (
      <div
        className={`nb-plain-welcome-screen ${welcomeStage === 'exit' ? 'is-fading-out' : 'is-fading-in'}`}
        onClick={handleSkipWelcome}
        role="button"
        tabIndex={0}
        title="Click to proceed into dashboard"
      >
        <div className="nb-plain-welcome-content font-mono">
          <span className="nb-plain-welcome-text">{welcomeTypedText}</span>
          <span className="nb-plain-cursor">█</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: NEOBRUTALIST LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="nb-login-container">
      <div className="nb-login-grid-bg" />

      {/* Main Neobrutalist Window Card */}
      <div className="nb-login-window">
        {/* Window Top Titlebar */}
        <div className="nb-window-header">
          <div className="nb-window-header-left">
            <div className="nb-header-dots">
              <span className="nb-dot dot-yellow" />
              <span className="nb-dot dot-teal" />
              <span className="nb-dot dot-pink" />
            </div>
            <span className="nb-window-title font-mono">
              CONSTELLATION OS // INVESTIGATOR ACCESS GATEWAY
            </span>
          </div>
          <div className="nb-window-header-right font-mono">
            SECURE TERMINAL : PORT 5173
          </div>
        </div>

        {/* Window Dual-Column Split */}
        <div className="nb-window-split">
          {/* Left Column: Brand & Capabilities */}
          <div className="nb-login-left">
            <div className="nb-left-brand">
              <div className="nb-brand-tag font-mono">RESTRICTED ACCESS</div>
              <h2 className="nb-brand-name">CONSTELLATION</h2>
              <p className="nb-brand-desc">
                High-confidence crime intelligence, cross-jurisdictional syndicate correlation, and autonomous forensic sweep engine.
              </p>
            </div>

            <div className="nb-features-list">
              <div className="nb-feature-item">
                <span className="nb-feature-badge badge-teal font-mono">01 // SWEEPS</span>
                <div className="nb-feature-content">
                  <div className="nb-feature-title">Autonomous 12-Hour Sweeps</div>
                  <div className="nb-feature-sub">Heuristic cross-case link detection &amp; Hawala transaction alerts.</div>
                </div>
              </div>

              <div className="nb-feature-item">
                <span className="nb-feature-badge badge-yellow font-mono">02 // BYOMKESH</span>
                <div className="nb-feature-content">
                  <div className="nb-feature-title">Byomkesh AI Co-Pilot</div>
                  <div className="nb-feature-sub">Multi-hop graph interrogation backed by strict evidentiary chain.</div>
                </div>
              </div>

              <div className="nb-feature-item">
                <span className="nb-feature-badge badge-pink font-mono">03 // PROVENANCE</span>
                <div className="nb-feature-content">
                  <div className="nb-feature-title">HMAC Audit Ledger</div>
                  <div className="nb-feature-sub">Cryptographically tamper-evident case file &amp; artifact preservation.</div>
                </div>
              </div>
            </div>

            <div className="nb-left-footer font-mono">
              <Shield size={14} className="nb-footer-icon" />
              <span>STATUTORY COMPLIANCE: BNS SEC 111 &middot; PMLA SEC 5</span>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="nb-login-right">
            <div className="nb-form-header">
              <div>
                <h3 className="nb-form-title">Investigator Sign In</h3>
                <p className="nb-form-subtitle font-mono">AUTHENTICATE WITH OFFICIAL CREDENTIALS</p>
              </div>
              <button
                type="button"
                className="nb-demo-btn font-mono"
                onClick={() => handleStartAuth('demo')}
                title="Instant One-Click Demo Mode"
              >
                <Sparkles size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
                DEMO ACCESS
              </button>
            </div>

            <form
              className="nb-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleStartAuth('submit');
              }}
            >
              <div className="nb-field-group">
                <label className="nb-field-label font-mono">
                  <User size={13} style={{ marginRight: 6, verticalAlign: -1 }} />
                  USERNAME / BADGE ID
                </label>
                <input
                  type="text"
                  className="nb-input font-mono"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="nb-field-group">
                <label className="nb-field-label font-mono">
                  <KeyRound size={13} style={{ marginRight: 6, verticalAlign: -1 }} />
                  SECURITY PASSWORD
                </label>
                <input
                  type="password"
                  className="nb-input font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {authError && (
                <div className="nb-error-banner font-mono">
                  <AlertCircle size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="nb-submit-btn font-mono"
                disabled={isLoggingIn}
              >
                <span>{isLoggingIn ? 'AUTHENTICATING...' : 'ENTER INVESTIGATION DESKTOP'}</span>
                <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            </form>

            <div className="nb-credentials-hint font-mono">
              <div className="hint-pill">
                DEFAULT BADGE: <strong>admin</strong> / <strong>password</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
