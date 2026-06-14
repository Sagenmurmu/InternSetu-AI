"""Main AI Recommendation Engine coordinating filters, scoring, and re-ranking."""

from app.ml.model_config import (
    SKILL_WEIGHT,
    QUALIFICATION_WEIGHT,
    LOCATION_WEIGHT,
    SECTOR_WEIGHT,
    FAIRNESS_WEIGHT
)
from app.ml.eligibility_filter import is_eligible
from app.ml.scoring_engine import (
    calculate_skill_score,
    calculate_qualification_score,
    calculate_location_score,
    calculate_sector_score
)
from app.ml.fairness_reranker import calculate_fairness_score, apply_fairness_reranking
from app.ml.explanation_generator import generate_explanation


def match_candidate_to_internship(candidate, internship, weights: dict = None) -> dict | None:
    """
    Perform a complete matching evaluation for a single candidate/internship pair.
    Returns a dictionary of scores and explanations, or None if candidate is ineligible.
    """
    # 1. Enforce hard constraints (active status, vacancy capacities)
    eligibility = is_eligible(candidate, internship)
    if not eligibility["eligible"]:
        return None

    # 2. Compute sub-scores and metadata
    skill_res = calculate_skill_score(candidate.skills, internship.required_skills)
    
    qual_res = calculate_qualification_score(candidate.qualification, internship.required_qualification)
    
    loc_res = calculate_location_score(candidate, internship)
    
    sec_res = calculate_sector_score(candidate.sector_interest, internship.sector)
    
    fairness_val = calculate_fairness_score(candidate)

    # 3. Calculate weighted final score
    if weights:
        s_w = weights.get("skill_weight", SKILL_WEIGHT)
        q_w = weights.get("qualification_weight", QUALIFICATION_WEIGHT)
        l_w = weights.get("location_weight", LOCATION_WEIGHT)
        sec_w = weights.get("sector_weight", SECTOR_WEIGHT)
        f_w = weights.get("fairness_weight", FAIRNESS_WEIGHT)
    else:
        s_w = SKILL_WEIGHT
        q_w = QUALIFICATION_WEIGHT
        l_w = LOCATION_WEIGHT
        sec_w = SECTOR_WEIGHT
        f_w = FAIRNESS_WEIGHT

    final_score = (
        skill_res["score"] * s_w
        + qual_res["score"] * q_w
        + loc_res["score"] * l_w
        + sec_res["score"] * sec_w
        + fairness_val * f_w
    )
    final_score = round(min(max(final_score, 0.0), 100.0), 2)

    # 4. Compile explainable rationales
    scores_dict = {
        "skill_score": skill_res["score"],
        "qualification_score": qual_res["score"],
        "location_score": loc_res["score"],
        "sector_score": sec_res["score"],
        "fairness_score": fairness_val,
        "final_score": final_score
    }
    
    explanation = generate_explanation(
        candidate,
        internship,
        scores_dict,
        skill_res["matched_skills"],
        skill_res["missing_skills"],
        qual_res["reason"],
        loc_res["reason"],
        sec_res["reason"]
    )

    # 5. Return match result metrics
    return {
        "skill_score": skill_res["score"],
        "qualification_score": qual_res["score"],
        "location_score": loc_res["score"],
        "sector_score": sec_res["score"],
        "fairness_score": fairness_val,
        "final_score": final_score,
        "explanation": explanation,
        "matched_skills": skill_res["matched_skills"],
        "missing_skills": skill_res["missing_skills"]
    }
