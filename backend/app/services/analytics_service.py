from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.candidate_model import Candidate
from app.models.company_model import Company
from app.models.internship_model import Internship
from app.models.application_model import Application
from app.models.match_result_model import MatchResult
from app.models.audit_log_model import AuditLog
from app.core.constants import ApplicationStatus


def get_overview_stats(db: Session) -> dict:
    """Get system-wide overview statistics for admin dashboard."""
    total_candidates = db.query(func.count(Candidate.id)).scalar() or 0
    total_companies = db.query(func.count(Company.id)).scalar() or 0
    total_internships = db.query(func.count(Internship.id)).scalar() or 0
    total_applications = db.query(func.count(Application.id)).scalar() or 0

    selected_candidates = (
        db.query(func.count(Application.id))
        .filter(Application.status == ApplicationStatus.SELECTED)
        .scalar() or 0
    )

    total_capacity = db.query(func.coalesce(func.sum(Internship.capacity), 0)).scalar()
    total_selected = db.query(func.coalesce(func.sum(Internship.selected_count), 0)).scalar()
    remaining_seats = total_capacity - total_selected

    avg_match = db.query(func.avg(MatchResult.final_score)).scalar()
    average_match_score = round(avg_match, 1) if avg_match else 0.0

    # Simple fairness score: % of SC/ST/OBC/EWS candidates among selected
    fairness_score = _calculate_system_fairness(db)

    return {
        "total_candidates": total_candidates,
        "total_companies": total_companies,
        "total_internships": total_internships,
        "total_applications": total_applications,
        "selected_candidates": selected_candidates,
        "remaining_seats": remaining_seats,
        "average_match_score": average_match_score,
        "fairness_score": fairness_score,
    }


def get_district_analytics(db: Session) -> list:
    """Get candidate count and selected count by district."""
    districts = (
        db.query(Candidate.district, func.count(Candidate.id))
        .filter(Candidate.district.isnot(None))
        .group_by(Candidate.district)
        .all()
    )

    result = []
    for district, total in districts:
        # Count selected candidates from this district
        allocated = (
            db.query(func.count(Application.id))
            .join(Candidate, Application.candidate_id == Candidate.id)
            .filter(Candidate.district == district, Application.status == ApplicationStatus.SELECTED)
            .scalar() or 0
        )
        result.append({"district": district, "total": total, "allocated": allocated})

    return result


def get_category_analytics(db: Session) -> list:
    """Get candidate count and percentage by category."""
    total_candidates = db.query(func.count(Candidate.id)).scalar() or 1

    categories = (
        db.query(Candidate.category, func.count(Candidate.id))
        .filter(Candidate.category.isnot(None))
        .group_by(Candidate.category)
        .all()
    )

    return [
        {
            "category": cat,
            "count": count,
            "percentage": round((count / total_candidates) * 100, 1),
        }
        for cat, count in categories
    ]


def get_capacity_utilization(db: Session) -> list:
    """Get capacity utilization breakdown by company."""
    companies = db.query(Company).all()
    result = []

    for company in companies:
        total_capacity = sum(i.capacity for i in company.internships) if company.internships else 0
        used = sum(i.selected_count for i in company.internships) if company.internships else 0

        result.append({
            "company": company.company_name,
            "total": total_capacity,
            "used": used,
            "remaining": total_capacity - used,
        })

    return result


def get_audit_logs(db: Session, limit: int = 100) -> list:
    """Get recent audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_role": log.user_role,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "description": log.description,
            "timestamp": log.timestamp,
        }
        for log in logs
    ]


def _calculate_system_fairness(db: Session) -> float:
    """Calculate a simple system-wide fairness score."""
    total_selected = (
        db.query(func.count(Application.id))
        .filter(Application.status == ApplicationStatus.SELECTED)
        .scalar() or 0
    )
    if total_selected == 0:
        return 85.0  # Default when no selections yet

    # Count selected candidates from underrepresented groups
    diverse_selected = (
        db.query(func.count(Application.id))
        .join(Candidate, Application.candidate_id == Candidate.id)
        .filter(
            Application.status == ApplicationStatus.SELECTED,
            Candidate.category.in_(["SC", "ST", "OBC", "EWS"])
        )
        .scalar() or 0
    )

    diversity_ratio = diverse_selected / total_selected
    # Score: 100 if at least 50% diverse, scaled down proportionally
    return round(min(diversity_ratio * 200, 100), 1)


def get_matching_insights(db: Session) -> dict:
    """Get admin-facing AI matching insights and analytics."""
    # Confidence levels
    high = db.query(func.count(MatchResult.id)).filter(MatchResult.final_score >= 80).scalar() or 0
    medium = db.query(func.count(MatchResult.id)).filter(MatchResult.final_score >= 60, MatchResult.final_score < 80).scalar() or 0
    low = db.query(func.count(MatchResult.id)).filter(MatchResult.final_score < 60).scalar() or 0
    
    avg_final = db.query(func.avg(MatchResult.final_score)).scalar()
    avg_skill = db.query(func.avg(MatchResult.skill_score)).scalar()
    avg_fairness = db.query(func.avg(MatchResult.fairness_score)).scalar()
    
    from app.ml.skill_normalizer import normalize_skills
    import json
    from collections import Counter
    
    # We can query all internships to see what skills are required
    internships = db.query(Internship).filter(Internship.is_active == True).all()
    candidates = db.query(Candidate).all()
    
    missing_skills_counter = Counter()
    recommended_sectors_counter = Counter()
    
    candidates_skills = {}
    for cand in candidates:
        cand_skills = []
        if cand.skills:
            try:
                cand_skills = json.loads(cand.skills) if isinstance(cand.skills, str) else cand.skills
            except Exception:
                cand_skills = []
        candidates_skills[cand.id] = normalize_skills(cand_skills)
        
        if cand.sector_interest:
            recommended_sectors_counter[cand.sector_interest] += 1
            
    for job in internships:
        req_skills = []
        if job.required_skills:
            try:
                req_skills = json.loads(job.required_skills) if isinstance(job.required_skills, str) else job.required_skills
            except Exception:
                req_skills = []
        req_norm = normalize_skills(req_skills)
        
        for cand_id, cand_norm in candidates_skills.items():
            missing = set(req_norm) - set(cand_norm)
            for sk in missing:
                missing_skills_counter[sk] += 1
                
    # Format top 5 missing skills and top 5 recommended sectors
    top_missing = [sk for sk, count in missing_skills_counter.most_common(5)]
    top_sectors = [sec for sec, count in recommended_sectors_counter.most_common(5)]
    
    return {
        "average_match_score": round(avg_final, 2) if avg_final else 0.0,
        "high_confidence_matches": high,
        "medium_confidence_matches": medium,
        "low_confidence_matches": low,
        "average_skill_score": round(avg_skill, 2) if avg_skill else 0.0,
        "average_fairness_score": round(avg_fairness, 2) if avg_fairness else 0.0,
        "top_missing_skills": top_missing,
        "top_recommended_sectors": top_sectors,
    }

