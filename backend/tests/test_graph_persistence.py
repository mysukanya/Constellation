import pytest
from app.db.sqlite_client import init_sqlite_db, get_db_connection
from app.dependencies import create_initial_users
from app.db.neo4j_client import GraphClient
from app.services.graph_service import graph_service

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

@pytest.mark.asyncio
async def test_graph_persistence_across_instances():
    actor = "usr_test_agent"
    client1 = GraphClient()

    # Create node with client 1
    node_id = "node_persisted_test_01"
    await client1.create_node(
        label="Person",
        node_id=node_id,
        properties={"full_name": "Vikramaditya Rao", "threat": "CRITICAL"},
        case_id="case_persist"
    )

    # Create relationship with client 1
    node_id_2 = "node_persisted_test_02"
    await client1.create_node(
        label="Organization",
        node_id=node_id_2,
        properties={"name": "Rao Logistics FZE"},
        case_id="case_persist"
    )

    rel = await client1.create_relationship(
        rel_id="rel_persist_01",
        from_id=node_id,
        to_id=node_id_2,
        rel_type="CONTROLS",
        confidence=0.96,
        source_ids=["ev_bol_01"],
        method="manual",
        created_at="2026-09-24T00:00:00Z",
        properties={"shareholding": "100%"}
    )

    # Simulate server restart by creating a completely new GraphClient instance
    client2 = GraphClient()

    # Verify node persists
    persisted_node = await client2.get_node(node_id)
    assert persisted_node is not None
    assert persisted_node["id"] == node_id
    assert persisted_node["properties"]["full_name"] == "Vikramaditya Rao"

    # Verify subgraph persists
    subgraph = await client2.get_subgraph(case_id="case_persist")
    node_ids = [n["id"] for n in subgraph["nodes"]]
    assert node_id in node_ids
    assert node_id_2 in node_ids
    assert any(e["id"] == "rel_persist_01" for e in subgraph["edges"])

@pytest.mark.asyncio
async def test_cypher_execution_real_results():
    actor = "usr_test_agent"

    # Create distinct nodes
    p1 = await graph_service.create_node("Person", properties={"full_name": "Subject Alpha", "phone": "111"}, actor_id=actor, case_id="c1")
    p2 = await graph_service.create_node("Person", properties={"full_name": "Subject Beta", "phone": "222"}, actor_id=actor, case_id="c1")
    p3 = await graph_service.create_node("Person", properties={"full_name": "Subject Gamma", "phone": "333"}, actor_id=actor, case_id="c2")

    await graph_service.create_relationship(p1["id"], p2["id"], "CONTACTS", confidence=0.9, source_ids=[], actor_id=actor)

    # Query 1: Find contacts of Subject Alpha
    q1 = f"MATCH (p:Person {{id: '{p1['id']}'}})-[r:CONTACTS]-(other:Person) RETURN p, r, other"
    res1 = await graph_service.execute_cypher(q1)
    assert len(res1) == 1
    assert res1[0]["p"]["id"] == p1["id"]
    assert res1[0]["other"]["id"] == p2["id"]

    # Query 2: Find contacts of Subject Gamma (has no contacts)
    q2 = f"MATCH (p:Person {{id: '{p3['id']}'}})-[r:CONTACTS]-(other:Person) RETURN p, r, other"
    res2 = await graph_service.execute_cypher(q2)
    assert len(res2) == 0

    # Prove different queries return different real results
    assert res1 != res2

@pytest.mark.asyncio
async def test_cypher_rejection_of_destructive_queries():
    client = GraphClient()

    # Attempt destructive Cypher injection
    with pytest.raises(ValueError) as exc:
        await client.execute_query("MATCH (n) DETACH DELETE n")
    assert "Security restriction" in str(exc.value)

    with pytest.raises(ValueError) as exc:
        await client.execute_query("DROP CONSTRAINT ON (p:Person) ASSERT p.id IS UNIQUE")
    assert "Security restriction" in str(exc.value)
