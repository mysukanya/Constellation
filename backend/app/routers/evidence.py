from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.evidence import EvidenceResponse, EvidenceCreate
from app.models.auth import UserResponse
from app.dependencies import get_current_user
from app.services.graph_service import graph_service
from app.db.sqlite_client import get_db_connection

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("", response_model=List[EvidenceResponse])
async def list_evidence(
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    nodes = await graph_service.list_nodes(label="Evidence", case_id=case_id)
    results = []
    for n in nodes:
        props = n.get("properties", {})
        results.append(EvidenceResponse(
            id=n["id"],
            case_id=n.get("case_id") or props.get("case_id", ""),
            title=props.get("title", n["id"]),
            evidence_type=props.get("evidence_type", "document"),
            description=props.get("description", ""),
            collected_at=props.get("collected_at", ""),
            collected_by=props.get("collected_by", ""),
            filename=props.get("filename"),
            file_hash=props.get("file_hash", "0" * 64),
            file_size=props.get("file_size"),
            chain_of_custody_hash=props.get("chain_of_custody_hash"),
            created_at=props.get("created_at", ""),
            metadata=props
        ))
    return results

@router.post("", response_model=EvidenceResponse)
async def create_evidence(
    ev_in: EvidenceCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    import uuid
    import hashlib
    from datetime import datetime, timezone
    from app.services.audit_service import audit_service

    ev_id = f"ev_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    # Compute genuine deterministic SHA-256 digest of metadata payload
    canonical_payload = f"{ev_id}:{ev_in.case_id}:{ev_in.title}:{ev_in.description}:{now}"
    computed_hash = hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()

    props = {
        "id": ev_id,
        "case_id": ev_in.case_id,
        "title": ev_in.title,
        "evidence_type": ev_in.evidence_type,
        "description": ev_in.description or "",
        "collected_at": ev_in.collected_at or now,
        "collected_by": current_user.full_name or current_user.username,
        "filename": f"{ev_in.title.replace(' ', '_').lower()}.dat",
        "file_hash": computed_hash,
        "file_size": len(canonical_payload),
        "chain_of_custody_hash": computed_hash[:16],
        "created_at": now
    }

    # Create node in persistent graph
    await graph_service.create_node(
        label="Evidence",
        node_id=ev_id,
        properties=props,
        case_id=ev_in.case_id,
        actor_id=current_user.id
    )

    # Link to case
    if ev_in.case_id:
        await graph_service.create_relationship(
            from_id=ev_id,
            to_id=ev_in.case_id,
            rel_type="LINKED_TO_CASE",
            confidence=1.0,
            source_ids=[ev_id],
            actor_id=current_user.id,
            method="manual_intake"
        )

    # Insert into SQLite evidence_records ledger
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO evidence_records (
            id, case_id, filename, file_path, file_hash,
            file_size, mime_type, collected_at, collected_by, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ev_id, ev_in.case_id, props["filename"], "vault://manual_registered",
        computed_hash, len(canonical_payload), ev_in.evidence_type,
        now, current_user.id, "{}"
    ))
    conn.commit()
    conn.close()

    # Log HMAC audit event
    audit_service.log_event(
        event_type="EVIDENCE_SEALED",
        actor_id=current_user.id,
        target_id=ev_id,
        payload=props
    )

    return EvidenceResponse(**props)


@router.get("/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(evidence_id: str, current_user: UserResponse = Depends(get_current_user)):
    node = await graph_service.get_node(evidence_id)
    if not node:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    props = node.get("properties", {})
    return EvidenceResponse(
        id=node["id"],
        case_id=node.get("case_id") or props.get("case_id", ""),
        title=props.get("title", node["id"]),
        evidence_type=props.get("evidence_type", "document"),
        description=props.get("description", ""),
        collected_at=props.get("collected_at", ""),
        collected_by=props.get("collected_by", ""),
        filename=props.get("filename"),
        file_hash=props.get("file_hash", "0" * 64),
        file_size=props.get("file_size"),
        chain_of_custody_hash=props.get("chain_of_custody_hash"),
        created_at=props.get("created_at", ""),
        metadata=props
    )
