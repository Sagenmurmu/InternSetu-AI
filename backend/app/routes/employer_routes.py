from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.employer_schema import CompanyCreate, CompanyUpdate
from app.services import employer_service
from app.utils.response import success_response

router = APIRouter(prefix="/employers", tags=["Employers"])


@router.post("/company")
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    result = employer_service.create_company_profile(db, current_user, data.model_dump())
    return success_response(result, "Company profile created")


@router.get("/company")
def get_company(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    result = employer_service.get_my_company_profile(db, current_user)
    return success_response(result, "Company profile retrieved")


@router.put("/company")
def update_company(
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    update_data = data.model_dump(exclude_unset=True)
    result = employer_service.update_company_profile(db, current_user, update_data)
    return success_response(result, "Company profile updated")
