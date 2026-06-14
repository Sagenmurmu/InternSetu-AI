import json
from sqlalchemy.orm import Session
from app.models.match_result_model import MatchResult


def save_match_result(db: Session, data: dict) -> MatchResult:
    if "explanation" in data and isinstance(data["explanation"], list):
        data["explanation"] = json.dumps(data["explanation"])
    match = MatchResult(**data)
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def get_matches_by_candidate(db: Session, candidate_id: int) -> list[MatchResult]:
    return (
        db.query(MatchResult)
        .filter(MatchResult.candidate_id == candidate_id)
        .order_by(MatchResult.final_score.desc())
        .all()
    )


def get_matches_by_internship(db: Session, internship_id: int) -> list[MatchResult]:
    return (
        db.query(MatchResult)
        .filter(MatchResult.internship_id == internship_id)
        .order_by(MatchResult.final_score.desc())
        .all()
    )


def delete_matches_by_candidate(db: Session, candidate_id: int) -> int:
    count = db.query(MatchResult).filter(MatchResult.candidate_id == candidate_id).delete()
    db.commit()
    return count


def delete_matches_by_internship(db: Session, internship_id: int) -> int:
    count = db.query(MatchResult).filter(MatchResult.internship_id == internship_id).delete()
    db.commit()
    return count
