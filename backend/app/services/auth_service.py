from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories import user_repository
from app.models.audit_log_model import AuditLog
from app.utils.validators import validate_email_format


def register_user(db: Session, name: str, email: str, password: str, role: str) -> dict:
    """Register a new user. Returns user data and JWT token."""
    if not validate_email_format(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    existing = user_repository.get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if role not in ["candidate", "employer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    password_hash = hash_password(password)
    user = user_repository.create_user(db, name, email, password_hash, role)

    token = create_access_token({"user_id": user.id, "role": user.role})

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="USER_REGISTER",
                     entity_type="user", entity_id=user.id, description=f"User {email} registered as {role}")
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
        },
    }


def login_user(db: Session, email: str, password: str) -> dict:
    """Authenticate a user and return JWT token."""
    user = user_repository.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"user_id": user.id, "role": user.role})

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="USER_LOGIN",
                     entity_type="user", entity_id=user.id, description=f"User {email} logged in")
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
        },
    }


def get_current_user_profile(db: Session, user) -> dict:
    """Return current user's full profile including role-specific data."""
    profile = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }

    if user.role == "candidate" and user.candidate:
        import json
        candidate = user.candidate
        skills = []
        if candidate.skills:
            try:
                skills = json.loads(candidate.skills)
            except (json.JSONDecodeError, TypeError):
                skills = []
        profile["candidate"] = {
            "id": candidate.id,
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
            "profile_completion": candidate.profile_completion,
        }

    if user.role == "employer" and user.company:
        company = user.company
        profile["company"] = {
            "id": company.id,
            "company_name": company.company_name,
            "sector": company.sector,
            "description": company.description,
            "district": company.district,
            "state": company.state,
            "total_capacity": company.total_capacity,
        }

    return profile
