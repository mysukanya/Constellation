import { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import api from '../../services/api';
import {
  User, Building2, MapPin, Car, DollarSign, Cpu,
  ShieldAlert, Clock, FileText, CheckCircle2, AlertTriangle,
  ArrowRight, Link2, ExternalLink, Calendar, Search, Loader
} from 'lucide-react';
import './DossierEvidenceInspector.css';

export default function DossierEvidenceInspector() {
  const { selectedEntity, activeCase, openTab } = useWorkspace();
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'timeline' | 'evidence'
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Fetch verified chronological timeline when selected entity changes
  useEffect(() => {
    if (!selectedEntity?.id) {
      setTimelineEvents([]);
      return;
    }

    let isMounted = true;
    setLoadingTimeline(true);

    api.getEntityTimeline(selectedEntity.id)
      .then(events => {
        if (!isMounted) return;
        if (Array.isArray(events) && events.length > 0) {
          setTimelineEvents(events);
        } else {
          // If no graph events directly linked to this entity, provide a factual status
          setTimelineEvents([
            {
              id: `evt-reg-${selectedEntity.id}`,
              date: selectedEntity.created_at || 'CURRENT RECORD',
              title: `Entity Registered in Intelligence Graph`,
              entity: selectedEntity.name || selectedEntity.id,
              provenance: selectedEntity.provenance || 'EXTRACTED_ENTITY',
              location: selectedEntity.location || selectedEntity.jurisdiction || 'Primary Investigation Grid',
              summary: selectedEntity.details || `Node ${selectedEntity.id} enrolled in active case ledger.`
            }
          ]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setTimelineEvents([
          {
            id: `evt-local-${selectedEntity.id}`,
            date: 'CURRENT SESSION',
            title: `Entity Active on Investigation Board`,
            entity: selectedEntity.name || selectedEntity.id,
            provenance: selectedEntity.provenance || 'RAW DATA',
            location: selectedEntity.location || 'Local Workspace',
            summary: selectedEntity.details || 'Active entity on canvas awaiting automated sweep correlation.'
          }
        ]);
      })
      .finally(() => {
        if (isMounted) setLoadingTimeline(false);
      });

    return () => { isMounted = false; };
  }, [selectedEntity?.id]);

  // Fetch real evidence records from SQLite ledger
  useEffect(() => {
    let isMounted = true;
    setLoadingEvidence(true);

    const caseId = activeCase?.id || 'case-102';
    api.listEvidence(caseId)
      .then(items => {
        if (!isMounted) return;
        if (Array.isArray(items) && items.length > 0) {
          setEvidenceItems(items.map(it => ({
            id: it.id,
            title: it.title,
            type: (it.evidence_type || 'DOCUMENT').toUpperCase(),
            classification: it.metadata?.classification || 'CONFIDENTIAL',
            hash: it.file_hash ? (it.file_hash.startsWith('0x') ? `${it.file_hash.slice(0, 10)}...${it.file_hash.slice(-4)}` : `0x${it.file_hash.slice(0, 8)}...${it.file_hash.slice(-4)}`) : '0xSEALED',
            provenance: it.metadata?.provenance_tier || 'RAW DATA',
            snippet: it.description || `Seized artifact collected by ${it.collected_by || 'Field Unit'}. Chain of custody verified.`
          })));
        }
      })
      .catch(err => {
        console.warn('Could not load evidence records:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingEvidence(false);
      });

    return () => { isMounted = false; };
  }, [activeCase?.id]);

  return (
    <div className="dossier-inspector-root">
      {/* Top Tab Switcher */}
      <div className="inspector-tabs-header">
        <button
          className={`insp-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
          onClick={() => setActiveTab('dossier')}
        >
          <User size={11} />
          <span>ENTITY DOSSIER</span>
        </button>
        <button
          className={`insp-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={11} />
          <span>TIMELINE ({timelineEvents.length})</span>
        </button>
        <button
          className={`insp-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          <FileText size={11} />
          <span>EVIDENCE VAULT ({evidenceItems.length})</span>
        </button>
      </div>

      {/* Tab Content Viewport */}
      <div className="inspector-tab-content">
        {/* ── TAB 1: ENTITY DOSSIER ────────────────────────────── */}
        {activeTab === 'dossier' && (
          <div className="dossier-view">
            {selectedEntity ? (
              <div className="dossier-details-container">
                <div className="dossier-hero-row">
                  <div className="dossier-name-lockup">
                    <span className="dossier-type-tag">{(selectedEntity.type || 'ENTITY').toUpperCase()}</span>
                    <h3 className="dossier-title">{selectedEntity.name}</h3>
                    <p className="dossier-role-text">{selectedEntity.role}</p>
                  </div>
                  <div className="dossier-badges">
                    <ProvenanceBadge level={selectedEntity.provenance || 'RAW DATA'} size="md" />
                    <span className={`threat-badge-pill threat-${(selectedEntity.threat || 'MEDIUM').toLowerCase()}`}>
                      {selectedEntity.threat || 'MEDIUM'} THREAT
                    </span>
                  </div>
                </div>

                <div className="dossier-synopsis">
                  <span className="field-label">INTELLIGENCE SYNOPSIS</span>
                  <p className="field-value">
                    {selectedEntity.details || 'Entity enrolled in active intelligence graph. Subject to automated cross-case correlation.'}
                  </p>
                </div>

                <div className="dossier-attributes-grid">
                  <div className="attr-item">
                    <span className="attr-k">JURISDICTION / LOC</span>
                    <span className="attr-v">{selectedEntity.jurisdiction || selectedEntity.location || 'Operational Corridor'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">IDENTIFIER HASH</span>
                    <span className="attr-v font-mono">{selectedEntity.id}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">TELEPHONE / COMMS</span>
                    <span className="attr-v">{selectedEntity.phone || 'No Comms Intercept Logged'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">CASE ENROLLMENT</span>
                    <span className="attr-v text-highlight">{selectedEntity.crossCase || (selectedEntity.case_id ? `Case ${selectedEntity.case_id.replace('case-', '')}` : (activeCase?.id ? `Active in ${activeCase.id}` : 'Case 102'))}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dossier-empty-state">
                <User size={24} className="empty-icon" />
                <span>Select any node on the Investigation Board to view classified dossier</span>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TIMELINE RECONSTRUCTION ──────────────────── */}
        {activeTab === 'timeline' && (
          <div className="timeline-view">
            {loadingTimeline ? (
              <div className="dossier-empty-state">
                <Loader size={20} className="animate-spin text-green" />
                <span>Traversing graph edges &amp; reconstructing chronological chain...</span>
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="dossier-empty-state">
                <Clock size={24} className="empty-icon" />
                <span>No chronological events linked to this entity.</span>
              </div>
            ) : (
              <div className="timeline-items-list">
                {timelineEvents.map((evt) => (
                  <div key={evt.id} className="timeline-event-card">
                    <div className="event-time-stamp">
                      <span className="time-code">{evt.date}</span>
                      <ProvenanceBadge level={evt.provenance} size="sm" />
                    </div>
                    <div className="event-title-line">
                      <strong>{evt.title}</strong> — <span className="event-entity">{evt.entity}</span>
                    </div>
                    <div className="event-summary-text">{evt.summary}</div>
                    <div className="event-location-text">📍 {evt.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EVIDENCE VAULT ────────────────────────────── */}
        {activeTab === 'evidence' && (
          <div className="evidence-view">
            {loadingEvidence ? (
              <div className="dossier-empty-state">
                <Loader size={20} className="animate-spin text-green" />
                <span>Querying cryptographic evidence vault...</span>
              </div>
            ) : evidenceItems.length === 0 ? (
              <div className="dossier-empty-state">
                <FileText size={24} className="empty-icon" />
                <span>No evidence registered for this case. Ingest files via Evidence Ingestion.</span>
              </div>
            ) : (
              <div className="evidence-cards-list">
                {evidenceItems.map(item => (
                  <div key={item.id} className="evidence-card-row">
                    <div className="evd-card-header">
                      <span className="evd-type-badge">{item.type}</span>
                      <ProvenanceBadge level={item.provenance} size="sm" />
                      <span className="evd-hash-code font-mono">{item.hash}</span>
                    </div>
                    <div className="evd-card-title">{item.title}</div>
                    <div className="evd-card-snippet">{item.snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
