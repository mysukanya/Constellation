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

  return (
    <div className="investigation-workspace-root">
      {/* ── MINIMAL MATTE-BLACK WORKSPACE COMMAND BAR ───────────────── */}
      <header className="workspace-top-bar">
        {/* Left: Hub Navigation & Active Case Title */}
        <div className="topbar-left-cluster">
          <button
            className="topbar-back-btn"
            onClick={closeWorkspace}
            title="Return to Workspaces Overview"
          >
            <ArrowLeft size={13} />
            <span>Hub</span>
          </button>

          <span className="topbar-breadcrumb-slash">/</span>

          <span className="case-name-text" title={activeWorkspace?.name || activeCase.name}>
            {activeWorkspace?.name || activeCase.name}
          </span>
        </div>

        {/* Center: Minimal Filter Segment & Node Tools */}
        <div className="topbar-center-cluster">
          <div className="canvas-filter-pills">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PERSON', label: 'People' },
              { id: 'ORGANIZATION', label: 'Orgs' },
              { id: 'FINANCIAL', label: 'Financial' }
            ].map(f => (
              <button
                key={f.id}
                className={`filter-pill ${canvasFilterType === f.id ? 'active' : ''}`}
                onClick={() => setCanvasFilterType(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="topbar-divider" />

          <button
            className="topbar-action-btn"
            onClick={() => quickSpawnNode('Person')}
            title="Add Person or Node to Canvas"
          >
            <Plus size={12} />
            <span>Entity</span>
          </button>

          <button
            className={`topbar-action-btn ${showConnectBar ? 'active' : ''}`}
            onClick={() => setShowConnectBar(prev => !prev)}
            title="Toggle Connection Rope Builder"
          >
            <Link2 size={12} />
            <span>Link</span>
          </button>
        </div>

        {/* Right: Board Counts, Side Dock Toggles & Health Dot */}
        <div className="topbar-right-cluster">
          <span className="topbar-counts font-mono">
            {canvasNodes.length} nodes · {canvasEdges.length} links
          </span>

          <div className="topbar-divider" />

          <button
            className={`topbar-icon-dock ${dataUploaderOpen ? 'active' : ''}`}
            onClick={() => setDataUploaderOpen(prev => !prev)}
            title="Case Files & Entity Data Drawer"
          >
            <Sidebar size={14} />
          </button>

          <button
            className={`topbar-icon-dock ${crossCaseOpen ? 'active' : ''}`}
            onClick={() => setCrossCaseOpen(prev => !prev)}
            title="Cross-Case Nexus Importer"
          >
            <Database size={14} />
          </button>

          <button
            className={`topbar-icon-dock btn-dock-byomkesh ${byomkeshOpen ? 'active' : ''}`}
            onClick={() => setByomkeshOpen(prev => !prev)}
            title="Byomkesh AI Forensic Co-Pilot"
          >
            <Brain size={14} />
          </button>

          <span
            className={`backend-pulse-dot ${backendStatus === 'live' ? 'live' : 'offline'}`}
            title={`Backend: ${backendStatus.toUpperCase()}`}
          />
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
