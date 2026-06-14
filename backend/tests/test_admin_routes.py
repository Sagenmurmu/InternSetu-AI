def test_admin_routes_role_enforcement(client):
    # 1. Create candidate and admin users
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

    # Register candidate
    c_res = client.post("/api/v1/auth/register", json=candidate_reg)
    c_token = c_res.json()["data"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Register admin
    a_res = client.post("/api/v1/auth/register", json=admin_reg)
    a_token = a_res.json()["data"]["access_token"]
    a_headers = {"Authorization": f"Bearer {a_token}"}

    # 2. Non-admin (candidate) tries to access admin overview -> 403 Forbidden
    response = client.get("/api/v1/admin/overview", headers=c_headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]

    # 3. Admin accesses overview successfully -> 200 OK
    response = client.get("/api/v1/admin/overview", headers=a_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "total_candidates" in data["data"]

    # 4. Admin accesses other analytics endpoints successfully
    for endpoint in ["district-analytics", "category-analytics", "capacity-utilization", "audit-logs"]:
        res = client.get(f"/api/v1/admin/{endpoint}", headers=a_headers)
        assert res.status_code == 200
        assert res.json()["success"] is True
