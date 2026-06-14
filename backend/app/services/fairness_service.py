"""Fairness scoring for the AI matching engine."""


def calculate_fairness_score(candidate) -> float:
    """
    Calculate a fairness bonus score based on candidate demographics.
    Designed to boost underrepresented groups for equitable allocation.

    Bonuses:
        SC/ST:  +15 points
        OBC/EWS: +8 points
        Female/Other gender: +10 points
        Rural: +10 points

    Returns a score between 0 and 100.
    """
    score = 50.0  # Base score for all candidates

    category = (candidate.category or "").upper()
    if category in ("SC", "ST"):
        score += 15
    elif category in ("OBC", "EWS"):
        score += 8

    gender = (candidate.gender or "").lower()
    if gender in ("female", "other"):
        score += 10

    rural_urban = (candidate.rural_or_urban or "").lower()
    if rural_urban == "rural":
        score += 10

    return min(score, 100.0)
