import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import ProvenanceBadge from '../components/desktop/ProvenanceBadge';
import Panel3D from '../components/Panel3D';
import {
  Radio, ShieldAlert, Plus, CheckCircle2, XCircle,
  Eye, Filter, Building2, User, Car, Globe, Cpu, ArrowRight, X, ExternalLink
} from 'lucide-react';
import api from '../services/api';
import './LiveIntelligencePage.css';

export default function LiveIntelligencePage() {
  const { setActiveCaseId, setActiveNavSection, addNodeToCanvas } = useWorkspace();
  const [activeTab, setActiveTab] = useState('FEED'); // 'FEED' | 'WATCHLISTS'
  const [filterSource, setFilterSource] = useState('ALL');
  const [selectedDossier, setSelectedDossier] = useState(null);

  const [signals, setSignals] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntel();
  }, []);

  const loadIntel = async () => {
    setLoading(true);
    try {
      const data = await api.getHomeBriefing();
      const fetchedSignals = (data.live_intelligence || []).map(item => ({
        id: item.id,
        title: item.title,
        source: item.source_name,
        category: (item.source_type || 'GENERAL').toUpperCase(),
        timestamp: new Date(item.detected_at).toLocaleTimeString(),
        provenance: item.status === 'unverified' ? 'RAW DATA' : 'OBSERVATION',
        verified: item.status === 'verified',
        relatedCase: item.relevant_case_ids?.length ? item.relevant_case_ids.join(', ') : 'N/A',
        summary: item.snippet,
        details: { confidence: item.confidence, source_type: item.source_type }
      }));
      setSignals(fetchedSignals);
      setWatchlists([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (id, action) => {
    if (action === 'REVIEW') {
      const sig = signals.find(s => s.id === id);
      if (sig) setSelectedDossier(sig);
      return;
    }
    setSignals(prev => prev.filter(s => s.id !== id));
  };

  const handlePinDossierToCanvas = (sig) => {
    addNodeToCanvas({
      id: `sig-node-${Date.now()}`,
      title: sig.title,
      type: sig.category.toLowerCase(),
      subtitle: sig.source,
      provenance: sig.provenance,
      description: sig.summary,
      confidence: 0.92
    });
    setSelectedDossier(null);
    setActiveCaseId('case-102');
    setActiveNavSection('workspace');
  };

  return (
    <div className="live-intel-container">
      {/* Top Bar with 3D bending */}
      <Panel3D maxAngle={1.5} glow="white" className="live-intel-toolbar-panel3d">
        <div className="live-intel-toolbar">
          <div className="intel-toolbar-left">
            <Radio size={14} className="text-red" />
            <span className="intel-toolbar-title">LIVE INTELLIGENCE STREAM & WATCHLIST MONITOR</span>
            <span className="signals-count">{signals.length} Incoming Signals</span>
          </div>
          <div className="intel-tabs-switch">
            <button
              className={`tab-switch-btn ${activeTab === 'FEED' ? 'active' : ''}`}
              onClick={() => setActiveTab('FEED')}
            >
              INFLUX FEED
            </button>
            <button
              className={`tab-switch-btn ${activeTab === 'WATCHLISTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('WATCHLISTS')}
            >
              WATCHLISTS ({watchlists.length})
            </button>
          </div>
        </div>
      </Panel3D>

      {/* Main Stream Viewport */}
      <div className="live-intel-viewport">
        {activeTab === 'FEED' && (
          <div className="signals-stream-list">
            {loading ? (
              <div className="p-xl text-center text-muted">Scanning for live signals...</div>
            ) : signals.length === 0 ? (
              <div className="p-xl text-center text-muted">
                <Radio size={48} className="mx-auto mb-md opacity-50" />
                <h3>No incoming signals</h3>
                <p>Monitoring gateways are active, but no new intelligence has arrived.</p>
              </div>
            ) : (
              signals.map(sig => (
                <Panel3D key={sig.id} maxAngle={4} glow="white" className="signal-card-panel3d">
                  <div className="signal-intel-card">
                    <div className="sig-header-row">
                      <div className="sig-header-left">
                        <span className="unverified-badge">UNVERIFIED SOURCE</span>
                        <ProvenanceBadge level={sig.provenance} size="sm" />
                        <span className="sig-source font-mono">{sig.source}</span>
                      </div>
                      <span className="sig-timestamp">{sig.timestamp}</span>
                    </div>
  
                    <div className="sig-headline">{sig.title}</div>
                    <p className="sig-summary-text">{sig.summary}</p>
  
                    <div className="sig-footer-row">
                      <span className="sig-related-case text-blue">
                        Related: {sig.relatedCase}
                      </span>
  
                      <div className="sig-actions-group">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAction(sig.id, 'REVIEW')}
                        >
                          <Eye size={11} /> Review Dossier
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            handleAction(sig.id, 'ADD');
                            addNodeToCanvas({
                              id: `sig-${sig.id}`,
                              title: sig.title,
                              type: sig.category.toLowerCase(),
                              subtitle: sig.source,
                              provenance: sig.provenance,
                              description: sig.summary,
                              confidence: 0.88
                            });
                            setActiveCaseId('case-102');
                            setActiveNavSection('workspace');
                          }}
                        >
                          <CheckCircle2 size={11} /> Add to Case 102
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleAction(sig.id, 'IGNORE')}
                        >
                          <XCircle size={11} /> Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                </Panel3D>
              ))
            )}
          </div>
        )}

        {activeTab === 'WATCHLISTS' && (
          <div className="watchlists-grid-view">
            {loading ? (
              <div className="p-xl text-center text-muted">Loading watchlists...</div>
            ) : watchlists.length === 0 ? (
              <div className="p-xl text-center text-muted">
                <ShieldAlert size={48} className="mx-auto mb-md opacity-50" />
                <h3>No active watchlists</h3>
              </div>
            ) : (
              watchlists.map((w, idx) => (
                <Panel3D key={idx} maxAngle={5} glow="white" className="watchlist-card-panel3d">
                  <div className="watchlist-item-card">
                    <div className="w-card-top">
                      <span className="w-type font-mono">{w.type}</span>
                      <span className={`w-threat-pill threat-${w.alertLevel.toLowerCase()}`}>
                        {w.alertLevel}
                      </span>
                    </div>
                    <div className="w-target-name">{w.target}</div>
                    <div className="w-card-footer">
                      <span>{w.hits} Sensor Hits</span>
                      <span>Active: {w.lastActive}</span>
                    </div>
                  </div>
                </Panel3D>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dossier Detail Inspection Modal */}
      {selectedDossier && (
        <div className="modal-backdrop" onClick={() => setSelectedDossier(null)}>
          <div className="dossier-modal-content" onClick={e => e.stopPropagation()}>
            <Panel3D maxAngle={3} glow="white" className="dossier-panel3d">
              <div className="dossier-modal-inner">
                <div className="dossier-modal-header">
                  <div>
                    <div className="flex items-center gap-xs">
                      <ProvenanceBadge level={selectedDossier.provenance} size="sm" />
                      <span className="font-mono text-muted text-xs">{selectedDossier.source}</span>
                    </div>
                    <h2 className="dossier-title">{selectedDossier.title}</h2>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDossier(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="dossier-body">
                  <div className="dossier-section">
                    <span className="dossier-sec-lbl">INTERCEPT SUMMARY</span>
                    <p className="dossier-summary-text">{selectedDossier.summary}</p>
                  </div>

                  {selectedDossier.details && (
                    <div className="dossier-section">
                      <span className="dossier-sec-lbl">TECHNICAL EVIDENCE BREAKDOWN</span>
                      <div className="dossier-specs-grid">
                        {Object.entries(selectedDossier.details).map(([key, val]) => (
                          <div key={key} className="spec-row">
                            <span className="spec-key">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</span>
                            <span className="spec-val font-mono">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="dossier-modal-footer">
                  <button className="btn btn-secondary" onClick={() => setSelectedDossier(null)}>
                    Close Dossier
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePinDossierToCanvas(selectedDossier)}
                  >
                    <Plus size={14} /> Pin to Investigation Canvas
                  </button>
                </div>
              </div>
            </Panel3D>
          </div>
        </div>
      )}
    </div>
  );
}
