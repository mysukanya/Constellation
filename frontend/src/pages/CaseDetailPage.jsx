import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  ArrowLeft, Network, Users, FileText, Lightbulb, ShieldCheck,
  Scale, Hash, Clock, ChevronRight, Swords
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Panel3D from '../components/Panel3D';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBar from '../components/ConfidenceBar';
import GraphViewer from '../components/GraphViewer';
import api from '../services/api';
import './CaseDetailPage.css';

const TABS = [
  { id: 'graph',      label: 'Graph View',   icon: Network },
  { id: 'entities',   label: 'Entities',     icon: Users },
  { id: 'evidence',   label: 'Evidence',     icon: FileText },
  { id: 'hypotheses', label: 'Hypotheses',   icon: Lightbulb },
  { id: 'audit',      label: 'Audit Trail',  icon: ShieldCheck },
];

export default function CaseDetailPage() {
  const { activeCaseId, setActiveNavSection } = useWorkspace();
  const caseId = activeCaseId;
  const [caseData, setCaseData] = useState(null);
  const [subgraph, setSubgraph] = useState(null);
  const [entities, setEntities] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [hypotheses, setHypotheses] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('graph');
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const [c, sg] = await Promise.all([
        api.getCase(caseId),
        api.getCaseSubgraph(caseId),
      ]);
      setCaseData(c);
      setSubgraph(sg);

      // Load additional data in background
      Promise.all([
        api.listEntities('Person', caseId).catch(() => []),
        api.listEvidence(caseId).catch(() => []),
        api.listHypotheses(caseId).catch(() => []),
        api.getRecentAudit(20).catch(() => []),
      ]).then(([ent, evi, hyp, aud]) => {
        setEntities(ent);
        setEvidence(evi);
        setHypotheses(hyp);
        setAuditEvents(aud);
      });
    } catch (err) {
      console.error('Failed to load case:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 500 }} />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Case not found</h3>
          <button className="btn btn-primary" onClick={() => setActiveNavSection('cases')}>Back to Cases</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container case-detail">
      {/* Back + Header */}
      <div
        className="case-detail-header"
        style={{ animation: 'fadeIn 0.3s ease' }}
      >
        <button className="btn btn-ghost btn-sm" onClick={() => setActiveNavSection('cases')}>
          <ArrowLeft size={16} /> All Cases
        </button>
        <div className="case-detail-title-row">
          <div>
            <h1>{caseData.title}</h1>
            {caseData.description && <p className="case-detail-desc">{caseData.description}</p>}
          </div>
          <StatusBadge status={caseData.status} />
        </div>
        <div className="case-detail-meta">
          <span className="meta-item"><Scale size={12} /> {caseData.legal_basis}</span>
          <span className="meta-item"><Hash size={12} /> <code>{caseData.id}</code></span>
          <span className="meta-item"><Users size={12} /> {caseData.entity_count} entities</span>
          <span className="meta-item"><Network size={12} /> {caseData.relationship_count} relationships</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        key={activeTab}
        style={{ animation: 'fadeIn 0.25s ease' }}
      >
        {/* GRAPH */}
        {activeTab === 'graph' && (
          <div className="graph-tab">
            <GraphViewer
              data={subgraph}
              onNodeClick={node => setSelectedNode(node)}
              style={{ height: 550 }}
            />
            {selectedNode && (
              <Panel3D className="node-detail-panel animate-slideInLeft" glow="white" maxAngle={4}>
                <h3 style={{ marginBottom: 12 }}>
                  <span className="badge badge-cyan" style={{ marginRight: 8 }}>{selectedNode.nodeType}</span>
                  {selectedNode.fullLabel}
                </h3>
                <div className="node-props">
                  {Object.entries(selectedNode.properties || {}).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                    <div key={k} className="node-prop-row">
                      <span className="node-prop-key">{k.replace(/_/g, ' ')}</span>
                      <span className="node-prop-value">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setSelectedNode(null)}>Close</button>
              </Panel3D>
            )}
          </div>
        )}

        {/* ENTITIES */}
        {activeTab === 'entities' && (
          <div className="entities-tab">
            {entities.length === 0 ? (
              <div className="empty-state"><Users size={48} /><h3>No entities</h3><p>Upload documents or create entities to populate this case.</p></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Type</th><th>Name</th><th>Created</th><th></th></tr></thead>
                  <tbody>
                    {entities.map(e => (
                      <tr key={e.id}>
                        <td><code className="text-mono" style={{ fontSize: '0.75rem' }}>{e.id}</code></td>
                        <td><StatusBadge status={e.label === 'Person' ? 'active' : 'pending'} label={e.label} size="sm" /></td>
                        <td style={{ fontWeight: 500 }}>{e.properties?.full_name || e.properties?.title || e.id}</td>
                        <td className="text-small">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}</td>
                        <td><ChevronRight size={14} style={{ color: 'var(--text-muted)' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="evidence-tab">
            {evidence.length === 0 ? (
              <div className="empty-state"><FileText size={48} /><h3>No evidence</h3><p>Upload PDFs, CSVs, or media to add evidence to this case.</p></div>
            ) : (
              <div className="evidence-grid">
                {evidence.map(ev => (
                  <Panel3D key={ev.id} className="evidence-card" glow="white" maxAngle={5}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <span className="badge badge-emerald">{ev.evidence_type}</span>
                      <span className="text-caption">{ev.filename || '—'}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{ev.title}</h4>
                    {ev.description && <p className="text-small" style={{ marginBottom: 8 }}>{ev.description}</p>}
                    <div className="evidence-hash">
                      <Hash size={10} />
                      <code>{ev.file_hash?.slice(0, 16)}…</code>
                    </div>
                  </Panel3D>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HYPOTHESES */}
        {activeTab === 'hypotheses' && (
          <div className="hypotheses-tab">
            {hypotheses.length === 0 ? (
              <div className="empty-state"><Lightbulb size={48} /><h3>No hypotheses</h3><p>Run Byomkesh auto-research or create hypotheses manually.</p></div>
            ) : (
              <div className="hypothesis-list">
                {hypotheses.map(h => (
                  <Panel3D key={h.id} className="hypothesis-card" glow="white" maxAngle={5}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <StatusBadge status={h.status || 'unverified'} />
                      <span className="text-caption text-mono">{h.id}</span>
                    </div>
                    <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: 12 }}>{h.statement}</p>
                    <ConfidenceBar value={h.confidence || 0.5} />
                    <div className="flex items-center gap-sm" style={{ marginTop: 12 }}>
                      <span className="text-small">{(h.supporting_evidence_ids || []).length} supporting</span>
                      <span className="text-small" style={{ color: 'var(--accent-rose)' }}>{(h.contradicting_evidence_ids || []).length} contradicting</span>
                    </div>
                  </Panel3D>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT */}
        {activeTab === 'audit' && (
          <div className="audit-tab">
            {auditEvents.length === 0 ? (
              <div className="empty-state"><ShieldCheck size={48} /><h3>No audit events</h3><p>Audit trail entries will appear as actions are taken on this case.</p></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>#</th><th>Event</th><th>Actor</th><th>Target</th><th>HMAC</th><th>Time</th></tr></thead>
                  <tbody>
                    {auditEvents.map(ev => (
                      <tr key={ev.sequence_number}>
                        <td className="text-mono" style={{ fontSize: '0.75rem' }}>{ev.sequence_number}</td>
                        <td><span className="badge badge-cyan">{ev.event_type}</span></td>
                        <td className="text-small">{ev.actor_id}</td>
                        <td className="text-small text-mono">{ev.target_id?.slice(0, 20)}</td>
                        <td><code className="text-mono" style={{ fontSize: '0.6875rem', color: 'var(--accent-emerald)' }}>{ev.hmac?.slice(0, 12)}…</code></td>
                        <td className="text-small">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
