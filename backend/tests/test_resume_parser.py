import io
import pytest

def test_resume_parser_flow(client):
    # 1. Register candidate user
    candidate_reg = {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "password": "password123",
        "role": "candidate"
    }
    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Create empty candidate profile so audit logs can refer to it
    profile_payload = {
        "age": 21,
        "gender": "Male",
        "category": "General",
        "rural_or_urban": "Urban",
        "district": "Pune",
        "state": "Maharashtra",
        "qualification": "B.Tech / B.E.",
        "course": "Computer Engineering",
        "college": "COEP Pune",
        "skills": [],
        "sector_interest": "IT / Software",
        "location_preference": "Pune",
        "willing_to_relocate": True,
        "past_participation": False
    }
    res = client.post("/api/v1/candidates/profile", json=profile_payload, headers=c_headers)
    assert res.status_code == 200

    # 2. Upload unsupported extension (.png) -> 400
    files = {"file": ("resume.png", io.BytesIO(b"dummy image data"), "image/png")}
    res = client.post("/api/v1/candidates/me/resume/parse", files=files, headers=c_headers)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]

    # 3. Upload oversized file -> 400
    oversized_data = b"a" * (5 * 1024 * 1024 + 10)
    files = {"file": ("resume.txt", io.BytesIO(oversized_data), "text/plain")}
    res = client.post("/api/v1/candidates/me/resume/parse", files=files, headers=c_headers)
    assert res.status_code == 400
    assert "exceeds maximum limit" in res.json()["detail"]

    # 4. Upload valid text resume -> 200
    resume_text = """John Doe
Email: john.doe@example.com
Phone: +91 9999988888
Skills: React, Python, SQL, Excel, Git
Education: B.Tech / B.E. in Computer Science
    """
    files = {"file": ("resume.txt", io.BytesIO(resume_text.encode("utf-8")), "text/plain")}
    res = client.post("/api/v1/candidates/me/resume/parse", files=files, headers=c_headers)
    assert res.status_code == 200, f"Response: {res.json()}"
    data = res.json()
    assert data["success"] is True
    parsed = data["data"]
    assert parsed["name"] == "John Doe"
    assert parsed["email"] == "john.doe@example.com"
    assert parsed["phone"] == "+91 9999988888"
    assert "React" in parsed["skills"]
    assert "Python" in parsed["skills"]
    assert parsed["qualification"] == "B.Tech / B.E."
