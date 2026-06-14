import json
from sqlalchemy.orm import Session
from app.repositories import user_repository, candidate_repository
from app.core.security import hash_password


def seed_candidates(db: Session) -> list:
    """Seed candidate users and profiles."""
    candidates_data = [
        {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "password": "password123",
            "role": "candidate",
            "profile": {
                "age": 21,
                "gender": "Female",
                "category": "SC",
                "rural_or_urban": "Rural",
                "state": "Madhya Pradesh",
                "district": "Bhopal",
                "qualification": "B.Tech / B.E.",
                "course": "Computer Science",
                "college": "LNCT Bhopal",
                "skills": ["Python", "React", "SQL"],
                "sector_interest": "IT / Software",
                "location_preference": "Bhopal",
                "willing_to_relocate": True,
                "past_participation": False,
                "profile_completion": 90.0,
            },
        },
        {
            "name": "Rahul Verma",
            "email": "rahul@example.com",
            "password": "password123",
            "role": "candidate",
            "profile": {
                "age": 22,
                "gender": "Male",
                "category": "OBC",
                "rural_or_urban": "Urban",
                "state": "Maharashtra",
                "district": "Mumbai",
                "qualification": "B.Sc",
                "course": "Information Technology",
                "college": "KC College Mumbai",
                "skills": ["JavaScript", "Java", "HTML/CSS"],
                "sector_interest": "IT / Software",
                "location_preference": "Mumbai",
                "willing_to_relocate": False,
                "past_participation": True,
                "profile_completion": 85.0,
            },
        },
        {
            "name": "Ananya Mishra",
            "email": "ananya@example.com",
            "password": "password123",
            "role": "candidate",
            "profile": {
                "age": 20,
                "gender": "Female",
                "category": "General",
                "rural_or_urban": "Urban",
                "state": "Delhi",
                "district": "New Delhi",
                "qualification": "B.Com",
                "course": "Commerce",
                "college": "SRCC Delhi",
                "skills": ["Excel", "Communication", "Data Analysis"],
                "sector_interest": "Finance / Banking",
                "location_preference": "Delhi",
                "willing_to_relocate": True,
                "past_participation": False,
                "profile_completion": 95.0,
            },
        },
    ]

    seeded_candidates = []
    for cd in candidates_data:
        # Check if already exists
        user = user_repository.get_user_by_email(db, cd["email"])
        if not user:
            pw_hash = hash_password(cd["password"])
            user = user_repository.create_user(db, cd["name"], cd["email"], pw_hash, cd["role"])
            candidate = candidate_repository.create_candidate(db, user.id, cd["profile"])
            seeded_candidates.append(candidate)
        else:
            cand = candidate_repository.get_candidate_by_user_id(db, user.id)
            if cand:
                seeded_candidates.append(cand)

    return seeded_candidates
