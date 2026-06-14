import pytest

def test_skill_gap_analysis(client):
    # 1. Register candidate and employer users
    candidate_reg = {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "password": "password123",
        "role": "candidate"
    }
    employer_reg = {
        "name": "TechNova Solutions",
        "email": "technova@example.com",
        "password": "password123",
        "role": "employer"
    }

    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    e_res = client.post("/api/v1/auth/register", json=employer_reg)
    e_token = e_res.json()["data"]["access_token"]
    e_headers = {"Authorization": f"Bearer {e_token}"}

    # 2. Create candidate profile with some skills
    profile_payload = {
        "age": 21,
        "gender": "Female",
        "category": "SC",
        "rural_or_urban": "Rural",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "qualification": "B.Tech / B.E.",
        "course": "Computer Science",
        "college": "LNCT Bhopal",
        "skills": ["Python", "SQL"],
        "sector_interest": "IT / Software",
        "location_preference": "Bhopal",
        "willing_to_relocate": True,
        "past_participation": False
    }
    res = client.post("/api/v1/candidates/profile", json=profile_payload, headers=c_headers)
    assert res.status_code == 200
    candidate_id = res.json()["data"]["id"]

    # 3. Create Company profile
    company_payload = {
        "company_name": "TechNova Solutions",
        "sector": "IT / Software",
        "description": "Software company",
        "district": "Bengaluru",
        "state": "Karnataka",
        "address": "Tech Park",
        "contact_person": "John Doe",
        "total_capacity": 5
    }
    res = client.post("/api/v1/employers/company", json=company_payload, headers=e_headers)
    assert res.status_code == 200

    # 4. Create Internship Posting
    internship_payload = {
        "title": "Software Development Intern",
        "description": "FastAPI + React development",
        "sector": "IT / Software",
        "required_skills": ["Python", "React", "SQL", "Power BI"],
        "required_qualification": "B.Tech / B.E.",
        "location": "Bengaluru",
        "district": "Bengaluru",
        "state": "Karnataka",
        "duration": "6 Months",
        "stipend": 15000,
        "capacity": 3,
        "mode": "Hybrid"
    }
    res = client.post("/api/v1/internships/", json=internship_payload, headers=e_headers)
    assert res.status_code == 200
    internship_id = res.json()["data"]["id"]

    # 5. Call get my skill gap endpoint (candidate perspective)
    res = client.get(f"/api/v1/matching/skill-gap/{internship_id}", headers=c_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    gap = data["data"]
    assert "python" in gap["matched_skills"]
    assert "sql" in gap["matched_skills"]
    assert "react" in gap["missing_skills"]
    assert "power bi" in gap["missing_skills"]
    assert gap["match_percentage"] == 50  # 2 of 4 matched

    # 6. Call get skill gaps for candidate endpoint (employer perspective)
    res = client.get(f"/api/v1/matching/candidate/{candidate_id}/skill-gaps?internship_id={internship_id}", headers=e_headers)
    assert res.status_code == 200
    gap = res.json()["data"]
    assert "react" in gap["missing_skills"]
