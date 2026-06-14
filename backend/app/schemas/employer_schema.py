from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    company_name: str
    sector: Optional[str] = None
    description: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    total_capacity: Optional[int] = 0


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    total_capacity: Optional[int] = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    company_name: str
    sector: Optional[str] = None
    description: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    total_capacity: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
