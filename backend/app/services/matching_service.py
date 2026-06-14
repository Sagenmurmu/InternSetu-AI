import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import match_repository, candidate_repository, internship_repository
from app.services.fairness_service import calculate_fairness_score
from app.services.explanation_service import generate_explanation
from app.core.constants import MATCHING_WEIGHTS
from app.models.audit_log_model import AuditLog
from app.utils.logger import logger
from app.ml.matching_engine import match_candidate_to_internship



def _parse_skills(raw) -> list[str]:
    """Parse skills from JSON text or list."""
    if not raw:
        return []
    if isinstance(raw, list):
        return raw
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []


def _calculate_skill_score(candidate_skills: list, required_skills: list) -> float:
    """Score based on skill overlap percentage."""
    if not required_skills:
        return 75.0  # No requirements = decent default
    if not candidate_skills:
        return 0.0

    candidate_lower = {s.lower().strip() for s in candidate_skills}
    required_lower = {s.lower().strip() for s in required_skills}
    overlap = candidate_lower & required_lower

    return round((len(overlap) / len(required_lower)) * 100, 1)


def _calculate_qualification_score(candidate_qual: str, required_qual: str) -> float:
    """Score based on qualification match."""
    if not required_qual:
        return 75.0
    if not candidate_qual:
        return 0.0

    if candidate_qual.lower().strip() == required_qual.lower().strip():
        return 100.0

    # Hierarchy-based partial matching
    hierarchy = [
        "10th pass", "12th pass", "iti", "diploma",
        "b.tech / b.e.", "b.sc", "b.com", "bba / bms",
        "m.tech / m.e.", "mba", "m.sc", "phd"
    ]
    candidate_idx = next((i for i, q in enumerate(hierarchy) if q in candidate_qual.lower()), -1)
    required_idx = next((i for i, q in enumerate(hierarchy) if q in required_qual.lower()), -1)

    if candidate_idx >= required_idx and candidate_idx != -1:
        return 80.0  # Higher qualification than required
    return 30.0


def _calculate_location_score(candidate, internship) -> float:
    """Score based on location proximity."""
    # Same district
    if candidate.district and internship.district:
        if candidate.district.lower().strip() == internship.district.lower().strip():
            return 100.0

    # Same state
    if candidate.state and internship.state:
        if candidate.state.lower().strip() == internship.state.lower().strip():
            return 75.0

    # Remote mode
    if internship.mode and internship.mode.lower() == "remote":
        return 80.0

    # Willing to relocate
    if candidate.willing_to_relocate:
        return 50.0

    return 20.0


def _calculate_sector_score(candidate_interest: str, internship_sector: str) -> float:
    """Score based on sector interest alignment."""
    if not internship_sector:
        return 60.0
    if not candidate_interest:
        return 40.0

    if candidate_interest.lower().strip() == internship_sector.lower().strip():
        return 100.0

    return 50.0


def _compute_final_score(scores: dict) -> float:
    """Compute weighted final score."""
    final = (
        scores["skill_score"] * MATCHING_WEIGHTS["skill"]
        + scores["qualification_score"] * MATCHING_WEIGHTS["qualification"]
        + scores["location_score"] * MATCHING_WEIGHTS["location"]
        + scores["sector_score"] * MATCHING_WEIGHTS["sector"]
        + scores["fairness_score"] * MATCHING_WEIGHTS["fairness"]
    )
    return round(final, 1)


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

    results = []

    for internship in internships:
        match_res = match_candidate_to_internship(candidate, internship)
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
    return results


def get_candidate_recommendations(db: Session, candidate_id: int) -> list:
    """Get stored match results for a candidate, sorted by score."""
    return match_repository.get_matches_by_candidate(db, candidate_id)


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

    results = []

    for candidate in candidates:
        match_res = match_candidate_to_internship(candidate, internship)
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
    return results


def get_internship_candidate_ranking(db: Session, internship_id: int) -> list:
    """Get stored candidate rankings for an internship, sorted by score."""
    return match_repository.get_matches_by_internship(db, internship_id)
