from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

IntelStatus = Literal["unverified", "confirmed", "discarded"]

class LiveIntelligenceItem(BaseModel):
    id: str
    source_name: str
    source_type: str # "osint" | "news" | "public_records" | "cyber" | "watchlist"
    title: str
    snippet: str
    url: Optional[str] = None
    confidence: float = 0.65
    status: IntelStatus = "unverified"
    detected_at: str
    relevant_entity_ids: List[str] = Field(default_factory=list)
    relevant_case_ids: List[str] = Field(default_factory=list)

class SweepFinding(BaseModel):
    id: str
    finding_type: str # "cross_case_connection" | "contradiction" | "new_link" | "hypothesis_update"
    title: str
    description: str
    case_ids: List[str]
    entity_ids: List[str]
    confidence: float
    detected_at: str
    action_url: Optional[str] = None

class SweepSummary(BaseModel):
    sweep_id: str
    executed_at: str
    status: str
    duration_ms: float
    cases_scanned_count: int
    entities_analyzed_count: int
    findings_count: int
    hypotheses_generated_count: int
    findings: List[SweepFinding] = Field(default_factory=list)

class HomeBriefingResponse(BaseModel):
    greeting: str
    hero_discovery: Optional[SweepFinding] = None
    continue_cases: List[Dict[str, Any]] = Field(default_factory=list)
    live_intelligence: List[LiveIntelligenceItem] = Field(default_factory=list)
    sweep_status: SweepSummary
    unread_alerts_count: int
    active_cases_count: int = 0
    total_entities: int = 0
    seized_artifacts: int = 0
    active_sweeps_count: int = 0
    chain_integrity: str = "100% SEALED"
    status: str = "ONLINE"
    active_cases: List[Dict[str, Any]] = Field(default_factory=list)

