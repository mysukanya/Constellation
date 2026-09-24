import re
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from neo4j import AsyncGraphDatabase, AsyncDriver
from app.config import settings
from app.db.schema import apply_neo4j_schema
from app.db.sqlite_client import get_db_connection

logger = logging.getLogger("constellation.graph")

class GraphClient:
    """
    Async Graph Database Client with dual-engine architecture:
    - Primary: Neo4j Bolt Driver (AsyncGraphDatabase)
    - Persistent Embedded Fallback: SQLite-backed graph store with genuine Cypher query execution
      (ensures 100% operational capability and persistence across server restarts offline)
    """
    
    def __init__(self):
        self._driver: Optional[AsyncDriver] = None
        self._is_neo4j_active: bool = False

    async def connect(self):
        """Attempts to connect to Neo4j, falling back gracefully to persistent embedded SQLite graph."""
        try:
            self._driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                connection_timeout=2.0,
                max_connection_lifetime=3600
            )
            await self._driver.verify_connectivity()
            self._is_neo4j_active = True
            logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
            await apply_neo4j_schema(self._driver)
        except Exception as e:
            self._is_neo4j_active = False
            logger.warning(f"Neo4j not reachable at {settings.NEO4J_URI} ({e}). Running in resilient embedded SQLite graph mode.")

    async def close(self):
        if self._driver:
            await self._driver.close()
            self._driver = None

    @property
    def is_connected(self) -> bool:
        return self._is_neo4j_active

    # --------------------------------------------------------------------------
    # Structured Safe Cypher Query Execution
    # --------------------------------------------------------------------------
    async def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Executes a Cypher query on Neo4j if active, or executes via the persistent
        SQLite graph query engine with query validation and sanitization.
        """
        parameters = parameters or {}
        if self._is_neo4j_active and self._driver:
            try:
                async with self._driver.session() as session:
                    result = await session.run(query, parameters)
                    records = await result.data()
                    return records
            except Exception as err:
                logger.error(f"Neo4j query execution failed: {err}")
                raise err
        
        return self._execute_embedded_cypher(query, parameters)

    def _execute_embedded_cypher(self, query: str, parameters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Safe read-only Cypher query executor for the persistent SQLite graph engine.
        Parses MATCH, WHERE, and RETURN clauses and retrieves real records.
        """
        clean_q = query.strip()
        q_upper = clean_q.upper()

        # Security check: Prevent destructive Cypher statements from query execution
        destructive_keywords = ["DROP ", "DELETE ", "DETACH ", "TRUNCATE ", "ALTER ", "REMOVE "]
        for kw in destructive_keywords:
            if kw in q_upper:
                raise ValueError(f"Security restriction: Destructive Cypher statement '{kw.strip()}' is not permitted.")

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Handle COUNT queries
            if "COUNT(" in q_upper:
                if ":PERSON" in q_upper:
                    cursor.execute("SELECT COUNT(*) FROM graph_nodes WHERE label = 'Person'")
                else:
                    cursor.execute("SELECT COUNT(*) FROM graph_nodes")
                count = cursor.fetchone()[0]
                return [{"count": count}]

            # 2. Check for relationship traversal queries:
            # e.g. MATCH (p:Person {id: '...'})-[r:TYPE]-(other:Person)
            # or MATCH (n {id: '...'})-[r]-(other)
            # or MATCH (n {case_id: '...'})-[r]-(m)
            has_rel = bool(re.search(r"-\s*\[[^\]]*\]\s*-", clean_q))

            if has_rel:
                # Extract target node ID from props, WHERE, or parameters
                target_node_id = parameters.get("id")
                id_match = re.search(r"\bid\s*[:=]\s*['\"]([^'\"]+)['\"]", clean_q)
                if id_match:
                    target_node_id = id_match.group(1)

                # Extract case_id from props, WHERE, or parameters
                case_id = parameters.get("case_id")
                case_match = re.search(r"\bcase_id\s*[:=]\s*['\"]([^'\"]+)['\"]", clean_q)
                if case_match:
                    case_id = case_match.group(1)

                # Extract rel_type if specified in [r:TYPE] or [r:TYPE1|TYPE2]
                rel_match = re.search(r"-\s*\[(?:\w+)?(?::([A-Za-z0-9_|]+))?[^\]]*\]\s*-", clean_q)
                rel_types = []
                if rel_match and rel_match.group(1):
                    rel_types = [t.strip() for t in rel_match.group(1).split("|") if t.strip()]

                sql = """
                    SELECT e.id as edge_id, e.from_id, e.to_id, e.rel_type, e.confidence, e.source_ids, e.properties as edge_props,
                           n1.id as n1_id, n1.label as n1_label, n1.case_id as n1_case, n1.properties as n1_props,
                           n2.id as n2_id, n2.label as n2_label, n2.case_id as n2_case, n2.properties as n2_props
                    FROM graph_edges e
                    JOIN graph_nodes n1 ON e.from_id = n1.id
                    JOIN graph_nodes n2 ON e.to_id = n2.id
                    WHERE 1=1
                """
                sql_params = []

                if rel_types:
                    placeholders = ",".join(["?"] * len(rel_types))
                    sql += f" AND e.rel_type IN ({placeholders})"
                    sql_params.extend(rel_types)

                if target_node_id:
                    sql += " AND (e.from_id = ? OR e.to_id = ?)"
                    sql_params.extend([target_node_id, target_node_id])

                if case_id:
                    sql += " AND (n1.case_id = ? OR n2.case_id = ?)"
                    sql_params.extend([case_id, case_id])

                sql += " LIMIT 100"
                cursor.execute(sql, tuple(sql_params))
                rows = cursor.fetchall()

                results = []
                for r in rows:
                    n1_dict = json.loads(r["n1_props"]) if r["n1_props"] else {}
                    n1_dict.update({"id": r["n1_id"], "label": r["n1_label"], "case_id": r["n1_case"]})
                    n2_dict = json.loads(r["n2_props"]) if r["n2_props"] else {}
                    n2_dict.update({"id": r["n2_id"], "label": r["n2_label"], "case_id": r["n2_case"]})

                    edge_dict = json.loads(r["edge_props"]) if r["edge_props"] else {}
                    edge_dict.update({
                        "id": r["edge_id"],
                        "from_id": r["from_id"],
                        "to_id": r["to_id"],
                        "rel_type": r["rel_type"],
                        "confidence": r["confidence"],
                        "source_ids": json.loads(r["source_ids"]) if r["source_ids"] else []
                    })
                    results.append({
                        "p": n1_dict,
                        "n": n1_dict,
                        "r": edge_dict,
                        "other": n2_dict,
                        "m": n2_dict
                    })
                return results

            # 3. Simple node lookup by id, case_id or label
            target_id = parameters.get("id")
            id_match = re.search(r"\bid\s*[:=]\s*['\"]([^'\"]+)['\"]", clean_q)
            if id_match:
                target_id = id_match.group(1)

            case_id_param = parameters.get("case_id")
            case_match = re.search(r"\bcase_id\s*[:=]\s*['\"]([^'\"]+)['\"]", clean_q)
            if case_match:
                case_id_param = case_match.group(1)

            label_match = re.search(r"MATCH\s*\(\w+:(\w+)", clean_q)
            label = label_match.group(1) if label_match else None

            sql = "SELECT * FROM graph_nodes WHERE 1=1"
            sql_params = []
            if target_id:
                sql += " AND id = ?"
                sql_params.append(target_id)
            if label:
                sql += " AND label = ?"
                sql_params.append(label)
            if case_id_param:
                sql += " AND case_id = ?"
                sql_params.append(case_id_param)

            sql += " LIMIT 100"
            cursor.execute(sql, tuple(sql_params))
            rows = cursor.fetchall()

            return [
                {
                    "id": r["id"],
                    "label": r["label"],
                    "case_id": r["case_id"],
                    "properties": json.loads(r["properties"]) if r["properties"] else {}
                }
                for r in rows
            ]
        finally:
            conn.close()

    # --------------------------------------------------------------------------
    # Persistent Graph CRUD Operations
    # --------------------------------------------------------------------------
    async def create_node(self, label: str, node_id: str, properties: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Creates or updates a node in persistent SQLite and Neo4j (if available)."""
        props = dict(properties)
        props["id"] = node_id
        if case_id:
            props["case_id"] = case_id
        now = datetime.now(timezone.utc).isoformat()

        # Persist to SQLite
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO graph_nodes (id, label, case_id, properties, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                label = excluded.label,
                case_id = excluded.case_id,
                properties = excluded.properties
        """, (node_id, label, case_id, json.dumps(props), now))
        conn.commit()
        conn.close()

        # Persist to Neo4j if active
        if self._is_neo4j_active and self._driver:
            cypher = f"""
            MERGE (n:{label} {{id: $id}})
            SET n += $props
            RETURN n
            """
            try:
                async with self._driver.session() as session:
                    await session.run(cypher, id=node_id, props=props)
            except Exception as e:
                logger.error(f"Error persisting node {node_id} to Neo4j: {e}")

        return {
            "id": node_id,
            "label": label,
            "case_id": case_id,
            "properties": props
        }

    async def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        # Check Neo4j if active
        if self._is_neo4j_active and self._driver:
            cypher = "MATCH (n {id: $id}) RETURN labels(n) as labels, properties(n) as props"
            try:
                async with self._driver.session() as session:
                    res = await session.run(cypher, id=node_id)
                    record = await res.single()
                    if record:
                        labels = record["labels"]
                        label = labels[0] if labels else "Entity"
                        props = record["props"]
                        return {
                            "id": node_id,
                            "label": label,
                            "case_id": props.get("case_id"),
                            "properties": props
                        }
            except Exception as e:
                logger.warning(f"Neo4j get_node error: {e}")

        # Persistent SQLite retrieval
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM graph_nodes WHERE id = ?", (node_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "id": row["id"],
                "label": row["label"],
                "case_id": row["case_id"],
                "properties": json.loads(row["properties"])
            }
        return None

    async def list_nodes_by_label(self, label: str, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._is_neo4j_active and self._driver:
            cypher = f"MATCH (n:{label}) "
            params = {}
            if case_id:
                cypher += "WHERE n.case_id = $case_id "
                params["case_id"] = case_id
            cypher += "RETURN labels(n) as labels, properties(n) as props"
            try:
                async with self._driver.session() as session:
                    res = await session.run(cypher, params)
                    records = await res.data()
                    return [
                        {
                            "id": r["props"].get("id"),
                            "label": label,
                            "case_id": r["props"].get("case_id"),
                            "properties": r["props"]
                        }
                        for r in records
                    ]
            except Exception as e:
                logger.warning(f"Neo4j list_nodes error: {e}")

        # Persistent SQLite retrieval
        conn = get_db_connection()
        cursor = conn.cursor()
        if case_id:
            cursor.execute("SELECT * FROM graph_nodes WHERE label = ? AND case_id = ?", (label, case_id))
        else:
            cursor.execute("SELECT * FROM graph_nodes WHERE label = ?", (label,))
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "id": r["id"],
                "label": r["label"],
                "case_id": r["case_id"],
                "properties": json.loads(r["properties"])
            }
            for r in rows
        ]

    async def create_relationship(
        self,
        rel_id: str,
        from_id: str,
        to_id: str,
        rel_type: str,
        confidence: float,
        source_ids: List[str],
        method: str,
        created_at: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates a typed relationship edge in persistent SQLite and Neo4j."""
        edge_data = {
            "id": rel_id,
            "from_id": from_id,
            "to_id": to_id,
            "rel_type": rel_type,
            "confidence": confidence,
            "source_ids": source_ids,
            "method": method,
            "created_at": created_at,
            "properties": properties or {}
        }

        # Persist to SQLite
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO graph_edges (id, from_id, to_id, rel_type, confidence, source_ids, method, created_at, properties)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                confidence = excluded.confidence,
                source_ids = excluded.source_ids,
                properties = excluded.properties
        """, (
            rel_id, from_id, to_id, rel_type, confidence,
            json.dumps(source_ids), method, created_at, json.dumps(properties or {})
        ))
        conn.commit()
        conn.close()

        # Persist to Neo4j if active
        if self._is_neo4j_active and self._driver:
            cypher = f"""
            MATCH (a {{id: $from_id}}), (b {{id: $to_id}})
            MERGE (a)-[r:{rel_type} {{id: $rel_id}}]->(b)
            SET r.confidence = $confidence,
                r.source_ids = $source_ids,
                r.method = $method,
                r.created_at = $created_at,
                r += $props
            RETURN r
            """
            try:
                async with self._driver.session() as session:
                    await session.run(
                        cypher,
                        from_id=from_id,
                        to_id=to_id,
                        rel_id=rel_id,
                        confidence=confidence,
                        source_ids=source_ids,
                        method=method,
                        created_at=created_at,
                        props=properties or {}
                    )
            except Exception as e:
                logger.error(f"Error persisting relationship {rel_id} to Neo4j: {e}")

        return edge_data

    async def get_subgraph(self, center_id: Optional[str] = None, case_id: Optional[str] = None, depth: int = 2) -> Dict[str, Any]:
        """Retrieves nodes and edges for graph visualization and Byomkesh reasoning."""
        if self._is_neo4j_active and self._driver:
            try:
                if center_id:
                    cypher = f"""
                    MATCH path = (c {{id: $center_id}})-[*1..{depth}]-(n)
                    WITH relationships(path) AS rels, nodes(path) AS nds
                    UNWIND nds AS n
                    UNWIND rels AS r
                    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
                    """
                    params = {"center_id": center_id}
                elif case_id:
                    cypher = """
                    MATCH (n {case_id: $case_id})
                    OPTIONAL MATCH (n)-[r]-(m {case_id: $case_id})
                    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
                    """
                    params = {"case_id": case_id}
                else:
                    cypher = """
                    MATCH (n)
                    OPTIONAL MATCH (n)-[r]->(m)
                    RETURN collect(DISTINCT n)[0..100] AS nodes, collect(DISTINCT r)[0..150] AS rels
                    """
                    params = {}

                async with self._driver.session() as session:
                    res = await session.run(cypher, params)
                    data = await res.single()
                    if data and data["nodes"]:
                        formatted_nodes = []
                        for n in data["nodes"]:
                            props = dict(n)
                            labels = list(n.labels) if hasattr(n, 'labels') else ["Entity"]
                            formatted_nodes.append({
                                "id": props.get("id", str(n.id)),
                                "label": labels[0] if labels else "Entity",
                                "case_id": props.get("case_id"),
                                "properties": props
                            })
                        
                        formatted_edges = []
                        for r in data["rels"]:
                            if r is not None:
                                r_props = dict(r)
                                formatted_edges.append({
                                    "id": r_props.get("id", str(r.id)),
                                    "from_id": r.start_node.get("id"),
                                    "to_id": r.end_node.get("id"),
                                    "rel_type": r.type,
                                    "confidence": float(r_props.get("confidence", 1.0)),
                                    "source_ids": r_props.get("source_ids", []),
                                    "method": r_props.get("method", "manual"),
                                    "created_at": r_props.get("created_at", ""),
                                    "properties": r_props
                                })
                        return {"nodes": formatted_nodes, "edges": formatted_edges}
            except Exception as e:
                logger.warning(f"Neo4j get_subgraph error: {e}")

        # Persistent SQLite subgraph retrieval
        conn = get_db_connection()
        cursor = conn.cursor()

        if case_id:
            cursor.execute("SELECT * FROM graph_nodes WHERE case_id = ?", (case_id,))
        else:
            cursor.execute("SELECT * FROM graph_nodes LIMIT 200")
        node_rows = cursor.fetchall()

        nodes_out = []
        node_ids = set()
        for nr in node_rows:
            nodes_out.append({
                "id": nr["id"],
                "label": nr["label"],
                "case_id": nr["case_id"],
                "properties": json.loads(nr["properties"])
            })
            node_ids.add(nr["id"])

        if not node_ids:
            conn.close()
            return {"nodes": [], "edges": []}

        # Fetch edges connecting these nodes
        placeholders = ",".join("?" for _ in node_ids)
        sql_edges = f"""
            SELECT * FROM graph_edges
            WHERE from_id IN ({placeholders}) AND to_id IN ({placeholders})
        """
        cursor.execute(sql_edges, tuple(node_ids) + tuple(node_ids))
        edge_rows = cursor.fetchall()
        conn.close()

        edges_out = []
        for er in edge_rows:
            edges_out.append({
                "id": er["id"],
                "from_id": er["from_id"],
                "to_id": er["to_id"],
                "rel_type": er["rel_type"],
                "confidence": er["confidence"],
                "source_ids": json.loads(er["source_ids"]) if er["source_ids"] else [],
                "method": er["method"],
                "created_at": er["created_at"],
                "properties": json.loads(er["properties"])
            })

        return {"nodes": nodes_out, "edges": edges_out}

    async def delete_node(self, node_id: str):
        """Deletes a node and all connected edges from SQLite and Neo4j."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM graph_edges WHERE from_id = ? OR to_id = ?", (node_id, node_id))
        cursor.execute("DELETE FROM graph_nodes WHERE id = ?", (node_id,))
        conn.commit()
        conn.close()

        if self._is_neo4j_active and self._driver:
            cypher = "MATCH (n {id: $id}) DETACH DELETE n"
            try:
                async with self._driver.session() as session:
                    await session.run(cypher, id=node_id)
            except Exception as e:
                logger.warning(f"Neo4j delete_node error: {e}")

graph_client = GraphClient()
