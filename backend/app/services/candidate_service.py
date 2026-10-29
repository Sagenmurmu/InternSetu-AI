import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import candidate_repository
from app.models.audit_log_model import AuditLog


def calculate_profile_completion(candidate, user=None) -> float:
    """
    Calculate profile completion percentage based on filled fields.
    Mandatory required fields: Full Name, Email, State, Qualification, Skills.
    If required fields are missing, the score cannot reach 100%.
    """
    u = user or getattr(candidate, "user", None)
    user_name = u.name if u else getattr(candidate, "name", None)
    user_email = u.email if u else getattr(candidate, "email", None)

    # Required fields
    required_fields = [
        user_name,
        user_email,
        candidate.state,
        candidate.qualification,
    ]

    optional_fields = [
        candidate.age,
        candidate.gender,
        candidate.category,
        candidate.rural_or_urban,
        candidate.district,
        candidate.course,
        candidate.college,
        candidate.sector_interest,
        candidate.location_preference,
    ]

    # Skills check (required: at least one skill)
    skills = []
    if candidate.skills:
        try:
            skills = json.loads(candidate.skills) if isinstance(candidate.skills, str) else candidate.skills
        except (json.JSONDecodeError, TypeError):
            skills = []

    filled_required = sum(1 for f in required_fields if f and str(f).strip())
    skills_filled = 1 if (skills and len(skills) > 0) else 0
    filled_optional = sum(1 for f in optional_fields if f and str(f).strip())

    total_items = len(required_fields) + 1 + len(optional_fields)  # 4 + 1 + 9 = 14
    total_filled = filled_required + skills_filled + filled_optional

    score = round((total_filled / total_items) * 100, 1)

    # If any required field is missing, score cannot exceed 90%
    if filled_required < len(required_fields) or skills_filled == 0:
        score = min(score, 90.0)

    return score


def create_candidate_profile(db: Session, user, data: dict) -> dict:
    """Create a candidate profile for the current user."""
    if user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can create a candidate profile")

    existing = candidate_repository.get_candidate_by_user_id(db, user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Candidate profile already exists")

    if "name" in data and data["name"] and user:
        user.name = data["name"].strip()
        db.add(user)

    cand_data = {k: v for k, v in data.items() if k != "name"}
    candidate = candidate_repository.create_candidate(db, user.id, cand_data)
    candidate.profile_completion = calculate_profile_completion(candidate, user=user)
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

    # If name is submitted, persist it to user
    if "name" in data and data["name"] and user:
        user.name = data["name"].strip()
        db.add(user)

    cand_data = {k: v for k, v in data.items() if k != "name"}
    candidate = candidate_repository.update_candidate(db, candidate, cand_data)
    candidate.profile_completion = calculate_profile_completion(candidate, user=user)
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
    """Convert a Candidate ORM object to a dict with parsed skills and user info."""
    skills = []
    if candidate.skills:
        try:
            skills = json.loads(candidate.skills) if isinstance(candidate.skills, str) else candidate.skills
        except (json.JSONDecodeError, TypeError):
            skills = []

    user = getattr(candidate, "user", None)

    return {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "name": user.name if user else getattr(candidate, "name", None),
        "email": user.email if user else getattr(candidate, "email", None),
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
