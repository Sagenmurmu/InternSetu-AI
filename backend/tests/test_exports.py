import pytest

def test_exports_endpoints(client):
    # 1. Register users
    candidate_reg = {
        "name": "Candidate Charlie",
        "email": "charlie@example.com",
        "password": "password123",
        "role": "candidate"
    }
    admin_reg = {
        "name": "Admin Chief",
        "email": "adminchief@example.com",
        "password": "password123",
        "role": "admin"
    }
    employer_reg = {
        "name": "Employer Bob",
        "email": "bob@example.com",
        "password": "password123",
        "role": "employer"
    }

    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    a_res = client.post("/api/v1/auth/register", json=admin_reg)
    a_token = a_res.json()["data"]["access_token"]
    a_headers = {"Authorization": f"Bearer {a_token}"}

    e_res = client.post("/api/v1/auth/register", json=employer_reg)
    e_token = e_res.json()["data"]["access_token"]
    e_headers = {"Authorization": f"Bearer {e_token}"}

    # Setup candidate and company profiles so the export operations don't throw 404
    profile_payload = {
        "age": 21,
        "gender": "Male",
        "category": "General",
        "rural_or_urban": "Urban",
        "district": "Pune",
        "state": "Maharashtra",
        "qualification": "B.Tech / B.E.",
        "course": "Computer Science",
        "college": "COEP Pune",
        "skills": [],
        "sector_interest": "IT / Software",
        "location_preference": "Pune",
        "willing_to_relocate": True,
        "past_participation": False
    }
    client.post("/api/v1/candidates/profile", json=profile_payload, headers=c_headers)

    company_payload = {
        "company_name": "Employer Company",
        "sector": "IT / Software",
        "description": "Company desc",
        "district": "Pune",
        "state": "Maharashtra",
        "address": "Office",
        "contact_person": "Bob",
        "total_capacity": 10
    }
    client.post("/api/v1/employers/company", json=company_payload, headers=e_headers)

    # 2. Candidate tries to download admin candidates export -> 403
    res = client.get("/api/v1/exports/admin/candidates", headers=c_headers)
    assert res.status_code == 403

    # 3. Admin downloads candidates export successfully -> 200 (text/csv)
    res = client.get("/api/v1/exports/admin/candidates", headers=a_headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment" in res.headers["content-disposition"]

    # 4. Admin downloads other reports
    for endpoint in ["internships", "applications", "matches", "capacity", "fairness", "audit-logs"]:
        res = client.get(f"/api/v1/exports/admin/{endpoint}", headers=a_headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]

    # 5. Employer exports applications
    res = client.get("/api/v1/exports/employer/applications", headers=e_headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]

    # 6. Employer exports selected candidates
    res = client.get("/api/v1/exports/employer/selected-candidates", headers=e_headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]

    # 7. Candidate exports applications history
    res = client.get("/api/v1/exports/candidate/applications", headers=c_headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
