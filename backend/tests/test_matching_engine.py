import json
from app.ml.skill_normalizer import normalize_skill, normalize_skills
from app.ml.skill_similarity import calculate_skill_score
from app.ml.scoring_engine import calculate_qualification_score, calculate_location_score, calculate_sector_score
from app.ml.fairness_reranker import calculate_fairness_score, apply_fairness_reranking
from app.ml.explanation_generator import generate_explanation
from app.ml.eligibility_filter import is_eligible


def test_matching_engine_computation(client):
    """Integration test checking end-to-end matching route calculations and schema compliance."""
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

    # 2. Create Candidate Profile
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
        "skills": ["Python", "React"],
        "sector_interest": "IT / Software",
        "location_preference": "Bhopal",
        "willing_to_relocate": True,
        "past_participation": False
    }
    res = client.post("/api/v1/candidates/profile", json=profile_payload, headers=c_headers)
    assert res.status_code == 200

    # 3. Create Company Profile
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
        "required_skills": ["Python", "FastAPI", "React"],
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

    # 5. Run matching generation for Priya
    response = client.post("/api/v1/candidates/me/recommendations/generate", headers=c_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 1

    # Verify score components
    match = data["data"][0]
    
    # Qualification score: exact match (100.0)
    assert match["qualification_score"] == 100.0
    # Location score: Bhopal MP to Bengaluru Karnataka with relocate=True (55.0)
    assert match["location_score"] == 55.0
    # Sector score: IT to IT (100.0)
    assert match["sector_score"] == 100.0
    # Fairness: Base 50 + SC (+20) + Female (+10) + Rural (+20) + first-time (+10) = 110.0 -> capped at 100.0
    assert match["fairness_score"] == 100.0
    
    # Skill score: combined exact overlap (66.67%) + TF-IDF similarity (cosine) -> ~69.7%
    assert 69.0 <= match["skill_score"] <= 70.0
    
    # Final score check: should be ~82.65%
    assert 82.0 <= match["final_score"] <= 83.0

    # Verify explanations exist
    assert len(match["explanation"]) > 0


def test_skill_normalization():
    """Verify that similar skills are mapped and parsed correctly."""
    assert normalize_skill("ReactJS") == "react"
    assert normalize_skill("js") == "javascript"
    assert normalize_skill("fast api") == "fastapi"
    
    # List and comma-separated string normalization
    assert normalize_skills("ReactJS, ms excel, Python Programming") == ["excel", "python", "react"]
    assert normalize_skills(["ReactJS", "js"]) == ["javascript", "react"]


def test_skill_synonyms():
    """Verify synonym mapping works correctly during match scoring."""
    res = calculate_skill_score(["ML", "JS"], ["Machine Learning", "FastAPI"])
    # "ML" maps to "machine learning" -> 1 match out of 2 required
    assert res["exact_overlap_score"] == 50.0
    assert res["score"] > 0.0


def test_qualification_satisfaction():
    """Verify higher qualification satisfies lower requirement in hierarchy."""
    # B.Tech (level 6) satisfies Diploma (level 4)
    res = calculate_qualification_score("B.Tech / B.E.", "Diploma")
    assert res["score"] == 90.0
    
    # ITI (level 3) is too low for B.Tech (level 6)
    res2 = calculate_qualification_score("ITI", "B.Tech / B.E.")
    assert res2["score"] == 0.0


def test_location_proximity():
    """Verify district matching yields higher location proximity score than relocation."""
    class Obj:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
                
    cand = Obj(district="Ranchi", state="Jharkhand", willing_to_relocate=True)
    job_local = Obj(district="Ranchi", state="Jharkhand", mode="On-site")
    job_remote = Obj(district="Bengaluru", state="Karnataka", mode="Remote")
    job_relocate = Obj(district="Bengaluru", state="Karnataka", mode="On-site")
    
    # Same district
    assert calculate_location_score(cand, job_local)["score"] == 100.0
    # Remote mode
    assert calculate_location_score(cand, job_remote)["score"] == 90.0
    # Relocation
    assert calculate_location_score(cand, job_relocate)["score"] == 55.0


def test_capacity_full_filter():
    """Verify internships at full capacity are filtered out of recommendations."""
    class DummyCand:
        pass
        
    class DummyJob:
        def __init__(self, is_active, capacity, selected_count):
            self.is_active = is_active
            self.capacity = capacity
            self.selected_count = selected_count
            
    cand = DummyCand()
    job_active = DummyJob(True, 3, 2)
    job_full = DummyJob(True, 3, 3)
    job_inactive = DummyJob(False, 3, 0)
    
    assert is_eligible(cand, job_active) is True
    assert is_eligible(cand, job_full) is False
    assert is_eligible(cand, job_inactive) is False


def test_fairness_cap():
    """Verify fairness score demographic adjustments are capped at 100.0."""
    class DummyCand:
        def __init__(self):
            self.rural_or_urban = "Rural"
            self.district = "ranchi"  # Aspirational district
            self.category = "SC"
            self.gender = "Female"
            self.past_participation = False
            
    cand = DummyCand()
    # Base 50 + Rural(20) + Ranchi(20) + SC(20) + Female(10) + first-time(10) = 130 -> capped at 100.0
    assert calculate_fairness_score(cand) == 100.0


def test_explanation_rationales():
    """Verify compiled rationales contain matched skills and qualification details."""
    class Dummy:
        pass
    cand = Dummy()
    cand.qualification = "B.Tech"
    job = Dummy()
    job.capacity = 3
    job.selected_count = 0
    
    scores = {"skill_score": 100.0, "qualification_score": 100.0, "final_score": 90.0}
    explanations = generate_explanation(
        cand, job, scores, 
        matched_skills=["Python"], missing_skills=[],
        qual_reason="satisfies requirement", 
        loc_reason="same district", 
        sec_reason="sector match"
    )
    
    # Must contain matched skills rationale
    assert any("Python" in exp for exp in explanations)
    # Must contain qualification rationale
    assert any("satisfies requirement" in exp for exp in explanations)
