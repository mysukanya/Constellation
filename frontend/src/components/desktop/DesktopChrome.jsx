import { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import TotalFileExplorer from './TotalFileExplorer';
import AdminUserManagementModal from './AdminUserManagementModal';
import {
  Search, Bell, Shield, Activity, GitBranch,
  CheckCircle2, Clock, ChevronRight, X, AlertTriangle,
  Radio, Check, Trash2, ArrowUpRight, Database,
  Home, Network, Folder, Globe, Cpu, Scale, Settings,
  UploadCloud, Brain, GitCompare, UserCheck, Sparkles, Key, ExternalLink,
  Briefcase, FileUp, UserSearch, Sun, Moon, Users, Layers, ShieldCheck
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
  const [showAdminModal, setShowAdminModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('modal') === 'admin';
    }
    return false;
  });

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
      {/* ── TOP OPENAI-STYLE FLUSH TOPBAR ── */}
      <header className="openai-topbar">
        {/* Left: OpenAI style clean typographic wordmark */}
        <div className="topbar-left-zone">
          <div className="openai-brand-lockup" onClick={() => setActiveNavSection('home')}>
            <span className="openai-brand-text">CONSTELLATION</span>
          </div>
        </div>

        {/* Center: Clean Horizontal Navigation Links */}
        <nav className="openai-nav-links">
          <button
            className={`openai-nav-link ${activeNavSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('home')}
          >
            Dashboard
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('workspace')}
          >
            Workspace
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'ingestion' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('ingestion')}
          >
            Evidence
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'byomkesh' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('byomkesh')}
          >
            Byomkesh AI
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'cases' || activeNavSection === 'case-detail' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('cases')}
          >
            Cases
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'sweeps' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('sweeps')}
          >
            12h Sweeps
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'intel' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('intel')}
          >
            Live Intel
          </button>
          <button
            className={`openai-nav-link ${activeNavSection === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveNavSection('audit')}
          >
            Provenance
          </button>
        </nav>

        {/* Right: Demo Badge, Ledger Seal, Admin User Button, Notification Bell, Theme Switcher */}
        <div className="openai-topbar-right">
          <div className="topbar-sealed-tag font-mono" title="Cryptographic Ledger Integrity: 0x8f3b...SEALED">
            <CheckCircle2 size={11} className="text-emerald" />
            <span>0x8f3b...SEALED</span>
          </div>

          {localStorage.getItem('constellation_token')?.startsWith('demo_token') && (
            <div className="openai-demo-badge font-mono" title="Running with offline demonstration data">
              <span className="openai-demo-dot" />
              <span>DEMO</span>
            </div>
          )}

          {/* Admin User Management Button */}
          <button
            className={`openai-admin-btn font-mono ${showAdminModal ? 'active' : ''}`}
            onClick={() => setShowAdminModal(true)}
            title="Admin User Management: Add Users to Database"
          >
            <Users size={12} />
            <span>Admin</span>
          </button>

          {/* Fully Functional Notification Bell */}
          <button
            className={`openai-icon-btn ${showNotifications ? 'active' : ''}`}
            title="Intelligence Alerts & Notifications"
            onClick={() => setShowNotifications(prev => !prev)}
          >
            <Bell size={14} />
            {unreadCount > 0 && <span className="openai-badge-dot">{unreadCount}</span>}
          </button>

          {/* Minimal Clean Light / Dark Mode Switcher */}
          <button
            className="openai-icon-btn theme-toggle-btn"
            title={theme === 'light' ? 'Switch to Pure Black Dark Mode' : 'Switch to Minimal Light Mode'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </header>

      {/* ── NOTIFICATION CENTER FLYOUT DROPDOWN ─────────────────── */}
      {showNotifications && (
        <div className="notification-center-flyout">
          <div className="notif-panel-clean">
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
          </div>
        </div>
      )}

      {/* ── DESKTOP MAIN VIEWPORT WITH FLUSH LEFT TOOL RAIL ─── */}
      <div className="desktop-main-split">
        <aside className="left-icon-rail-dock">
          {/* Main Navigation Group - Mutually exclusive, no duplicates */}
          <div className="rail-group-top">
            {/* 1. Global Intelligence Grid Dashboard */}
            <button
              className={`rail-btn ${activeNavSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('home')}
              title="Global Intelligence Grid Dashboard"
            >
              <Globe size={17} />
            </button>

            {/* 2. Investigation Workspace & Canvas Hub */}
            <button
              className={`rail-btn ${activeNavSection === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('workspace')}
              title="Investigation Workspace Canvas & Hub"
            >
              <Layers size={17} />
            </button>

            {/* 3. Evidence Ingestion & Drag-and-Drop Organization */}
            <button
              className={`rail-btn ${activeNavSection === 'ingestion' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('ingestion')}
              title="Evidence Ingestion (Folder Upload & Organization)"
            >
              <FileUp size={17} />
            </button>

            {/* 4. Byomkesh AI Forensic Co-Pilot */}
            <button
              className={`rail-btn ${activeNavSection === 'byomkesh' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('byomkesh')}
              title="Byomkesh AI Forensic Co-Pilot"
            >
              <Brain size={17} />
            </button>

            {/* 5. Bureau Cases Directory */}
            <button
              className={`rail-btn ${activeNavSection === 'cases' || activeNavSection === 'case-detail' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('cases')}
              title="Bureau Cases & Investigations"
            >
              <Briefcase size={17} />
            </button>

            {/* 6. Autonomous 12-Hour Sweeps */}
            <button
              className={`rail-btn ${activeNavSection === 'sweeps' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('sweeps')}
              title="Autonomous 12H Sweeps & Cross-Case Corroboration"
            >
              <Sparkles size={17} />
            </button>

            {/* 7. Provenance & Sealed Ledger */}
            <button
              className={`rail-btn ${activeNavSection === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('audit')}
              title="Cryptographic Evidence Provenance Ledger"
            >
              <ShieldCheck size={17} />
            </button>
          </div>

          {/* Bottom Group: Bureau File Explorer & Security Clearance Dossier */}
          <div className="rail-group-bottom">
            <button
              className={`rail-btn ${totalExplorerOpen ? 'active' : ''}`}
              onClick={() => setTotalExplorerOpen(true)}
              title="Total File Explorer (Case Files & Evidence Archive)"
            >
              <Folder size={17} />
            </button>

            <button
              className="rail-btn rail-btn-settings"
              onClick={() => setShowSearchModal(true)}
              title="Global Search & Command Palette (⌘K)"
            >
              <Search size={17} />
            </button>

            <button
              className={`rail-btn rail-btn-profile ${showOfficerProfile ? 'active' : ''}`}
              onClick={() => setShowOfficerProfile(true)}
              title="Lead Officer Dossier & Security Clearance"
            >
              <Shield size={17} />
              <span className="rail-profile-dot" />
            </button>
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="desktop-workspace-canvas">
          {children}
        </main>
      </div>


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
                onClick={() => { setTotalExplorerOpen(true); setShowSearchModal(false); }}
              >
                <span>Open Total Bureau File Explorer</span>
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
              <div
                className="palette-result-item"
                onClick={() => { setShowAdminModal(true); setShowSearchModal(false); }}
              >
                <span>Admin: Manage Bureau Users & Add to Database</span>
                <span className="palette-tag">ADMIN DB</span>
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

      {/* ── ADMIN USER MANAGEMENT MODAL (SQLite Users DB) ───────── */}
      <AdminUserManagementModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
}
