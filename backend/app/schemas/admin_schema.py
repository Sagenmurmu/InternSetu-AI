from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class AdminOverviewResponse(BaseModel):
    total_candidates: int = 0
    total_companies: int = 0
    total_internships: int = 0
    total_applications: int = 0
    selected_candidates: int = 0
    remaining_seats: int = 0
    average_match_score: float = 0.0
    fairness_score: float = 0.0


class DistrictAnalyticsItem(BaseModel):
    district: str
    total: int = 0
    allocated: int = 0


class DistrictAnalyticsResponse(BaseModel):
    data: List[DistrictAnalyticsItem] = []


class CategoryAnalyticsItem(BaseModel):
    category: str
    count: int = 0
    percentage: float = 0.0


class CategoryAnalyticsResponse(BaseModel):
    data: List[CategoryAnalyticsItem] = []


class CapacityAnalyticsItem(BaseModel):
    company: str
    total: int = 0
    used: int = 0
    remaining: int = 0


class CapacityAnalyticsResponse(BaseModel):
    data: List[CapacityAnalyticsItem] = []


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    user_role: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    description: Optional[str] = None
    timestamp: Optional[datetime] = None
