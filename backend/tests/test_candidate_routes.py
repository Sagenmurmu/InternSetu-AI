def test_candidate_profile_flow(client):
    # 1. Create a candidate user and an employer user
    candidate_reg = {
        "name": "Candidate Alice",
        "email": "alice@example.com",
        "password": "password123",
        "role": "candidate"
    }
    employer_reg = {
        "name": "Employer Bob",
        "email": "bob@example.com",
        "password": "password123",
        "role": "employer"
    }

    # Register candidate
    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Register employer
    e_res = client.post("/api/v1/auth/register", json=employer_reg)
    e_token = e_res.json()["data"]["access_token"]
    e_headers = {"Authorization": f"Bearer {e_token}"}

    # 2. Employer tries to create a candidate profile -> 403 Forbidden
    profile_payload = {
        "age": 22,
        "gender": "Female",
        "category": "General",
        "rural_or_urban": "Urban",
        "district": "Pune",
        "state": "Maharashtra",
        "qualification": "B.Tech / B.E.",
        "course": "Computer Engineering",
        "college": "COEP Pune",
        "skills": ["Python", "React"],
        "sector_interest": "IT / Software",
        "location_preference": "Pune",
        "willing_to_relocate": True,
        "past_participation": False
    }
    response = client.post("/api/v1/candidates/profile", json=profile_payload, headers=e_headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]

    # 3. Candidate creates profile successfully -> 200 OK
    response = client.post("/api/v1/candidates/profile", json=profile_payload, headers=c_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["age"] == 22
    assert data["data"]["college"] == "COEP Pune"
    assert "Python" in data["data"]["skills"]
    assert data["data"]["profile_completion"] > 0

    # 4. Candidate retrieves their own profile -> 200 OK
    response = client.get("/api/v1/candidates/me", headers=c_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["age"] == 22
    assert data["data"]["college"] == "COEP Pune"

    # 5. Candidate updates profile -> 200 OK
    update_payload = {
        "age": 23,
        "district": "Mumbai",
        "skills": ["Python", "React", "FastAPI"]
    }
    response = client.put("/api/v1/candidates/me", json=update_payload, headers=c_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["age"] == 23
    assert data["data"]["district"] == "Mumbai"
    assert "FastAPI" in data["data"]["skills"]
