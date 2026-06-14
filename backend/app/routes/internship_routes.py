from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.internship_schema import InternshipCreate, InternshipUpdate
from app.services import internship_service
from app.utils.response import success_response

router = APIRouter(prefix="/internships", tags=["Internships"])


@router.post("/")
def create_internship(
    data: InternshipCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    result = internship_service.create_internship(db, current_user, data.model_dump())
    return success_response(result, "Internship created successfully")


@router.get("/")
def list_internships(db: Session = Depends(get_db)):
    result = internship_service.get_all_internships(db)
    return success_response(result, "Internships retrieved")


@router.get("/company/my")
def my_company_internships(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    result = internship_service.get_my_company_internships(db, current_user)
    return success_response(result, "Company internships retrieved")


@router.get("/{internship_id}")
def get_internship(internship_id: int, db: Session = Depends(get_db)):
    result = internship_service.get_internship_details(db, internship_id)
    return success_response(result, "Internship details retrieved")


@router.put("/{internship_id}")
def update_internship(
    internship_id: int,
    data: InternshipUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    update_data = data.model_dump(exclude_unset=True)
    result = internship_service.update_internship(db, current_user, internship_id, update_data)
    return success_response(result, "Internship updated")
