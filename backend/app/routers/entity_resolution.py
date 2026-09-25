from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.entity_resolution import ERMatchResponse, ERResolutionAction
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.er_service import er_service
from app.services.graph_service import graph_service

router = APIRouter(prefix="/entity-resolution", tags=["Entity Resolution"])

@router.get("/matches", response_model=List[ERMatchResponse])
async def get_pending_matches(
    case_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserResponse = Depends(get_current_user)
):
    """Fetches all pending entity resolution match candidates awaiting investigator review (paginated)."""
    return await er_service.get_pending_matches(case_id=case_id, limit=limit, offset=offset)

@router.post("/matches/{match_id}/resolve")
async def resolve_match(
    match_id: str,
    action_in: ERResolutionAction,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    """
    Investigator action:
    - 'confirm': Merges entity_b into entity_a, rewires relationships, updates audit ledger
    - 'reject': Marks as distinct entities, records non-match decision
    """
    try:
        result = await er_service.resolve_match(
            match_id=match_id,
            action=action_in.action,
            actor_id=current_user.id,
            notes=action_in.notes
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/trigger")
async def trigger_er_sweep(
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    """Runs pairwise probabilistic linkage across all Person entities."""
    nodes = await graph_service.list_nodes(label="Person", case_id=case_id)
    matches_found = 0
    for node in nodes:
        m = await er_service.run_resolution_for_entity(node["id"], case_id=case_id)
        matches_found += len(m)
    return {"status": "sweep_completed", "new_matches_found": matches_found}
