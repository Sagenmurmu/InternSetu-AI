import json
from sqlalchemy.orm import Session
from app.models.internship_model import Internship


def create_internship(db: Session, company_id: int, data: dict) -> Internship:
    data_copy = data.copy()
    if "required_skills" in data_copy and isinstance(data_copy["required_skills"], list):
        data_copy["required_skills"] = json.dumps(data_copy["required_skills"])
    data_copy.pop("company_id", None)
    internship = Internship(company_id=company_id, **data_copy)
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship


def get_internship_by_id(db: Session, internship_id: int) -> Internship | None:
    return db.query(Internship).filter(Internship.id == internship_id).first()


def get_all_internships(db: Session) -> list[Internship]:
    return db.query(Internship).all()


def get_active_internships(db: Session) -> list[Internship]:
    return db.query(Internship).filter(Internship.is_active == True).all()


def get_internships_by_company(db: Session, company_id: int) -> list[Internship]:
    return db.query(Internship).filter(Internship.company_id == company_id).all()


def update_internship(db: Session, internship: Internship, data: dict) -> Internship:
    for key, value in data.items():
        if value is not None:
            if key == "required_skills" and isinstance(value, list):
                value = json.dumps(value)
            setattr(internship, key, value)
    db.commit()
    db.refresh(internship)
    return internship
