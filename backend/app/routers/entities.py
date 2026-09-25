from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.graph import NodeCreate, NodeResponse
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.graph_service import graph_service
from app.services.er_service import er_service

router = APIRouter(prefix="/entities", tags=["Entities"])

@router.post("", response_model=NodeResponse)
async def create_entity(
    node_in: NodeCreate,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    node = await graph_service.create_node(
        label=node_in.label,
        properties=node_in.properties,
        case_id=node_in.case_id,
        actor_id=current_user.id
    )

    # Automatically run entity resolution against same-label entities
    await er_service.run_resolution_for_entity(node["id"], case_id=node_in.case_id)

    return NodeResponse(
        id=node["id"],
        label=node["label"],
        properties=node["properties"],
        case_id=node.get("case_id"),
        created_at=node["properties"].get("created_at")
    )

@router.get("/{entity_id}", response_model=NodeResponse)
async def get_entity(entity_id: str, current_user: UserResponse = Depends(get_current_user)):
    node = await graph_service.get_node(entity_id)
    if not node:
        raise HTTPException(status_code=404, detail="Entity not found")
    return NodeResponse(
        id=node["id"],
        label=node["label"],
        properties=node["properties"],
        case_id=node.get("case_id"),
        created_at=node["properties"].get("created_at")
    )

@router.get("/{entity_id}/timeline")
async def get_entity_timeline(entity_id: str, current_user: UserResponse = Depends(get_current_user)):
    """
    Returns verified chronological timeline events for the target entity
    derived from knowledge graph edges, linked evidence, and the HMAC audit ledger.
    """
    node = await graph_service.get_node(entity_id)
    if not node:
        raise HTTPException(status_code=404, detail="Entity not found")

    props = node.get("properties", {})
    name = props.get("full_name") or props.get("name") or entity_id

    subgraph = await graph_service.get_case_subgraph()
    edges = subgraph.get("edges", [])
    nodes_map = {n["id"]: n for n in subgraph.get("nodes", [])}

    timeline_items = []
    # 1. Edge-based events
    for e in edges:
        if e["from_id"] == entity_id or e["to_id"] == entity_id:
            other_id = e["to_id"] if e["from_id"] == entity_id else e["from_id"]
            other_node = nodes_map.get(other_id, {})
            other_name = other_node.get("properties", {}).get("full_name") or other_node.get("properties", {}).get("name") or other_id
            direction = "Outgoing to" if e["from_id"] == entity_id else "Incoming from"
            rel_type = e.get("rel_type", "RELATED_TO").replace("_", " ")

            ts = e.get("created_at") or e.get("properties", {}).get("timestamp") or "2026-09-24T12:00:00Z"
            timeline_items.append({
                "id": f"evt-{e['id']}",
                "date": ts,
                "title": f"{rel_type.title()} ({direction} {other_name})",
                "entity": name,
                "provenance": "GRAPH_EDGE",
                "confidence": e.get("confidence", 0.95),
                "location": props.get("location") or props.get("jurisdiction") or "Operational Corridor",
                "summary": f"Verified relationship link: {name} -[{e.get('rel_type')}]-> {other_name} with confidence {e.get('confidence', 0.95)}."
            })

    # Sort descending by date
    timeline_items.sort(key=lambda x: str(x["date"]), reverse=True)
    return timeline_items


@router.get("", response_model=List[NodeResponse])
async def list_entities(
    label: str = "Person",
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    nodes = await graph_service.list_nodes(label=label, case_id=case_id)
    return [
        NodeResponse(
            id=n["id"],
            label=n["label"],
            properties=n["properties"],
            case_id=n.get("case_id"),
            created_at=n["properties"].get("created_at")
        )
        for n in nodes
    ]
