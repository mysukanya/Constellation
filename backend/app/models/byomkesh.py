from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

class ByomkeshCitation(BaseModel):
    citation_id: str
    target_type: str = Field(..., pattern="^(node|edge|evidence)$")
    target_id: str
    label_or_type: str
    summary: str
    confidence: Optional[float] = None
    properties: Dict[str, Any] = {}

class ByomkeshQueryRequest(BaseModel):
    case_id: Optional[str] = None
    question: str = Field(..., min_length=3)
    focus_entity_ids: List[str] = Field(default_factory=list)

class ByomkeshQueryResponse(BaseModel):
    query_id: str
    question: str
    answer: str
    # NON-NEGOTIABLE HARD CONSTRAINT: Structured list of citations
    citations: List[ByomkeshCitation] = Field(
        ...,
        min_length=0,
        description="Strict audit citations referencing exact nodes, edges, or evidence items"
    )
    cypher_queries_used: List[str] = Field(default_factory=list)
    reasoning_trace: List[str] = Field(default_factory=list)
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    execution_time_ms: Optional[float] = None
