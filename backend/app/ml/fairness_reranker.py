"""Fairness calculations and equitable candidate re-ranking strategies."""

from app.ml.model_config import ASPIRATIONAL_DISTRICTS


def calculate_fairness_score(candidate, current_distribution=None) -> float:
    """
    Calculate diversity and fairness adjustments based on candidate demographics.
    Cap output score at 100.0.
    """
    score = 50.0  # Base level for all candidates
    
    if not candidate:
        return score

    # 1. Geographic environment bonus
    rural_urban = (getattr(candidate, "rural_or_urban", "") or "").lower().strip()
    if rural_urban == "rural":
        score += 20.0

    # 2. Aspirational District check
    dist = (getattr(candidate, "district", "") or "").lower().strip()
    if dist in ASPIRATIONAL_DISTRICTS:
        score += 20.0

    # 3. Caste Category diversity adjustments
    cat = (getattr(candidate, "category", "") or "").lower().strip()
    if cat in ("sc", "st"):
        score += 20.0
    elif cat in ("obc", "ews"):
        score += 12.0

    # 4. Gender representation adjustments
    gender = (getattr(candidate, "gender", "") or "").lower().strip()
    if gender in ("female", "other"):
        score += 10.0

    # 5. First-time platform participant bonus
    past = getattr(candidate, "past_participation", False)
    if not past:
        score += 10.0

    return min(score, 100.0)


def apply_fairness_reranking(matches: list) -> list:
    """
    Perform a fairness-aware re-ranking over a list of match entries.
    Computes ranking_score: final_score + min(fairness_score * 0.05, 5)
    Guarantees that fairness acts as a transparent booster but never overrides basic merit.
    Supports both ORM models and native dictionaries.
    """
    if not matches:
        return []

    def get_sort_key(m):
        if isinstance(m, dict):
            final = float(m.get("final_score", 0.0) or 0.0)
            fairness = float(m.get("fairness_score", 0.0) or 0.0)
        else:
            final = float(getattr(m, "final_score", 0.0) or 0.0)
            fairness = getattr(m, "fairness_score", 0.0)
            if fairness is None and hasattr(m, "fair_score"):
                fairness = getattr(m, "fair_score", 0.0)
            fairness = float(fairness or 0.0)

        # Max fairness ranking boost is 5.0
        ranking_score = final + min(fairness * 0.05, 5.0)
        ranking_score = round(ranking_score, 2)
        
        # Save ranking score inside the items for transparency
        if isinstance(m, dict):
            m["ranking_score"] = ranking_score
        else:
            setattr(m, "ranking_score", ranking_score)
            
        return ranking_score

    # Sort descending
    return sorted(matches, key=get_sort_key, reverse=True)
