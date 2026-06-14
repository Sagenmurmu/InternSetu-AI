"""Fairness and representation services for candidate matching analytics."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.candidate_model import Candidate
from app.ml.fairness_reranker import calculate_fairness_score as ml_calculate_fairness_score
from app.ml.model_config import ASPIRATIONAL_DISTRICTS


def calculate_fairness_score(candidate) -> float:
    """
    Calculate a fairness bonus score based on candidate demographics.
    Delegates to the ML fairness reranker module.
    """
    return ml_calculate_fairness_score(candidate)


def get_representation_summaries(db: Session) -> dict:
    """
    Calculate and return platform-wide demographic representation summaries:
    - Category demographics (SC, ST, OBC, EWS, GENERAL)
    - Geographic environments (Rural vs Urban)
    - District coverages (including Aspirational Districts count)
    """
    total = db.query(func.count(Candidate.id)).scalar() or 0
    if total == 0:
        return {
            "total_candidates": 0,
            "category_demographics": {},
            "geographic_environments": {},
            "district_coverages": {
                "total_districts": 0,
                "aspirational_count": 0,
                "aspirational_percentage": 0.0
            }
        }

    # Category demographics
    categories = db.query(Candidate.category, func.count(Candidate.id)).group_by(Candidate.category).all()
    cat_summary = {}
    for cat, count in categories:
        name = (cat or "GENERAL").upper()
        cat_summary[name] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    # Geographic environments
    environments = db.query(Candidate.rural_or_urban, func.count(Candidate.id)).group_by(Candidate.rural_or_urban).all()
    geo_summary = {}
    for env, count in environments:
        name = (env or "unknown").lower()
        geo_summary[name] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    # District coverages
    districts = db.query(Candidate.district).filter(Candidate.district.isnot(None)).distinct().all()
    distinct_districts = [d[0].lower().strip() for d in districts if d[0]]
    total_districts = len(distinct_districts)
    
    # Query case-insensitively for aspirational districts using lowercase in the list
    asp_dist_list = [d.lower() for d in ASPIRATIONAL_DISTRICTS]
    aspirational_count = db.query(func.count(Candidate.id)).filter(
        func.lower(Candidate.district).in_(asp_dist_list)
    ).scalar() or 0

    return {
        "total_candidates": total,
        "category_demographics": cat_summary,
        "geographic_environments": geo_summary,
        "district_coverages": {
            "total_districts": total_districts,
            "aspirational_count": aspirational_count,
            "aspirational_percentage": round((aspirational_count / total) * 100, 2)
        }
    }
