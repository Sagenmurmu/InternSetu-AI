from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.application_schema import ApplicationCreate, ApplicationStatusUpdate
from app.services import application_service
from app.utils.response import success_response

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/")
def apply_to_internship(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    result = application_service.apply_to_internship(db, current_user, data.internship_id)
    return success_response(result, "Application submitted successfully")


@router.get("/my")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    result = application_service.get_my_applications(db, current_user)
    return success_response(result, "Applications retrieved")


@router.get("/company")
def get_company_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    result = application_service.get_company_applications(db, current_user)
    return success_response(result, "Company applications retrieved")


@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer", "admin")),
):
    result = application_service.update_application_status(
        db, current_user, application_id, data.status, data.decision_reason
    )
    return success_response(result, f"Application status updated to {data.status}")
