import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import { CANONICAL_CASES } from '../../contexts/WorkspaceContext';
import {
  Search, Plus, User, Building2, Car, DollarSign,
  ShieldAlert, FileText, Upload, Check, GripVertical,
  X, Layers, ChevronRight, ChevronDown, Sparkles, Folder,
  FolderPlus, Edit, Radio, StickyNote, FileEdit
} from 'lucide-react';
import './CaseFileAdder.css';

// Default preloaded case notes & transcripts for grounded realism
const DEFAULT_CASE_NOTES = {
  'case-102': [
    {
      id: 'note-102-1',
      name: 'Berth 4 Surveillance Memo',
      type: 'Note',
      role: 'Investigator Field Log',
      threat: 'HIGH',
      provenance: 'OBSERVATION',
      text: 'Surveillance operative observed Tariq Merchant meeting with Kandla port crane supervisor at 01:45 AM. Two sealed manifest binders exchanged.',
      author: 'Special Agent Adithya Srivatsa',
      date: '2026-09-22'
    },
    {
      id: 'transcript-102-2',
      name: 'Satcom Audio Transcript #TEL-889',
      type: 'Transcript',
      role: 'Intercepted Satellite Comms',
      threat: 'CRITICAL',
      provenance: 'RAW DATA',
      text: 'TARGET A: "Twelve tranches must settle before the bulk carrier clears drydock."\nTARGET B: "Confirming Dubai remittance code 88219. Handlers in Surat are staged."',
      author: 'Technical Intercept Division',
      date: '2026-09-23'
    }
  ],
  'case-117': [
    {
      id: 'note-117-1',
      name: 'CFSL Spectrometry Lab Findings',
      type: 'Note',
      role: 'Forensic Lab Dossier',
      threat: 'HIGH',
      provenance: 'EVIDENCE',
      text: 'Chemical spectrometry on seized drums verifies pharmaceutical-grade precursor batch #BATCH-UAE-77 identical to Al-Barakah consignments.',
      author: 'CFSL Senior Analyst',
      date: '2026-09-21'
    }
  ],
  'case-108': [
    {
      id: 'note-108-1',
      name: 'Ballistics & CCTV Correlation Memo',
      type: 'Note',
      role: 'Ballistic Comparison Log',
      threat: 'CRITICAL',
      provenance: 'EVIDENCE',
      text: '9mm casing recovered at Berth 4 matches firing pin striations from weapon seized in Case 102 warehouse raid.',
      author: 'Sr. Inspector Deshmukh',
      date: '2026-09-24'
    }
  ],
  'case-135': [
    {
      id: 'transcript-135-1',
      name: 'VoIP Extortion Call #VOIP-441',
      type: 'Transcript',
      role: 'VoIP Audio Extraction',
      threat: 'CRITICAL',
      provenance: 'RAW DATA',
      text: 'VOIP CALLER: "If the gypsum cargo is detained, the Kandla stevedores will pay ₹5 Cr penalty immediately."',
      author: 'Cyber Cell Mumbai',
      date: '2026-09-24'
    }
  ]
};

export default function CaseFileAdder({ onClose }) {
  const {
    activeCaseId,
    activeCase,
    canvasNodes,
    addNodeToCanvas
  } = useWorkspace();

  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [importedCaseIds, setImportedCaseIds] = useState(() => {
    return [activeCaseId || 'case-102'];
  });
  const [expandedFolders, setExpandedFolders] = useState({
    [activeCaseId || 'case-102']: true
  });
  const [addedIds, setAddedIds] = useState(new Set());

  // Show Import Case Dropdown modal
  const [showImportSelector, setShowImportSelector] = useState(false);

  // Note Creator Modal State
  const [showNoteCreator, setShowNoteCreator] = useState(false);
  const [noteForm, setNoteForm] = useState({
    caseId: activeCaseId || 'case-102',
    name: '',
    type: 'Note', // 'Note' | 'Transcript'
    text: '',
    threat: 'HIGH'
  });

  // Custom added notes map
  const [customNotes, setCustomNotes] = useState(DEFAULT_CASE_NOTES);

  const toggleFolder = (caseId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [caseId]: !prev[caseId]
    }));
  };

  const handleImportCase = (caseId) => {
    if (!importedCaseIds.includes(caseId)) {
      setImportedCaseIds(prev => [...prev, caseId]);
      setExpandedFolders(prev => ({ ...prev, [caseId]: true }));
    }
    setShowImportSelector(false);
  };

  const handleAdd = (item) => {
    addNodeToCanvas(item);
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const handleDragStart = (e, item) => {
    const payload = JSON.stringify(item);
    try {
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
    } catch (err) {}
    window.__CONSTELLATION_DRAGGED_ITEM__ = item;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!noteForm.name.trim() || !noteForm.text.trim()) return;

    const newNote = {
      id: `memo-${Date.now()}`,
      name: noteForm.name.trim(),
      type: noteForm.type,
      role: noteForm.type === 'Note' ? 'Investigator Memo' : 'Intercept Transcript',
      threat: noteForm.threat,
      provenance: 'ANALYTICAL_INFERENCE',
      text: noteForm.text.trim(),
      author: 'Lead Investigator',
      date: new Date().toISOString().split('T')[0]
    };

    // Add to local notes list
    setCustomNotes(prev => ({
      ...prev,
      [noteForm.caseId]: [newNote, ...(prev[noteForm.caseId] || [])]
    }));

    // Directly drop onto canvas as well!
    addNodeToCanvas(newNote);

    setNoteForm({
      caseId: activeCaseId || 'case-102',
      name: '',
      type: 'Note',
      text: '',
      threat: 'HIGH'
    });
    setShowNoteCreator(false);
  };

  const getIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'person': return <User size={12} />;
      case 'organization': return <Building2 size={12} />;
      case 'vehicle': return <Car size={12} />;
      case 'financial': return <DollarSign size={12} />;
      case 'note': return <StickyNote size={12} />;
      case 'transcript': return <Radio size={12} />;
      case 'evidence': return <FileText size={12} />;
      default: return <ShieldAlert size={12} />;
    }
  };

  // Helper to compile all labeled items for a given case
  const getCaseSections = (caseId) => {
    const cData = CANONICAL_CASES[caseId] || (caseId === activeCaseId ? activeCase : null);
    if (!cData) return { people: [], vehicles: [], organizations: [], financial: [], notes: [] };

    const info = cData.information || {};
    const people = (info.people || []).map(p => ({ ...p, type: 'Person', role: p.role || 'Person of Interest' }));
    const vehicles = (info.vehicles || []).map(v => ({ ...v, type: 'Vehicle', role: v.type || 'Vehicle / Vessel' }));
    const organizations = (info.organizations || []).map(o => ({ ...o, type: 'Organization', role: o.type || 'Corporate Entity' }));
    const financial = (info.financial || []).map(f => ({ ...f, type: 'Financial', role: f.amount || 'Financial Account' }));
    const notes = (customNotes[caseId] || []);

    return { people, vehicles, organizations, financial, notes };
  };

  return (
    <aside className="case-file-adder-sidebar">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="adder-header">
        <div className="adder-title-group">
          <Folder size={16} className="adder-icon yellow-folder-icon" />
          <div className="adder-title-text">
            <span className="adder-title font-mono">CASE DOSSIER EXPLORER</span>
            <span className="adder-case-count font-mono">{importedCaseIds.length} Cases Imported</span>
          </div>
        </div>

        <div className="flex items-center gap-xs">
          <button
            className="adder-header-btn"
            onClick={() => setShowImportSelector(!showImportSelector)}
            title="Import another Case Folder from Bureau Archive"
          >
            <FolderPlus size={13} />
            <span>Import</span>
          </button>

          <button
            className="adder-header-btn"
            style={{ background: 'var(--nb-yellow, #ffd166)' }}
            onClick={() => setShowNoteCreator(true)}
            title="Write Investigator Note or Transcript"
          >
            <FileEdit size={13} />
            <span>+ Note</span>
          </button>

          {onClose && (
            <button className="adder-close-btn" onClick={onClose} title="Hide Case Explorer">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Import Case Dropdown Drawer ────────────────────────── */}
      {showImportSelector && (
        <div className="adder-import-drawer font-mono">
          <div className="import-drawer-header">
            <span>SELECT CASE TO IMPORT:</span>
            <button className="drawer-close" onClick={() => setShowImportSelector(false)}>✕</button>
          </div>
          <div className="import-case-options">
            {Object.keys(CANONICAL_CASES).map(cId => {
              const c = CANONICAL_CASES[cId];
              const isAlreadyImported = importedCaseIds.includes(cId);
              return (
                <div
                  key={cId}
                  className={`import-case-option ${isAlreadyImported ? 'already-imported' : ''}`}
                  onClick={() => !isAlreadyImported && handleImportCase(cId)}
                >
                  <Folder size={12} className="yellow-folder-icon" />
                  <span className="import-case-name">{c.name}</span>
                  {isAlreadyImported && <span className="import-tag">Imported</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Search Input ────────────────────────────────────────── */}
      <div className="adder-search-box">
        <Search size={13} className="adder-search-icon" />
        <input
          type="text"
          placeholder="Filter people, vehicles, notes..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="adder-search-input font-mono"
        />
        {filterText && (
          <button className="adder-clear-btn" onClick={() => setFilterText('')}>×</button>
        )}
      </div>

      {/* ── Filter Chips ────────────────────────────────────────── */}
      <div className="adder-filter-chips font-mono">
        {['ALL', 'PERSON', 'VEHICLE', 'ORGANIZATION', 'FINANCIAL', 'NOTE'].map(cat => (
          <button
            key={cat}
            className={`adder-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Hierarchical Case Folders Tree ──────────────────────── */}
      <div className="adder-items-list">
        {importedCaseIds.map(cId => {
          const cData = CANONICAL_CASES[cId] || (cId === activeCaseId ? activeCase : null);
          if (!cData) return null;

          const isExpanded = expandedFolders[cId];
          const { people, vehicles, organizations, financial, notes } = getCaseSections(cId);

          const matchesQuery = (name, role) => {
            if (!filterText) return true;
            const q = filterText.toLowerCase();
            return (name || '').toLowerCase().includes(q) || (role || '').toLowerCase().includes(q);
          };

          const filteredPeople = people.filter(p => matchesQuery(p.name, p.role));
          const filteredVehicles = vehicles.filter(v => matchesQuery(v.name, v.role));
          const filteredOrgs = organizations.filter(o => matchesQuery(o.name, o.role));
          const filteredFin = financial.filter(f => matchesQuery(f.name, f.role));
          const filteredNotes = notes.filter(n => matchesQuery(n.name, n.text || n.role));

          return (
            <div key={cId} className="case-folder-card">
              {/* Folder Header */}
              <div
                className="case-folder-header font-mono"
                onClick={() => toggleFolder(cId)}
              >
                <div className="folder-header-left">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="yellow-folder-icon" />
                  <span className="case-folder-name" title={cData.name}>
                    {cData.name}
                  </span>
                </div>
                {cId === activeCaseId && (
                  <span className="active-case-tag">ACTIVE</span>
                )}
              </div>

              {/* Folder Expanded Contents */}
              {isExpanded && (
                <div className="case-folder-body">
                  {/* 1. Persons of Interest */}
                  {(selectedCategory === 'ALL' || selectedCategory === 'PERSON') && filteredPeople.length > 0 && (
                    <div className="case-section-group">
                      <div className="section-label font-mono">
                        <User size={11} />
                        <span>PERSONS ({filteredPeople.length})</span>
                      </div>
                      {filteredPeople.map(p => renderItemRow(p))}
                    </div>
                  )}

                  {/* 2. Vehicles & Vessels */}
                  {(selectedCategory === 'ALL' || selectedCategory === 'VEHICLE') && filteredVehicles.length > 0 && (
                    <div className="case-section-group">
                      <div className="section-label font-mono">
                        <Car size={11} />
                        <span>VEHICLES &amp; VESSELS ({filteredVehicles.length})</span>
                      </div>
                      {filteredVehicles.map(v => renderItemRow(v))}
                    </div>
                  )}

                  {/* 3. Organizations */}
                  {(selectedCategory === 'ALL' || selectedCategory === 'ORGANIZATION') && filteredOrgs.length > 0 && (
                    <div className="case-section-group">
                      <div className="section-label font-mono">
                        <Building2 size={11} />
                        <span>ORGANIZATIONS ({filteredOrgs.length})</span>
                      </div>
                      {filteredOrgs.map(o => renderItemRow(o))}
                    </div>
                  )}

                  {/* 4. Financial Accounts */}
                  {(selectedCategory === 'ALL' || selectedCategory === 'FINANCIAL') && filteredFin.length > 0 && (
                    <div className="case-section-group">
                      <div className="section-label font-mono">
                        <DollarSign size={11} />
                        <span>FINANCIAL CONDUITS ({filteredFin.length})</span>
                      </div>
                      {filteredFin.map(f => renderItemRow(f))}
                    </div>
                  )}

                  {/* 5. Notes & Transcripts */}
                  {(selectedCategory === 'ALL' || selectedCategory === 'NOTE') && filteredNotes.length > 0 && (
                    <div className="case-section-group">
                      <div className="section-label font-mono">
                        <StickyNote size={11} />
                        <span>NOTES &amp; TRANSCRIPTS ({filteredNotes.length})</span>
                      </div>
                      {filteredNotes.map(n => renderItemRow(n, true))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Note / Transcript Creator Modal ──────────────────────── */}
      {showNoteCreator && (
        <div className="command-palette-backdrop" onClick={() => setShowNoteCreator(false)}>
          <div className="note-creator-modal font-mono" onClick={e => e.stopPropagation()}>
            <div className="note-creator-header">
              <div className="flex items-center gap-xs">
                <StickyNote size={16} />
                <span className="note-modal-title">ADD INVESTIGATIVE NOTE / TRANSCRIPT</span>
              </div>
              <button className="drawer-close" onClick={() => setShowNoteCreator(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateNote} className="note-creator-form">
              <div className="note-field-wrap">
                <label className="note-label">TARGET CASE FOLDER:</label>
                <select
                  value={noteForm.caseId}
                  onChange={e => setNoteForm(prev => ({ ...prev, caseId: e.target.value }))}
                  className="note-select"
                >
                  {importedCaseIds.map(cId => (
                    <option key={cId} value={cId}>{CANONICAL_CASES[cId]?.name || cId}</option>
                  ))}
                </select>
              </div>

              <div className="note-field-row">
                <div className="note-field-wrap" style={{ flex: 1 }}>
                  <label className="note-label">ENTRY TYPE:</label>
                  <select
                    value={noteForm.type}
                    onChange={e => setNoteForm(prev => ({ ...prev, type: e.target.value }))}
                    className="note-select"
                  >
                    <option value="Note">Investigator Field Memo</option>
                    <option value="Transcript">Surveillance / Audio Transcript</option>
                  </select>
                </div>

                <div className="note-field-wrap" style={{ flex: 1 }}>
                  <label className="note-label">THREAT LEVEL:</label>
                  <select
                    value={noteForm.threat}
                    onChange={e => setNoteForm(prev => ({ ...prev, threat: e.target.value }))}
                    className="note-select"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="note-field-wrap">
                <label className="note-label">TITLE / SUBJECT:</label>
                <input
                  type="text"
                  placeholder="e.g. Berth 4 Meeting Observed / Intercept #441..."
                  value={noteForm.name}
                  onChange={e => setNoteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="note-input"
                  required
                  autoFocus
                />
              </div>

              <div className="note-field-wrap">
                <label className="note-label">MEMO TEXT OR VERBATIM TRANSCRIPT:</label>
                <textarea
                  rows={4}
                  placeholder="Type field observations, surveillance timestamps, or audio transcript..."
                  value={noteForm.text}
                  onChange={e => setNoteForm(prev => ({ ...prev, text: e.target.value }))}
                  className="note-textarea font-mono"
                  required
                />
              </div>

              <div className="note-creator-actions">
                <button
                  type="button"
                  className="btn-cancel font-mono"
                  onClick={() => setShowNoteCreator(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save-note font-mono"
                >
                  <Plus size={13} />
                  <span>Pin Note to Canvas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );

  function renderItemRow(item, isNote = false) {
    const alreadyOnCanvas = canvasNodes.some(n => n.id === item.id || n.name === item.name);
    const justAdded = addedIds.has(item.id);

    return (
      <div
        key={item.id}
        className={`adder-card-item ${alreadyOnCanvas ? 'is-on-canvas' : ''} ${isNote ? 'is-note-item' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
      >
        <div className="adder-drag-handle" title="Drag onto canvas">
          <GripVertical size={12} />
        </div>

        <div className="adder-item-main">
          <div className="adder-item-top">
            <span className={`adder-type-pill pill-${(item.type || 'ITEM').toLowerCase()}`}>
              {getIcon(item.type)}
              <span>{(item.type || 'ITEM').toUpperCase()}</span>
            </span>
            <ProvenanceBadge level={item.provenance || 'RAW DATA'} size="sm" />
          </div>

          <div className="adder-item-title">{item.name}</div>
          <div className="adder-item-role">
            {isNote ? (item.text ? item.text.slice(0, 50) + '...' : item.role) : item.role}
          </div>
        </div>

        <button
          className={`adder-add-btn ${justAdded ? 'added' : ''}`}
          onClick={() => handleAdd(item)}
          title={alreadyOnCanvas ? "Item already placed on canvas" : "Place on canvas"}
        >
          {justAdded ? (
            <Check size={11} />
          ) : alreadyOnCanvas ? (
            'Placed'
          ) : (
            <Plus size={12} />
          )}
        </button>
      </div>
    );
  }
}
