import { useState, useEffect } from 'react';
import { useWorkspace, CANONICAL_CASES } from '../contexts/WorkspaceContext';
import {
  ArrowRight, ExternalLink, RefreshCw, Box,
  Users, ShieldAlert, Activity, CheckCircle2,
  TrendingUp, FileText, Sparkles, ArrowUpRight,
  ShieldCheck, UploadCloud, Brain, Search, Clock, MapPin, Database,
  Play, Layers, Plus
} from 'lucide-react';
import api from '../services/api';
import TacticalGlobe from '../components/dashboard/TacticalGlobe';
import './DashboardPage.css';

const ACTIVE_CASES = [
  {
    id: 'case-102',
    name: 'Case 102 — Silver Dune',
    sector: 'Maritime Narcotics & Hawala',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    lead: 'Officer A. Sharma',
    legalBasis: 'PMLA Sec 3/4 & NDPS Act Sec 21/29',
    evidenceCount: 28,
    entitiesCount: 42,
    lastUpdate: '14 mins ago',
    summary: 'Cross-border maritime narcotics & hawala settlement nexus between UAE and Gujarat.'
  },
  {
    id: 'case-117',
    name: 'Case 117 — Operation Black Tide',
    sector: 'Corporate Fraud & AML',
    priority: 'HIGH',
    status: 'ACTIVE',
    lead: 'Inspector K. Varma',
    legalBasis: 'NDPS Act Sec 21/29 & UAPA Sec 15',
    evidenceCount: 22,
    entitiesCount: 35,
    lastUpdate: '1 hour ago',
    summary: 'Synthetic narcotics distribution network and illicit pharmaceutical front companies.'
  },
  {
    id: 'case-121',
    name: 'Case 121 — Diamond Bourse Vault Breach',
    sector: 'Armed Robbery & Biometric Heist',
    priority: 'HIGH',
    status: 'ACTIVE',
    lead: 'Deputy Commissioner V. Mehta',
    legalBasis: 'BNS Sec 309 & Cyber Fraud',
    evidenceCount: 18,
    entitiesCount: 29,
    lastUpdate: '3 hours ago',
    summary: 'Inside-job biometric override and armed breach of subterranean vaults.'
  },
  {
    id: 'case-135',
    name: 'Case 135 — Black Pearl Extortion',
    sector: 'Organized Extortion & VoIP Coercion',
    priority: 'HIGH',
    status: 'ACTIVE',
    lead: 'ACP S. Kulkarni',
    legalBasis: 'BNS Sec 308 (Extortion) & IT Act Sec 66D',
    evidenceCount: 11,
    entitiesCount: 16,
    lastUpdate: '6 hours ago',
    summary: 'Coercive extortion ring targeting shipping contractors with VoIP death threats.'
  }
];

const LIVE_SIGNALS = [
  {
    id: 'sig-1',
    title: 'AIS Transponder Inversion Detected',
    time: '4m ago',
    priority: 'CRITICAL',
    location: 'Gulf of Kutch, Off Port Kandla',
    confidence: '96%',
    details: 'Bulk cargo vessel MT Sagar Ratna altered MMSI broadcast pattern. Unscheduled STS lightering rendezvous flagged.',
    caseId: 'case-102'
  },
  {
    id: 'sig-2',
    title: 'High-Value Structured Hawala Wire',
    time: '18m ago',
    priority: 'HIGH',
    location: 'Dubai Marina ↔ Surat Bourse',
    confidence: '91%',
    details: 'Mirror ledger #88219 triggered ₹14.8 Cr split remittance alert across 12 smurfing bank conduits.',
    caseId: 'case-102'
  },
  {
    id: 'sig-3',
    title: 'Encrypted Thuraya Satellite Ping',
    time: '34m ago',
    priority: 'HIGH',
    location: 'Arabian Sea (22.4°N, 68.9°E)',
    confidence: '88%',
    details: 'Burst communication on 1544.15 MHz captured. Direct correlation with Al-Barakah logistics fleet.',
    caseId: 'case-102'
  },
  {
    id: 'sig-4',
    title: 'Biometric Watchlist Airport Flag',
    time: '1h ago',
    priority: 'MEDIUM',
    location: 'Chhatrapati Shivaji Maharaj Intl (BOM)',
    confidence: '84%',
    details: 'Facial recognition camera 4B matched associate of Tariq Merchant on inbound transit from Muscat.',
    caseId: 'case-102'
  }
];

const AUTONOMOUS_SWEEPS = [
  {
    id: 'swp-1',
    badge: 'CROSS-CASE ENTITY LINK',
    targetCase: 'CASE 102 ↔ CASE 117',
    title: 'Shared Logistics Front Between Narcotics & Hawala Rings',
    desc: 'Autonomous Heuristic Sweep detected Al-Barakah Logistics FZE as common beneficial owner for maritime shipment MV Sagar Ratna and offshore wire transfer FIU-99201.',
    confidence: '96.4%',
    caseId: 'case-102'
  },
  {
    id: 'swp-2',
    badge: 'BALLISTICS STRIATION MATCH',
    targetCase: 'CASE 108 ↔ CASE 135',
    title: '9mm Glock Weapon Linkage to Syndicate Enforcer',
    desc: 'Forensic ballistics hash aa19c344...c344 matches recovered shell casings from Dock 4 execution to extortion threats issued against Kandla port contractor.',
    confidence: '98.9%',
    caseId: 'case-135'
  },
  {
    id: 'swp-3',
    badge: 'RF CIPHER BURST CORRELATION',
    targetCase: 'CASE 168 ↔ CASE 102',
    title: 'Thuraya Satellite Telemetry Synchronized to Coastal Lightering',
    desc: 'Encrypted RF bursts on 1544.15 MHz coincide within 90 seconds of AIS transponder deactivation by bulk cargo carrier off Gujarat coast.',
    confidence: '92.1%',
    caseId: 'case-102'
  }
];

export default function DashboardPage() {
  const {
    setActiveNavSection,
    setActiveCaseId,
    openWorkspace,
    workspaces,
    addNodeToCanvas
  } = useWorkspace();

  const [briefing, setBriefing] = useState(null);
  const [casesList, setCasesList] = useState(ACTIVE_CASES);
  const [sweepsList, setSweepsList] = useState(AUTONOMOUS_SWEEPS);
  const [signalsList, setSignalsList] = useState(LIVE_SIGNALS);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLiveDashboardData();
  }, []);

  const loadLiveDashboardData = async () => {
    try {
      const [briefingData, casesData, sweepData] = await Promise.all([
        api.getHomeBriefing().catch(() => null),
        api.listCases().catch(() => null),
        api.getLatestSweep().catch(() => null)
      ]);

      if (briefingData) {
        setBriefing(briefingData);
        if (briefingData.live_intelligence && briefingData.live_intelligence.length > 0) {
          setSignalsList(briefingData.live_intelligence.map(item => ({
            id: item.id,
            title: item.title,
            time: new Date(item.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            priority: (item.confidence > 0.9 ? 'CRITICAL' : (item.confidence > 0.8 ? 'HIGH' : 'MEDIUM')),
            location: item.source_name,
            confidence: `${Math.round(item.confidence * 100)}%`,
            details: item.snippet,
            caseId: item.relevant_case_ids?.[0] || 'case-102'
          })));
        }
      }

      if (briefingData && briefingData.active_cases && briefingData.active_cases.length > 0) {
        // Use live enriched cases from backend with exact counts
        setCasesList(briefingData.active_cases);
      } else if (casesData && casesData.length > 0) {
        // Merge backend data with canonical case metadata for richer display
        setCasesList(casesData.map(c => {
          const canonical = CANONICAL_CASES[c.id];
          return {
            id: c.id,
            name: canonical?.name || c.title,
            sector: canonical?.genreLabel || c.description || 'Active Investigation',
            priority: canonical?.priority || (c.status === 'active' ? 'HIGH' : (c.status || 'HIGH').toUpperCase()),
            status: (c.status || 'ACTIVE').toUpperCase(),
            lead: canonical?.leadInvestigator || (c.created_by?.startsWith('usr_') ? 'Assigned Investigator' : c.created_by || 'Directorate Lead'),
            legalBasis: canonical?.legalBasis || c.legal_basis || 'Authorized Order',
            evidenceCount: c.relationship_count || canonical?.evidenceCount || 0,
            entitiesCount: c.entity_count || canonical?.entitiesCount || 0,
            lastUpdate: canonical?.lastModified || (c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'),
            summary: canonical?.description || c.description || 'Authorized active case file.'
          };
        }));
      }

      if (sweepData && sweepData.findings && sweepData.findings.length > 0) {
        setSweepsList(sweepData.findings.map(f => ({
          id: f.id,
          badge: (f.finding_type || 'CROSS-CASE LINK').toUpperCase().replace(/_/g, ' '),
          targetCase: (f.case_ids || []).join(' ↔ ').toUpperCase() || 'MULTI-CASE NEXUS',
          title: f.title,
          desc: f.description,
          confidence: `${Math.round(f.confidence * 100)}%`,
          caseId: f.case_ids?.[0] || 'case-102'
        })));
      }
    } catch (err) {
      console.warn('Dashboard live sync note:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadLiveDashboardData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLaunchCase = (targetCaseId) => {
    if (targetCaseId) {
      setActiveCaseId(targetCaseId);
      const matchingWs = (workspaces || []).find(w => w.caseId === targetCaseId);
      if (matchingWs) {
        openWorkspace(matchingWs.id);
      } else if (workspaces && workspaces.length > 0) {
        openWorkspace(workspaces[0].id);
      }
    } else if (workspaces && workspaces.length > 0) {
      openWorkspace(workspaces[0].id);
    }
    setActiveNavSection('workspace');
  };

  const handleAttachSignalToWorkspace = (signal) => {
    addNodeToCanvas({
      id: `signal-${Date.now()}`,
      name: signal.title,
      type: 'Alert Signal',
      role: `${signal.location} Anomaly`,
      threat: signal.priority,
      provenance: 'OBSERVED_EVENT',
      details: `${signal.details} (Confidence: ${signal.confidence})`
    });
    handleLaunchCase(signal.caseId || 'case-102');
    setSelectedSignal(null);
  };

  const totalCasesCount = briefing?.active_cases_count ?? casesList.length;
  const totalArtifactsCount = briefing?.seized_artifacts ?? 79;
  const totalEntitiesCount = briefing?.total_entities ?? 122;
  const chainIntegrityText = briefing?.chain_integrity ?? '100% SEALED';

  return (
    <div className="minimal-dashboard-root">
      {/* ── TOP HEADER BAR ────────────────────────────────────── */}
      <header className="minimal-dash-header">
        <div className="dash-header-left">
          <div className="dash-title-row">
            <h1 className="dash-main-title">Intelligence Overview</h1>
            <span className="dash-status-badge">
              <span className="dash-live-dot" /> LIVE FORENSIC GRID
            </span>
          </div>
          <p className="dash-sub-title">
            Directorate of Revenue Intelligence &amp; Central Crime Bureau Operational Hub
          </p>
        </div>

        <div className="dash-header-actions">
          <button
            className={`dash-refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh Live Signals"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            className="dash-action-btn dash-action-primary"
            onClick={() => setActiveNavSection('ingestion')}
          >
            <UploadCloud size={14} />
            <span>Upload Evidence</span>
          </button>

          <button
            className="dash-action-btn dash-action-ai"
            onClick={() => setActiveNavSection('byomkesh')}
          >
            <Brain size={14} />
            <span>Byomkesh AI</span>
          </button>
        </div>
      </header>

      {/* ── NEOBRUTALISM HERO BANNER (NN/g Style) ─────────────── */}
      <section className="nb-hero-banner">
        <div className="nb-hero-content">
          <div className="nb-hero-badge font-mono">
            <span className="nb-badge-dot" />
            <span>FORENSIC KNOWLEDGE MATRIX 2026</span>
          </div>
          <h1 className="nb-hero-title">
            Emerging Forensic<br />Intelligence
          </h1>
          <p className="nb-hero-subtitle">
            Autonomous multi-vector correlation across hawala ledgers, AIS maritime transponders, encrypted telecom bursts, and corporate shells.
          </p>
          <div className="nb-hero-actions">
            <button
              className="nb-explore-pill-btn"
              onClick={() => setActiveNavSection('workspace')}
            >
              <span>EXPLORE</span>
              <ArrowRight size={15} />
            </button>
            <button
              className="nb-hero-secondary-btn"
              onClick={() => setActiveNavSection('byomkesh')}
            >
              <Brain size={14} />
              <span>Byomkesh NIM</span>
            </button>
          </div>
        </div>

        {/* Retro Window Illustration from NN/g Reference */}
        <div className="nb-hero-visual">
          <div className="nb-retro-window">
            <div className="nb-window-titlebar">
              <span className="nb-win-dot" />
              <span className="nb-win-dot" />
              <span className="nb-win-dot" />
            </div>
            <div className="nb-window-body">
              <div className="nb-retro-search-capsule">
                <Search size={15} className="nb-search-ico" />
                <span className="nb-search-placeholder">MV Sagar Ratna · FIU-9921 · Tariq Merchant</span>
                <span className="nb-search-cursor">|</span>
              </div>
            </div>
          </div>

          <div className="nb-retro-mini-window">
            <div className="nb-mini-titlebar">
              <span>SHA-256 HASH</span>
              <span className="nb-mini-close">×</span>
            </div>
            <div className="nb-mini-body font-mono">
              * * * SHA256: 88f29cb1 * * *
            </div>
          </div>

          {/* Retro Geometric Accents */}
          <div className="nb-geo-dots-matrix" />
          <svg className="nb-geo-polygon" viewBox="0 0 80 60" fill="none">
            <polygon points="10,10 70,15 55,50 20,45" stroke="#000000" strokeWidth="2.5" fill="none" />
            <circle cx="10" cy="10" r="3" fill="#ff2a85" stroke="#000000" strokeWidth="1.5" />
            <circle cx="70" cy="15" r="3" fill="#ff2a85" stroke="#000000" strokeWidth="1.5" />
            <circle cx="55" cy="50" r="3" fill="#ff2a85" stroke="#000000" strokeWidth="1.5" />
            <circle cx="20" cy="45" r="3" fill="#ff2a85" stroke="#000000" strokeWidth="1.5" />
          </svg>
          <div className="nb-geo-cursor-pointer" />
        </div>
      </section>

      {/* ── METRICS STRIP (Live Database-Backed Metrics) ──────────── */}
      <div className="minimal-metrics-strip">
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">ACTIVE INVESTIGATIONS</span>
            <ShieldCheck size={14} className="metric-box-icon text-emerald" />
          </div>
          <div className="metric-box-value">{totalCasesCount} Active Cases</div>
          <div className="metric-box-hint">Western Seaboard &amp; Financial Corridors</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">SEIZED EVIDENCE ARTIFACTS</span>
            <FileText size={14} className="metric-box-icon text-blue" />
          </div>
          <div className="metric-box-value">{totalArtifactsCount} Artifacts</div>
          <div className="metric-box-hint">100% SHA-256 Cryptographically Sealed</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">CANONICAL ENTITIES</span>
            <Users size={14} className="metric-box-icon text-purple" />
          </div>
          <div className="metric-box-value">{totalEntitiesCount} Resolved</div>
          <div className="metric-box-hint">Persons, Vessels, Front Orgs, Bank Nodes</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">HMAC AUDIT INTEGRITY</span>
            <Sparkles size={14} className="metric-box-icon text-green" />
          </div>
          <div className="metric-box-value">{chainIntegrityText}</div>
          <div className="metric-box-hint">{sweepsList.length} Active Cross-Case Correlations</div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN CONTENT AREA ──────────────────────── */}
      <div className="minimal-dash-grid">
        
        {/* LEFT COLUMN: ACTIVE CASES + 12H SWEEPS ───────────── */}
        <div className="dash-col-primary">
          
          {/* Active Workspace Command Boards Section - 3 Neobrutalist Folder Cards */}
          <section className="dash-card-section workspaces-overview-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <Layers size={16} className="text-cyan" />
                <h2 className="section-title">Investigation Workspaces</h2>
                <span className="section-count-pill font-mono">{workspaces.length} Boards</span>
              </div>
              <button
                className="section-link-btn"
                onClick={() => setActiveNavSection('workspace')}
              >
                <span>Open Workspace Hub</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* 3-Folder Cards Layout Directly Matching the NN/g Reference Image */}
            <div className="nb-folder-grid">
              {workspaces.slice(0, 3).map((ws, idx) => (
                <div
                  key={ws.id}
                  className={`nb-folder-card nb-card-theme-${idx % 3}`}
                  onClick={() => {
                    openWorkspace(ws.id);
                    setActiveNavSection('workspace');
                  }}
                >
                  {/* Top Colored Folder Container */}
                  <div className="nb-folder-card-top">
                    <button
                      className="nb-folder-plus-btn"
                      title="Add entity / quick launch"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWorkspace(ws.id);
                        setActiveNavSection('workspace');
                      }}
                    >
                      <Plus size={13} />
                    </button>

                    {/* Clean Neobrutal Folder Illustration */}
                    <div className="nb-folder-icon-wrap">
                      <svg className="nb-folder-svg" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 20C10 15.58 13.58 12 18 12H38L48 24H82C86.42 24 90 27.58 90 32V68C90 72.42 86.42 76 82 76H18C13.58 76 10 72.42 10 68V20Z" fill="#000000" />
                        <path d="M14 28H86C88.2 28 90 29.8 90 32V68C90 72.42 86.42 76 82 76H18C13.58 76 10 72.42 10 68V32C10 29.8 11.8 28 14 28Z" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                        <line x1="24" y1="44" x2="62" y2="44" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                        <line x1="24" y1="56" x2="74" y2="56" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>

                    <span className="nb-folder-sector-tag font-mono">
                      {(ws.genre || 'INVESTIGATION').toUpperCase()}
                    </span>
                  </div>

                  {/* Bottom Crisp White Card Body */}
                  <div className="nb-folder-card-bottom">
                    <div className="nb-folder-card-title-row">
                      <h3 className="nb-folder-card-title">{ws.name}</h3>
                      <span className="nb-case-pill font-mono">{ws.caseName || 'Workspace'}</span>
                    </div>

                    <p className="nb-folder-card-desc">{ws.description}</p>

                    <div className="nb-folder-card-meta font-mono">
                      <span>{ws.nodesCount || ws.nodes?.length || 0} Entities</span>
                      <span className="nb-meta-dot">·</span>
                      <span>{ws.edgesCount || ws.edges?.length || 0} Ropes</span>
                      <span className="nb-meta-dot">·</span>
                      <span>{ws.lastModified || 'Recent'}</span>
                    </div>

                    <div className="nb-folder-card-footer">
                      <button
                        className="nb-folder-launch-btn font-mono"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkspace(ws.id);
                          setActiveNavSection('workspace');
                        }}
                      >
                        <Play size={11} fill="currentColor" />
                        <span>Launch Board</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Autonomous 12-Hour Sweeps Section */}
          <section className="dash-card-section sweeps-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <Sparkles size={16} className="text-green" />
                <h2 className="section-title">Autonomous 12H Sweeps &amp; Discoveries</h2>
              </div>
              <button
                className="section-link-btn"
                onClick={() => setActiveNavSection('sweeps')}
              >
                <span>View Full Sweep Ledger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="sweeps-list-grid">
              {sweepsList.map(sw => (
                <div key={sw.id} className="sweep-item-card">
                  <div className="sweep-top-meta">
                    <span className="sweep-badge font-mono">{sw.badge}</span>
                    <span className="sweep-target-case font-mono">{sw.targetCase}</span>
                    <span className="sweep-conf-tag font-mono">{sw.confidence}</span>
                  </div>
                  <h4 className="sweep-title">{sw.title}</h4>
                  <p className="sweep-desc">{sw.desc}</p>
                  <div className="sweep-card-footer">
                    <button
                      className="sweep-explore-btn"
                      onClick={() => handleLaunchCase(sw.caseId)}
                    >
                      <span>Investigate Link in Workspace</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: LIVE FORENSIC SIGNALS ──────────────── */}
        <div className="dash-col-secondary">
          {/* Aesthetic 3D Rotating Tactical Globe Widget */}
          <TacticalGlobe onSelectHub={(hub) => handleLaunchCase(hub.caseId)} />
          
          <section className="dash-card-section signals-feed-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <Activity size={15} className="text-blue" />
                <h2 className="section-title">Live Intelligence Signals</h2>
              </div>
              <button
                className="section-link-btn"
                onClick={() => setActiveNavSection('intel')}
              >
                <span>Live Feed</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="signals-feed-stack">
              {signalsList.map(sig => (
                <div
                  key={sig.id}
                  className={`signal-card-item ${selectedSignal?.id === sig.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedSignal(sig)}
                >
                  <div className="sig-card-header">
                    <span className={`sig-urgency-dot dot-${sig.priority.toLowerCase()}`} />
                    <span className="sig-title-text">{sig.title}</span>
                    <span className="sig-time-text">{sig.time}</span>
                  </div>

                  <div className="sig-location-row">
                    <MapPin size={11} className="sig-loc-icon" />
                    <span>{sig.location}</span>
                  </div>

                  <p className="sig-details-text">{sig.details}</p>

                  <div className="sig-card-bottom">
                    <span className="sig-conf-pill font-mono">CONF: {sig.confidence}</span>
                    <button
                      className="sig-attach-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttachSignalToWorkspace(sig);
                      }}
                    >
                      <span>Attach to Board</span>
                      <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Bureau Tools Card */}
          <div className="dash-tools-card">
            <h3 className="tools-card-title">Investigative Workflows</h3>
            <div className="tools-btn-list">
              <button
                className="tool-shortcut-btn"
                onClick={() => setActiveNavSection('ingestion')}
              >
                <div className="tool-shortcut-left">
                  <UploadCloud size={15} />
                  <div>
                    <div className="tool-shortcut-name">Evidence Ingestion</div>
                    <div className="tool-shortcut-sub">Upload folders, files &amp; organize</div>
                  </div>
                </div>
                <ArrowRight size={13} />
              </button>

              <button
                className="tool-shortcut-btn"
                onClick={() => setActiveNavSection('byomkesh')}
              >
                <div className="tool-shortcut-left">
                  <Brain size={15} />
                  <div>
                    <div className="tool-shortcut-name">Byomkesh AI Co-Pilot</div>
                    <div className="tool-shortcut-sub">Synthesize graph evidence &amp; answers</div>
                  </div>
                </div>
                <ArrowRight size={13} />
              </button>

              <button
                className="tool-shortcut-btn"
                onClick={() => setActiveNavSection('audit')}
              >
                <div className="tool-shortcut-left">
                  <Database size={15} />
                  <div>
                    <div className="tool-shortcut-name">Provenance Ledger</div>
                    <div className="tool-shortcut-sub">Inspect cryptographic audit chain</div>
                  </div>
                </div>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="signal-modal-backdrop" onClick={() => setSelectedSignal(null)}>
          <div className="signal-modal-content" onClick={e => e.stopPropagation()}>
            <div className="signal-modal-header">
              <div className="signal-modal-title-row">
                <span className={`sig-urgency-dot dot-${selectedSignal.priority.toLowerCase()}`} />
                <h3 className="signal-modal-title">{selectedSignal.title}</h3>
              </div>
              <button className="signal-modal-close" onClick={() => setSelectedSignal(null)}>✕</button>
            </div>

            <div className="signal-modal-body">
              <div className="sig-meta-grid">
                <div>
                  <span className="sig-label">LOCATION</span>
                  <p className="sig-val">{selectedSignal.location}</p>
                </div>
                <div>
                  <span className="sig-label">TIMESTAMP</span>
                  <p className="sig-val">{selectedSignal.time}</p>
                </div>
                <div>
                  <span className="sig-label">CONFIDENCE</span>
                  <p className="sig-val font-mono">{selectedSignal.confidence}</p>
                </div>
                <div>
                  <span className="sig-label">TARGET CASE</span>
                  <p className="sig-val font-mono">{selectedSignal.caseId}</p>
                </div>
              </div>

              <div className="sig-details-block">
                <span className="sig-label">DETAILED INTELLIGENCE REPORT</span>
                <p className="sig-text">{selectedSignal.details}</p>
              </div>
            </div>

            <div className="signal-modal-footer">
              <button
                className="dash-action-btn"
                onClick={() => setSelectedSignal(null)}
              >
                Dismiss
              </button>
              <button
                className="dash-action-btn dash-action-primary"
                onClick={() => handleAttachSignalToWorkspace(selectedSignal)}
              >
                Add Node to Workspace Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
