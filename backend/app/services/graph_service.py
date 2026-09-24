import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.db.neo4j_client import graph_client
from app.services.audit_service import audit_service

class GraphService:
    """
    High-level graph domain service enforcing:
    - Audit logging via HMAC hash-chain for every modification
    - Proper relationship attribution (confidence, source_ids, method)
    - Safe node merging on Entity Resolution confirmation
    """
    
    async def create_node(
        self,
        label: str,
        properties: Dict[str, Any],
        actor_id: str,
        case_id: Optional[str] = None,
        node_id: Optional[str] = None
    ) -> Dict[str, Any]:
        node_id = node_id or f"{label.lower()}_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        props = dict(properties)
        props["created_at"] = now
        props["created_by"] = actor_id
        
        node = await graph_client.create_node(label=label, node_id=node_id, properties=props, case_id=case_id)
        
        # Tamper-evident Audit Log
        audit_service.log_event(
            event_type="NODE_CREATED",
            actor_id=actor_id,
            target_id=node_id,
            payload={"label": label, "properties": props, "case_id": case_id}
        )
        
        return node

    async def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        return await graph_client.get_node(node_id)

    async def list_nodes(self, label: str, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return await graph_client.list_nodes_by_label(label, case_id)

    async def create_relationship(
        self,
        from_id: str,
        to_id: str,
        rel_type: str,
        confidence: float,
        source_ids: List[str],
        actor_id: str,
        method: str = "manual",
        properties: Optional[Dict[str, Any]] = None,
        rel_id: Optional[str] = None
    ) -> Dict[str, Any]:
        rel_id = rel_id or f"rel_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        props = properties or {}
        
        edge = await graph_client.create_relationship(
            rel_id=rel_id,
            from_id=from_id,
            to_id=to_id,
            rel_type=rel_type,
            confidence=confidence,
            source_ids=source_ids,
            method=method,
            created_at=now,
            properties=props
        )

        # Audit Log
        audit_service.log_event(
            event_type="RELATIONSHIP_CREATED",
            actor_id=actor_id,
            target_id=rel_id,
            payload={
                "from_id": from_id,
                "to_id": to_id,
                "rel_type": rel_type,
                "confidence": confidence,
                "source_ids": source_ids,
                "method": method
            }
        )

        return edge

    async def merge_entities(self, keep_id: str, drop_id: str, actor_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Merges drop_id into keep_id:
        - Transfers all incoming/outgoing edges to keep_id
        - Adds drop_id name/identifiers as aliases
        - Logs tamper-evident audit event
        """
        keep_node = await graph_client.get_node(keep_id)
        drop_node = await graph_client.get_node(drop_id)
        
        if not keep_node or not drop_node:
            raise ValueError("Both entities must exist to perform merge")
            
        # Merge properties (e.g. aliases)
        drop_props = drop_node.get("properties", {})
        keep_props = keep_node.get("properties", {})
        
        aliases = set(keep_props.get("aliases", []))
        if "full_name" in drop_props:
            aliases.add(drop_props["full_name"])
        for a in drop_props.get("aliases", []):
            aliases.add(a)
        keep_props["aliases"] = list(aliases)
        
        # Transfer edges in graph client
        subgraph = await graph_client.get_subgraph()
        transferred_edges = 0
        for edge in subgraph["edges"]:
            if edge["from_id"] == drop_id:
                await self.create_relationship(
                    from_id=keep_id,
                    to_id=edge["to_id"],
                    rel_type=edge["rel_type"],
                    confidence=edge["confidence"],
                    source_ids=edge["source_ids"] + [drop_id],
                    actor_id=actor_id,
                    method="resolved",
                    properties={"merged_from": drop_id}
                )
                transferred_edges += 1
            elif edge["to_id"] == drop_id:
                await self.create_relationship(
                    from_id=edge["from_id"],
                    to_id=keep_id,
                    rel_type=edge["rel_type"],
                    confidence=edge["confidence"],
                    source_ids=edge["source_ids"] + [drop_id],
                    actor_id=actor_id,
                    method="resolved",
                    properties={"merged_from": drop_id}
                )
                transferred_edges += 1

        # Update keep_node
        await graph_client.create_node(
            label=keep_node["label"],
            node_id=keep_id,
            properties=keep_props,
            case_id=keep_node.get("case_id")
        )

        # Audit event
        audit_service.log_event(
            event_type="ENTITIES_MERGED",
            actor_id=actor_id,
            target_id=keep_id,
            payload={
                "kept_entity_id": keep_id,
                "merged_entity_id": drop_id,
                "transferred_edges": transferred_edges,
                "notes": notes
            }
        )

        return {
            "status": "success",
            "kept_entity_id": keep_id,
            "merged_entity_id": drop_id,
            "transferred_edges": transferred_edges
        }

    async def execute_cypher(self, query: str) -> List[Dict[str, Any]]:
        """
        Execute a Cypher query against the graph engine.
        Delegates to graph_client.execute_query() which enforces
        security restrictions (blocks destructive operations).
        """
        return await graph_client.execute_query(query)

    async def get_case_subgraph(self, case_id: Optional[str] = None, center_id: Optional[str] = None) -> Dict[str, Any]:
        return await graph_client.get_subgraph(center_id=center_id, case_id=case_id)

graph_service = GraphService()
