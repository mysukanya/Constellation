import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.case import CaseCreate, CaseResponse, CaseUpdate
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.graph_service import graph_service
from app.db.neo4j_client import graph_client

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=CaseResponse)
async def create_case(
    case_in: CaseCreate,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    # NON-NEGOTIABLE GUARDRAIL: legal_basis validation
    if not case_in.legal_basis or len(case_in.legal_basis.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A defensible legal_basis is strictly required to authorize this investigation (e.g. Subpoena, Warrant, Official Case Order)."
        )

    case_id = f"case_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    props = {
        "title": case_in.title,
        "description": case_in.description or "",
        "legal_basis": case_in.legal_basis.strip(),
        "status": case_in.status
    }
    
    node = await graph_service.create_node(
        label="Case",
        node_id=case_id,
        properties=props,
        actor_id=current_user.id
    )

    return CaseResponse(
        id=case_id,
        title=case_in.title,
        description=case_in.description,
        legal_basis=case_in.legal_basis.strip(),
        status=case_in.status,
        created_at=now,
        created_by=current_user.id,
        entity_count=0,
        relationship_count=0
    )

@router.get("", response_model=List[CaseResponse])
async def list_cases(current_user: UserResponse = Depends(get_current_user)):
    nodes = await graph_service.list_nodes(label="Case")
    cases = []
    for n in nodes:
        props = n.get("properties", {})
        # Get real entity and relationship counts from subgraph
        try:
            subgraph = await graph_service.get_case_subgraph(case_id=n["id"])
            entity_count = len(subgraph.get("nodes", []))
            relationship_count = len(subgraph.get("edges", []))
        except Exception:
            entity_count = 0
            relationship_count = 0
        cases.append(CaseResponse(
            id=n["id"],
            title=props.get("title", "Untitled Case"),
            description=props.get("description", ""),
            legal_basis=props.get("legal_basis", "Unspecified"),
            status=props.get("status", "active"),
            created_at=props.get("created_at", ""),
            created_by=props.get("created_by", "system"),
            entity_count=entity_count,
            relationship_count=relationship_count
        ))
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str, current_user: UserResponse = Depends(get_current_user)):
    node = await graph_service.get_node(case_id)
    if not node:
        raise HTTPException(status_code=404, detail="Case not found")
    
    props = node.get("properties", {})
    subgraph = await graph_service.get_case_subgraph(case_id=case_id)
    
    return CaseResponse(
        id=node["id"],
        title=props.get("title", "Untitled Case"),
        description=props.get("description", ""),
        legal_basis=props.get("legal_basis", ""),
        status=props.get("status", "active"),
        created_at=props.get("created_at", ""),
        created_by=props.get("created_by", "system"),
        entity_count=len(subgraph["nodes"]),
        relationship_count=len(subgraph["edges"])
    )

@router.get("/{case_id}/subgraph")
async def get_case_subgraph(case_id: str, current_user: UserResponse = Depends(get_current_user)):
    return await graph_service.get_case_subgraph(case_id=case_id)
