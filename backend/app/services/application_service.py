from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import application_repository, candidate_repository, internship_repository, employer_repository
from app.models.audit_log_model import AuditLog
from app.core.constants import ApplicationStatus
from app.utils.validators import validate_status_transition


def apply_to_internship(db: Session, user, internship_id: int) -> dict:
    """Candidate applies to an internship."""
    if user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply to internships")

    candidate = candidate_repository.get_candidate_by_user_id(db, user.id)
    if not candidate:
        raise HTTPException(status_code=400, detail="Create a candidate profile first")

    internship = internship_repository.get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    if not internship.is_active:
        raise HTTPException(status_code=400, detail="This internship is no longer active")

    if internship.selected_count >= internship.capacity:
        raise HTTPException(status_code=400, detail="Internship capacity is full")

    if application_repository.check_duplicate_application(db, candidate.id, internship_id):
        raise HTTPException(status_code=400, detail="You have already applied to this internship")

    application = application_repository.create_application(db, candidate.id, internship_id)

    # Audit log
    audit = AuditLog(user_id=user.id, user_role=user.role, action="APPLICATION_SUBMITTED",
                     entity_type="application", entity_id=application.id,
                     description=f"{user.name} applied to '{internship.title}'")
    db.add(audit)
    db.commit()

    return _serialize_application(application)


def get_my_applications(db: Session, user) -> list:
    """Get all applications for the current candidate."""
    candidate = candidate_repository.get_candidate_by_user_id(db, user.id)
    if not candidate:
        return []

    applications = application_repository.get_applications_by_candidate(db, candidate.id)
    return [_serialize_application(app) for app in applications]


def get_company_applications(db: Session, user) -> list:
    """Get all applications for the current employer's company."""
    company = employer_repository.get_company_by_user_id(db, user.id)
    if not company:
        return []

    applications = application_repository.get_applications_by_company(db, company.id)
    return [_serialize_application(app) for app in applications]


def update_application_status(db: Session, user, application_id: int, new_status: str, reason: str = None) -> dict:
    """Update application status (employer only, must own the internship)."""
    application = application_repository.get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify ownership
    internship = internship_repository.get_internship_by_id(db, application.internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    if user.role == "employer":
        company = employer_repository.get_company_by_user_id(db, user.id)
        if not company or internship.company_id != company.id:
            raise HTTPException(status_code=403, detail="You can only manage applications for your own internships")

    # Validate status transition
    if not validate_status_transition(application.status, new_status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {application.status} → {new_status}"
        )

    old_status = application.status

    # Handle selected_count changes
    if new_status == ApplicationStatus.SELECTED:
        if internship.selected_count >= internship.capacity:
            raise HTTPException(status_code=400, detail="Internship capacity is full. Cannot select more candidates.")
        internship.selected_count += 1

    if old_status == ApplicationStatus.SELECTED and new_status in [ApplicationStatus.REJECTED, ApplicationStatus.WAITLISTED]:
        internship.selected_count = max(0, internship.selected_count - 1)

    application = application_repository.update_application_status(db, application, new_status, reason)
    db.commit()

    # Audit log
    action_map = {
        ApplicationStatus.SHORTLISTED: "CANDIDATE_SHORTLISTED",
        ApplicationStatus.SELECTED: "CANDIDATE_SELECTED",
        ApplicationStatus.REJECTED: "CANDIDATE_REJECTED",
        ApplicationStatus.WAITLISTED: "CANDIDATE_WAITLISTED",
    }
    audit = AuditLog(
        user_id=user.id, user_role=user.role,
        action=action_map.get(new_status, "APPLICATION_SUBMITTED"),
        entity_type="application", entity_id=application.id,
        description=f"Application #{application.id} status changed: {old_status} → {new_status}"
    )
    db.add(audit)
    db.commit()

    return _serialize_application(application)


def _serialize_application(application) -> dict:
    result = {
        "id": application.id,
        "candidate_id": application.candidate_id,
        "internship_id": application.internship_id,
        "status": application.status,
        "decision_reason": application.decision_reason,
        "applied_at": application.applied_at,
        "updated_at": application.updated_at,
        "candidate_name": None,
        "internship_title": None,
        "company_name": None,
        "match_score": None,
    }

    if application.candidate and application.candidate.user:
        result["candidate_name"] = application.candidate.user.name

    if application.internship:
        result["internship_title"] = application.internship.title
        if application.internship.company:
            result["company_name"] = application.internship.company.company_name

    return result
