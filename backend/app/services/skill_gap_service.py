from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories import candidate_repository, internship_repository
from app.ml.skill_similarity import normalize_skills

SKILL_RECOMMENDATION_MAP = {
    "power bi": "Learn dashboard creation and data visualization.",
    "sql": "Practice joins, grouping, subqueries, and indexing.",
    "react": "Build reusable components and learn hooks.",
    "fastapi": "Learn REST APIs, Pydantic, and authentication.",
    "machine learning": "Learn regression, classification, and model evaluation.",
    "excel": "Learn formulas, pivot tables, and charts."
}


def analyze_skill_gap(candidate, internship) -> dict:
    """Analyze matched and missing skills, and output prioritize items and learning path descriptions."""
    cand_skills = normalize_skills(getattr(candidate, "skills", None))
    req_skills = normalize_skills(getattr(internship, "required_skills", None))
    
    cand_id = getattr(candidate, "id", 0)
    job_id = getattr(internship, "id", 0)
    
    if not req_skills:
        return {
            "candidate_id": cand_id,
            "internship_id": job_id,
            "matched_skills": [],
            "missing_skills": [],
            "match_percentage": 100,
            "priority_skills": [],
            "recommendations": ["No required skills specified for this internship."]
        }
        
    cand_set = set(cand_skills)
    req_set = set(req_skills)
    
    matched = sorted(list(cand_set & req_set))
    missing = sorted(list(req_set - cand_set))
    
    match_percentage = int((len(matched) / len(req_skills)) * 100)
    priority_skills = missing[:2]
    
    recommendations = []
    for sk in missing:
        desc = SKILL_RECOMMENDATION_MAP.get(sk.lower())
        if desc:
            recommendations.append(f"Learn {sk}: {desc}")
        else:
            recommendations.append(f"Practice {sk} concepts and build sample projects to improve your match score.")
            
    if not missing:
        recommendations.append("Excellent! You satisfy all skill requirements for this internship.")
        
    return {
        "candidate_id": cand_id,
        "internship_id": job_id,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "priority_skills": priority_skills,
        "recommendations": recommendations
    }


def get_skill_gap_for_candidate(db: Session, candidate_id: int, internship_id: int) -> dict:
    """Load candidate and internship from database and run analysis."""
    candidate = candidate_repository.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    internship = internship_repository.get_internship_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
        
    return analyze_skill_gap(candidate, internship)
