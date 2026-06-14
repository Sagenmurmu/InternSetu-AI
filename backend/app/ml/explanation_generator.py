"""Natural language explanation generator for match results."""


def generate_explanation(
    candidate,
    internship,
    scores: dict,
    matched_skills: list,
    missing_skills: list,
    qual_reason: str,
    loc_reason: str,
    sec_reason: str
) -> list[str]:
    """
    Generate a list of human-readable match explanations for the candidate/internship recommendation pair.
    """
    explanations = []

    # 1. Skills match details
    skill_score = scores.get("skill_score", 0.0)
    if matched_skills:
        skill_str = ", ".join(matched_skills)
        if skill_score >= 80.0:
            explanations.append(f"Strong skill match: {skill_str} matched with the internship requirements.")
        else:
            explanations.append(f"Partial skill match: {skill_str} matched with the internship requirements.")
    else:
        explanations.append("No matching skills identified for this role.")
        
    if missing_skills:
        missing_str = ", ".join(missing_skills)
        explanations.append(f"Missing skills: {missing_str}. Candidate can improve these areas.")

    # 2. Qualification details
    explanations.append(f"Qualification status: {qual_reason}.")

    # 3. Location details
    explanations.append(f"Location status: {loc_reason}.")

    # 4. Sector details
    explanations.append(f"Sector status: {sec_reason}.")

    # 5. Fairness & Diversity
    fairness_score = scores.get("fairness_score", 50.0)
    if fairness_score > 50.0:
        factors = []
        rural_urban = (getattr(candidate, "rural_or_urban", "") or "").lower().strip()
        if rural_urban == "rural":
            factors.append("rural background")
            
        dist = (getattr(candidate, "district", "") or "").lower().strip()
        from app.ml.model_config import ASPIRATIONAL_DISTRICTS
        if dist in ASPIRATIONAL_DISTRICTS:
            factors.append("aspirational district residency")
            
        cat = (getattr(candidate, "category", "") or "").lower().strip()
        if cat in ("sc", "st", "obc", "ews"):
            factors.append(f"{cat.upper()} category representation")
            
        gender = (getattr(candidate, "gender", "") or "").lower().strip()
        if gender in ("female", "other"):
            factors.append(f"{gender} representation support")
            
        past = getattr(candidate, "past_participation", False)
        if not past:
            factors.append("first-time platform participation")
            
        if factors:
            factor_str = ", ".join(factors)
            explanations.append(f"Fairness factor: {factor_str} supports representation goals.")

    # 6. Capacity vacancy warnings
    capacity = getattr(internship, "capacity", 1) or 1
    selected_count = getattr(internship, "selected_count", 0) or 0
    remaining = capacity - selected_count
    if remaining <= 2 and remaining > 0:
        explanations.append(f"Limited seats remaining: Only {remaining} slots available.")

    # 7. Final overall summary recommendation
    final_score = scores.get("final_score", 0.0)
    if final_score >= 80.0:
        explanations.append("Overall, this candidate is a strong fit for the internship.")
    elif final_score >= 60.0:
        explanations.append("Overall, this candidate is a reasonable fit with some training opportunity.")
    else:
        explanations.append("Overall, this candidate has low match alignment and may require substantial preparation.")

    return explanations
