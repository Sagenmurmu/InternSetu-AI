import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import candidate_repository
from app.models.audit_log_model import AuditLog


def calculate_profile_completion(candidate) -> float:
    """Calculate profile completion percentage based on filled fields."""
    fields = [
        candidate.age, candidate.gender, candidate.category,
        candidate.rural_or_urban, candidate.district, candidate.state,
        candidate.qualification, candidate.course, candidate.college,
        candidate.sector_interest, candidate.location_preference,
    ]
    # Skills check
    skills = []
    if candidate.skills:
        try:
            skills = json.loads(candidate.skills) if isinstance(candidate.skills, str) else candidate.skills
        except (json.JSONDecodeError, TypeError):
            skills = []

    filled = sum(1 for f in fields if f)
    if skills:
        filled += 1
    total = len(fields) + 1  # +1 for skills

    return round((filled / total) * 100, 1)


def create_candidate_profile(db: Session, user, data: dict) -> dict:
    """Create a candidate profile for the current user."""
    if user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can create a candidate profile")

    existing = candidate_repository.get_candidate_by_user_id(db, user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Candidate profile already exists")

    candidate = candidate_repository.create_candidate(db, user.id, data)
    candidate.profile_completion = calculate_profile_completion(candidate)
    db.commit()
    db.refresh(candidate)

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="PROFILE_UPDATE",
                     entity_type="candidate", entity_id=candidate.id,
                     description=f"Candidate profile created for {user.name}")
    db.add(audit)
    db.commit()

    return _serialize_candidate(candidate)


def get_my_candidate_profile(db: Session, user) -> dict:
    """Get the current user's candidate profile."""
    candidate = candidate_repository.get_candidate_by_user_id(db, user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found. Please create one first.")

    return _serialize_candidate(candidate)


def update_candidate_profile(db: Session, user, data: dict, from_parser: bool = False) -> dict:
    """Update the current user's candidate profile."""
    candidate = candidate_repository.get_candidate_by_user_id(db, user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    candidate = candidate_repository.update_candidate(db, candidate, data)
    candidate.profile_completion = calculate_profile_completion(candidate)
    db.commit()
    db.refresh(candidate)

    # Audit log
    description = "Candidate updated profile using resume parser" if from_parser else f"Candidate profile updated by {user.name}"
    audit = AuditLog(user_id=user.id, user_role=user.role, action="PROFILE_UPDATE",
                     entity_type="candidate", entity_id=candidate.id,
                     description=description)
    db.add(audit)
    db.commit()

    return _serialize_candidate(candidate)


def _serialize_candidate(candidate) -> dict:
    """Convert a Candidate ORM object to a dict with parsed skills."""
    skills = []
    if candidate.skills:
        try:
            skills = json.loads(candidate.skills) if isinstance(candidate.skills, str) else candidate.skills
        except (json.JSONDecodeError, TypeError):
            skills = []

    return {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "age": candidate.age,
        "gender": candidate.gender,
        "category": candidate.category,
        "rural_or_urban": candidate.rural_or_urban,
        "district": candidate.district,
        "state": candidate.state,
        "qualification": candidate.qualification,
        "course": candidate.course,
        "college": candidate.college,
        "skills": skills,
        "sector_interest": candidate.sector_interest,
        "location_preference": candidate.location_preference,
        "willing_to_relocate": candidate.willing_to_relocate,
        "past_participation": candidate.past_participation,
        "profile_completion": candidate.profile_completion,
        "created_at": candidate.created_at,
        "updated_at": candidate.updated_at,
    }
