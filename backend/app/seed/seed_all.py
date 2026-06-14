import sys
import os

# Add the backend directory to path if not already there
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.repositories import user_repository
from app.models.application_model import Application
from app.models.internship_model import Internship
from app.models.audit_log_model import AuditLog
from app.utils.seed_helper import is_already_seeded

from app.seed.seed_candidates import seed_candidates
from app.seed.seed_companies import seed_companies
from app.seed.seed_internships import seed_internships
from app.services import matching_service


def seed_admin(db: Session):
    """Seed the admin user."""
    admin_email = "admin@example.com"
    existing = user_repository.get_user_by_email(db, admin_email)
    if not existing:
        pw_hash = hash_password("adminpassword")
        admin = user_repository.create_user(
            db,
            name="System Admin",
            email=admin_email,
            password_hash=pw_hash,
            role="admin"
        )
        # Audit log
        audit = AuditLog(
            user_id=admin.id,
            user_role="admin",
            action="USER_REGISTER",
            entity_type="user",
            entity_id=admin.id,
            description="Admin user seeded"
        )
        db.add(audit)
        db.commit()
        print("Admin user seeded.")
    else:
        print("Admin user already exists.")


def seed_applications_and_audit(db: Session, candidates, internships):
    """Seed dummy applications and audit logs."""
    # Find internships and candidates by title/name
    sw_intern = next((i for i in internships if i.title == "Software Development Intern"), None)
    fe_intern = next((i for i in internships if i.title == "Front-End Developer Intern"), None)
    da_intern = next((i for i in internships if i.title == "Data Analyst Intern"), None)
    mech_intern = next((i for i in internships if i.title == "Mechanical Design Intern"), None)
    op_intern = next((i for i in internships if i.title == "Operations Analyst Intern"), None)

    priya = next((c for c in candidates if c.user.name == "Priya Sharma"), None)
    rahul = next((c for c in candidates if c.user.name == "Rahul Verma"), None)
    ananya = next((c for c in candidates if c.user.name == "Ananya Mishra"), None)

    if not all([priya, rahul, ananya, sw_intern, fe_intern, da_intern, mech_intern, op_intern]):
        print("Warning: Missing candidates or internships. Skipping applications seeding.")
        return

    # Check if applications already exist
    existing_apps = db.query(Application).count()
    if existing_apps > 0:
        print("Applications already exist. Skipping application seeding.")
        return

    apps_to_create = [
        # Priya Sharma applied to Software Development and shortlisted for Front-End
        {"candidate_id": priya.id, "internship": sw_intern, "status": "applied", "reason": None},
        {"candidate_id": priya.id, "internship": fe_intern, "status": "shortlisted", "reason": "Good frontend skills"},
        
        # Rahul Verma rejected for Software Development, applied to Mechanical
        {"candidate_id": rahul.id, "internship": sw_intern, "status": "rejected", "reason": "Lacks required FastAPI skills"},
        {"candidate_id": rahul.id, "internship": mech_intern, "status": "applied", "reason": None},

        # Ananya Mishra selected for Data Analyst, applied to Operations
        {"candidate_id": ananya.id, "internship": da_intern, "status": "selected", "reason": "Excellent Excel and analytics skills"},
        {"candidate_id": ananya.id, "internship": op_intern, "status": "applied", "reason": None},
    ]

    for item in apps_to_create:
        internship = item["internship"]
        app = Application(
            candidate_id=item["candidate_id"],
            internship_id=internship.id,
            status=item["status"],
            decision_reason=item["reason"]
        )
        db.add(app)
        
        # Increment selected_count if status is selected
        if item["status"] == "selected":
            internship.selected_count += 1
            db.add(internship)
            
        db.commit()
        db.refresh(app)

        # Audit logs for application actions
        user_role = "candidate"
        audit = AuditLog(
            user_id=app.candidate.user_id,
            user_role=user_role,
            action="APPLICATION_SUBMITTED",
            entity_type="application",
            entity_id=app.id,
            description=f"Candidate applied to '{internship.title}'"
        )
        db.add(audit)
        
        # Audit log for status changes
        if item["status"] != "applied":
            action_map = {
                "shortlisted": "CANDIDATE_SHORTLISTED",
                "selected": "CANDIDATE_SELECTED",
                "rejected": "CANDIDATE_REJECTED",
                "waitlisted": "CANDIDATE_WAITLISTED"
            }
            audit_action = action_map.get(item["status"], "APPLICATION_SUBMITTED")
            # Employer/System changed the status
            company_user_id = internship.company.user_id
            audit_change = AuditLog(
                user_id=company_user_id,
                user_role="employer",
                action=audit_action,
                entity_type="application",
                entity_id=app.id,
                description=f"Application #{app.id} status updated to {item['status']}"
            )
            db.add(audit_change)

        db.commit()

    print("Dummy applications and audits seeded.")


def generate_initial_matches(db: Session, candidates):
    """Pre-generate AI matches for all candidates."""
    print("Generating AI matching recommendations...")
    for candidate in candidates:
        matching_service.generate_candidate_recommendations(db, candidate.id)
    print("AI matching recommendations generated successfully.")


def main():
    db_type = "PostgreSQL" if "postgres" in str(engine.url) else "SQLite"
    print(f"Starting database seeding on {db_type} database...")
    
    # Ensure database tables are created first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        if is_already_seeded(db):
            print("Database is already seeded with user(s). Running idempotent updates...")
            seed_admin(db)
        else:
            print("Database is empty. Starting fresh seeding...")
            seed_admin(db)
            
        # Seed core entities (they check uniqueness internally)
        candidates = seed_candidates(db)
        print(f"Seeded {len(candidates)} candidates.")
        
        companies = seed_companies(db)
        print(f"Seeded {len(companies)} companies.")
        
        internships = seed_internships(db)
        print(f"Seeded {len(internships)} internships.")
        
        # Seed relationships
        seed_applications_and_audit(db, candidates, internships)
        
        # Pre-compute AI matches
        generate_initial_matches(db, candidates)
        
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    main()
