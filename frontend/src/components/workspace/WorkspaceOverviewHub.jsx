import { useState } from 'react';
import { useWorkspace, CANONICAL_CASES } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import {
  FolderPlus, Layers, Play, Clock, Shield, Search,
  Trash2, Plus, ArrowRight, CheckCircle2, ChevronRight,
  Briefcase, Activity, AlertTriangle, X, MapPin, Compass,
  RotateCcw, Filter, Anchor, Sparkles
} from 'lucide-react';
import './WorkspaceOverviewHub.css';

const SECTOR_PILLS = [
  { id: 'ALL', label: 'All Sectors' },
  { id: 'narcotics', label: 'Maritime Narcotics (Case 102)', caseId: 'case-102' },
  { id: 'corporate_fraud', label: 'Corporate Fraud & AML (Case 117)', caseId: 'case-117' },
  { id: 'homicide', label: 'Contract Hit Syndicate (Case 108)', caseId: 'case-108' },
  { id: 'theft', label: 'Diamond Vault Breach (Case 121)', caseId: 'case-121' },
  { id: 'trafficking', label: 'Human Trafficking (Case 143)', caseId: 'case-143' },
  { id: 'cyber', label: 'Cyber Infiltration (Case 168)', caseId: 'case-168' }
];

const HUB_PILLS = [
  { id: 'ALL', label: 'All Hubs & Corridors' },
  { id: 'kandla', label: 'Gulf of Kutch / Kandla Port', query: 'kandla' },
  { id: 'dubai', label: 'Dubai Marina / JAFZA Free Zone', query: 'dubai' },
  { id: 'surat', label: 'Surat Diamond Bourse', query: 'surat' },
  { id: 'mumbai', label: 'Mumbai Customs Free Port', query: 'mumbai' },
  { id: 'colombo', label: 'Colombo Escrow Anchorage', query: 'colombo' },
  { id: 'porbandar', label: 'Porbandar Coastal Creek', query: 'porbandar' }
];

export default function WorkspaceOverviewHub() {
  const {
    workspaces,
    openWorkspace,
    createWorkspace,
    deleteWorkspace,
    setActiveNavSection
  } = useWorkspace();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedHub, setSelectedHub] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsForm, setNewWsForm] = useState({
    name: '',
    associationMode: 'standalone', // 'standalone' | 'case'
    caseType: 'narcotics',
    customLabel: '',
    caseId: 'case-102',
    description: ''
  });

  const allCasesList = Object.values(CANONICAL_CASES);

  const filteredWorkspaces = workspaces.filter(w => {
    // 1. Search text filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      const matchSearch =
        w.name.toLowerCase().includes(q) ||
        (w.caseName && w.caseName.toLowerCase().includes(q)) ||
        (w.description && w.description.toLowerCase().includes(q)) ||
        (w.genre && w.genre.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // 2. Sector filter
    if (selectedSector !== 'ALL') {
      const secDef = SECTOR_PILLS.find(s => s.id === selectedSector);
      const matchSector =
        (w.genre && w.genre.toLowerCase() === selectedSector.toLowerCase()) ||
        (secDef?.caseId && w.caseId === secDef.caseId) ||
        (w.caseName && w.caseName.toLowerCase().includes(selectedSector.toLowerCase()));
      if (!matchSector) return false;
    }

    // 3. Hub / Place filter
    if (selectedHub !== 'ALL') {
      const hubDef = HUB_PILLS.find(h => h.id === selectedHub);
      const targetQuery = hubDef?.query || selectedHub.toLowerCase();
      const matchHub =
        w.name.toLowerCase().includes(targetQuery) ||
        (w.description && w.description.toLowerCase().includes(targetQuery)) ||
        (w.nodes && w.nodes.some(n =>
          (n.name && n.name.toLowerCase().includes(targetQuery)) ||
          (n.role && n.role.toLowerCase().includes(targetQuery)) ||
          (n.jurisdiction && n.jurisdiction.toLowerCase().includes(targetQuery))
        ));
      if (!matchHub) return false;
    }

    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newWsForm.name.trim()) return;

    createWorkspace({
      name: newWsForm.name,
      caseId: newWsForm.associationMode === 'case' ? newWsForm.caseId : 'none',
      caseType: newWsForm.caseType,
      customLabel: newWsForm.customLabel || (newWsForm.associationMode === 'standalone' ? 'Standalone Docket' : ''),
      description: newWsForm.description
    });

    setShowCreateModal(false);
    setNewWsForm({
      name: '',
      associationMode: 'standalone',
      caseType: 'narcotics',
      customLabel: '',
      caseId: 'case-102',
      description: ''
    });
  };

  const hasActiveFilters = selectedSector !== 'ALL' || selectedHub !== 'ALL' || searchFilter.trim() !== '';

  const handleClearFilters = () => {
    setSelectedSector('ALL');
    setSelectedHub('ALL');
    setSearchFilter('');
  };

  return (
    <div className="workspace-hub-scrollable">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <Panel3D className="hub-header-panel3d" glow="white" maxAngle={2}>
        <div className="hub-header-container">
          <div className="hub-header-left">
            <div className="hub-badge-row">
              <span className="hub-live-dot" />
              <span className="hub-title-kicker font-mono">WORKSPACE COMMAND CENTER</span>
              <span className="hub-count-pill font-mono">{workspaces.length} ACTIVE WORKSPACES</span>
            </div>
            <h1 className="hub-main-title">Investigation Workspaces</h1>
            <p className="hub-subtext">
              Select an ongoing case workspace to continue graph analysis, or create a clean new workspace to import dossiers, link people, and map cross-case conduits.
            </p>
          </div>

          <div className="hub-header-actions">
            <button
              className="btn btn-primary hub-create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={14} /> Create New Workspace
            </button>
          </div>
        </div>
      </Panel3D>

      {/* ── Minimal Clean Sector & Corridor Filter Bars ──────────── */}
      <div className="hub-filters-panel">
        <div className="hub-filter-row">
          <div className="hub-filter-label font-mono">
            <Briefcase size={12} />
            <span>CRIME SECTOR:</span>
          </div>
          <div className="hub-pills-scroll">
            {SECTOR_PILLS.map(s => (
              <button
                key={s.id}
                className={`hub-filter-pill ${selectedSector === s.id ? 'active' : ''}`}
                onClick={() => setSelectedSector(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Minimal Clean Corridor / Jurisdictions Filter Bar ── */}
        <div className="hub-filter-row">
          <div className="hub-filter-label font-mono">
            <Compass size={12} />
            <span>CORRIDORS &amp; HUBS:</span>
          </div>
          <div className="hub-pills-scroll">
            {HUB_PILLS.map(h => (
              <button
                key={h.id}
                className={`hub-filter-pill ${selectedHub === h.id ? 'active' : ''}`}
                onClick={() => setSelectedHub(h.id)}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="hub-active-filters-bar font-mono">
            <span className="active-filter-text">
              Active Filters: {selectedSector !== 'ALL' ? `Sector: ${SECTOR_PILLS.find(p=>p.id===selectedSector)?.label}` : ''} {selectedHub !== 'ALL' ? `· Hub: ${HUB_PILLS.find(p=>p.id===selectedHub)?.label}` : ''} {searchFilter ? `· Search: "${searchFilter}"` : ''}
            </span>
            <button className="hub-clear-filters-btn" onClick={handleClearFilters}>
              <RotateCcw size={11} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="hub-toolbar-strip">
        <div className="hub-search-box">
          <Search size={14} className="hub-search-icon" />
          <input
            type="text"
            className="hub-search-input"
            placeholder="Search workspaces by name, case, or keyword..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button className="hub-search-clear" onClick={() => setSearchFilter('')}>×</button>
          )}
        </div>

        <div className="hub-stats-overview font-mono">
          <span>SHOWING {filteredWorkspaces.length} OF {workspaces.length} WORKSPACES</span>
        </div>
      </div>

      {/* ── Workspaces Grid ──────────────────────────────────────── */}
      <div className="hub-workspaces-grid">
        {/* Create Workspace Quick Tile - AT THE TOP */}
        <div className="hub-create-tile" onClick={() => setShowCreateModal(true)}>
          <div className="create-tile-inner">
            <div className="create-tile-icon-box">
              <Plus size={24} />
            </div>
            <h3 className="create-tile-title">Create Workspace</h3>
            <p className="create-tile-caption">Start a clean investigation board or label a custom case</p>
          </div>
        </div>

        {filteredWorkspaces.map(ws => (
          <Panel3D key={ws.id} className="hub-card-panel3d" glow="white" maxAngle={4}>
            <div
              className={`hub-workspace-card priority-border-${(ws.priority || 'high').toLowerCase()}`}
              onClick={() => openWorkspace(ws.id)}
            >
              {/* Card Top Meta */}
              <div className="ws-card-top-row">
                <span className="ws-case-tag font-mono">{ws.caseName || 'Case Workspace'}</span>
                <span className={`ws-priority-pill priority-${(ws.priority || 'high').toLowerCase()}`}>
                  {ws.priority || 'ACTIVE'}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="ws-card-title">{ws.name}</h2>
              <p className="ws-card-desc">{ws.description}</p>

              {/* Entity & Rope Count Badges */}
              <div className="ws-stats-chips">
                <div className="stat-chip">
                  <Layers size={11} />
                  <span className="font-mono">{ws.nodesCount || ws.nodes?.length || 0} Entities</span>
                </div>
                <div className="stat-chip">
                  <span className="font-mono">{ws.edgesCount || ws.edges?.length || 0} Ropes</span>
                </div>
                <div className="stat-chip time-chip">
                  <Clock size={11} />
                  <span>{ws.lastModified || 'Recent'}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="ws-card-footer">
                <button
                  className="btn btn-primary ws-open-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWorkspace(ws.id);
                  }}
                >
                  <Play size={12} fill="currentColor" /> Open Workspace
                </button>

                <button
                  className="ws-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
                      deleteWorkspace(ws.id);
                    }
                  }}
                  title="Delete Workspace"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </Panel3D>
        ))}
      </div>

      {/* ── CREATE WORKSPACE MODAL ───────────────────────────────── */}
      {showCreateModal && (
        <div className="hub-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hub-modal-header">
              <div className="modal-title-group">
                <FolderPlus size={16} className="modal-title-icon" />
                <h3 className="modal-title">Create Investigation Workspace</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="hub-modal-form">
              <div className="modal-form-group">
                <label className="modal-label font-mono">WORKSPACE TITLE</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Dubai Hawala Trail &amp; Shell Companies"
                  value={newWsForm.name}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              {/* Case Classification & Kind */}
              <div className="modal-form-group">
                <label className="modal-label font-mono">CASE CLASSIFICATION / WHAT IS THIS CASE ABOUT?</label>
                <select
                  className="modal-select"
                  value={newWsForm.caseType}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, caseType: e.target.value }))}
                >
                  <option value="narcotics">Maritime Narcotics Smuggling (NDPS)</option>
                  <option value="corporate_fraud">Hawala, Shell Companies &amp; Money Laundering (PMLA)</option>
                  <option value="homicide">Contract Hit Syndicate &amp; Firearms</option>
                  <option value="theft">Vault Breach &amp; Diamond Asset Embezzlement</option>
                  <option value="trafficking">Human Trafficking &amp; Coastal Forgery</option>
                  <option value="cyber">Cyber Extortion, Malware &amp; Crypto Laundering</option>
                  <option value="custom">Custom Investigation Classification...</option>
                </select>
              </div>

              {newWsForm.caseType === 'custom' && (
                <div className="modal-form-group">
                  <label className="modal-label font-mono">CUSTOM CASE CLASSIFICATION LABEL</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Illicit Arms Procurement &amp; Forged Manifests"
                    value={newWsForm.customLabel}
                    onChange={(e) => setNewWsForm(prev => ({ ...prev, customLabel: e.target.value }))}
                    required
                  />
                </div>
              )}

              {/* Association Mode: Standalone vs Linked */}
              <div className="modal-form-group">
                <label className="modal-label font-mono">CASE ASSOCIATION</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${newWsForm.associationMode === 'standalone' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', flex: 1, padding: '6px 8px' }}
                    onClick={() => setNewWsForm(prev => ({ ...prev, associationMode: 'standalone' }))}
                  >
                    Independent / Standalone Docket
                  </button>
                  <button
                    type="button"
                    className={`btn ${newWsForm.associationMode === 'case' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', flex: 1, padding: '6px 8px' }}
                    onClick={() => setNewWsForm(prev => ({ ...prev, associationMode: 'case' }))}
                  >
                    Link to Existing Case
                  </button>
                </div>

                {newWsForm.associationMode === 'case' && (
                  <select
                    className="modal-select"
                    value={newWsForm.caseId}
                    onChange={(e) => setNewWsForm(prev => ({ ...prev, caseId: e.target.value }))}
                  >
                    {allCasesList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.genreLabel || c.genre})
                      </option>
                    ))}
                  </select>
                )}
                {newWsForm.associationMode === 'standalone' && (
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Creates a dedicated workspace classified under your selected crime category without requiring a formal case binding.
                  </p>
                )}
              </div>

              <div className="modal-form-group">
                <label className="modal-label font-mono">INVESTIGATIVE GOAL &amp; BRIEF</label>
                <textarea
                  className="modal-textarea"
                  rows={2}
                  placeholder="Key objective: e.g. Map ultimate beneficial owners of bulk carriers..."
                  value={newWsForm.description}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newWsForm.name.trim()}
                >
                  <Plus size={13} /> Create &amp; Open Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
