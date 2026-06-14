from sqlalchemy.orm import Session
from app.models.company_model import Company


def create_company(db: Session, user_id: int, data: dict) -> Company:
    company = Company(user_id=user_id, **data)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def get_company_by_id(db: Session, company_id: int) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_user_id(db: Session, user_id: int) -> Company | None:
    return db.query(Company).filter(Company.user_id == user_id).first()


def update_company(db: Session, company: Company, data: dict) -> Company:
    for key, value in data.items():
        if value is not None:
            setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company


def get_all_companies(db: Session) -> list[Company]:
    return db.query(Company).all()
