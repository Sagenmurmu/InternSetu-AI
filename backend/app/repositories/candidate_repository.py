import json
from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate


def create_candidate(db: Session, user_id: int, data: dict) -> Candidate:
    if "skills" in data and isinstance(data["skills"], list):
        data["skills"] = json.dumps(data["skills"])
    candidate = Candidate(user_id=user_id, **data)
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def get_candidate_by_id(db: Session, candidate_id: int) -> Candidate | None:
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()


def get_candidate_by_user_id(db: Session, user_id: int) -> Candidate | None:
    return db.query(Candidate).filter(Candidate.user_id == user_id).first()


def update_candidate(db: Session, candidate: Candidate, data: dict) -> Candidate:
    for key, value in data.items():
        if value is not None:
            if key == "skills" and isinstance(value, list):
                value = json.dumps(value)
            setattr(candidate, key, value)
    db.commit()
    db.refresh(candidate)
    return candidate


def get_all_candidates(db: Session) -> list[Candidate]:
    return db.query(Candidate).all()
