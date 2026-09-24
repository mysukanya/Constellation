import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  ArrowRight, ExternalLink, RefreshCw, Box,
  Users, CreditCard, Globe as GlobeIcon, Cpu,
  ShieldAlert, Activity, CheckCircle, X, MapPin,
  TrendingUp, Compass, FileText, AlertCircle, Sparkles,
  Zap, ArrowUpRight, ShieldCheck, Check
} from 'lucide-react';
import Panel3D from '../components/Panel3D';
import Globe3D from '../components/Globe3D';
import api from '../services/api';
import './DashboardPage.css';
export default function DashboardPage() {
  const {
    setActiveNavSection,
    setActiveCaseId,
    openWorkspace,
    workspaces,
    addNodeToCanvas
  } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    loadBriefing();
  }, []);

  const loadBriefing = async () => {
    try {
      const data = await api.getHomeBriefing();
      setBriefing(data);
    } catch (err) {
      console.error("Failed to load briefing", err);
    } finally {
      setLoading(false);
    }
  };

  const activeInvestigations = briefing?.continue_cases || [];
  const sweepDiscoveries = briefing?.sweep_status?.findings || [];
  const liveIntel = briefing?.live_intelligence || [];
  const heroDiscovery = briefing?.hero_discovery;

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [showRegionSelect, setShowRegionSelect] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Trigger processing animation
  const handleRefreshAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1800);
  };

  const handleLaunchCase = (targetCaseId) => {
    if (targetCaseId) {
      setActiveCaseId(targetCaseId);
      const matchingWs = (workspaces || []).find(w => w.caseId === targetCaseId);
      if (matchingWs) openWorkspace(matchingWs.id);
    }
    setActiveNavSection('workspace');
  };

  const handleAttachAlertToWorkspace = (alert) => {
    addNodeToCanvas({
      id: `alert-${Date.now()}`,
      name: alert.title,
      type: 'Alert Signal',
      role: `${alert.location} Anomaly`,
      threat: alert.priority === 'Critical' ? 'CRITICAL' : 'HIGH',
      provenance: 'OBSERVED_EVENT',
      details: `${alert.details} (Confidence: ${alert.confidence})`
    });
    handleLaunchCase(alert.caseId || 'case-102');
    setSelectedAlert(null);
  };

  return (
    <div className="grid-dashboard-root">
      {/* ── MAIN TWO-COLUMN DASHBOARD GRID ───────────────── */}
      <div className="dashboard-grid-layout">
        
        {/* ══ LEFT 2/3 COLUMN: HERO + BOTTOM PANELS ════════ */}
        <div className="left-intelligence-column">
          
          {/* 1. HERO PANEL: GLOBAL INTELLIGENCE GRID */}
          <Panel3D className="hero-grid-panel" maxAngle={3} glow="green">
            <div className="hero-content-split">
              {/* Left Side: Headline, Subtitle, CTA, Stats */}
              <div className="hero-text-block">
                <div className="hero-grid-badge">
                  <span className="status-dot dot-green pulse-indicator" />
                  <span>GLOBAL INTELLIGENCE GRID</span>
                </div>

                <h1 className="hero-main-heading">
                  Connect<br />
                  <span className="accent-gradient-text">the dots.</span>
                </h1>

                <p className="hero-description-text">
                  AI-powered intelligence to uncover organized crime networks across the globe.
                </p>

                <button
                  className="hero-explore-btn"
                  onClick={() => setActiveNavSection('workspace')}
                >
                  <span>Explore Network</span>
                  <ArrowRight size={16} />
                </button>

                {/* Key Jurisdictions & Entities Metrics */}
                <div className="hero-metrics-row">
                  <div className="metric-stat-item">
                    <span className="stat-value">32</span>
                    <span className="stat-label">Jurisdictions Monitored</span>
                  </div>
                  <div className="metric-stat-item">
                    <span className="stat-value">1.2M+</span>
                    <span className="stat-label">Entities Analyzed</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive 3D Canvas Globe */}
              <div className="hero-globe-wrapper">
                <Globe3D />
              </div>
            </div>
          </Panel3D>

          {/* 2. BOTTOM ROW: NETWORK OVERVIEW & AI ANALYSIS */}
          <div className="bottom-intelligence-row">
            
            {/* Panel A: Network Overview */}
            <Panel3D className="network-overview-panel" maxAngle={4} glow="green">
              <div className="panel-header-row">
                <h3 className="panel-title">Network Overview</h3>
                <div className="header-controls-group">
                  <div className="dropdown-pill-wrapper">
                    <button
                      className="region-pill-dropdown"
                      onClick={() => setShowRegionSelect(!showRegionSelect)}
                    >
                      <span>{selectedRegion}</span>
                      <span className="dropdown-arrow">▾</span>
                    </button>
                    {showRegionSelect && (
                      <div className="dropdown-pill-menu">
                        {['India', 'Southeast Asia', 'Middle East', 'Global Grid'].map(r => (
                          <div
                            key={r}
                            className="dropdown-menu-item"
                            onClick={() => {
                              setSelectedRegion(r);
                              setShowRegionSelect(false);
                            }}
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="panel-action-btn"
                    onClick={() => setActiveNavSection('workspace')}
                    title="Open Full Network Workspace"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards in a Row */}
              <div className="overview-stats-grid">
                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <Box size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">1,842</div>
                  <div className="stat-card-type">Organizations</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>12%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">5,671</div>
                  <div className="stat-card-type">Individuals</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>8%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <CreditCard size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">12,309</div>
                  <div className="stat-card-type">Financial Links</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>24%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <GlobeIcon size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">47</div>
                  <div className="stat-card-type">Active Regions</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>6%</span>
                  </div>
                </div>
              </div>
            </Panel3D>

            {/* Panel B: AI Analysis */}
            <Panel3D className="ai-analysis-panel" maxAngle={4} glow="green">
              <div className="panel-header-row">
                <h3 className="panel-title">AI Analysis</h3>
                <div className="header-controls-group">
                  <button
                    className={`ai-processing-pill ${isProcessing ? 'is-spinning' : ''}`}
                    onClick={handleRefreshAnalysis}
                    title="Refresh AI Analysis Models"
                  >
                    <RefreshCw size={12} className="spin-icon" />
                    <span>{isProcessing ? 'Analyzing...' : 'Processing'}</span>
                  </button>
                  <button
                    className="panel-action-btn"
                    onClick={() => setActiveNavSection('sweeps')}
                    title="Open Byomkesh AI Sweeps"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Sleek Glowing Progress Bars */}
              <div className="ai-progress-list">
                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Cpu size={15} className="progress-icon" />
                      <span>Pattern Recognition</span>
                    </div>
                    <span className="progress-value-pct">87%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '87%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Compass size={15} className="progress-icon" />
                      <span>Entity Resolution</span>
                    </div>
                    <span className="progress-value-pct">72%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <ShieldAlert size={15} className="progress-icon" />
                      <span>Risk Scoring</span>
                    </div>
                    <span className="progress-value-pct">91%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '91%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Activity size={15} className="progress-icon" />
                      <span>Network Mapping</span>
                    </div>
                    <span className="progress-value-pct">68%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>
            </Panel3D>

          </div>
        </div>

        {/* ══ RIGHT 1/3 COLUMN: LIVE ALERTS & INVESTIGATIONS ═ */}
        <div className="right-feed-column">
          
          {/* Panel 1: Live Alerts */}
          <Panel3D className="live-alerts-panel" maxAngle={4} glow="green">
            <div className="panel-header-row">
              <h3 className="panel-title">Live Alerts</h3>
              <button
                className="panel-action-btn view-all-link"
                onClick={() => setActiveNavSection('intel')}
                title="View All Intelligence Feeds"
              >
                <span>View all</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="alerts-feed-list">
              {INITIAL_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className="alert-feed-item"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="alert-item-header">
                    <span className={`status-dot dot-${alert.type} pulse-indicator`} />
                    <span className="alert-title-text">{alert.title}</span>
                    <span className="alert-time-stamp">{alert.time}</span>
                  </div>
                  <div className="alert-item-location">
                    <span>{alert.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel3D>

          {/* Panel 2: Active Investigations */}
          <Panel3D className="active-investigations-panel" maxAngle={4} glow="green">
            <div className="panel-header-row">
              <h3 className="panel-title">Active Investigations</h3>
              <button
                className="panel-action-btn view-all-link"
                onClick={() => setActiveNavSection('workspace')}
                title="View All Workspaces"
              >
                <span>View all</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="investigations-list">
              {ACTIVE_INVESTIGATIONS.map(inv => (
                <div
                  key={inv.id}
                  className="investigation-item-card"
                  onClick={() => handleLaunchCase(inv.targetCaseId)}
                >
                  <div
                    className="inv-icon-box"
                    style={{ background: inv.iconBg, color: inv.iconColor }}
                  >
                    <FileText size={18} />
                  </div>
                  <div className="inv-details">
                    <span className="inv-title">{inv.title}</span>
                    <span className="inv-subtitle">{inv.subtitle}</span>
                  </div>
                  <div className="inv-badge-wrapper">
                    <span className={`badge-pill ${inv.severityClass}`}>
                      {inv.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Status Pill */}
            <div className="powered-badge-container">
              <div className="powered-pill font-mono">
                <span className="powered-sparkle">✦</span>
                <span>CONSTELLATION · GLOBAL GRID OPERATIONAL</span>
              </div>
            </div>
          </Panel3D>

        </div>
      </div>

      {/* ── 3. BELOW GRID: BYOMKESH 12H SWEEP DISCOVERIES & FINDINGS ── */}
      <div className="dashboard-sweep-section">
        <Panel3D className="sweep-discoveries-panel" maxAngle={2} glow="green">
          <div className="sweep-header-row">
            <div className="sweep-header-left">
              <div className="sweep-tag font-mono">
                <Sparkles size={13} className="text-green" />
                <span>BYOMKESH 12-HOUR AUTONOMOUS SWEEPS</span>
              </div>
              <h3 className="sweep-heading">Cross-Case Pattern Discoveries &amp; Evidentiary Findings</h3>
              <p className="sweep-sub">
                Autonomous heuristic engine runs continuous scans across all seized phone logs, customs BOLs, and SWIFT transactions.
              </p>
            </div>
            <button
              className="btn btn-primary font-mono btn-sweep-deep"
              onClick={() => setActiveNavSection('sweeps')}
            >
              <span>Explore 12H Sweeps</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="sweep-cards-grid">
            {SWEEP_DISCOVERIES.map(disc => (
              <div key={disc.id} className="sweep-card-item">
                <div className="sweep-card-top">
                  <span className="sweep-card-badge font-mono">{disc.badge}</span>
                  <span className="sweep-card-tag font-mono">{disc.targetCase}</span>
                </div>
                <h4 className="sweep-card-title">{disc.title}</h4>
                <p className="sweep-card-desc">{disc.desc}</p>
                <div className="sweep-card-footer">
                  <span className="sweep-metric font-mono">{disc.confidence}</span>
                  <button
                    className="sweep-launch-btn font-mono"
                    onClick={() => handleLaunchCase(disc.caseId)}
                  >
                    Workspace →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel3D>
      </div>

      {/* ── ALERT DETAIL MODAL ─────────────────────────── */}
      {selectedAlert && (
        <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="alert-inspect-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title-lockup">
                <span className={`status-dot dot-${selectedAlert.type}`} />
                <h3>{selectedAlert.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedAlert(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="modal-meta-grid font-mono">
                <div className="meta-cell">
                  <span className="cell-label">Location</span>
                  <span className="cell-val">
                    <MapPin size={13} /> {selectedAlert.location}
                  </span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Timestamp</span>
                  <span className="cell-val">{selectedAlert.time}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Confidence</span>
                  <span className="cell-val text-green">{selectedAlert.confidence}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Priority</span>
                  <span className={`cell-val priority-${selectedAlert.priority.toLowerCase()}`}>
                    {selectedAlert.priority}
                  </span>
                </div>
              </div>

              <div className="modal-intel-summary">
                <h4>Intelligence Brief</h4>
                <p>{selectedAlert.details}</p>
              </div>

              <div className="modal-action-buttons font-mono">
                <button
                  className="btn-action-primary"
                  onClick={() => handleAttachAlertToWorkspace(selectedAlert)}
                >
                  <span>Attach to Investigation Canvas</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  className="btn-action-secondary"
                  onClick={() => {
                    setSelectedAlert(null);
                    setActiveNavSection('sweeps');
                  }}
                >
                  <span>Query Byomkesh AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
