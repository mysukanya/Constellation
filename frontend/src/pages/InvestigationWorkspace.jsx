import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import WorkspaceOverviewHub from '../components/workspace/WorkspaceOverviewHub';
import CaseFileAdder from '../components/workspace/CaseFileAdder';
import InvestigationCanvas from '../components/workspace/InvestigationCanvas';
import CrossCaseImporter from '../components/workspace/CrossCaseImporter';
import ByomkeshPanel from '../components/desktop/ByomkeshPanel';
import Panel3D from '../components/Panel3D';
import {
  Layers, ArrowLeft, Plus, Database, Sidebar,
  Activity, CheckCircle2, Shield, RefreshCw, X, Brain, Sparkles, Link2
} from 'lucide-react';
import api from '../services/api';
import './InvestigationWorkspace.css';

export default function InvestigationWorkspace() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    closeWorkspace,
    activeCase,
    canvasNodes,
    canvasEdges,
    canvasFilterType,
    setCanvasFilterType,
    showConnectBar,
    setShowConnectBar,
    quickSpawnNode,
    byomkeshOpen,
    setByomkeshOpen,
    dataUploaderOpen,
    setDataUploaderOpen,
    crossCaseOpen,
    setCrossCaseOpen
  } = useWorkspace();

  const [backendStatus, setBackendStatus] = useState('healthy');

  // Verify backend health
  useEffect(() => {
    api.healthCheck()
      .then(data => {
        if (data.status === 'healthy') {
          setBackendStatus('live');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  // If no workspace is open, show the clean Workspaces Hub
  if (!activeWorkspaceId) {
    return <WorkspaceOverviewHub />;
  }

  const caseIdDisplay = activeCase.id.toUpperCase();
  const caseTitleDisplay = activeCase.name.includes('—') 
    ? activeCase.name.split('—')[1].trim() 
    : activeCase.name;

  return (
    <div className="investigation-workspace-root">
      {/* ── UNIFIED HIGH-END MATTE-BLACK COMMAND BAR ───────────────── */}
      <header className="workspace-top-bar">
        {/* Left: Hub Navigation & Synchronized Case Breadcrumb */}
        <div className="topbar-left-cluster">
          <button
            className="topbar-back-btn"
            onClick={closeWorkspace}
            title="Return to Workspaces Overview"
          >
            <ArrowLeft size={13} />
            <span>Workspaces</span>
          </button>

          <span className="topbar-breadcrumb-slash">/</span>

          <div className="case-title-cluster">
            <span className="case-name-text" title={activeWorkspace?.name || activeCase.name}>
              {activeWorkspace?.name || 'Active Investigation'}
            </span>
            <span className="case-badge-pill font-mono" title={`Linked to ${activeCase.name}`}>
              {caseIdDisplay}: {caseTitleDisplay}
            </span>
            <span className={`case-priority-badge font-mono priority-${(activeCase.priority || 'ACTIVE').toLowerCase()}`}>
              {activeCase.priority || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Center: Canvas Filter Chips & Node Operations */}
        <div className="topbar-center-cluster">
          {/* Filter Pills */}
          <div className="canvas-filter-pills">
            {['ALL', 'PERSON', 'ORGANIZATION', 'VEHICLE', 'FINANCIAL'].map(type => (
              <button
                key={type}
                className={`filter-pill ${canvasFilterType === type ? 'active' : ''}`}
                onClick={() => setCanvasFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="topbar-divider" />

          {/* Quick Spawn Buttons */}
          <div className="topbar-spawn-group">
            <button className="topbar-spawn-btn" onClick={() => quickSpawnNode('Person')} title="Add Person entity to canvas">
              <Plus size={11} /> Person
            </button>
            <button className="topbar-spawn-btn" onClick={() => quickSpawnNode('Organization')} title="Add Organization entity">
              <Plus size={11} /> Org
            </button>
            <button className="topbar-spawn-btn" onClick={() => quickSpawnNode('Vehicle')} title="Add Vessel/Vehicle entity">
              <Plus size={11} /> Vessel
            </button>
            <button className="topbar-spawn-btn" onClick={() => quickSpawnNode('Financial')} title="Add Hawala entity">
              <Plus size={11} /> Hawala
            </button>
          </div>

          <button
            className={`topbar-connect-btn ${showConnectBar ? 'active' : ''}`}
            onClick={() => setShowConnectBar(prev => !prev)}
            title="Toggle Connection Rope Builder"
          >
            <Link2 size={12} />
            <span>Connect</span>
          </button>
        </div>

        {/* Right: Board Metrics, Side Docks & Live Indicator */}
        <div className="topbar-right-cluster">
          {/* Counters */}
          <div className="topbar-board-metrics font-mono">
            <span className="metric-pill nodes-count">{canvasNodes.length} NODES</span>
            <span className="metric-pill ropes-count">{canvasEdges.length} ROPES</span>
          </div>

          <div className="topbar-divider" />

          {/* Side Drawer Toggles */}
          <button
            className={`topbar-toggle-btn ${dataUploaderOpen ? 'active' : ''}`}
            onClick={() => setDataUploaderOpen(prev => !prev)}
            title="Toggle Case File & Entity Data Drawer"
          >
            <Sidebar size={13} />
            <span>Case Files</span>
          </button>

          <button
            className={`topbar-toggle-btn ${crossCaseOpen ? 'active' : ''}`}
            onClick={() => setCrossCaseOpen(prev => !prev)}
            title="Toggle Cross-Case Nexus Importer"
          >
            <Database size={13} />
            <span>Cross-Case</span>
          </button>

          <button
            className={`topbar-toggle-btn btn-byomkesh ${byomkeshOpen ? 'active' : ''}`}
            onClick={() => setByomkeshOpen(prev => !prev)}
            title="Toggle Byomkesh AI Co-Pilot"
          >
            <Brain size={13} />
            <span>Byomkesh AI</span>
            <span className="byomkesh-pulse-sparkle">✦</span>
          </button>

          <div className="topbar-divider" />

          {/* Backend Connection Indicator */}
          <div className="backend-status-pill">
            <span className={`backend-pulse-dot ${backendStatus === 'live' ? 'live' : 'offline'}`} />
            <span className="backend-status-text font-mono">
              {backendStatus === 'live' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Stage ──────────────────────────────────── */}
      <div className="workspace-main-stage">
        {/* Left: Case File & Data Uploader */}
        {dataUploaderOpen && (
          <CaseFileAdder onClose={() => setDataUploaderOpen(false)} />
        )}

        {/* Center: Full-Scale Investigation Canvas */}
        <main className="workspace-canvas-stage">
          <InvestigationCanvas />
        </main>

        {/* Right: Collapsible Cross-Case Importer */}
        {crossCaseOpen && (
          <aside className="workspace-importer-dock">
            <CrossCaseImporter onClose={() => setCrossCaseOpen(false)} />
          </aside>
        )}

        {/* Far Right: Byomkesh AI Reasoning Engine Dock */}
        {byomkeshOpen && (
          <aside className="workspace-byomkesh-dock">
            <Panel3D glow="green" maxAngle={2} className="byomkesh-dock-panel">
              <ByomkeshPanel onClose={() => setByomkeshOpen(false)} />
            </Panel3D>
          </aside>
        )}
      </div>
    </div>
  );
}
