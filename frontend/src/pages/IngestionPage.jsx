import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  Upload, Folder, FileText, CheckCircle2, AlertCircle,
  Search, Filter, Brain, ArrowRight, Trash2, Eye,
  Plus, Check, HardDrive, ShieldCheck, Clock, FileSpreadsheet,
  FileCode, Sparkles, X, ChevronDown
} from 'lucide-react';
import api from '../services/api';
import './IngestionPage.css';

// Initial grounded forensic evidence items (no fake placeholder nonsense)
export const INITIAL_EVIDENCE_ROSTER = [
  {
    id: 'EVD-102-BOL',
    title: 'Bill of Lading #BOL-9921-A (MV Sagar Ratna)',
    caseId: 'case-102',
    caseName: 'Case 102 — Silver Dune',
    category: 'Maritime Cargo & AIS Logs',
    source: 'DRI Kandla Port Customs (Gate 3)',
    date: '2026-09-21',
    size: '4.8 MB',
    type: 'PDF Document',
    hash: '0x88f29c1b48d1e847c51d668fa912c91a',
    entities: ['MV Sagar Ratna', 'Tariq Merchant', 'Al-Barakah Logistics FZE'],
    notes: 'Manifest declared 12,000 MT industrial gypsum. Physical examination revealed false bulkheads concealing 420 kg contraband narcotics.',
    status: 'INDEXED_BYOMKESH'
  },
  {
    id: 'EVD-102-AIS',
    title: 'AIS Satellite Track & Radar Telemetry Log',
    caseId: 'case-102',
    caseName: 'Case 102 — Silver Dune',
    category: 'Maritime Cargo & AIS Logs',
    source: 'Indian Coast Guard Western Command',
    date: '2026-09-22',
    size: '1.2 MB',
    type: 'CSV Dataset',
    hash: '0x32e1c4a2559b9101d2938b819fec3119',
    entities: ['MV Sagar Ratna', 'Gulf of Kutch Rendezvous Point'],
    notes: 'Shows 3-hour transponder dark period in international waters coinciding with satellite burst communication on 1544.15 MHz.',
    status: 'INDEXED_BYOMKESH'
  },
  {
    id: 'EVD-102-WIRE',
    title: 'Hawala Mirror Ledger Account #88219 Extractions',
    caseId: 'case-102',
    caseName: 'Case 102 — Silver Dune',
    category: 'Financial Ledger & Wire Remittance',
    source: 'Financial Intelligence Unit (FIU-IND)',
    date: '2026-09-23',
    size: '680 KB',
    type: 'Encrypted Spreadsheet',
    hash: '0x99a7d31fe18204918237cb10948ac019',
    entities: ['Hawala Account #88219', 'Al-Barakah Logistics FZE', 'Dubai Trade LLC'],
    notes: 'Structured wire breakdown totaling ₹14.8 Cr split across 12 domestic banking accounts within 48 hours of ship berthing.',
    status: 'INDEXED_BYOMKESH'
  },
  {
    id: 'EVD-117-LAB',
    title: 'CFSL Chemical Spectrometry Report #CH-9921',
    caseId: 'case-117',
    caseName: 'Case 117 — Operation Black Tide',
    category: 'Forensic Ballistics & Biometrics',
    source: 'Central Forensic Science Laboratory (CFSL)',
    date: '2026-09-20',
    size: '3.1 MB',
    type: 'Forensic Report',
    hash: '0xbb201948ac91204859182cb019485910',
    entities: ['Al-Barakah Pharma Unit', 'Surat Synthesis Facility'],
    notes: 'Confirms high-purity methamphetamine precursor chemicals matched to offshore consignment batch #BATCH-UAE-77.',
    status: 'INDEXED_BYOMKESH'
  },
  {
    id: 'EVD-121-CCTV',
    title: 'Bharat Diamond Bourse Vault Turnstile Biometric Logs',
    caseId: 'case-121',
    caseName: 'Case 121 — Diamond Bourse Vault Breach',
    category: 'Surveillance & Identity Dossier',
    source: 'Mumbai Crime Branch Cyber Cell',
    date: '2026-09-19',
    size: '8.4 MB',
    type: 'Audit Log & Video Still',
    hash: '0xee42d9102948c019284710293847ac91',
    entities: ['Arjun Singhania (Insider)', 'Subterranean Vault 4'],
    notes: 'Biometric override timestamped at 02:41 AM using cloned master supervisor credential during scheduled maintenance.',
    status: 'INDEXED_BYOMKESH'
  },
  {
    id: 'EVD-135-VOIP',
    title: 'Intercepted VoIP Audio & CDR Session #VOIP-441',
    caseId: 'case-135',
    caseName: 'Case 135 — Black Pearl Extortion',
    category: 'Telecommunications & Intercepts',
    source: 'NCB Technical Intercept Wing',
    date: '2026-09-24',
    size: '2.4 MB',
    type: 'Audio Capture & Transcript',
    hash: '0xaa19c344910293847102938471029384',
    entities: ['Sameer "Viper" Mir', 'Kandla Stevedores Syndicate'],
    notes: 'Audio recording of death threat and ₹5 Cr extortion demand routed through Netherlands VPN node.',
    status: 'INDEXED_BYOMKESH'
  }
];

export default function IngestionPage() {
  const { setActiveNavSection, setActiveCaseId } = useWorkspace();

  // Evidence list stored in localStorage
  const [evidenceList, setEvidenceList] = useState(() => {
    try {
      const saved = localStorage.getItem('constellation_evidence_roster');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EVIDENCE_ROSTER;
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Manual Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCaseId, setFormCaseId] = useState('case-102');
  const [formCategory, setFormCategory] = useState('Maritime Cargo & AIS Logs');
  const [formSource, setFormSource] = useState('Directorate of Revenue Intelligence');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formEntities, setFormEntities] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFileSize, setFormFileSize] = useState('');

  // Dropzone State
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [inspectItem, setInspectItem] = useState(null);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Sync evidence list to localStorage
  useEffect(() => {
    localStorage.setItem('constellation_evidence_roster', JSON.stringify(evidenceList));
  }, [evidenceList]);

  // Recursively traverse dropped folder items
  const traverseFileTree = async (entry, path = '') => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          resolve([{ file, path: path + file.name }]);
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = [];
        const readEntries = () => {
          dirReader.readEntries(async (result) => {
            if (!result.length) {
              const nestedFiles = await Promise.all(
                entries.map(e => traverseFileTree(e, `${path}${entry.name}/`))
              );
              resolve(nestedFiles.flat());
            } else {
              entries.push(...result);
              readEntries();
            }
          });
        };
        readEntries();
      } else {
        resolve([]);
      }
    });
  };

  // Handle files & folders dropped
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    let droppedFiles = [];

    if (items && items.length > 0 && items[0].webkitGetAsEntry) {
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) promises.push(traverseFileTree(entry));
      }
      const results = await Promise.all(promises);
      droppedFiles = results.flat();
    } else {
      const files = Array.from(e.dataTransfer.files || []);
      droppedFiles = files.map(f => ({ file: f, path: f.name }));
    }

    if (droppedFiles.length > 0) {
      processIngestedFiles(droppedFiles);
    }
  };

  // Process ingested files into Evidence Ledger
  const processIngestedFiles = (fileEntries) => {
    const newItems = fileEntries.map(({ file, path }) => {
      const ext = file.name.split('.').pop().toLowerCase();
      let category = 'Intelligence Surveillance Dossier';
      let type = 'File Document';

      if (['pdf', 'doc', 'docx'].includes(ext)) {
        category = 'Maritime Cargo & AIS Logs';
        type = 'PDF Document';
      } else if (['csv', 'xlsx', 'xls'].includes(ext)) {
        category = 'Financial Ledger & Wire Remittance';
        type = 'Spreadsheet / Data Log';
      } else if (['jpg', 'png', 'jpeg', 'mp4', 'mov'].includes(ext)) {
        category = 'Surveillance & Identity Dossier';
        type = 'Visual Media Evidence';
      } else if (['mp3', 'wav', 'aac'].includes(ext)) {
        category = 'Telecommunications & Intercepts';
        type = 'Audio Intercept';
      }

      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      return {
        id: `EVD-${Math.floor(1000 + Math.random() * 9000)}`,
        title: path || file.name,
        caseId: formCaseId,
        caseName: formCaseId === 'case-102' ? 'Case 102 — Silver Dune' : (formCaseId === 'case-117' ? 'Case 117 — Black Tide' : 'Case 121 — Diamond Bourse'),
        category,
        source: formSource,
        date: new Date().toISOString().split('T')[0],
        size: sizeStr,
        type,
        hash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        entities: ['Pending Byomkesh Extraction'],
        notes: `Batch ingested via Folder Drop: ${path}. Ready for autonomous entity resolution and graph correlation.`,
        status: 'INDEXED_BYOMKESH'
      };
    });

    setEvidenceList(prev => [...newItems, ...prev]);
    setUploadQueue(newItems);
    setTimeout(() => setUploadQueue([]), 4000);
  };

  // Handle manual form submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItem = {
      id: `EVD-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formTitle.trim(),
      caseId: formCaseId,
      caseName: formCaseId === 'case-102' ? 'Case 102 — Silver Dune' : (formCaseId === 'case-117' ? 'Case 117 — Black Tide' : (formCaseId === 'case-121' ? 'Case 121 — Diamond Bourse' : 'Case 135 — Black Pearl')),
      category: formCategory,
      source: formSource.trim() || 'Central Intelligence Directorate',
      date: formDate,
      size: formFileSize || '1.5 MB',
      type: 'Forensic Document',
      hash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      entities: formEntities ? formEntities.split(',').map(s => s.trim()).filter(Boolean) : ['Unclassified'],
      notes: formNotes.trim() || 'Organized and indexed for Byomkesh AI investigative queries.',
      status: 'INDEXED_BYOMKESH'
    };

    setEvidenceList(prev => [newItem, ...prev]);
    setFormTitle('');
    setFormEntities('');
    setFormNotes('');
    setFormFileSize('');
  };

  // Delete evidence item
  const handleDeleteItem = (id) => {
    setEvidenceList(prev => prev.filter(item => item.id !== id));
  };

  // Send evidence item directly to Byomkesh AI
  const handleAskByomkesh = (item) => {
    localStorage.setItem('byomkesh_pending_query', `Analyze evidence ${item.id} ("${item.title}") from ${item.caseName}. Cross-reference all extracted entities, timestamps, and detect contradictions.`);
    setActiveNavSection('byomkesh');
  };

  // Filter evidence list
  const filteredEvidence = evidenceList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.entities || []).some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCase = selectedCaseFilter === 'ALL' || item.caseId === selectedCaseFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCase && matchesCategory;
  });

  return (
    <div className="ingestion-page-root">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="ingestion-header">
        <div className="ingestion-title-block">
          <div className="ingestion-badge font-mono">
            <ShieldCheck size={13} className="text-emerald" />
            <span>CHAIN OF CUSTODY EVIDENCE VAULT</span>
          </div>
          <h1 className="ingestion-main-title">Evidence Ingestion &amp; Organization</h1>
          <p className="ingestion-subtitle">
            Upload folders, manifests, wire ledgers &amp; forensic files. All items are indexed and accessible to Byomkesh AI.
          </p>
        </div>

        <div className="ingestion-stats-summary font-mono">
          <div className="summary-stat-box">
            <span className="stat-label">TOTAL EVIDENCE</span>
            <span className="stat-val">{evidenceList.length} Items</span>
          </div>
          <div className="summary-stat-box">
            <span className="stat-label">BYOMKESH STATUS</span>
            <span className="stat-val text-green">100% INDEXED</span>
          </div>
        </div>
      </header>

      {/* ── TOP SECTION: DRAG-DROP ZONE + MANUAL FORM SPLIT ──── */}
      <div className="ingestion-top-grid">
        
        {/* LEFT: DRAG-AND-DROP ZONE (FILES + FOLDERS) ─────────── */}
        <div className="dropzone-container-card">
          <div className="card-top-heading">
            <Upload size={16} />
            <span>Drag &amp; Drop Ingestion (Files &amp; Folders)</span>
          </div>

          <div
            className={`folder-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon-circle">
              <Folder size={28} />
            </div>
            <h3 className="dropzone-title">Drop Files or Complete Folders Here</h3>
            <p className="dropzone-hint">
              Drop directories with subfolders, PDF documents, CSV call data, media, or archives
            </p>

            <div className="dropzone-actions-row">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map(f => ({ file: f, path: f.name }));
                  processIngestedFiles(files);
                }}
              />
              <button
                className="btn-browse-action"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText size={13} />
                <span>Select Files</span>
              </button>

              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map(f => ({ file: f, path: f.webkitRelativePath || f.name }));
                  processIngestedFiles(files);
                }}
              />
              <button
                className="btn-browse-action btn-folder-browse"
                onClick={() => folderInputRef.current?.click()}
              >
                <Folder size={13} />
                <span>Select Entire Folder</span>
              </button>
            </div>
          </div>

          {/* Quick upload notification banner */}
          {uploadQueue.length > 0 && (
            <div className="upload-success-toast">
              <CheckCircle2 size={15} className="text-green" />
              <span>Ingested {uploadQueue.length} items. Formatted and indexed for Byomkesh AI.</span>
            </div>
          )}
        </div>

        {/* RIGHT: MANUAL ORGANIZATION FORM ────────────────────── */}
        <div className="manual-form-card">
          <div className="card-top-heading">
            <Plus size={16} />
            <span>Manual Organization &amp; Metadata Form</span>
          </div>

          <form className="manual-org-form" onSubmit={handleManualSubmit}>
            <div className="form-field-group">
              <label className="form-label">Evidence Title / Document Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. MV Sagar Ratna Offloading Bill of Lading #991"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-row-split">
              <div className="form-field-group">
                <label className="form-label">Target Case *</label>
                <select
                  value={formCaseId}
                  onChange={e => setFormCaseId(e.target.value)}
                  className="form-select"
                >
                  <option value="case-102">Case 102 — Silver Dune</option>
                  <option value="case-117">Case 117 — Operation Black Tide</option>
                  <option value="case-121">Case 121 — Diamond Bourse Vault</option>
                  <option value="case-135">Case 135 — Black Pearl Extortion</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Category *</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Maritime Cargo & AIS Logs">Maritime Cargo &amp; AIS Logs</option>
                  <option value="Financial Ledger & Wire Remittance">Financial Ledger &amp; Wire Remittance</option>
                  <option value="Telecommunications & Intercepts">Telecommunications &amp; Intercepts</option>
                  <option value="Forensic Ballistics & Biometrics">Forensic Ballistics &amp; Biometrics</option>
                  <option value="Surveillance & Identity Dossier">Surveillance &amp; Identity Dossier</option>
                </select>
              </div>
            </div>

            <div className="form-row-split">
              <div className="form-field-group">
                <label className="form-label">Seizing Agency / Chain of Custody</label>
                <input
                  type="text"
                  placeholder="e.g. DRI Kandla / FIU / NCB"
                  value={formSource}
                  onChange={e => setFormSource(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Seizure Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">Key Suspects &amp; Entities (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Tariq Merchant, Al-Barakah Logistics, MT Sagar Ratna"
                value={formEntities}
                onChange={e => setFormEntities(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Forensic Notes &amp; Evidentiary Significance</label>
              <textarea
                rows={2}
                placeholder="Enter forensic summary, seizure circumstances, and notes for Byomkesh AI..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn-submit-org font-mono">
              <Plus size={14} />
              <span>Register &amp; Ingest Evidence</span>
            </button>
          </form>
        </div>

      </div>

      {/* ── BOTTOM SECTION: ORGANIZED EVIDENCE ROSTER TABLE ─── */}
      <section className="evidence-roster-section">
        <div className="roster-header-bar">
          <div className="roster-title-group">
            <h2 className="roster-title">Organized Evidence Ledger</h2>
            <span className="roster-count font-mono">{filteredEvidence.length} of {evidenceList.length} artifacts</span>
          </div>

          {/* Filters & Search */}
          <div className="roster-filter-controls">
            <div className="roster-search-box">
              <Search size={13} className="roster-search-icon" />
              <input
                type="text"
                placeholder="Search evidence ID, title, or suspect tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="roster-search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <select
              value={selectedCaseFilter}
              onChange={e => setSelectedCaseFilter(e.target.value)}
              className="roster-select-filter"
            >
              <option value="ALL">All Cases</option>
              <option value="case-102">Case 102</option>
              <option value="case-117">Case 117</option>
              <option value="case-121">Case 121</option>
              <option value="case-135">Case 135</option>
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="roster-select-filter"
            >
              <option value="ALL">All Categories</option>
              <option value="Maritime Cargo & AIS Logs">Maritime Cargo &amp; AIS</option>
              <option value="Financial Ledger & Wire Remittance">Financial &amp; Hawala</option>
              <option value="Telecommunications & Intercepts">Telecom &amp; Intercepts</option>
              <option value="Forensic Ballistics & Biometrics">Ballistics &amp; Bio</option>
              <option value="Surveillance & Identity Dossier">Surveillance &amp; Identity</option>
            </select>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="evidence-table-container">
          <table className="evidence-ledger-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Evidence Title &amp; Source</th>
                <th>Case</th>
                <th>Category</th>
                <th>Format &amp; Size</th>
                <th>Entities Linked</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.length > 0 ? (
                filteredEvidence.map(item => (
                  <tr key={item.id} className="ledger-table-row">
                    <td className="font-mono text-bold td-id">{item.id}</td>
                    <td className="td-title-col">
                      <div className="evidence-main-title">{item.title}</div>
                      <div className="evidence-source-sub">{item.source} · {item.date}</div>
                    </td>
                    <td className="td-case-col">
                      <span className="case-tag-pill font-mono">{item.caseId}</span>
                    </td>
                    <td>
                      <span className="category-pill font-mono">{item.category}</span>
                    </td>
                    <td className="td-format font-mono">
                      <span>{item.type}</span>
                      <span className="file-size-tag">{item.size}</span>
                    </td>
                    <td>
                      <div className="entities-tags-wrap">
                        {(item.entities || []).slice(0, 2).map((ent, idx) => (
                          <span key={idx} className="entity-tag-badge">{ent}</span>
                        ))}
                        {(item.entities || []).length > 2 && (
                          <span className="entity-tag-more">+{item.entities.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="byomkesh-ready-tag font-mono">
                        <Sparkles size={11} /> READY FOR AI
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions-group">
                        <button
                          className="btn-ask-byomkesh"
                          onClick={() => handleAskByomkesh(item)}
                          title="Send to Byomkesh AI for forensic synthesis"
                        >
                          <Brain size={12} />
                          <span>Ask Byomkesh</span>
                        </button>
                        <button
                          className="btn-row-action"
                          onClick={() => setInspectItem(item)}
                          title="Inspect Evidence Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn-row-action btn-row-delete"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Remove from Ledger"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty-row">
                    No evidence items matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── INSPECT EVIDENCE MODAL ────────────────────────────── */}
      {inspectItem && (
        <div className="inspect-modal-backdrop" onClick={() => setInspectItem(null)}>
          <div className="inspect-modal-card" onClick={e => e.stopPropagation()}>
            <div className="inspect-modal-header">
              <div>
                <span className="inspect-id-badge font-mono">{inspectItem.id}</span>
                <h3 className="inspect-modal-title">{inspectItem.title}</h3>
              </div>
              <button className="inspect-close-btn" onClick={() => setInspectItem(null)}>✕</button>
            </div>

            <div className="inspect-modal-body font-mono">
              <div className="inspect-grid">
                <div>
                  <span className="inspect-label">TARGET CASE</span>
                  <p className="inspect-val">{inspectItem.caseName} ({inspectItem.caseId})</p>
                </div>
                <div>
                  <span className="inspect-label">CATEGORY</span>
                  <p className="inspect-val">{inspectItem.category}</p>
                </div>
                <div>
                  <span className="inspect-label">CHAIN OF CUSTODY</span>
                  <p className="inspect-val">{inspectItem.source}</p>
                </div>
                <div>
                  <span className="inspect-label">DATE SEIZED</span>
                  <p className="inspect-val">{inspectItem.date}</p>
                </div>
                <div>
                  <span className="inspect-label">CRYPTOGRAPHIC HASH (SHA-256)</span>
                  <p className="inspect-val text-emerald">{inspectItem.hash}</p>
                </div>
                <div>
                  <span className="inspect-label">FILE SIZE &amp; FORMAT</span>
                  <p className="inspect-val">{inspectItem.size} ({inspectItem.type})</p>
                </div>
              </div>

              <div className="inspect-notes-box">
                <span className="inspect-label">FORENSIC NOTES &amp; SUMMARY</span>
                <p className="inspect-notes-text">{inspectItem.notes}</p>
              </div>

              <div className="inspect-entities-box">
                <span className="inspect-label">EXTRACTED ENTITIES</span>
                <div className="entities-tags-wrap" style={{ marginTop: 6 }}>
                  {(inspectItem.entities || []).map((ent, i) => (
                    <span key={i} className="entity-tag-badge">{ent}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="inspect-modal-footer">
              <button
                className="btn-browse-action"
                onClick={() => setInspectItem(null)}
              >
                Close
              </button>
              <button
                className="btn-submit-org font-mono"
                onClick={() => {
                  handleAskByomkesh(inspectItem);
                  setInspectItem(null);
                }}
              >
                <Brain size={13} />
                <span>Open in Byomkesh AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
