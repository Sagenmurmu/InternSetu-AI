from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.candidate_schema import CandidateCreate, CandidateUpdate
from app.services import candidate_service, application_service, matching_service
from app.utils.response import success_response

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/profile")
def create_profile(
    data: CandidateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    result = candidate_service.create_candidate_profile(db, current_user, data.model_dump())
    return success_response(result, "Candidate profile created")


@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    result = candidate_service.get_my_candidate_profile(db, current_user)
    return success_response(result, "Profile retrieved")


@router.put("/me")
def update_my_profile(
    data: CandidateUpdate,
    from_parser: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    update_data = data.model_dump(exclude_unset=True)
    result = candidate_service.update_candidate_profile(db, current_user, update_data, from_parser=from_parser)
    return success_response(result, "Profile updated")


@router.post("/me/resume/parse")
def parse_my_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    # Enforce size limit: 5MB
    content = file.file.read()
    file.file.seek(0)
    
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5 MB.")
        
    ext = file.filename.split(".")[-1].lower()
    if ext not in ("pdf", "docx", "txt"):
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, DOCX, and TXT are allowed.")
        
    try:
        from app.services.resume_parser_service import parse_resume
        result = parse_resume(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")
        
    # Write audit log: "Candidate parsed resume"
    from app.models.audit_log_model import AuditLog
    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role,
        action="PROFILE_UPDATE",
        entity_type="candidate",
        description="Candidate parsed resume"
    )
    db.add(audit)
    db.commit()
    
    return success_response(result, "Resume parsed successfully")


@router.get("/me/applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    result = application_service.get_my_applications(db, current_user)
    return success_response(result, "Applications retrieved")


@router.get("/me/recommendations")
def get_my_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    from app.repositories import candidate_repository
    candidate = candidate_repository.get_candidate_by_user_id(db, current_user.id)
    if not candidate:
        return success_response([], "No candidate profile found")
    result = matching_service.get_candidate_recommendations(db, candidate.id)
    return success_response(
        [_serialize_match(m) for m in result],
        "Recommendations retrieved"
    )


@router.post("/me/recommendations/generate")
def generate_my_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    from app.repositories import candidate_repository
    candidate = candidate_repository.get_candidate_by_user_id(db, current_user.id)
    if not candidate:
        return success_response([], "No candidate profile found")
    result = matching_service.generate_candidate_recommendations(db, candidate.id, user=current_user)
    return success_response(
        [_serialize_match(m) for m in result],
        f"Generated {len(result)} recommendations"
    )


def _serialize_match(match):
    import json
    explanation = []
    if match.explanation:
        try:
            explanation = json.loads(match.explanation) if isinstance(match.explanation, str) else match.explanation
        except (json.JSONDecodeError, TypeError):
            explanation = []
    return {
        "id": match.id,
        "candidate_id": match.candidate_id,
        "internship_id": match.internship_id,
        "skill_score": match.skill_score,
        "qualification_score": match.qualification_score,
        "location_score": match.location_score,
        "sector_score": match.sector_score,
        "fairness_score": match.fairness_score,
        "final_score": match.final_score,
        "ranking_score": getattr(match, "ranking_score", match.final_score),
        "explanation": explanation,
        "created_at": match.created_at,
    }
