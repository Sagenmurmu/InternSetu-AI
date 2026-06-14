from sqlalchemy.orm import Session
from app.models.application_model import Application


def create_application(db: Session, candidate_id: int, internship_id: int) -> Application:
    application = Application(candidate_id=candidate_id, internship_id=internship_id, status="applied")
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application_by_id(db: Session, application_id: int) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()


def check_duplicate_application(db: Session, candidate_id: int, internship_id: int) -> bool:
    return (
        db.query(Application)
        .filter(Application.candidate_id == candidate_id, Application.internship_id == internship_id)
        .first()
        is not None
    )


def get_applications_by_candidate(db: Session, candidate_id: int) -> list[Application]:
    return db.query(Application).filter(Application.candidate_id == candidate_id).order_by(Application.applied_at.desc()).all()


def get_applications_by_company(db: Session, company_id: int) -> list[Application]:
    """Get all applications for internships belonging to a company."""
    from app.models.internship_model import Internship

    return (
        db.query(Application)
        .join(Internship, Application.internship_id == Internship.id)
        .filter(Internship.company_id == company_id)
        .order_by(Application.applied_at.desc())
        .all()
    )


def get_all_applications(db: Session) -> list[Application]:
    return db.query(Application).order_by(Application.applied_at.desc()).all()


def update_application_status(db: Session, application: Application, status: str, reason: str = None) -> Application:
    application.status = status
    if reason:
        application.decision_reason = reason
    db.commit()
    db.refresh(application)
    return application
