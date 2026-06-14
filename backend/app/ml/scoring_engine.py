"""Scoring modules for Qualifications, Locations, Sectors, and Skills matching."""

from app.ml.model_config import QUALIFICATION_HIERARCHY, SECTOR_GROUPS


def calculate_skill_score(candidate_skills, required_skills) -> dict:
    """Wrapper calling calculate_skill_similarity."""
    from app.ml.skill_similarity import calculate_skill_similarity
    return calculate_skill_similarity(candidate_skills, required_skills)


def calculate_qualification_score(candidate_qualification: str, required_qualification: str) -> dict:
    """
    Calculate scoring metrics for qualification match based on academic hierarchies.
    """
    if not required_qualification:
        return {"score": 75.0, "reason": "No qualification requirement specified"}
        
    if not candidate_qualification:
        return {"score": 0.0, "reason": "Candidate has no specified qualification"}

    cand_str = candidate_qualification.lower().strip()
    req_str = required_qualification.lower().strip()
    
    # Exact Match
    if cand_str == req_str:
        return {"score": 100.0, "reason": f"Qualification matches exactly: {candidate_qualification}"}

    # Hierarchy lookup
    def get_level(q_str: str) -> int:
        for key, val in QUALIFICATION_HIERARCHY.items():
            if key in q_str:
                return val
        return -1

    cand_level = get_level(cand_str)
    req_level = get_level(req_str)

    # Unknown qualifications
    if cand_level == -1 or req_level == -1:
        return {"score": 50.0, "reason": f"Assumed partial match for qualification: {candidate_qualification}"}

    if cand_level == req_level:
        return {"score": 100.0, "reason": f"Qualification level matches exactly: {candidate_qualification}"}
    elif cand_level > req_level:
        return {"score": 90.0, "reason": f"Candidate qualification ({candidate_qualification}) is higher than required ({required_qualification})"}
    elif cand_level == req_level - 1:
        return {"score": 60.0, "reason": f"Candidate qualification ({candidate_qualification}) is one level below requirement ({required_qualification})"}
    else:
        return {"score": 0.0, "reason": f"Qualification gap: {candidate_qualification} does not satisfy {required_qualification}"}


def calculate_location_score(candidate, internship) -> dict:
    """
    Calculate location proximity rating between candidate profile and internship listings.
    """
    cand_dist = (getattr(candidate, "district", "") or "").lower().strip()
    cand_state = (getattr(candidate, "state", "") or "").lower().strip()
    
    job_dist = (getattr(internship, "district", "") or "").lower().strip()
    job_state = (getattr(internship, "state", "") or "").lower().strip()
    job_mode = (getattr(internship, "mode", "") or "").lower().strip()
    
    willing_relocate = bool(getattr(candidate, "willing_to_relocate", False))

    if cand_dist and job_dist and cand_dist == job_dist:
        return {"score": 100.0, "reason": f"Same district proximity match ({candidate.district})"}
        
    if job_mode == "remote":
        return {"score": 90.0, "reason": "Remote mode vacancy"}
        
    if cand_state and job_state and cand_state == job_state:
        if job_mode == "hybrid":
            return {"score": 70.0, "reason": f"Same state ({candidate.state}) with Hybrid work mode"}
        else:
            return {"score": 75.0, "reason": f"Same state match ({candidate.state})"}
            
    if willing_relocate:
        return {"score": 55.0, "reason": "Candidate is willing to relocate"}
        
    return {
        "score": 25.0,
        "reason": f"Geographic difference (Job in {internship.district or internship.state or 'different location'}), unwilling to relocate"
    }


def calculate_sector_score(candidate_sector_interest: str, internship_sector: str) -> dict:
    """
    Calculate sector alignment rating using pre-configured sector transferability maps.
    """
    cand_sec = (candidate_sector_interest or "").lower().strip()
    job_sec = (internship_sector or "").lower().strip()

    if not job_sec:
        return {"score": 60.0, "reason": "No internship sector classification specified"}
        
    if not cand_sec:
        return {"score": 40.0, "reason": "Candidate has no sector interest specified"}
        
    if cand_sec == job_sec:
        return {"score": 100.0, "reason": f"Exact sector interest match ({internship_sector})"}

    # Evaluate related groups
    for group in SECTOR_GROUPS:
        if cand_sec in group and job_sec in group:
            return {
                "score": 70.0,
                "reason": f"Related/transferable sector match ({candidate_sector_interest} and {internship_sector})"
            }

    return {
        "score": 35.0,
        "reason": f"Different sector interest: {candidate_sector_interest} (Job in {internship_sector})"
    }


def calculate_final_score(score_breakdown: dict) -> float:
    """Calculate final matching score based on configurations weights."""
    from app.ml.model_config import (
        SKILL_WEIGHT,
        QUALIFICATION_WEIGHT,
        LOCATION_WEIGHT,
        SECTOR_WEIGHT,
        FAIRNESS_WEIGHT
    )
    final = (
        score_breakdown.get("skill_score", 0.0) * SKILL_WEIGHT
        + score_breakdown.get("qualification_score", 0.0) * QUALIFICATION_WEIGHT
        + score_breakdown.get("location_score", 0.0) * LOCATION_WEIGHT
        + score_breakdown.get("sector_score", 0.0) * SECTOR_WEIGHT
        + score_breakdown.get("fairness_score", 0.0) * FAIRNESS_WEIGHT
    )
    return round(min(max(final, 0.0), 100.0), 2)
