from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class CandidateCreate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    rural_or_urban: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    qualification: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[List[str]] = []
    sector_interest: Optional[str] = None
    location_preference: Optional[str] = None
    willing_to_relocate: Optional[bool] = True
    past_participation: Optional[bool] = False


class CandidateUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    rural_or_urban: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    qualification: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[List[str]] = None
    sector_interest: Optional[str] = None
    location_preference: Optional[str] = None
    willing_to_relocate: Optional[bool] = None
    past_participation: Optional[bool] = None


class CandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    rural_or_urban: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    qualification: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[List[str]] = []
    sector_interest: Optional[str] = None
    location_preference: Optional[str] = None
    willing_to_relocate: Optional[bool] = True
    past_participation: Optional[bool] = False
    profile_completion: Optional[float] = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CandidateProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: str
    candidate: Optional[CandidateResponse] = None
