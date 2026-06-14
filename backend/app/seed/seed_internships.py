from sqlalchemy.orm import Session
from app.models.company_model import Company
from app.repositories import internship_repository


def seed_internships(db: Session) -> list:
    """Seed internships connected to existing companies."""
    technova = db.query(Company).filter(Company.company_name == "TechNova Solutions").first()
    bharat = db.query(Company).filter(Company.company_name == "Bharat Manufacturing Ltd").first()

    if not technova or not bharat:
        raise ValueError("Companies must be seeded before seeding internships")

    internships_data = [
        # TechNova Internships
        {
            "company_id": technova.id,
            "title": "Software Development Intern",
            "description": "Build scalable web applications using FastAPI and React.",
            "sector": "IT / Software",
            "required_skills": ["Python", "FastAPI", "React"],
            "required_qualification": "B.Tech / B.E.",
            "location": "Bengaluru",
            "district": "Bengaluru",
            "state": "Karnataka",
            "duration": "6 Months",
            "stipend": 15000.0,
            "capacity": 3,
            "selected_count": 0,
            "mode": "Hybrid",
            "is_active": True,
        },
        {
            "company_id": technova.id,
            "title": "Front-End Developer Intern",
            "description": "Design and implement beautiful responsive web UIs using React and modern CSS frameworks.",
            "sector": "IT / Software",
            "required_skills": ["React", "JavaScript", "HTML/CSS"],
            "required_qualification": "Diploma",
            "location": "Bengaluru",
            "district": "Bengaluru",
            "state": "Karnataka",
            "duration": "3 Months",
            "stipend": 10000.0,
            "capacity": 2,
            "selected_count": 0,
            "mode": "Remote",
            "is_active": True,
        },
        {
            "company_id": technova.id,
            "title": "Data Analyst Intern",
            "description": "Perform data cleanup, analysis, and generate reports using Excel and Power BI.",
            "sector": "IT / Software",
            "required_skills": ["Excel", "Data Analysis", "Power BI"],
            "required_qualification": "B.Sc",
            "location": "Bengaluru",
            "district": "Bengaluru",
            "state": "Karnataka",
            "duration": "6 Months",
            "stipend": 12000.0,
            "capacity": 2,
            "selected_count": 0,
            "mode": "Remote",
            "is_active": True,
        },
        # Bharat Manufacturing Internships
        {
            "company_id": bharat.id,
            "title": "Mechanical Design Intern",
            "description": "Assist with manufacturing process control and mechanical design blueprints.",
            "sector": "Manufacturing",
            "required_skills": ["Communication", "Excel"],
            "required_qualification": "Diploma",
            "location": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "duration": "6 Months",
            "stipend": 8000.0,
            "capacity": 2,
            "selected_count": 0,
            "mode": "On-site",
            "is_active": True,
        },
        {
            "company_id": bharat.id,
            "title": "Operations Analyst Intern",
            "description": "Monitor operations flow, inspect quality standards, and track metrics.",
            "sector": "Manufacturing",
            "required_skills": ["Data Analysis", "Excel", "Communication"],
            "required_qualification": "B.Com",
            "location": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "duration": "3 Months",
            "stipend": 9000.0,
            "capacity": 1,
            "selected_count": 0,
            "mode": "Hybrid",
            "is_active": True,
        },
    ]

    seeded_internships = []
    for idata in internships_data:
        # Check if already exists to prevent duplicate seeding
        existing = db.query(internship_repository.Internship).filter(
            internship_repository.Internship.company_id == idata["company_id"],
            internship_repository.Internship.title == idata["title"]
        ).first()

        if not existing:
            internship = internship_repository.create_internship(db, idata["company_id"], idata)
            seeded_internships.append(internship)
        else:
            seeded_internships.append(existing)

    return seeded_internships
