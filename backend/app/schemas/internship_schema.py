from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class InternshipCreate(BaseModel):
    title: str
    description: Optional[str] = None
    sector: Optional[str] = None
    required_skills: Optional[List[str]] = []
    required_qualification: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[float] = 0.0
    capacity: int = 1
    mode: Optional[str] = "Remote"


class InternshipUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    required_skills: Optional[List[str]] = None
    required_qualification: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[float] = None
    capacity: Optional[int] = None
    mode: Optional[str] = None
    is_active: Optional[bool] = None


class InternshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    title: str
    description: Optional[str] = None
    sector: Optional[str] = None
    required_skills: Optional[List[str]] = []
    required_qualification: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[float] = 0.0
    capacity: int = 1
    selected_count: int = 0
    mode: Optional[str] = "Remote"
    is_active: bool = True
    company_name: Optional[str] = None  # populated in service layer
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
