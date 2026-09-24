import pytest
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.services.graph_service import graph_service
from app.services.byomkesh_service import byomkesh_agent

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

@pytest.mark.asyncio
async def test_byomkesh_langgraph_workflow_and_citations():
    actor = "usr_test_investigator"
    case_id = "case_byomkesh_test"

    # Setup real graph entities
    p1 = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Farhan Qureshi", "role": "Financial Courier"},
        actor_id=actor,
        case_id=case_id
    )
    p2 = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Tariq Merchant", "role": "Coordinator"},
        actor_id=actor,
        case_id=case_id
    )

    # Create real evidence
    ev = await graph_service.create_node(
        label="Evidence",
        node_id="ev_real_wiretap_88",
        properties={"title": "Intercept Transcript #WT-88", "file_hash": "a1b2c3d4e5f67890"},
        actor_id=actor,
        case_id=case_id
    )

    # Link with real relationship carrying evidence ID
    await graph_service.create_relationship(
        from_id=p1["id"],
        to_id=p2["id"],
        rel_type="CONTACTS",
        confidence=0.95,
        source_ids=[ev["id"]],
        actor_id=actor,
        method="manual"
    )

    # Query Byomkesh using real LangGraph pipeline
    response = await byomkesh_agent.query(
        question="Who did Farhan Qureshi contact?",
        case_id=case_id
    )

    assert response.query_id.startswith("byo_")
    assert response.confidence > 0.5
    assert len(response.citations) >= 2

    # Verify citations correspond to actual IDs in the graph
    citation_targets = {c.target_id for c in response.citations}
    assert p2["id"] in citation_targets or ev["id"] in citation_targets

    for c in response.citations:
        assert c.target_type in ("node", "edge", "evidence")
        assert not c.target_id.startswith("ev_fabricated")

@pytest.mark.asyncio
async def test_byomkesh_empty_query():
    response = await byomkesh_agent.query(
        question="Who is NonExistentPersonXYZ?",
        case_id="case_empty_test"
    )
    assert response.query_id.startswith("byo_")
    assert response.confidence == 0.0
    assert len(response.citations) == 0
    assert "No verified entities" in response.answer
