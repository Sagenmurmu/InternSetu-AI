from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import employer_repository
from app.models.audit_log_model import AuditLog


def create_company_profile(db: Session, user, data: dict) -> dict:
    """Create a company profile for the current employer user."""
    if user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can create a company profile")

    existing = employer_repository.get_company_by_user_id(db, user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Company profile already exists")

    company = employer_repository.create_company(db, user.id, data)

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="COMPANY_CREATED",
                     entity_type="company", entity_id=company.id,
                     description=f"Company '{company.company_name}' created by {user.name}")
    db.add(audit)
    db.commit()

    return _serialize_company(company)


def get_my_company_profile(db: Session, user) -> dict:
    """Get the current employer's company profile."""
    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found. Please create one first.")
    return _serialize_company(company)


def update_company_profile(db: Session, user, data: dict) -> dict:
    """Update the current employer's company profile."""
    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    company = employer_repository.update_company(db, company, data)

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="PROFILE_UPDATE",
                     entity_type="company", entity_id=company.id,
                     description=f"Company '{company.company_name}' updated by {user.name}")
    db.add(audit)
    db.commit()

    return _serialize_company(company)


def _serialize_company(company) -> dict:
    return {
        "id": company.id,
        "user_id": company.user_id,
        "company_name": company.company_name,
        "sector": company.sector,
        "description": company.description,
        "district": company.district,
        "state": company.state,
        "address": company.address,
        "contact_person": company.contact_person,
        "total_capacity": company.total_capacity,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
    }
