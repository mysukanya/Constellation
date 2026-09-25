import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  Brain, FileText, CheckCircle2, AlertTriangle, Layers,
  Compass, ShieldCheck, Download, Share2, Printer
} from 'lucide-react';
import './ResearchReportView.css';

export default function ResearchReportView() {
  return (
    <div className="report-view-container">
      {/* Report Header Toolbar */}
      <div className="report-toolbar">
        <div className="report-toolbar-left">
          <Brain size={14} className="text-violet" />
          <span className="report-path font-mono">BYOMKESH / RESEARCH / CASE-102 / 23-SEP-2026-SWEEP</span>
        </div>
        <div className="report-toolbar-right">
          <button className="btn btn-secondary btn-sm" title="Export Formal Dossier">
            <Download size={12} /> Export PDF
          </button>
          <button className="btn btn-secondary btn-sm" title="Share with Prosecution Wing">
            <Share2 size={12} /> Share Dossier
          </button>
        </div>
      </div>

      {/* Main Dossier Document */}
      <div className="report-document-scroll">
        <article className="dossier-paper">
          {/* Header Block */}
          <div className="dossier-title-section">
            <div className="dossier-classification-header">
              <span>SPECIAL INVESTIGATION REPORT // TOP SECRET // STRICT PROVENANCE</span>
              <ProvenanceBadge level="INFERENCE" size="sm" />
            </div>
            <h1 className="dossier-headline">
              Autonomous Sweep Investigation: Al-Barakah Cross-Case Maritime Nexus
            </h1>
            <div className="dossier-meta-line font-mono">
              <span>CASE REF: IND-CID-102</span>
              <span>•</span>
              <span>DATE: 23 SEPT 2026</span>
              <span>•</span>
              <span>RESEARCH ENGINE: BYOMKESH V4.2</span>
              <span>•</span>
              <span>SWEEP DURATION: 18.4s</span>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="dossier-section">
            <h2 className="section-title">1. EXECUTIVE INTELLIGENCE SUMMARY</h2>
            <p className="section-paragraph">
              During the scheduled 12-hour autonomous sweep, Byomkesh discovered an unnotified cross-border transfer nexus linking <strong>Case 102 (Silver Dune)</strong> to <strong>Case 117 (Operation Black Tide)</strong>. Analysis reveals that <strong>Al-Barakah Logistics FZE</strong> (Dubai) operates as an offshore mirror escrow for narcotics consignments landed at Gujarat maritime ports. Beneficial ownership traces back to <strong>Tariq "The Anchor" Merchant</strong> through nominee proxy contracts executed in Panama.
            </p>
          </section>

          {/* Sources Read */}
          <section className="dossier-section">
            <h2 className="section-title">2. PRIMARY SOURCES & EVIDENCE HARVESTED (19 SOURCES)</h2>
            <div className="sources-table-block">
              <div className="src-item">
                <span className="src-type font-mono">OFFICIAL REGISTRY:</span>
                <span className="src-name">Panama Public Registry Remote Incorporation Ledger (Ref #PAN-8819)</span>
                <ProvenanceBadge level="RAW DATA" size="sm" />
              </div>
              <div className="src-item">
                <span className="src-type font-mono">MARITIME AIS:</span>
                <span className="src-name">Lloyd's Intelligence Maritime Transponder Log for MV Sagar Ratna (IMO 921882)</span>
                <ProvenanceBadge level="RAW DATA" size="sm" />
              </div>
              <div className="src-item">
                <span className="src-type font-mono">FINANCIAL:</span>
                <span className="src-name">FIU-IND Suspicious Transaction Report (STR #44091-B) for Hawala Account #88219</span>
                <ProvenanceBadge level="CORRELATION" size="sm" />
              </div>
              <div className="src-item">
                <span className="src-type font-mono">SURVEILLANCE:</span>
                <span className="src-name">Port of Kandla Gate 3 Cargo Inspection CCTV Stream (Camera 04-Night)</span>
                <ProvenanceBadge level="OBSERVATION" size="sm" />
              </div>
            </div>
          </section>

          {/* Key Entities Discovered */}
          <section className="dossier-section">
            <h2 className="section-title">3. IDENTIFIED ENTITIES & RESOLVED IDENTITIES</h2>
            <div className="entities-resolved-grid">
              <div className="resolved-cell">
                <span className="r-label">ENTITY RESOLVED</span>
                <span className="r-name">Tariq Merchant</span>
                <span className="r-res">Splink Resolution Score: 98.4% Match to Target A</span>
              </div>
              <div className="resolved-cell">
                <span className="r-label">SHELL VEHICLE</span>
                <span className="r-name">Al-Barakah Logistics</span>
                <span className="r-res">Zero Warehouse Footprint in JAFZA (Proxy Detected)</span>
              </div>
              <div className="resolved-cell">
                <span className="r-label">CARRIER ASSET</span>
                <span className="r-name">MV Sagar Ratna</span>
                <span className="r-res">Flag: Panama // 31-Hour AIS Dark Period</span>
              </div>
            </div>
          </section>

          {/* Contradictions Detected */}
          <section className="dossier-section">
            <h2 className="section-title text-red">4. CONTRADICTIONS & DISCREPANCIES DETECTED</h2>
            <div className="dossier-contradiction-box">
              <div className="contra-title-row">
                <AlertTriangle size={15} className="text-red" />
                <strong>Timeline Falsification Discrepancy (31-Hour Gap)</strong>
              </div>
              <p>
                ICEGATE customs manifest declares that container C-9921 arrived and was inspected on 21-Sept at 11:30 UTC. However, video surveillance timestamps from Gate 3 clearly confirm the flatbed truck departed port grounds with the sealed container on 20-Sept at 04:15 UTC. Byomkesh concludes the official clearance log was backdated post-departure.
              </p>
            </div>
          </section>

          {/* Unanswered Questions */}
          <section className="dossier-section">
            <h2 className="section-title">5. UNANSWERED INVESTIGATIVE QUESTIONS</h2>
            <ul className="unanswered-list">
              <li>Who authorized the release of Gate 3 barrier at 04:15 UTC without digital customs scan?</li>
              <li>What is the ultimate bank of deposit for the remaining ₹10.0 Crore split withdrawal from Account #88219?</li>
              <li>Did the AIS transponder outage off Gujarat coast involve offshore ship-to-ship transfer with dhow Al-Noor?</li>
            </ul>
          </section>

          {/* Signoff Block */}
          <div className="dossier-signoff-block">
            <div className="signoff-seal font-mono">
              <span>EVIDENCE VERIFICATION: SHA-256 SECURED</span>
              <span>LEDGER STATE: CRYPTOGRAPHICALLY VALIDATED</span>
            </div>
            <div className="signoff-officer">
              <span>Compiled by: Byomkesh Autonomous Engine</span>
              <span>Reviewed by: Intelligence Division Lead</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
