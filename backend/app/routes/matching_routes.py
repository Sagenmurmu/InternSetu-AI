import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.services import matching_service
from app.utils.response import success_response
from app.ml.fairness_reranker import apply_fairness_reranking

router = APIRouter(prefix="/matching", tags=["AI Matching"])


@router.post("/candidate/{candidate_id}/generate")
def generate_candidate_recommendations(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = matching_service.generate_candidate_recommendations(db, candidate_id, user=current_user)
    # Apply fairness-aware re-ranking
    reranked = apply_fairness_reranking(results)
    return success_response(
        [_serialize(m) for m in reranked],
        f"Generated {len(reranked)} recommendations"
    )


@router.get("/candidate/{candidate_id}")
def get_candidate_recommendations(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = matching_service.get_candidate_recommendations(db, candidate_id)
    # Apply fairness-aware re-ranking
    reranked = apply_fairness_reranking(results)
    return success_response(
        [_serialize(m) for m in reranked],
        "Recommendations retrieved"
    )


@router.post("/internship/{internship_id}/generate")
def generate_internship_ranking(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = matching_service.generate_internship_candidate_ranking(db, internship_id, user=current_user)
    # Apply fairness-aware re-ranking
    reranked = apply_fairness_reranking(results)
    return success_response(
        [_serialize(m) for m in reranked],
        f"Generated {len(reranked)} candidate rankings"
    )


@router.get("/internship/{internship_id}")
def get_internship_ranking(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = matching_service.get_internship_candidate_ranking(db, internship_id)
    # Apply fairness-aware re-ranking
    reranked = apply_fairness_reranking(results)
    return success_response(
        [_serialize(m) for m in reranked],
        "Candidate rankings retrieved"
    )


def _serialize(match):
    explanation = []
    if match.explanation:
        try:
            explanation = json.loads(match.explanation) if isinstance(match.explanation, str) else match.explanation
        except (json.JSONDecodeError, TypeError):
            explanation = []
            
    cand_info = None
    if match.candidate:
        cand = match.candidate
        cand_skills = []
        if cand.skills:
            try:
                cand_skills = json.loads(cand.skills) if isinstance(cand.skills, str) else cand.skills
            except (json.JSONDecodeError, TypeError):
                cand_skills = []
        cand_info = {
            "name": cand.user.name if cand.user else "Unknown Candidate",
            "email": cand.user.email if cand.user else "",
            "age": cand.age,
            "gender": cand.gender,
            "category": cand.category,
            "rural_or_urban": cand.rural_or_urban,
            "district": cand.district,
            "state": cand.state,
            "qualification": cand.qualification,
            "course": cand.course,
            "college": cand.college,
            "skills": cand_skills,
            "sector_interest": cand.sector_interest,
            "location_preference": cand.location_preference,
            "willing_to_relocate": cand.willing_to_relocate,
            "past_participation": cand.past_participation,
            "profile_completion": cand.profile_completion,
        }
            
    return {
        "id": match.id,
        "candidate_id": match.candidate_id,
        "internship_id": match.internship_id,
        "skill_score": match.skill_score,
        "qualification_score": match.qualification_score,
        "location_score": match.location_score,
        "sector_score": match.sector_score,
        "fairness_score": match.fair_score if hasattr(match, 'fair_score') else match.fairness_score,
        "final_score": match.final_score,
        "ranking_score": getattr(match, "ranking_score", match.final_score),
        "explanation": explanation,
        "created_at": match.created_at,
        "candidate": cand_info,
    }


@router.get("/skill-gap/{internship_id}")
def get_my_skill_gap(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from fastapi import HTTPException
    from app.repositories import candidate_repository
    from app.services import skill_gap_service
    
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can access this endpoint")
        
    candidate = candidate_repository.get_candidate_by_user_id(db, current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
        
    result = skill_gap_service.get_skill_gap_for_candidate(db, candidate.id, internship_id)
    return success_response(result, "Skill gap analysis retrieved")


@router.get("/candidate/{candidate_id}/skill-gaps")
def get_candidate_skill_gaps(
    candidate_id: int,
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from fastapi import HTTPException
    from app.services import skill_gap_service
    
    if current_user.role not in ("admin", "employer"):
        raise HTTPException(status_code=403, detail="Permission denied")
        
    result = skill_gap_service.get_skill_gap_for_candidate(db, candidate_id, internship_id)
    return success_response(result, "Skill gap analysis retrieved")
