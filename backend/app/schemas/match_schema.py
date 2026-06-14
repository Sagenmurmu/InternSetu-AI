from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class MatchScoreBreakdown(BaseModel):
    skill_score: float = 0.0
    qualification_score: float = 0.0
    location_score: float = 0.0
    sector_score: float = 0.0
    fairness_score: float = 0.0
    final_score: float = 0.0


class MatchResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    internship_id: int
    skill_score: float = 0.0
    qualification_score: float = 0.0
    location_score: float = 0.0
    sector_score: float = 0.0
    fairness_score: float = 0.0
    final_score: float = 0.0
    explanation: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    # Enriched fields
    candidate_name: Optional[str] = None
    internship_title: Optional[str] = None


class RecommendationResponse(BaseModel):
    """Internship with match score for candidate recommendations."""
    internship_id: int
    title: str
    company_name: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    stipend: Optional[float] = 0.0
    duration: Optional[str] = None
    mode: Optional[str] = None
    required_skills: Optional[List[str]] = []
    match_details: MatchScoreBreakdown
    explanation: Optional[List[str]] = []
