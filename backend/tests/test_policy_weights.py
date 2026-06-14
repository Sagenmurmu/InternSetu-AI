import pytest

def test_policy_weights_flow(client):
    # 1. Register candidate and admin
    candidate_reg = {
        "name": "Candidate Alice",
        "email": "alice@example.com",
        "password": "password123",
        "role": "candidate"
    }
    admin_reg = {
        "name": "Admin weights",
        "email": "adminweights@example.com",
        "password": "password123",
        "role": "admin"
    }

    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    a_res = client.post("/api/v1/auth/register", json=admin_reg)
    a_token = a_res.json()["data"]["access_token"]
    a_headers = {"Authorization": f"Bearer {a_token}"}

    # 2. Get active policy weights (should default to baseline)
    res = client.get("/api/v1/admin/policy-weights", headers=a_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["skill_weight"] == 0.35
    assert data["qualification_weight"] == 0.20

    # 3. Non-admin (candidate) tries to update -> 403
    payload = {
        "skill_weight": 0.30,
        "qualification_weight": 0.25,
        "location_weight": 0.15,
        "sector_weight": 0.15,
        "fairness_weight": 0.15
    }
    res = client.put("/api/v1/admin/policy-weights", json=payload, headers=c_headers)
    assert res.status_code == 403

    # 4. Admin tries to update with invalid sum (total = 1.1) -> 422
    payload["skill_weight"] = 0.40
    res = client.put("/api/v1/admin/policy-weights", json=payload, headers=a_headers)
    assert res.status_code == 422
    assert "Sum of weights must be exactly 1.0" in str(res.json()["detail"])

    # 5. Admin updates with valid sum (total = 1.0) -> 200
    payload["skill_weight"] = 0.30
    res = client.put("/api/v1/admin/policy-weights", json=payload, headers=a_headers)
    assert res.status_code == 200, f"Response: {res.json()}"
    data = res.json()
    assert "skill_weight" in data["data"], f"Response data: {data}"
    assert data["data"]["skill_weight"] == 0.30

    # 6. Admin resets weights -> 200
    res = client.post("/api/v1/admin/policy-weights/reset", headers=a_headers)
    assert res.status_code == 200
    assert res.json()["data"]["skill_weight"] == 0.35
