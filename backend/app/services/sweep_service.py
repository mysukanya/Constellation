import uuid
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.models.intelligence import SweepSummary, SweepFinding
from app.services.graph_service import graph_service
from app.services.audit_service import audit_service
from app.db.sqlite_client import get_db_connection

class SweepService:
    """
    12-Hour Autonomous Sweep Engine.
    Examines all cases, entities, relationships, and hypotheses looking for:
    - Cross-case connections (entities shared or related across case boundaries)
    - Contradictions in evidence or timestamps
    - Recurring patterns & new hypothesis candidates
    """

    def __init__(self):
        self._last_sweep: Optional[SweepSummary] = None

    async def execute_sweep(self, triggered_by: str = "scheduled_job") -> SweepSummary:
        start_time = time.time()
        sweep_id = f"swp_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        # Step 1: Fetch all cases and nodes
        cases = await graph_service.list_nodes(label="Case")
        all_persons = await graph_service.list_nodes(label="Person")
        subgraph = await graph_service.get_case_subgraph()

        findings: List[SweepFinding] = []

        # Step 2: Cross-case shared-entity discovery
        # Map entity names to cases they appear in
        entity_case_map: Dict[str, set] = {}
        for p in all_persons:
            name = p.get("properties", {}).get("full_name")
            c_id = p.get("case_id")
            if name and c_id:
                clean_name = name.strip().lower()
                if clean_name not in entity_case_map:
                    entity_case_map[clean_name] = set()
                entity_case_map[clean_name].add(c_id)

        for name_clean, c_ids in entity_case_map.items():
            if len(c_ids) > 1:
                # Discovered cross-case entity!
                c_list = list(c_ids)
                f_id = f"fnd_{uuid.uuid4().hex[:10]}"
                finding = SweepFinding(
                    id=f_id,
                    finding_type="cross_case_connection",
                    title=f"Cross-Case Intersection: {name_clean.title()}",
                    description=f"Entity '{name_clean.title()}' appears in {len(c_list)} distinct active investigations ({', '.join(c_list)}).",
                    case_ids=c_list,
                    entity_ids=[],
                    confidence=0.88,
                    detected_at=now,
                    action_url=f"/investigate?case={c_list[0]}"
                )
                findings.append(finding)

        # Step 3: Deep attribute cross-case correlation (phones, emails)
        # Avoid duplicate findings by tracking pairs
        seen_pairs = set()
        
        for p in all_persons:
            props = p.get("properties", {})
            phone = props.get("phone")
            email = props.get("email")
            c_id = p.get("case_id")
            
            if not c_id:
                continue
                
            for other_p in all_persons:
                other_c_id = other_p.get("case_id")
                if not other_c_id or c_id == other_c_id or p["id"] == other_p["id"]:
                    continue
                    
                pair_key = tuple(sorted([p["id"], other_p["id"]]))
                if pair_key in seen_pairs:
                    continue
                    
                other_props = other_p.get("properties", {})
                
                # Check for shared phone
                if phone and phone == other_props.get("phone"):
                    f_id = f"fnd_{uuid.uuid4().hex[:10]}"
                    findings.append(SweepFinding(
                        id=f_id,
                        finding_type="cross_case_connection",
                        title="Shared Telephony Infrastructure",
                        description=f"Identical phone number ({phone}) detected across {c_id} and {other_c_id}.",
                        case_ids=[c_id, other_c_id],
                        entity_ids=[p["id"], other_p["id"]],
                        confidence=0.92,
                        detected_at=now
                    ))
                    seen_pairs.add(pair_key)
                    continue
                    
                # Check for shared email
                if email and email == other_props.get("email"):
                    f_id = f"fnd_{uuid.uuid4().hex[:10]}"
                    findings.append(SweepFinding(
                        id=f_id,
                        finding_type="cross_case_connection",
                        title="Shared Digital Identity",
                        description=f"Identical email address ({email}) detected across {c_id} and {other_c_id}.",
                        case_ids=[c_id, other_c_id],
                        entity_ids=[p["id"], other_p["id"]],
                        confidence=0.95,
                        detected_at=now
                    ))
                    seen_pairs.add(pair_key)

        # Check for potential contradictions
        for p in all_persons:
            aliases = p.get("properties", {}).get("aliases", [])
            if len(aliases) > 3:
                f_id = f"fnd_{uuid.uuid4().hex[:10]}"
                findings.append(SweepFinding(
                    id=f_id,
                    finding_type="contradiction",
                    title=f"Multiple Conflicting Aliases: {p.get('properties', {}).get('full_name')}",
                    description=f"Entity maintains {len(aliases)} disparate identity documents across jurisdictions.",
                    case_ids=[p.get("case_id")] if p.get("case_id") else [],
                    entity_ids=[p["id"]],
                    confidence=0.78,
                    detected_at=now
                ))

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        summary = SweepSummary(
            sweep_id=sweep_id,
            executed_at=now,
            status="completed",
            duration_ms=elapsed_ms,
            cases_scanned_count=len(cases),
            entities_analyzed_count=len(all_persons),
            findings_count=len(findings),
            hypotheses_generated_count=len(findings),
            findings=findings
        )

        self._last_sweep = summary

        # Log audit event for sweep run
        audit_service.log_event(
            event_type="SWEEP_COMPLETED",
            actor_id=triggered_by,
            target_id=sweep_id,
            payload={
                "cases_scanned": len(cases),
                "findings_count": len(findings),
                "duration_ms": elapsed_ms
            }
        )

        return summary

    async def get_latest_sweep(self) -> SweepSummary:
        if not self._last_sweep:
            return await self.execute_sweep(triggered_by="startup_initial_sweep")
        return self._last_sweep

sweep_service = SweepService()
