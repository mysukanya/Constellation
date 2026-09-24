import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  FolderSearch, Plus, Scale, Users, GitBranch, Grid3X3, List
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Panel3D from '../components/Panel3D';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import api from '../services/api';
import './CasesPage.css';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({ title: '', description: '', legal_basis: '', status: 'active' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const { setActiveNavSection, setActiveCaseId } = useWorkspace();

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    try {
      const data = await api.listCases();
      setCases(data);
    } catch { /* empty list */ }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (formData.legal_basis.trim().length < 5) {
      setFormError('Legal basis must be at least 5 characters (e.g., Warrant #1234)');
      return;
    }
    setCreating(true);
    try {
      await api.createCase(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', legal_basis: '', status: 'active' });
      await loadCases();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCase = (caseId) => {
    setActiveCaseId(caseId);
    setActiveNavSection('case-detail');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Investigation Cases</h1>
            <p>Manage and monitor active investigations with full legal provenance</p>
          </div>
          <div className="flex items-center gap-md">
            <div className="view-toggle">
              <button className={`btn btn-ghost btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 size={16} /></button>
              <button className={`btn btn-ghost btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={16} /></button>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Case
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="cases-grid">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : cases.length === 0 ? (
        <div className="empty-state">
          <FolderSearch size={64} />
          <h3>No cases yet</h3>
          <p>Create your first investigation case to get started. All cases require a valid legal basis.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create First Case
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'cases-grid' : 'cases-list'}>
          {cases.map((c, idx) => (
            <div
              key={c.id}
              style={{ animation: `fadeIn 0.3s ease ${idx * 0.05}s both` }}
            >
              <Panel3D
                className="case-card card-clickable"
                glow="white"
                maxAngle={5}
                onClick={() => handleOpenCase(c.id)}
              >
                <div className="case-card-top">
                  <StatusBadge status={c.status} />
                  <span className="text-caption text-mono">{c.id}</span>
                </div>
                <h3 className="case-card-title">{c.title}</h3>
                {c.description && <p className="case-card-desc">{c.description}</p>}
                <div className="case-card-footer">
                  <div className="case-card-stat">
                    <Scale size={12} />
                    <span>{c.legal_basis}</span>
                  </div>
                  <div className="case-card-counts">
                    <span className="case-count"><Users size={12} /> {c.entity_count || 0}</span>
                    <span className="case-count"><GitBranch size={12} /> {c.relationship_count || 0}</span>
                  </div>
                </div>
              </Panel3D>
            </div>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Investigation Case">
        <form onSubmit={handleCreate} className="case-form">
          {formError && <div className="login-error" style={{ marginBottom: 16 }}><span>{formError}</span></div>}

          <div className="login-field">
            <label className="input-label">Case Title *</label>
            <input
              className="input-field"
              placeholder="e.g. Operation Nightfall"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
            />
          </div>

          <div className="login-field">
            <label className="input-label">Description</label>
            <textarea
              className="input-field"
              placeholder="Brief description of the investigation..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="login-field">
            <label className="input-label">
              <Scale size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
              Legal Basis * <span className="text-small">(Non-negotiable)</span>
            </label>
            <input
              className="input-field"
              placeholder="e.g., Warrant #2024-0193, Grand Jury Subpoena..."
              value={formData.legal_basis}
              onChange={e => setFormData({ ...formData, legal_basis: e.target.value })}
              required
              minLength={5}
            />
          </div>

          <div className="login-field">
            <label className="input-label">Status</label>
            <select
              className="input-field"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-md" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={creating}>
              {creating ? <span className="spinner" /> : <><Plus size={16} /> Create Case</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
