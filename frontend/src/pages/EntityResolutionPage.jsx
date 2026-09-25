import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitMerge, Check, X, RefreshCw, Users, ArrowRight, Loader, ChevronLeft, ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Panel3D from '../components/Panel3D';
import ConfidenceBar from '../components/ConfidenceBar';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import './EntityResolutionPage.css';

export default function EntityResolutionPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [resolving, setResolving] = useState({});
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMatches(page);
  }, [page]);

  const loadMatches = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await api.getPendingMatches('pending', pageSize, targetPage * pageSize);
      if (Array.isArray(data)) {
        setMatches(data);
        setHasMore(data.length === pageSize);
      } else {
        setMatches([]);
        setHasMore(false);
      }
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (matchId, action) => {
    setResolving(prev => ({ ...prev, [matchId]: action }));
    try {
      await api.resolveMatch(matchId, action);
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(prev => {
        const n = { ...prev };
        delete n[matchId];
        return n;
      });
    }
  };

  const handleSweep = async () => {
    setSweeping(true);
    try {
      await api.triggerErSweep();
      setPage(0);
      await loadMatches(0);
    } catch { /* empty */ }
    finally { setSweeping(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1><GitMerge size={24} style={{ verticalAlign: -4, marginRight: 8, color: 'var(--accent-violet)' }} />Entity Resolution</h1>
            <p>Review potential duplicate entities detected by probabilistic matching</p>
          </div>
          <button className="btn btn-secondary" onClick={handleSweep} disabled={sweeping}>
            {sweeping ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Run ER Sweep
          </button>
        </div>
      </div>

      {loading ? (
        <div className="er-loading">
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16 }} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <GitMerge size={64} />
          <h3>No pending matches</h3>
          <p>All entity resolution candidates have been reviewed. Run a sweep to check for new duplicates.</p>
        </div>
      ) : (
        <div className="er-matches">
          {matches.map((match, idx) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Panel3D className="er-match-card" glow="white" maxAngle={3}>
                <div className="er-match-header">
                  <div className="flex items-center gap-sm">
                    <StatusBadge status={match.status || 'pending'} />
                    <span className="badge badge-violet">{match.label}</span>
                    <span className="text-caption text-mono">{match.id}</span>
                  </div>
                  <ConfidenceBar value={match.confidence} size="sm" />
                </div>

                <div className="er-comparison">
                  {/* Entity A */}
                  <div className="er-entity-card">
                    <div className="er-entity-label">
                      <Users size={14} />
                      <span>Entity A</span>
                      <code className="text-mono">{match.entity_a_id}</code>
                    </div>
                    {match.entity_a_data && (
                      <div className="er-entity-props">
                        {Object.entries(match.entity_a_data).filter(([k]) => !k.startsWith('_') && k !== 'created_at').map(([k, v]) => (
                          <div key={k} className="er-prop">
                            <span className="er-prop-key">{k.replace(/_/g, ' ')}</span>
                            <span className="er-prop-val">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="er-vs">
                    <ArrowRight size={20} />
                    <span className="text-caption">MERGE?</span>
                  </div>

                  {/* Entity B */}
                  <div className="er-entity-card">
                    <div className="er-entity-label">
                      <Users size={14} />
                      <span>Entity B</span>
                      <code className="text-mono">{match.entity_b_id}</code>
                    </div>
                    {match.entity_b_data && (
                      <div className="er-entity-props">
                        {Object.entries(match.entity_b_data).filter(([k]) => !k.startsWith('_') && k !== 'created_at').map(([k, v]) => (
                          <div key={k} className="er-prop">
                            <span className="er-prop-key">{k.replace(/_/g, ' ')}</span>
                            <span className="er-prop-val">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Comparison */}
                {Object.keys(match.comparison_details || {}).length > 0 && (
                  <div className="er-field-compare">
                    <span className="text-caption" style={{ marginBottom: 8, display: 'block' }}>Field Similarity</span>
                    {Object.entries(match.comparison_details).map(([field, detail]) => (
                      <div key={field} className="er-field-row">
                        <span className="er-field-name">{field}</span>
                        <ConfidenceBar value={typeof detail === 'object' ? detail.similarity : detail} size="sm" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="er-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleResolve(match.id, 'confirm')}
                    disabled={!!resolving[match.id]}
                  >
                    {resolving[match.id] === 'confirm' ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
                    Confirm Merge
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleResolve(match.id, 'reject')}
                    disabled={!!resolving[match.id]}
                  >
                    {resolving[match.id] === 'reject' ? <Loader size={14} className="animate-spin" /> : <X size={14} />}
                    Reject — Distinct
                  </button>
                </div>
              </Panel3D>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && (matches.length > 0 || page > 0) && (
        <div className="er-pagination-bar font-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '24px', paddingBottom: '32px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            PAGE {page + 1} {hasMore ? '' : '(FINAL)'}
          </span>

          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
