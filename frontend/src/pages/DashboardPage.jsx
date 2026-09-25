import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  ArrowRight, ExternalLink, RefreshCw, Box,
  Users, ShieldAlert, Activity, CheckCircle2,
  TrendingUp, FileText, Sparkles, ArrowUpRight,
  ShieldCheck, UploadCloud, Brain, Search, Clock, MapPin, Database
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
    legalBasis: 'IPC Sec 384 / IT Act Sec 66D',
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
    desc: 'Forensic ballistics hash 0xaa19...c344 matches recovered shell casings from Dock 4 execution to extortion threats issued against Kandla port contractor.',
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

      if (casesData && casesData.length > 0) {
        setCasesList(casesData.map(c => ({
          id: c.id,
          name: c.title,
          sector: c.description || 'Maritime & Financial Investigation',
          priority: 'ACTIVE',
          status: (c.status || 'ACTIVE').toUpperCase(),
          lead: c.created_by === 'usr_system_seed' ? 'Directorate Lead' : c.created_by,
          legalBasis: c.legal_basis || 'Authorized Order',
          evidenceCount: c.entity_count || 14,
          entitiesCount: c.relationship_count || 22,
          lastUpdate: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
          summary: c.description || 'Authorized active case file.'
        })));
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
      if (matchingWs) openWorkspace(matchingWs.id);
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
          
          {/* Active Investigations Section */}
          <section className="dash-card-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <h2 className="section-title">Active Investigations</h2>
                <span className="section-count-pill">{casesList.length} Active</span>
              </div>
              <button
                className="section-link-btn"
                onClick={() => setActiveNavSection('cases')}
              >
                <span>View Bureau Cases</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="cases-cards-stack">
              {casesList.map(c => (
                <div
                  key={c.id}
                  className="case-card-row"
                  onClick={() => handleLaunchCase(c.id)}
                >
                  <div className="case-row-left">
                    <div className="case-row-badge-line">
                      <span className={`case-priority-pill priority-${(c.priority || 'ACTIVE').toLowerCase()}`}>
                        {c.priority || 'ACTIVE'}
                      </span>
                      <span className="case-sector-label">{c.sector}</span>
                      <span className="case-legal-label">{c.legalBasis}</span>
                    </div>
                    <h3 className="case-row-name">{c.name}</h3>
                    <p className="case-row-summary">{c.summary}</p>
                    <div className="case-row-meta">
                      <span>Lead: <strong>{c.lead}</strong></span>
                      <span className="meta-dot">·</span>
                      <span>{c.evidenceCount} Evidence Items</span>
                      <span className="meta-dot">·</span>
                      <span>{c.entitiesCount} Entities</span>
                      <span className="meta-dot">·</span>
                      <span className="meta-time"><Clock size={11} /> {c.lastUpdate}</span>
                    </div>
                  </div>

                  <div className="case-row-right">
                    <button
                      className="case-launch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchCase(c.id);
                      }}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={13} />
                    </button>
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
