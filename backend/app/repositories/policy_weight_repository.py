from sqlalchemy.orm import Session
from app.models.policy_weight_model import PolicyWeight
from app.core.constants import MATCHING_WEIGHTS


def get_active_policy_weights(db: Session) -> PolicyWeight:
    """Retrieve the single active policy weights row. If none exists, create default."""
    policy = db.query(PolicyWeight).filter(PolicyWeight.is_active == True).first()
    if not policy:
        policy = PolicyWeight(
            skill_weight=MATCHING_WEIGHTS["skill"],
            qualification_weight=MATCHING_WEIGHTS["qualification"],
            location_weight=MATCHING_WEIGHTS["location"],
            sector_weight=MATCHING_WEIGHTS["sector"],
            fairness_weight=MATCHING_WEIGHTS["fairness"],
            is_active=True
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy


def create_policy_weights(db: Session, data: dict, updated_by: int) -> PolicyWeight:
    """Create new active policy weights, setting older records to inactive."""
    db.query(PolicyWeight).filter(PolicyWeight.is_active == True).update({"is_active": False})
    
    new_policy = PolicyWeight(
        skill_weight=data.get("skill_weight", MATCHING_WEIGHTS["skill"]),
        qualification_weight=data.get("qualification_weight", MATCHING_WEIGHTS["qualification"]),
        location_weight=data.get("location_weight", MATCHING_WEIGHTS["location"]),
        sector_weight=data.get("sector_weight", MATCHING_WEIGHTS["sector"]),
        fairness_weight=data.get("fairness_weight", MATCHING_WEIGHTS["fairness"]),
        is_active=True,
        updated_by=updated_by
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    return new_policy


def update_policy_weights(db: Session, data: dict, updated_by: int) -> PolicyWeight:
    """Update existing active policy weights."""
    policy = get_active_policy_weights(db)
    policy.skill_weight = data["skill_weight"]
    policy.qualification_weight = data["qualification_weight"]
    policy.location_weight = data["location_weight"]
    policy.sector_weight = data["sector_weight"]
    policy.fairness_weight = data["fairness_weight"]
    policy.updated_by = updated_by
    db.commit()
    db.refresh(policy)
    return policy


def reset_policy_weights(db: Session, updated_by: int) -> PolicyWeight:
    """Reset dynamic matching weights to original fallback constants."""
    policy = get_active_policy_weights(db)
    policy.skill_weight = MATCHING_WEIGHTS["skill"]
    policy.qualification_weight = MATCHING_WEIGHTS["qualification"]
    policy.location_weight = MATCHING_WEIGHTS["location"]
    policy.sector_weight = MATCHING_WEIGHTS["sector"]
    policy.fairness_weight = MATCHING_WEIGHTS["fairness"]
    policy.updated_by = updated_by
    db.commit()
    db.refresh(policy)
    return policy
