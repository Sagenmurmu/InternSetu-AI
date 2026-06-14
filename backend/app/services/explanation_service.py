"""Natural language explanation generator for match results."""


def generate_explanation(candidate, internship, scores: dict) -> list[str]:
    """
    Generate a list of human-readable explanations for a match result.

    Args:
        candidate: Candidate ORM object
        internship: Internship ORM object
        scores: dict with skill_score, qualification_score, location_score, sector_score, fairness_score
    """
    explanations = []

    # Skill match
    if scores["skill_score"] >= 80:
        explanations.append(f"Strong skill match — candidate has most of the required skills for this role.")
    elif scores["skill_score"] >= 50:
        explanations.append(f"Partial skill match — candidate has some relevant skills for this position.")
    else:
        explanations.append(f"Limited skill overlap — candidate may need to develop additional skills.")

    # Qualification
    if scores["qualification_score"] >= 100:
        explanations.append(f"Qualification match — candidate's {candidate.qualification or 'qualification'} meets the requirement.")
    else:
        explanations.append(f"Qualification gap — the required qualification is {internship.required_qualification or 'not specified'}.")

    # Location
    if scores["location_score"] >= 100:
        explanations.append(f"Same location — candidate is from {candidate.district or candidate.state or 'the same area'}.")
    elif scores["location_score"] >= 75:
        explanations.append(f"Same state — candidate is from {candidate.state or 'a nearby area'}.")
    elif scores["location_score"] >= 50:
        explanations.append(f"Candidate is willing to relocate for this opportunity.")
    else:
        explanations.append(f"Location difference — internship is in {internship.location or internship.state or 'a different area'}.")

    # Sector
    if scores["sector_score"] >= 100:
        explanations.append(f"Sector interest aligned — candidate is interested in {candidate.sector_interest or 'this sector'}.")
    else:
        explanations.append(f"Different sector interest, but cross-sector skills may apply.")

    # Fairness
    if scores["fairness_score"] >= 70:
        explanations.append(f"Fairness bonus applied — supporting diversity and inclusion in allocation.")

    return explanations
