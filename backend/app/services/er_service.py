import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
from splink import Linker, SettingsCreator
import splink.comparison_library as cl
from splink.backends.duckdb import DuckDBAPI
from app.db.sqlite_client import get_db_connection
from app.services.graph_service import graph_service
from app.services.audit_service import audit_service

logger = logging.getLogger("constellation.er")

class EntityResolutionService:
    """
    Unsupervised Probabilistic Entity Resolution powered by Splink, DuckDB,
    and the Fellegi-Sunter record linkage methodology.
    
    Hard Rule:
    - NEVER auto-merge entities.
    - Always surface {confidence, supporting_evidence_count, contradicting_evidence_count, comparison_details}
      to the investigator for explicit confirmation.
    """

    def __init__(self):
        self.db_api = DuckDBAPI()

    def _normalize_str(self, val: Optional[str]) -> Optional[str]:
        if val is None:
            return None
        s = str(val).strip()
        return s if s else None

    def _normalize_phone(self, val: Optional[str]) -> Optional[str]:
        if not val:
            return None
        return "".join(c for c in str(val) if c.isdigit() or c == "+")

    def _run_splink_inference(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes genuine Splink + DuckDB Fellegi-Sunter probabilistic comparison.
        """
        df = pd.DataFrame([
            {
                "unique_id": record_a["id"],
                "full_name": record_a.get("full_name"),
                "phone": record_a.get("phone"),
                "email": record_a.get("email"),
                "date_of_birth": record_a.get("date_of_birth")
            },
            {
                "unique_id": record_b["id"],
                "full_name": record_b.get("full_name"),
                "phone": record_b.get("phone"),
                "email": record_b.get("email"),
                "date_of_birth": record_b.get("date_of_birth")
            }
        ])

        settings = SettingsCreator(
            link_type="dedupe_only",
            comparisons=[
                cl.NameComparison("full_name"),
                cl.ExactMatch("phone"),
                cl.ExactMatch("email"),
                cl.ExactMatch("date_of_birth")
            ],
            blocking_rules_to_generate_predictions=["1=1"],
            probability_two_random_records_match=0.1
        )

        import duckdb
        db_api = DuckDBAPI(connection=duckdb.connect())
        linker = Linker(df, settings, db_api)
        predictions = linker.inference.predict()
        df_pred = predictions.as_pandas_dataframe()

        if df_pred.empty:
            return {
                "match_probability": 0.0,
                "match_weight": -20.0,
                "gamma_full_name": -1,
                "gamma_phone": -1,
                "gamma_email": -1,
                "gamma_date_of_birth": -1
            }

        row = df_pred.iloc[0]
        return {
            "match_probability": float(row.get("match_probability", 0.0)),
            "match_weight": float(row.get("match_weight", 0.0)),
            "gamma_full_name": int(row.get("gamma_full_name", -1)),
            "gamma_phone": int(row.get("gamma_phone", -1)),
            "gamma_email": int(row.get("gamma_email", -1)),
            "gamma_date_of_birth": int(row.get("gamma_date_of_birth", -1))
        }

    async def evaluate_candidate_pair(
        self,
        new_entity: Dict[str, Any],
        existing_entity: Dict[str, Any],
        case_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates a pair of entities using Splink + Fellegi-Sunter methodology.
        Returns match dict if match confidence >= 0.40.
        """
        props_a = new_entity.get("properties", {})
        props_b = existing_entity.get("properties", {})

        id_a = new_entity.get("id") or str(uuid.uuid4())
        id_b = existing_entity.get("id") or str(uuid.uuid4())

        name_a = self._normalize_str(props_a.get("full_name") or props_a.get("name"))
        name_b = self._normalize_str(props_b.get("full_name") or props_b.get("name"))
        phone_a = self._normalize_phone(props_a.get("phone"))
        phone_b = self._normalize_phone(props_b.get("phone"))
        email_a = self._normalize_str(props_a.get("email"))
        email_b = self._normalize_str(props_b.get("email"))
        dob_a = self._normalize_str(props_a.get("date_of_birth"))
        dob_b = self._normalize_str(props_b.get("date_of_birth"))

        rec_a = {"id": id_a, "full_name": name_a, "phone": phone_a, "email": email_a, "date_of_birth": dob_a}
        rec_b = {"id": id_b, "full_name": name_b, "phone": phone_b, "email": email_b, "date_of_birth": dob_b}

        # Check alias overlap
        aliases_a = set(props_a.get("aliases", []))
        aliases_b = set(props_b.get("aliases", []))
        alias_overlap = bool(
            aliases_a.intersection(aliases_b)
            or (name_a and name_a in aliases_b)
            or (name_b and name_b in aliases_a)
        )

        splink_res = self._run_splink_inference(rec_a, rec_b)
        splink_prob = splink_res["match_probability"]
        splink_weight = splink_res["match_weight"]

        # Build comparison details & evidence counts
        supporting_evidence = 0
        contradicting_evidence = 0
        comparison_details: Dict[str, Any] = {}

        # Name comparison details
        gamma_name = splink_res["gamma_full_name"]
        if gamma_name >= 2:
            name_sim = 1.0
            supporting_evidence += 2
        elif gamma_name == 1:
            name_sim = 0.88
            supporting_evidence += 1
        elif gamma_name == 0:
            name_sim = 0.20
            contradicting_evidence += 1
        else:
            name_sim = 0.0

        if alias_overlap:
            name_sim = max(name_sim, 0.95)
            supporting_evidence += 2

        comparison_details["full_name"] = {
            "similarity": round(name_sim, 3),
            "value_a": name_a,
            "value_b": name_b,
            "gamma": gamma_name,
            "method": "splink_name_comparison"
        }

        # Phone comparison details
        if phone_a and phone_b:
            phone_match = phone_a == phone_b
            comparison_details["phone"] = {
                "similarity": 1.0 if phone_match else 0.0,
                "match": phone_match,
                "value_a": phone_a,
                "value_b": phone_b,
                "gamma": splink_res["gamma_phone"]
            }
            if phone_match:
                supporting_evidence += 3
            else:
                contradicting_evidence += 1

        # Email comparison details
        if email_a and email_b:
            email_match = email_a.lower() == email_b.lower()
            comparison_details["email"] = {
                "similarity": 1.0 if email_match else 0.0,
                "match": email_match,
                "value_a": email_a,
                "value_b": email_b,
                "gamma": splink_res["gamma_email"]
            }
            if email_match:
                supporting_evidence += 3
            else:
                contradicting_evidence += 1

        # DOB comparison details
        if dob_a and dob_b:
            dob_match = dob_a == dob_b
            comparison_details["date_of_birth"] = {
                "similarity": 1.0 if dob_match else 0.0,
                "match": dob_match,
                "value_a": dob_a,
                "value_b": dob_b,
                "gamma": splink_res["gamma_date_of_birth"]
            }
            if dob_match:
                supporting_evidence += 2
            else:
                contradicting_evidence += 1

        comparison_details["splink_fellegi_sunter"] = {
            "engine": "Splink 4 (DuckDB)",
            "match_probability": round(splink_prob, 4),
            "match_weight": round(splink_weight, 3),
            "algorithm": "Fellegi-Sunter Record Linkage"
        }

        # Overall confidence score
        confidence = splink_prob
        if gamma_name >= 2 and contradicting_evidence == 0 and confidence < 0.65:
            # Exact name agreement with unobserved secondary fields is a valid candidate for review
            confidence = max(confidence, 0.65)
        if alias_overlap and confidence < 0.85:
            confidence = max(confidence, 0.85)
            supporting_evidence = max(supporting_evidence, 2)

        # Confidence rounding
        confidence = round(max(0.0, min(0.99, confidence)), 3)

        if confidence < 0.40 and not alias_overlap:
            return None

        match_id = f"erm_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        match_record = {
            "id": match_id,
            "case_id": case_id,
            "label": new_entity.get("label", "Person"),
            "entity_a_id": id_a,
            "entity_b_id": id_b,
            "confidence": confidence,
            "supporting_evidence_count": supporting_evidence,
            "contradicting_evidence_count": contradicting_evidence,
            "comparison_details": comparison_details,
            "status": "pending",
            "created_at": now
        }

        # Persist to SQLite match queue
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO er_matches (
                id, case_id, label, entity_a_id, entity_b_id,
                confidence, supporting_evidence_count, contradicting_evidence_count,
                comparison_details, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            match_id, case_id, match_record["label"],
            match_record["entity_a_id"], match_record["entity_b_id"],
            confidence, supporting_evidence, contradicting_evidence,
            json.dumps(comparison_details), "pending", now
        ))
        conn.commit()
        conn.close()

        return match_record

    async def run_resolution_for_entity(self, entity_id: str, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        current_entity = await graph_service.get_node(entity_id)
        if not current_entity:
            return []

        label = current_entity.get("label", "Person")
        existing_nodes = await graph_service.list_nodes(label=label, case_id=case_id)

        discovered_matches = []
        for other in existing_nodes:
            if other["id"] == entity_id:
                continue

            if self._has_existing_decision(entity_id, other["id"]):
                continue

            match = await self.evaluate_candidate_pair(current_entity, other, case_id=case_id)
            if match:
                discovered_matches.append(match)

        return discovered_matches

    async def run_full_er_sweep(self, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        all_persons = await graph_service.list_nodes(label="Person", case_id=case_id)
        new_matches = []
        for i in range(len(all_persons)):
            for j in range(i + 1, len(all_persons)):
                p1 = all_persons[i]
                p2 = all_persons[j]
                if self._has_existing_decision(p1["id"], p2["id"]):
                    continue
                match = await self.evaluate_candidate_pair(p1, p2, case_id=case_id)
                if match:
                    new_matches.append(match)
        return new_matches

    def _has_existing_decision(self, id1: str, id2: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id FROM er_matches
            WHERE (entity_a_id = ? AND entity_b_id = ?)
               OR (entity_a_id = ? AND entity_b_id = ?)
        """, (id1, id2, id2, id1))
        row = cursor.fetchone()
        conn.close()
        return row is not None

    async def get_pending_matches(self, case_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if case_id:
            cursor.execute("SELECT * FROM er_matches WHERE case_id = ? AND status = 'pending' ORDER BY confidence DESC LIMIT ? OFFSET ?", (case_id, limit, offset))
        else:
            cursor.execute("SELECT * FROM er_matches WHERE status = 'pending' ORDER BY confidence DESC LIMIT ? OFFSET ?", (limit, offset))
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            node_a = await graph_service.get_node(r["entity_a_id"])
            node_b = await graph_service.get_node(r["entity_b_id"])
            results.append({
                "id": r["id"],
                "case_id": r["case_id"],
                "label": r["label"],
                "entity_a_id": r["entity_a_id"],
                "entity_b_id": r["entity_b_id"],
                "entity_a_data": node_a,
                "entity_b_data": node_b,
                "confidence": r["confidence"],
                "supporting_evidence_count": r["supporting_evidence_count"],
                "contradicting_evidence_count": r["contradicting_evidence_count"],
                "comparison_details": json.loads(r["comparison_details"]),
                "status": r["status"],
                "created_at": r["created_at"]
            })
        return results

    async def resolve_match(self, match_id: str, action: str, actor_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM er_matches WHERE id = ?", (match_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise ValueError(f"Match {match_id} not found")

        now = datetime.now(timezone.utc).isoformat()
        db_status = "confirmed" if action in ("confirm", "confirmed") else "rejected"
        cursor.execute("""
            UPDATE er_matches
            SET status = ?, reviewed_at = ?, reviewer_id = ?
            WHERE id = ?
        """, (db_status, now, actor_id, match_id))
        conn.commit()
        conn.close()

        # Audit decision
        audit_service.log_event(
            event_type=f"ER_MATCH_{db_status.upper()}",
            actor_id=actor_id,
            target_id=match_id,
            payload={
                "match_id": match_id,
                "entity_a_id": row["entity_a_id"],
                "entity_b_id": row["entity_b_id"],
                "action": action,
                "status": db_status,
                "notes": notes
            }
        )

        merge_result = None
        if db_status == "confirmed":
            merge_result = await graph_service.merge_entities(
                keep_id=row["entity_a_id"],
                drop_id=row["entity_b_id"],
                actor_id=actor_id,
                notes=notes
            )

        return {
            "match_id": match_id,
            "action": action,
            "status": db_status,
            "merge_result": merge_result
        }

er_service = EntityResolutionService()
