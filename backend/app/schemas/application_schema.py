from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from app.core.constants import ApplicationStatus


class ApplicationCreate(BaseModel):
    internship_id: int


class ApplicationStatusUpdate(BaseModel):
    status: str
    decision_reason: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in ApplicationStatus.ALL:
            raise ValueError(f"Status must be one of: {', '.join(ApplicationStatus.ALL)}")
        return v


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    internship_id: int
    status: str
    decision_reason: Optional[str] = None
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Enriched fields populated in service layer
    candidate_name: Optional[str] = None
    internship_title: Optional[str] = None
    company_name: Optional[str] = None
    match_score: Optional[float] = None
