"""Eligibility filter for verifying candidate and internship constraints (e.g. active, capacity)."""

from app.ml.scoring_engine import calculate_qualification_score
from app.ml import model_config


def is_eligible(candidate, internship) -> dict:
    """
    Check if a candidate can be recommended/allocated to an internship.
    Checks active status, capacity vacancy, qualification requirements, profile completion, and past participation.
    Returns a dict with:
        "eligible": bool
        "reasons": list of strings explaining details if ineligible
    """
    eligible = True
    reasons = []

    if not internship:
        return {"eligible": False, "reasons": ["Internship not specified"]}

    if not candidate:
        return {"eligible": False, "reasons": ["Candidate not specified"]}

    # 1. Check if internship is active
    if not getattr(internship, "is_active", True):
        eligible = False
        reasons.append("Internship posting is inactive")

    # 2. Enforce capacity constraints: cannot match if slots are full
    capacity = getattr(internship, "capacity", 1) or 1
    selected_count = getattr(internship, "selected_count", 0) or 0
    if selected_count >= capacity:
        eligible = False
        reasons.append(f"Internship capacity is full ({selected_count}/{capacity} slots filled)")

    # 3. Check qualification hierarchy satisfaction at minimum level
    cand_qual = getattr(candidate, "qualification", "")
    job_qual = getattr(internship, "required_qualification", "")
    if job_qual:
        qual_res = calculate_qualification_score(cand_qual, job_qual)
        if qual_res["score"] == 0.0:
            eligible = False
            reasons.append(f"Qualification requirement not satisfied: {qual_res['reason']}")

    # 4. Check if candidate profile is incomplete or missing required fields
    cand_skills = getattr(candidate, "skills", None)
    if not cand_skills or (isinstance(cand_skills, str) and cand_skills.strip() in ("", "[]")):
        eligible = False
        reasons.append("Candidate profile is missing required skills")

    if not cand_qual or not getattr(candidate, "state", None) or not getattr(candidate, "district", None):
        eligible = False
        reasons.append("Candidate profile missing essential fields (qualification, state, or district)")

    profile_completion = getattr(candidate, "profile_completion", 0.0) or 0.0
    if profile_completion < 30.0:
        eligible = False
        reasons.append(f"Candidate profile completion ({profile_completion}%) is below minimum threshold")

    # 5. Check past participation rules
    allow_past = getattr(model_config, "ALLOW_PAST_PARTICIPATION", True)
    if not allow_past and getattr(candidate, "past_participation", False):
        eligible = False
        reasons.append("Candidate has past participation which is disallowed under current rules")

    return {"eligible": eligible, "reasons": reasons}
