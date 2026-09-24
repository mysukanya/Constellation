import logging
from app.db.neo4j_client import graph_client
from app.services.graph_service import graph_service
from app.services.autonomous_research_service import auto_research_service

logger = logging.getLogger("constellation.seed")

async def seed_canonical_intelligence():
    """
    Seeds canonical intelligence for Case 102 (Silver Dune), Case 117, and Case 143.
    Ensures all graph queries, Byomkesh queries, and entity resolution routes
    have rich, authoritative graph entities and relationships.
    """
    try:
        actor_id = "usr_system_seed"

        # 1. Seed Cases
        cases = [
            {
                "id": "case-102",
                "label": "Case",
                "properties": {
                    "id": "case-102",
                    "title": "Case 102 — Silver Dune",
                    "description": "Cross-border maritime narcotics & hawala syndicate spanning Arabian Sea corridors into Gujarat and Mumbai.",
                    "legal_basis": "PMLA Sec 3/4 & NDPS Act Sec 21/29",
                    "status": "active"
                }
            },
            {
                "id": "case-117",
                "label": "Case",
                "properties": {
                    "id": "case-117",
                    "title": "Case 117 — Operation Black Tide",
                    "description": "Inter-state maritime trafficking nexus with deep sea transshipment points.",
                    "legal_basis": "NDPS Act Sec 21/29 & UAPA Sec 15",
                    "status": "active"
                }
            },
            {
                "id": "case-143",
                "label": "Case",
                "properties": {
                    "id": "case-143",
                    "title": "Case 143 — Red Sand Syndicate",
                    "description": "Smuggling & illicit financial settlement network operating via maritime brokers.",
                    "legal_basis": "IPC Sec 370 / Passports Act",
                    "status": "active"
                }
            }
        ]

        for c in cases:
            await graph_client.create_node(
                label=c["label"],
                node_id=c["id"],
                properties=c["properties"],
                case_id=c["id"]
            )

        # 2. Seed Entities for Case 102
        entities = [
            {
                "id": "p-1",
                "label": "Person",
                "properties": {
                    "id": "p-1",
                    "name": "Tariq \"The Anchor\" Merchant",
                    "full_name": "Tariq Merchant",
                    "role": "Syndicate Coordinator",
                    "threat": "CRITICAL",
                    "risk": "Critical",
                    "provenance": "INFERENCE",
                    "phone": "+971-50-882-991",
                    "location": "Dubai / Mumbai",
                    "details": "Identified via wiretap transcript #WT-882 coordinating transshipment logistics off Gujarat coast."
                }
            },
            {
                "id": "p-2",
                "label": "Person",
                "properties": {
                    "id": "p-2",
                    "name": "Rajesh Sharma",
                    "full_name": "Rajesh Sharma",
                    "role": "Charter Broker",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "OBSERVATION",
                    "phone": "+91-98201-9921",
                    "location": "Surat, Gujarat",
                    "details": "Acts as local charter broker facilitating cargo documentation and customs clearance."
                }
            },
            {
                "id": "p-3",
                "label": "Person",
                "properties": {
                    "id": "p-3",
                    "name": "Captain Al-Sayed",
                    "full_name": "Captain Al-Sayed",
                    "role": "Vessel Master (MV Sagar Ratna)",
                    "threat": "MEDIUM",
                    "risk": "Medium",
                    "provenance": "RAW DATA",
                    "phone": "+968-9122-384",
                    "location": "At Sea",
                    "details": "Master of bulk carrier MV Sagar Ratna during suspicious Arabian Sea blackout period."
                }
            },
            {
                "id": "p-4",
                "label": "Person",
                "properties": {
                    "id": "p-4",
                    "name": "Nadia Chen",
                    "full_name": "Nadia Chen",
                    "role": "Financial Broker",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "CORRELATION",
                    "phone": "+852-9102-441",
                    "location": "Hong Kong / Dubai",
                    "details": "Coordinates escrow accounts linked to Al-Barakah shell entities."
                }
            },
            {
                "id": "org-1",
                "label": "Organization",
                "properties": {
                    "id": "org-1",
                    "name": "Al-Barakah Logistics FZE",
                    "full_name": "Al-Barakah Logistics FZE",
                    "role": "Shell Charterer (Dubai)",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "INFERENCE",
                    "jurisdiction": "Dubai, UAE",
                    "address": "JAFZA Zone 4, Dubai",
                    "details": "Incorporated in JAFZA free zone with no verifiable physical warehouse footprint."
                }
            },
            {
                "id": "org-2",
                "label": "Organization",
                "properties": {
                    "id": "org-2",
                    "name": "Vikramaditya Shipping Lines",
                    "full_name": "Vikramaditya Shipping Lines",
                    "role": "Maritime Freight Operator",
                    "threat": "MEDIUM",
                    "risk": "Medium",
                    "provenance": "RAW DATA",
                    "jurisdiction": "Mumbai, India",
                    "address": "Nariman Point, Mumbai",
                    "details": "Domestic shipping operator chartered by Al-Barakah for coastal freight."
                }
            },
            {
                "id": "veh-1",
                "label": "Vehicle",
                "properties": {
                    "id": "veh-1",
                    "name": "MV Sagar Ratna (IMO 921882)",
                    "full_name": "MV Sagar Ratna",
                    "role": "Bulk Cargo Carrier",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "RAW DATA",
                    "flag": "Panama",
                    "details": "AIS transponder deactivated for 31 hours while in international waters off Arabian Sea."
                }
            },
            {
                "id": "fin-1",
                "label": "Financial",
                "properties": {
                    "id": "fin-1",
                    "name": "Hawala Account #88219",
                    "full_name": "Hawala Account #88219",
                    "role": "Illicit Value Transfer Mirror",
                    "threat": "CRITICAL",
                    "risk": "Critical",
                    "provenance": "CORRELATION",
                    "bank": "Emirates National Mirror Ledger",
                    "details": "Structured transfer of ₹14.8 Crore matching narcotics courier payment timestamps."
                }
            },
            {
                "id": "loc-1",
                "label": "Location",
                "properties": {
                    "id": "loc-1",
                    "name": "Port of Kandla (Berth 4)",
                    "full_name": "Port of Kandla (Terminal 4)",
                    "role": "Primary Offloading Site",
                    "threat": "LOW",
                    "risk": "Low",
                    "provenance": "RAW DATA",
                    "country": "India",
                    "details": "Physical maritime berth where nocturnal unmanifested offload was captured on CCTV."
                }
            }
        ]

        for e in entities:
            await graph_client.create_node(
                label=e["label"],
                node_id=e["id"],
                properties=e["properties"],
                case_id="case-102"
            )

        # 3. Seed Relationships for Case 102
        relationships = [
            ("edge-1", "p-1", "org-1", "BENEFICIAL_OWNER", 0.94, ["evd-3"], "Cross-border shell analysis"),
            ("edge-2", "p-1", "p-2", "COMMUNICATES_WITH", 0.88, ["evd-satellite"], "Thuraya phone intercepts"),
            ("edge-3", "org-1", "fin-1", "FUNDS_TRANSFERRED", 0.97, ["evd-wire-ledger"], "SWIFT & ledger audit"),
            ("edge-4", "p-2", "fin-1", "AUTHORIZED_SIGNATORY", 0.91, ["evd-fiu-report"], "Bank signature card match"),
            ("edge-5", "org-1", "veh-1", "CHARTERS_VESSEL", 0.95, ["evd-charter-doc"], "Voyage charter agreement"),
            ("edge-6", "veh-1", "loc-1", "DOCKED_AT", 0.99, ["evd-port-log"], "Port AIS and berth log"),
            ("edge-7", "p-3", "veh-1", "COMMANDS", 0.98, ["evd-crew-manifest"], "Crew manifest verification")
        ]

        for rel_id, src, dst, r_type, conf, sources, method in relationships:
            await graph_client.create_relationship(
                rel_id=rel_id,
                from_id=src,
                to_id=dst,
                rel_type=r_type,
                confidence=conf,
                source_ids=sources,
                method=method,
                created_at="2026-09-23T12:00:00Z"
            )

        # 4. Seed Canonical Hypotheses
        hypotheses = [
            {
                "statement": "Tariq Merchant utilizes Al-Barakah Logistics as an offshore shell to orchestrate Arabian Sea narcotics shipments masked as industrial gypsum.",
                "confidence": 0.89,
                "supporting_evidence_ids": ["evd-1", "evd-3"]
            },
            {
                "statement": "Hawala node #88219 acts as the primary laundering bridge between Dubai export accounts and Surat diamond brokers.",
                "confidence": 0.92,
                "supporting_evidence_ids": ["evd-3"]
            }
        ]

        for h in hypotheses:
            await auto_research_service.create_hypothesis(
                case_id="case-102",
                statement=h["statement"],
                confidence=h["confidence"],
                supporting_evidence_ids=h["supporting_evidence_ids"],
                contradicting_evidence_ids=[],
                actor_id=actor_id
            )

        # 5. Seed Canonical Evidence
        evidence_items = [
            {
                "id": "evd-1",
                "title": "Bill of Lading #BOL-9921-A",
                "description": "Falsified cargo manifest listing industrial gypsum from Port of Fujairah to Kandla.",
                "evidence_type": "document",
                "filename": "BOL-9921-A.pdf",
                "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "file_size": 245192,
                "collected_at": "2026-09-22T08:15:00Z",
                "collected_by": "Customs Inspector D. Roy",
                "case_id": "case-102"
            },
            {
                "id": "evd-2",
                "title": "CCTV Still: Port Gate 3 Nocturnal Offload",
                "description": "High-resolution thermal capture of unmanifested crates transferred to unmarked container truck.",
                "evidence_type": "photo",
                "filename": "CCTV_Gate3_offload_0230hrs.jpg",
                "file_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
                "file_size": 4194304,
                "collected_at": "2026-09-22T21:30:00Z",
                "collected_by": "Berth Security Unit",
                "case_id": "case-102"
            },
            {
                "id": "evd-3",
                "title": "Wire Transfer Ledger (Al-Barakah Logistics)",
                "description": "Encrypted ledger spreadsheet documenting ₹14.8 Crore disbursement matching vessel offload date.",
                "evidence_type": "call_log",
                "filename": "AlBarakah_Settlement_Sep2026.csv",
                "file_hash": "99a7d31f001248c89b210e4a778c8921b3f09812456aaeeff778899001122334",
                "file_size": 18240,
                "collected_at": "2026-09-23T11:00:00Z",
                "collected_by": "FIU-IND Analyst",
                "case_id": "case-102"
            }
        ]

        for ev in evidence_items:
            # Seed to Graph Engine
            await graph_client.create_node(
                label="Evidence",
                node_id=ev["id"],
                properties=ev,
                case_id=ev["case_id"]
            )

        from app.db.sqlite_client import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()

        for ev in evidence_items:
            # Seed to SQLite evidence_records
            cursor.execute("""
                INSERT OR REPLACE INTO evidence_records (id, case_id, filename, file_path, file_hash, file_size, mime_type, collected_at, collected_by, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ev["id"], ev["case_id"], ev["filename"], f"/evidence_store/{ev['filename']}",
                ev["file_hash"], ev["file_size"], "application/pdf" if ev["filename"].endswith(".pdf") else "image/jpeg",
                ev["collected_at"], ev["collected_by"], "{}"
            ))

        # 6. Seed Pending Entity Resolution Matches
        er_matches = [
            (
                "er-match-01", "case-102", "Person", "p-1", "p-ext-901", 0.93,
                3, 0,
                '{"common_tokens": ["Tariq", "Merchant"], "phone_similarity": 0.88, "cross_case": "Case 117 — Operation Black Tide"}',
                "pending", "2026-09-23T14:00:00Z"
            ),
            (
                "er-match-02", "case-102", "Person", "p-2", "p-ext-902", 0.84,
                2, 0,
                '{"common_tokens": ["Rajesh", "Sharma"], "jurisdiction_match": "Surat, Gujarat", "alias": "R. K. Sharma (Customs Broker)"}',
                "pending", "2026-09-23T15:30:00Z"
            )
        ]

        for match in er_matches:
            cursor.execute("""
                INSERT OR REPLACE INTO er_matches (
                    id, case_id, label, entity_a_id, entity_b_id, confidence,
                    supporting_evidence_count, contradicting_evidence_count, comparison_details,
                    status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, match)

        # 7. Seed Canonical Workspaces
        import json
        ws_canvas_102 = json.dumps({
            "nodes": [
                {"id": "p-1", "name": 'Tariq "The Anchor" Merchant', "type": "Person", "role": "Syndicate Coordinator", "threat": "CRITICAL", "x": 80, "y": 80},
                {"id": "p-2", "name": "Rajesh Sharma", "type": "Person", "role": "Charter Broker", "threat": "HIGH", "x": 420, "y": 90},
                {"id": "org-1", "name": "Al-Barakah Logistics FZE", "type": "Organization", "role": "Shell Charterer (Dubai)", "threat": "HIGH", "x": 180, "y": 280},
                {"id": "fin-1", "name": "Hawala Account #88219", "type": "Financial", "role": "₹14.8 Cr Settlement Mirror", "threat": "CRITICAL", "x": 480, "y": 310}
            ],
            "edges": [
                {"id": "edge-1", "source": "p-1", "target": "org-1", "label": "BENEFICIAL_OWNER", "confidence": 0.94},
                {"id": "edge-2", "source": "p-1", "target": "p-2", "label": "COMMUNICATES_WITH", "confidence": 0.88},
                {"id": "edge-3", "source": "org-1", "target": "fin-1", "label": "FUNDS_TRANSFERRED", "confidence": 0.96},
                {"id": "edge-4", "source": "p-2", "target": "fin-1", "label": "AUTHORIZED_SIGNATORY", "confidence": 0.91}
            ]
        })

        cursor.execute("""
            INSERT OR REPLACE INTO workspaces (id, name, case_id, description, canvas_state, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "ws-102", "Silver Dune — Maritime Narcotics & Hawala Board", "case-102",
            "Tracing cross-border lightering off Saurashtra coast and Hawala split mirror accounts.",
            ws_canvas_102, "usr_investigator", "2026-09-23T10:00:00Z", "2026-09-23T12:00:00Z"
        ))

        # 8. Seed Initial Notifications
        notifications = [
            ("notif-1", "all", "12-Hour Autonomous Sweep Completed", "Cross-case analysis identified 3 correlations between Case 102 and Case 117.", "info", 0, "/sweeps", "2026-09-23T08:00:00Z"),
            ("notif-2", "investigator", "Entity Resolution: High-Confidence Match", "Match candidate (93% confidence) between Tariq Merchant and Dubai freezone registry.", "alert", 0, "/er", "2026-09-23T14:05:00Z"),
            ("notif-3", "investigator", "Byomkesh AI Hypothesis Formulated", "New hypothesis generated on Hawala ledger #88219 routing to Surat diamond brokers.", "info", 0, "/workspace", "2026-09-23T16:00:00Z")
        ]

        for n in notifications:
            cursor.execute("""
                INSERT OR REPLACE INTO notifications (id, user_id, title, body, notification_type, is_read, link, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, n)

        conn.commit()
        conn.close()

        logger.info("Successfully seeded canonical intelligence, evidence, ER matches, workspaces, and notifications!")
    except Exception as e:
        logger.error(f"Error seeding canonical intelligence: {e}")
