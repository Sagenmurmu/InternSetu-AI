from sqlalchemy.orm import Session
from app.repositories import user_repository, employer_repository
from app.core.security import hash_password


def seed_companies(db: Session) -> list:
    """Seed employer users and company profiles."""
    companies_data = [
        {
            "name": "TechNova Solutions",
            "email": "technova@example.com",
            "password": "password123",
            "role": "employer",
            "profile": {
                "company_name": "TechNova Solutions",
                "sector": "IT / Software",
                "description": "Leading provider of cutting-edge software solutions.",
                "district": "Bengaluru",
                "state": "Karnataka",
                "address": "Tech Park, Phase 2, Bengaluru",
                "contact_person": "John Doe",
                "total_capacity": 10,
            },
        },
        {
            "name": "Bharat Manufacturing Ltd",
            "email": "bharat@example.com",
            "password": "password123",
            "role": "employer",
            "profile": {
                "company_name": "Bharat Manufacturing Ltd",
                "sector": "Manufacturing",
                "description": "High-quality mechanical components manufacturer.",
                "district": "Pune",
                "state": "Maharashtra",
                "address": "MIDC Area, Pune",
                "contact_person": "Ramesh Kumar",
                "total_capacity": 5,
            },
        },
    ]

    seeded_companies = []
    for cd in companies_data:
        # Check if already exists
        user = user_repository.get_user_by_email(db, cd["email"])
        if not user:
            pw_hash = hash_password(cd["password"])
            user = user_repository.create_user(db, cd["name"], cd["email"], pw_hash, cd["role"])
            company = employer_repository.create_company(db, user.id, cd["profile"])
            seeded_companies.append(company)
        else:
            company = employer_repository.get_company_by_user_id(db, user.id)
            if company:
                seeded_companies.append(company)

    return seeded_companies
