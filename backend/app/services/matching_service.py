import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import match_repository, candidate_repository, internship_repository
from app.models.audit_log_model import AuditLog
from app.utils.logger import logger
from app.ml.matching_engine import match_candidate_to_internship


def generate_candidate_recommendations(db: Session, candidate_id: int, user=None) -> list:
    """
    Generate match scores for a candidate against all active internships.
    Stores results in the database and returns them.
    """
    candidate = candidate_repository.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    internships = internship_repository.get_active_internships(db)
    if not internships:
        return []

    # Clear old matches
    match_repository.delete_matches_by_candidate(db, candidate_id)

    # Fetch dynamic database-driven policy weights
    from app.services.policy_service import get_current_policy_weights
    policy = get_current_policy_weights(db)
    weights_dict = {
        "skill_weight": policy.skill_weight,
        "qualification_weight": policy.qualification_weight,
        "location_weight": policy.location_weight,
        "sector_weight": policy.sector_weight,
        "fairness_weight": policy.fairness_weight
    }

    results = []

    for internship in internships:
        match_res = match_candidate_to_internship(candidate, internship, weights=weights_dict)
        if match_res is None:
            continue

        match_data = {
            "candidate_id": candidate_id,
            "internship_id": internship.id,
            "skill_score": match_res["skill_score"],
            "qualification_score": match_res["qualification_score"],
            "location_score": match_res["location_score"],
            "sector_score": match_res["sector_score"],
            "fairness_score": match_res["fairness_score"],
            "final_score": match_res["final_score"],
            "explanation": match_res["explanation"],
        }
        match = match_repository.save_match_result(db, match_data)
        results.append(match)

    # Audit log
    if user:
        audit = AuditLog(user_id=user.id, user_role=user.role, action="MATCHING_RUN",
                         entity_type="candidate", entity_id=candidate_id,
                         description=f"Generated {len(results)} recommendations for candidate #{candidate_id}")
        db.add(audit)
        db.commit()

    logger.info(f"Generated {len(results)} matches for candidate #{candidate_id}")
    from app.ml.fairness_reranker import apply_fairness_reranking
    return apply_fairness_reranking(results)


def get_candidate_recommendations(db: Session, candidate_id: int) -> list:
    """Get stored match results for a candidate, sorted by score."""
    from app.ml.fairness_reranker import apply_fairness_reranking
    return apply_fairness_reranking(match_repository.get_matches_by_candidate(db, candidate_id))


def generate_internship_candidate_ranking(db: Session, internship_id: int, user=None) -> list:
    """
    Generate ranked candidate list for a specific internship.
    """
    internship = internship_repository.get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    candidates = candidate_repository.get_all_candidates(db)
    if not candidates:
        return []

    # Clear old matches for this internship
    match_repository.delete_matches_by_internship(db, internship_id)

    # Fetch dynamic database-driven policy weights
    from app.services.policy_service import get_current_policy_weights
    policy = get_current_policy_weights(db)
    weights_dict = {
        "skill_weight": policy.skill_weight,
        "qualification_weight": policy.qualification_weight,
        "location_weight": policy.location_weight,
        "sector_weight": policy.sector_weight,
        "fairness_weight": policy.fairness_weight
    }

    results = []

    for candidate in candidates:
        match_res = match_candidate_to_internship(candidate, internship, weights=weights_dict)
        if match_res is None:
            continue

        match_data = {
            "candidate_id": candidate.id,
            "internship_id": internship_id,
            "skill_score": match_res["skill_score"],
            "qualification_score": match_res["qualification_score"],
            "location_score": match_res["location_score"],
            "sector_score": match_res["sector_score"],
            "fairness_score": match_res["fairness_score"],
            "final_score": match_res["final_score"],
            "explanation": match_res["explanation"],
        }
        match = match_repository.save_match_result(db, match_data)
        results.append(match)

    # Audit log
    if user:
        audit = AuditLog(user_id=user.id, user_role=user.role, action="MATCHING_RUN",
                         entity_type="internship", entity_id=internship_id,
                         description=f"Generated {len(results)} candidate rankings for internship #{internship_id}")
        db.add(audit)
        db.commit()

    logger.info(f"Generated {len(results)} candidate rankings for internship #{internship_id}")
    from app.ml.fairness_reranker import apply_fairness_reranking
    return apply_fairness_reranking(results)


def get_internship_candidate_ranking(db: Session, internship_id: int) -> list:
    """Get stored candidate rankings for an internship, sorted by score."""
    from app.ml.fairness_reranker import apply_fairness_reranking
    return apply_fairness_reranking(match_repository.get_matches_by_internship(db, internship_id))
