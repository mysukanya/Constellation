import { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import TotalFileExplorer from './TotalFileExplorer';
import {
  Search, Bell, Shield, Activity, GitBranch,
  CheckCircle2, Clock, ChevronRight, X, AlertTriangle,
  Radio, Check, Trash2, ArrowUpRight, Database,
  Home, Network, Folder, Globe, Cpu, Scale, Settings,
  UploadCloud, Brain, GitCompare, UserCheck, Sparkles, Key, ExternalLink,
  Briefcase, FileUp, UserSearch, Sun, Moon
} from 'lucide-react';
import './DesktopChrome.css';

export default function DesktopChrome({ children }) {
  const {
    activeNavSection,
    setActiveNavSection,
    activeCase,
    selectedFileItem,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    setSelectedEntity,
    canvasNodes,
    byomkeshOpen,
    setByomkeshOpen,
    dataUploaderOpen,
    setDataUploaderOpen,
    crossCaseOpen,
    setCrossCaseOpen,
    totalExplorerOpen,
    setTotalExplorerOpen,
    theme,
    toggleTheme
  } = useWorkspace();

  const [utcTime, setUtcTime] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOfficerProfile, setShowOfficerProfile] = useState(false);

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${mins}:${secs} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard shortcuts: Cmd+K, Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setByomkeshOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowOfficerProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setByomkeshOpen]);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    if (notif.targetId) {
      const matching = canvasNodes.find(n => n.id === notif.targetId);
      if (matching) setSelectedEntity(matching);
    }
    setActiveNavSection('workspace');
    setShowNotifications(false);
  };

  return (
    <div className="desktop-window-container">
      {/* ── TOP TITLEBAR CHROME (Floating OpenAI Style Minimal Panel) ── */}
      <div className="floating-titlebar-wrapper">
        <Panel3D className="desktop-titlebar-panel3d floating-titlebar-panel3d" glow="green" maxAngle={1.5}>
          <header className="desktop-titlebar openai-minimal-titlebar">
            {/* Left: OpenAI style minimal brand mark */}
            <div className="titlebar-left">
              <div className="brand-lockup-openai" onClick={() => setActiveNavSection('home')}>
                <div className="brand-dot-emerald" />
                <span className="brand-text-openai">CONSTELLATION</span>
                <span className="brand-sub-openai font-mono">SEE PATTERNS. STOP CRIME.</span>
              </div>
            </div>

            {/* Center: Global Navigation Perspective Switcher */}
            <nav className="titlebar-nav-switcher">
              <button
                className={`nav-tab-btn ${activeNavSection === 'home' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('home')}
              >
                Dashboard
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'workspace' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('workspace')}
              >
                Workspace
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'sweeps' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('sweeps')}
              >
                12h Sweeps
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'intel' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('intel')}
              >
                Live Intel
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('audit')}
              >
                Provenance
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'cases' || activeNavSection === 'case-detail' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('cases')}
              >
                Cases
              </button>
              <button
                className={`nav-tab-btn ${activeNavSection === 'er' ? 'active' : ''}`}
                onClick={() => setActiveNavSection('er')}
              >
                Entity Res.
              </button>
            </nav>

            {/* Right: Active Case Pill, Quick Search, Sweep Countdown, Notification Bell */}
            <div className="titlebar-right">
              {localStorage.getItem('constellation_token')?.startsWith('demo_token') && (
                <div className="titlebar-active-case-capsule font-mono" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.2)' }} title="Running with offline demonstration data">
                  <span className="backend-pulse-dot" style={{ background: 'var(--accent-amber)', marginRight: '6px' }} />
                  <span>DEMO MODE</span>
                </div>
              )}
              <div
                className="titlebar-active-case-capsule font-mono"
                onClick={() => setActiveNavSection('workspace')}
                title="Active Investigation Context"
              >
                <GitBranch size={11} className="text-green" />
                <span>case/{activeCase.id}</span>
              </div>

              <div className="titlebar-search-box" onClick={() => setShowSearchModal(true)}>
                <Search size={13} className="search-ico" />
                <span className="search-text-placeholder">Search intelligence...</span>
                <kbd className="search-kbd">⌘K</kbd>
              </div>

              <div className="sweep-countdown-indicator" title="Next Autonomous 12-Hour Sweep in 10 Hours">
                <span className="sweep-dot" />
                <span>Sweep: 10h</span>
              </div>

              {/* Fully Functional Notification Bell */}
              <button
                className={`titlebar-icon-action ${showNotifications ? 'active' : ''}`}
                title="Intelligence Alerts & Notifications"
                onClick={() => setShowNotifications(prev => !prev)}
              >
                <Bell size={14} />
                {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
              </button>

              {/* Minimal Clean Light / Dark Mode Switcher */}
              <button
                className="titlebar-icon-action theme-toggle-btn"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Minimal Light Mode'}
                onClick={toggleTheme}
                style={{ marginLeft: '2px' }}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
          </header>
        </Panel3D>
      </div>

      {/* ── NOTIFICATION CENTER FLYOUT DROPDOWN ─────────────────── */}
      {showNotifications && (
        <div className="notification-center-flyout">
          <Panel3D className="notification-panel3d" glow="white" maxAngle={4}>
            <div className="notif-header">
              <div className="notif-title-row">
                <Bell size={13} />
                <span className="notif-heading">INTELLIGENCE ALERTS</span>
                {unreadCount > 0 && <span className="notif-count-tag">{unreadCount} NEW</span>}
              </div>
              <div className="notif-header-actions">
                <button className="notif-action-btn" onClick={markAllNotificationsRead} title="Mark All as Read">
                  <Check size={12} />
                  <span>Mark Read</span>
                </button>
                <button className="notif-close-btn" onClick={() => setShowNotifications(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="notif-list-body">
              {notifications && notifications.length > 0 ? (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-card-item ${!n.read ? 'is-unread' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="notif-card-top">
                      <span className={`urgency-pill urgency-${n.urgency.toLowerCase()}`}>
                        {n.urgency}
                      </span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-actions">
                      <span className="view-workspace-hint">
                        View in Workspace <ArrowUpRight size={10} />
                      </span>
                      <button
                        className="notif-dismiss-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(n.id);
                        }}
                        title="Dismiss alert"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notif-empty-state">No active intelligence alerts</div>
              )}
            </div>
          </Panel3D>
        </div>
      )}

      {/* ── DESKTOP MAIN VIEWPORT WITH FLOATING LEFT TOOL RAIL ─── */}
      <div className="desktop-main-split">
        {/* Floating Left Workspace Tools Rail */}
        <div className="floating-rail-wrapper">
          <Panel3D className="floating-rail-panel3d" glow="green" maxAngle={2}>
            <aside className="left-icon-rail-dock">
              {/* Workspace Tools Group */}
              <div className="rail-group-top">
                {/* 1. File Explorer (Windows 11 Explorer with Cases Done & Folders) */}
                <button
                  className={`rail-btn ${totalExplorerOpen ? 'active' : ''}`}
                  onClick={() => setTotalExplorerOpen(true)}
                  title="Total File Explorer (Windows 11 Case Files & Closed Convictions)"
                >
                  <Folder size={18} />
                </button>

                {/* 2. Data Uploader (Add Suspects, Phone Logs, Evidentiary Documents) */}
                <button
                  className={`rail-btn ${dataUploaderOpen ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavSection('workspace');
                    setDataUploaderOpen(prev => !prev);
                  }}
                  title="Data Uploader & Evidence Ingestion (Upload Phone Logs, BOLs, Suspect Dossiers)"
                >
                  <UploadCloud size={18} />
                </button>

                {/* 3. Byomkesh AI Co-Pilot Toggle */}
                <button
                  className={`rail-btn rail-btn-byomkesh ${byomkeshOpen ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavSection('workspace');
                    setByomkeshOpen(prev => !prev);
                  }}
                  title="Byomkesh AI Co-Pilot (Autonomous Reasoning & Evidence Inferences) [⌘B]"
                >
                  <Brain size={18} />
                </button>

                {/* 4. Cross-Case Importer & Linker */}
                <button
                  className={`rail-btn ${crossCaseOpen ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavSection('workspace');
                    setCrossCaseOpen(prev => !prev);
                  }}
                  title="Cross-Case Connections & Entity Correlation Tool"
                >
                  <GitCompare size={18} />
                </button>

                {/* 5. Global Intelligence Map / 3D Globe */}
                <button
                  className={`rail-btn ${activeNavSection === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveNavSection('home')}
                  title="Global Intelligence Grid (3D Rotating Globe & Corridor Map)"
                >
                  <Globe size={18} />
                </button>

                {/* 6. Evidence Ingestion */}
                <button
                  className={`rail-btn ${activeNavSection === 'ingestion' ? 'active' : ''}`}
                  onClick={() => setActiveNavSection('ingestion')}
                  title="Evidence Ingestion (Upload PDFs, CSVs, Media Files)"
                >
                  <FileUp size={18} />
                </button>

                {/* 7. Byomkesh Dedicated Query Page */}
                <button
                  className={`rail-btn ${activeNavSection === 'byomkesh' ? 'active' : ''}`}
                  onClick={() => setActiveNavSection('byomkesh')}
                  title="Byomkesh AI Investigative Query Interface"
                >
                  <Sparkles size={18} />
                </button>

                {/* 8. Entity Resolution Queue */}
                <button
                  className={`rail-btn ${activeNavSection === 'er' ? 'active' : ''}`}
                  onClick={() => setActiveNavSection('er')}
                  title="Entity Resolution Match Review Queue"
                >
                  <UserSearch size={18} />
                </button>
              </div>

              {/* Bottom Group: Settings & Profile Icon */}
              <div className="rail-group-bottom">
                <button
                  className="rail-btn rail-btn-settings"
                  onClick={() => setShowSearchModal(true)}
                  title="Global Search & Hotkey Command Palette (⌘K)"
                >
                  <Settings size={18} />
                </button>

                {/* Profile Icon at Bottom of Sidebar */}
                <button
                  className={`rail-btn rail-btn-profile ${showOfficerProfile ? 'active' : ''}`}
                  onClick={() => setShowOfficerProfile(true)}
                  title="Lead Officer Dossier & Security Clearance (TS-SCI)"
                >
                  <Shield size={18} />
                  <span className="rail-profile-dot" />
                </button>
              </div>
            </aside>
          </Panel3D>
        </div>

        {/* Center Main Stage (Floating Canvas Container) */}
        <main className="desktop-workspace-canvas floating-workspace-canvas">
          {children}
        </main>
      </div>

      {/* ── BOTTOM DESKTOP STATUS BAR (3D Bending Floating Panel) ── */}
      <Panel3D className="desktop-statusbar-panel3d" glow="white" maxAngle={2}>
        <footer className="desktop-statusbar">
          <div className="statusbar-left">
            <div className="status-item">
              <GitBranch size={12} className="status-icon" />
              <span className="status-label font-mono">case/{activeCase.id}</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <CheckCircle2 size={12} className="status-icon text-green" />
              <span className="status-label">Ledger: 0x8f3b...SEALED</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <span className="legal-basis-badge">{activeCase.legalBasis}</span>
            </div>
          </div>

          <div className="statusbar-right">
            <div className="status-item">
              <Activity size={12} className="status-icon text-blue" />
              <span className="status-label">Byomkesh Engine: READY</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <Clock size={12} className="status-icon" />
              <span className="status-label font-mono">{utcTime}</span>
            </div>
          </div>
        </footer>
      </Panel3D>

      {/* ── COMMAND PALETTE MODAL (Cmd+K) ──────────────────────── */}
      {showSearchModal && (
        <div className="command-palette-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="command-palette-panel" onClick={e => e.stopPropagation()}>
            <div className="palette-input-row">
              <Search size={16} className="palette-search-icon" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search entities, cases, files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="palette-input-field"
              />
              <button className="palette-close-btn" onClick={() => setShowSearchModal(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="palette-results-list">
              <div className="palette-group-title">COMMANDS</div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('home'); setShowSearchModal(false); }}
              >
                <span>Navigate to Global Intelligence Grid Dashboard</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Open Active Case Workspace Canvas</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setShowTotalExplorer(true); setShowSearchModal(false); }}
              >
                <span>Open Windows File Explorer</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('sweeps'); setShowSearchModal(false); }}
              >
                <span>Inspect 12-Hour Sweep Discoveries</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('cases'); setShowSearchModal(false); }}
              >
                <span>Browse All Cases & Investigations</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('er'); setShowSearchModal(false); }}
              >
                <span>Entity Resolution Match Queue</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('ingestion'); setShowSearchModal(false); }}
              >
                <span>Upload Evidence & Ingest Data</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('byomkesh'); setShowSearchModal(false); }}
              >
                <span>Byomkesh AI Investigative Queries</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div className="palette-group-title">CANONICAL ENTITIES</div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Tariq "The Anchor" Merchant [PERSON // CRITICAL]</span>
                <span className="palette-tag">Case 102</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Al-Barakah Logistics FZE [ORGANIZATION // DUBAI]</span>
                <span className="palette-tag">Case 102</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOTAL BUREAU FILE EXPLORER MODAL ────────────────────── */}
      <TotalFileExplorer
        isOpen={totalExplorerOpen}
        onClose={() => setTotalExplorerOpen(false)}
      />

      {/* ── OFFICER PROFILE & CLEARANCE MODAL ───────────────────── */}
      {showOfficerProfile && (
        <div className="command-palette-backdrop" onClick={() => setShowOfficerProfile(false)}>
          <div className="officer-profile-modal-panel" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-header-title">
                <Shield size={18} className="text-emerald" />
                <div>
                  <h3 className="profile-modal-name">Special Agent Adithya Srivatsa</h3>
                  <p className="profile-modal-sub font-mono">DIRECTORATE OF REVENUE INTELLIGENCE // LEAD INVESTIGATOR</p>
                </div>
              </div>
              <button className="profile-close-btn" onClick={() => setShowOfficerProfile(false)}>
                <X size={15} />
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-meta-grid font-mono">
                <div className="profile-meta-item">
                  <span className="profile-meta-label">CLEARANCE LEVEL</span>
                  <span className="profile-meta-val badge-clearance">TOP SECRET // SCI (TK-G-HCS)</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">ORGANIZATION</span>
                  <span className="profile-meta-val">Hundred-Trillion Systems</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">OPERATIONAL SECTOR</span>
                  <span className="profile-meta-val">Western Seaboard Maritime Contraband & Hawala</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">CRYPTOGRAPHIC IDENTITY</span>
                  <span className="profile-meta-val text-green">0x71f8...442a (SEALED)</span>
                </div>
              </div>

              <div className="profile-legal-box font-mono">
                <div className="legal-box-title">STATUTORY INVESTIGATIVE AUTHORITY:</div>
                <div className="legal-box-content">
                  Empowered under Bharatiya Nyaya Sanhita (BNS) Sec 111 (Organized Crime Syndicates),
                  Customs Act 1962 Sec 108 (Summons & Seizure), Prevention of Money Laundering Act (PMLA) Sec 5,
                  and Information Technology Act Sec 69 (Decryption).
                </div>
              </div>

              <div className="profile-modal-footer">
                <span className="profile-session-clock font-mono">SESSION ACTIVE · {utcTime}</span>
                <button className="profile-action-btn font-mono" onClick={() => setShowOfficerProfile(false)}>
                  Dismiss Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
