import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import internship_repository, employer_repository
from app.models.audit_log_model import AuditLog


def create_internship(db: Session, user, data: dict) -> dict:
    """Create a new internship posting (employer only)."""
    if user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can create internships")

    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company:
        raise HTTPException(status_code=400, detail="Create a company profile first")

    if data.get("capacity", 0) < 1:
        raise HTTPException(status_code=400, detail="Capacity must be at least 1")

    internship = internship_repository.create_internship(db, company.id, data)

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="INTERNSHIP_CREATED",
                     entity_type="internship", entity_id=internship.id,
                     description=f"Internship '{internship.title}' created by {company.company_name}")
    db.add(audit)
    db.commit()

    return _serialize_internship(internship, company.company_name)


def get_all_internships(db: Session) -> list:
    """Get all internships with company names."""
    internships = internship_repository.get_all_internships(db)
    return [_serialize_internship(i, i.company.company_name if i.company else None) for i in internships]


def get_internship_details(db: Session, internship_id: int) -> dict:
    """Get a single internship by ID."""
    internship = internship_repository.get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return _serialize_internship(internship, internship.company.company_name if internship.company else None)


def get_my_company_internships(db: Session, user) -> list:
    """Get internships belonging to the current employer's company."""
    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    internships = internship_repository.get_internships_by_company(db, company.id)
    return [_serialize_internship(i, company.company_name) for i in internships]


def update_internship(db: Session, user, internship_id: int, data: dict) -> dict:
    """Update an internship (only by the owning employer)."""
    internship = internship_repository.get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company or internship.company_id != company.id:
        raise HTTPException(status_code=403, detail="You can only update your own company's internships")

    internship = internship_repository.update_internship(db, internship, data)
    return _serialize_internship(internship, company.company_name)


def _serialize_internship(internship, company_name: str = None) -> dict:
    required_skills = []
    if internship.required_skills:
        try:
            required_skills = json.loads(internship.required_skills) if isinstance(internship.required_skills, str) else internship.required_skills
        except (json.JSONDecodeError, TypeError):
            required_skills = []

    return {
        "id": internship.id,
        "company_id": internship.company_id,
        "title": internship.title,
        "description": internship.description,
        "sector": internship.sector,
        "required_skills": required_skills,
        "required_qualification": internship.required_qualification,
        "location": internship.location,
        "district": internship.district,
        "state": internship.state,
        "duration": internship.duration,
        "stipend": internship.stipend,
        "capacity": internship.capacity,
        "selected_count": internship.selected_count,
        "mode": internship.mode,
        "is_active": internship.is_active,
        "company_name": company_name,
        "created_at": internship.created_at,
        "updated_at": internship.updated_at,
    }
