from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional, List
from datetime import datetime


class PolicyWeightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill_weight: float
    qualification_weight: float
    location_weight: float
    sector_weight: float
    fairness_weight: float
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[int] = None


class PolicyWeightUpdateRequest(BaseModel):
    skill_weight: float
    qualification_weight: float
    location_weight: float
    sector_weight: float
    fairness_weight: float

    @model_validator(mode="after")
    def validate_weights(self) -> "PolicyWeightUpdateRequest":
        weights = [
            self.skill_weight,
            self.qualification_weight,
            self.location_weight,
            self.sector_weight,
            self.fairness_weight
        ]
        for w in weights:
            if w < 0.0 or w > 1.0:
                raise ValueError("Weights must be between 0.0 and 1.0")
        
        total = sum(weights)
        if abs(total - 1.0) > 0.001:
            raise ValueError(f"Sum of weights must be exactly 1.0 (got {total})")
        return self


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
