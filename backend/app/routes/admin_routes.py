from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.services import analytics_service
from app.utils.response import success_response
from app.schemas.admin_schema import PolicyWeightUpdateRequest, PolicyWeightResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def admin_overview(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_overview_stats(db)
    return success_response(result, "Admin overview retrieved")


@router.get("/district-analytics")
def district_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_district_analytics(db)
    return success_response(result, "District analytics retrieved")


@router.get("/category-analytics")
def category_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_category_analytics(db)
    return success_response(result, "Category analytics retrieved")


@router.get("/capacity-utilization")
def capacity_utilization(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_capacity_utilization(db)
    return success_response(result, "Capacity utilization retrieved")


@router.get("/audit-logs")
def audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_audit_logs(db)
    return success_response(result, "Audit logs retrieved")


@router.get("/matching-insights")
def matching_insights(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    result = analytics_service.get_matching_insights(db)
    return success_response(result, "Matching insights retrieved")


@router.get("/policy-weights")
def get_policy_weights(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    from app.services import policy_service
    result = policy_service.get_current_policy_weights(db)
    return success_response(PolicyWeightResponse.model_validate(result), "Policy weights retrieved")


@router.put("/policy-weights")
def update_policy_weights(
    payload: PolicyWeightUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    from app.services import policy_service
    result = policy_service.update_policy_weights(db, payload, current_user)
    return success_response(PolicyWeightResponse.model_validate(result), "Policy weights updated successfully")


@router.post("/policy-weights/reset")
def reset_policy_weights(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    from app.services import policy_service
    result = policy_service.reset_policy_weights(db, current_user)
    return success_response(PolicyWeightResponse.model_validate(result), "Policy weights reset to default")

