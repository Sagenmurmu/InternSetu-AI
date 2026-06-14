from sqlalchemy.orm import Session
from app.repositories import policy_weight_repository
from app.models.audit_log_model import AuditLog
from app.schemas.admin_schema import PolicyWeightUpdateRequest
from fastapi import HTTPException


def get_current_policy_weights(db: Session):
    """Fetch active policy weights."""
    return policy_weight_repository.get_active_policy_weights(db)


def update_policy_weights(db: Session, payload: PolicyWeightUpdateRequest, admin_user):
    """Update active policy weights and write an audit log."""
    if admin_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")
    
    data = payload.model_dump()
    policy = policy_weight_repository.update_policy_weights(db, data, updated_by=admin_user.id)
    
    audit = AuditLog(
        user_id=admin_user.id,
        user_role=admin_user.role,
        action="POLICY_UPDATE",
        entity_type="policy_weights",
        entity_id=policy.id,
        description="Admin updated matching policy weights"
    )
    db.add(audit)
    db.commit()
    return policy


def reset_policy_weights(db: Session, admin_user):
    """Reset weights to original defaults and write an audit log."""
    if admin_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    policy = policy_weight_repository.reset_policy_weights(db, updated_by=admin_user.id)
    
    audit = AuditLog(
        user_id=admin_user.id,
        user_role=admin_user.role,
        action="POLICY_UPDATE",
        entity_type="policy_weights",
        entity_id=policy.id,
        description="Admin reset matching policy weights to default"
    )
    db.add(audit)
    db.commit()
    return policy
