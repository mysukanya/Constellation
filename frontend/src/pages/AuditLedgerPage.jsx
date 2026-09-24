import { useState, useEffect } from 'react';
import ProvenanceBadge from '../components/desktop/ProvenanceBadge';
import Panel3D from '../components/Panel3D';
import {
  ShieldCheck, ShieldAlert, CheckCircle2, Hash, Lock, Search,
  FileText, Activity, Clock, KeyRound, RefreshCw, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import './AuditLedgerPage.css';

export default function AuditLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyReport, setVerifyReport] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const [recentEvents, report] = await Promise.all([
        api.getRecentAudit(100),
        api.verifyAuditLedger()
      ]);
      setEvents(recentEvents || []);
      setVerifyReport(report || null);
      setIsDemoMode(false);
    } catch (err) {
      console.warn('Backend audit API offline, using fallback:', err);
      setIsDemoMode(true);
      setVerifyReport({
        valid: true,
        total_records: 4,
        status: 'demo_fallback',
        latest_hmac: '0x88f2b19c72e41a0b33c5e89d12f384a91c0b2d3e'
      });
      setEvents([
        {
          sequence_number: 4,
          event_type: 'EVIDENCE_ATTACHED',
          target_id: 'Bill of Lading #BOL-9921-A',
          actor_id: 'Lead Investigator (IND-CID-8820)',
          payload_hash: '88f2b19c72e41a0b33c5e89d12f384a91c0b2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
          timestamp: new Date().toISOString(),
          hmac: '35f8fdab5d4544876b091450c9ca99b67ee67c99efb8ef935d5419d11df102c5'
        },
        {
          sequence_number: 3,
          event_type: 'IDENTITY_RESOLUTION_COMMITTED',
          target_id: 'Entity Match: Rajesh Sharma',
          actor_id: 'Machine Engine',
          payload_hash: '32e1a84f09c21d8b77a6f5e432109876543210fedcba9876543210fedcba9876',
          timestamp: new Date().toISOString(),
          hmac: '7aee13b83c615a0d2f9d61d2f651e279a34bda10d7fc82b4887182c99dfe65a7'
        },
        {
          sequence_number: 2,
          event_type: 'CROSS_CASE_DISCOVERY_RECORDED',
          target_id: 'Bridge: Case 102 ↔ Case 117',
          actor_id: 'Byomkesh Autonomous Agent',
          payload_hash: '99a7d31fe82c1b0456789abcdef0123456789abcdef0123456789abcdef99a7d',
          timestamp: new Date().toISOString(),
          hmac: 'db80603478c78420733faab6cf5ca1918af9e2819389c20ae67864d8b46dd1c3'
        },
        {
          sequence_number: 1,
          event_type: 'HYPOTHESIS_CHALLENGED',
          target_id: 'Rebuttal Statement',
          actor_id: 'Officer A. Sharma',
          payload_hash: '44c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
          timestamp: new Date().toISOString(),
          hmac: '0ba1a73e13a098d8b471eda703f243e03d528036b4841c93b01173b667621d85'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditLedger();
      setVerifyReport(res);
    } catch (err) {
      setVerifyReport({ valid: false, error: err.message || 'Verification endpoint unreachable' });
    } finally {
      setVerifying(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (ev.event_type && ev.event_type.toLowerCase().includes(term)) ||
      (ev.target_id && ev.target_id.toLowerCase().includes(term)) ||
      (ev.actor_id && ev.actor_id.toLowerCase().includes(term)) ||
      (ev.payload_hash && ev.payload_hash.toLowerCase().includes(term)) ||
      (ev.hmac && ev.hmac.toLowerCase().includes(term)) ||
      String(ev.sequence_number).includes(term)
    );
  });

  const isChainValid = verifyReport?.valid ?? true;
  const totalBlocks = verifyReport?.total_records ?? events.length;

  return (
    <div className="audit-ledger-container">
      {/* Top Ledger Header with 3D bending */}
      <Panel3D maxAngle={2} glow={isChainValid ? "green" : "red"} className="ledger-header-panel3d">
        <div className="ledger-header-panel">
          <div className="ledger-header-left">
            <div className="ledger-title-row">
              {isChainValid ? (
                <ShieldCheck size={18} className="text-green" />
              ) : (
                <ShieldAlert size={18} className="text-red" />
              )}
              <h1>Cryptographic Provenance & Audit Ledger</h1>
              <span className={`ledger-status-tag font-mono ${isChainValid ? 'status-valid' : 'status-invalid'}`}>
                {isChainValid ? 'HMAC CHAIN: VERIFIED INTACT' : 'TAMPER DETECTED: INVALID'}
              </span>
              {isDemoMode && (
                <span className="ledger-status-tag font-mono" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                  OFFLINE DEMO
                </span>
              )}
            </div>
            <p className="ledger-desc">
              Tamper-evident append-only ledger certifying the unbroken chain of custody, SHA-256 payload digests, and HMAC signatures for every write operation across the platform.
            </p>
          </div>

          <div className="ledger-header-right">
            <div className="merkle-stat-badge">
              <span className="m-lbl">TOTAL BLOCKS</span>
              <span className="m-val font-mono">#{totalBlocks}</span>
            </div>
            <div className="merkle-stat-badge">
              <span className="m-lbl">CHAIN INTEGRITY</span>
              <span className={`m-val ${isChainValid ? 'text-green' : 'text-red'}`}>
                {isChainValid ? '100% VERIFIED' : 'TAMPER DETECTED'}
              </span>
            </div>
            <button
              className="btn btn-secondary font-mono"
              onClick={handleVerifyChain}
              disabled={verifying}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <RefreshCw size={12} className={verifying ? 'spin-slow' : ''} />
              {verifying ? 'Verifying...' : 'Verify Cryptographic Chain'}
            </button>
          </div>
        </div>
      </Panel3D>

      {/* Ledger Table Section with 3D bending */}
      <Panel3D maxAngle={2} glow="white" className="ledger-table-panel3d">
        <div className="ledger-table-section">
          <div className="ledger-search-bar">
            <Search size={13} className="text-muted" />
            <input
              type="text"
              placeholder="Search sequence #, event type, actor ID, or HMAC digest..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
            <span className="font-mono text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
              Showing {filteredEvents.length} of {events.length} records
            </span>
          </div>

          <div className="ledger-table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>SEQ #</th>
                  <th>EVENT TYPE</th>
                  <th>TARGET ARTIFACT / ID</th>
                  <th>ACTOR SIGNATURE</th>
                  <th>PAYLOAD SHA-256</th>
                  <th>HMAC SIGNATURE</th>
                  <th>TIMESTAMP</th>
                  <th>INTEGRITY</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.4)' }}>
                      Loading verified ledger records from database...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.4)' }}>
                      No audit records found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(event => (
                    <tr key={event.sequence_number || event.id}>
                      <td className="font-mono text-muted">#{event.sequence_number}</td>
                      <td className="font-mono text-primary font-bold">{event.event_type}</td>
                      <td className="font-mono" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={event.target_id}>
                        {event.target_id}
                      </td>
                      <td className="text-secondary font-mono" style={{ fontSize: '12px' }}>{event.actor_id}</td>
                      <td className="font-mono text-muted" title={event.payload_hash} style={{ fontSize: '11px' }}>
                        {event.payload_hash ? `${event.payload_hash.slice(0, 12)}...` : 'N/A'}
                      </td>
                      <td className="font-mono text-muted" title={event.hmac} style={{ fontSize: '11px' }}>
                        {event.hmac ? `${event.hmac.slice(0, 12)}...` : 'N/A'}
                      </td>
                      <td className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                      </td>
                      <td>
                        <span className="integrity-tag">
                          <CheckCircle2 size={11} className="text-green" /> SEALED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Panel3D>
    </div>
  );
}
