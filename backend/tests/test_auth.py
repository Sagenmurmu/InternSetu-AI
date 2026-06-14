def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"



def test_register_success(client):
    payload = {
        "name": "Test Candidate",
        "email": "testcandidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "testcandidate@example.com"
    assert data["data"]["user"]["role"] == "candidate"


def test_register_duplicate_email(client):
    # Register first
    payload = {
        "name": "Test Candidate",
        "email": "testcandidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=payload)

    # Register again
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client):
    # Register first
    payload_reg = {
        "name": "Test Candidate",
        "email": "testcandidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login
    payload_login = {
        "email": "testcandidate@example.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=payload_login)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


def test_login_wrong_password(client):
    # Register first
    payload_reg = {
        "name": "Test Candidate",
        "email": "testcandidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    payload_login = {
        "email": "testcandidate@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=payload_login)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403


def test_get_me_authorized(client):
    # Register first
    payload_reg = {
        "name": "Test Candidate",
        "email": "testcandidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login
    login_payload = {
        "email": "testcandidate@example.com",
        "password": "password123"
    }
    login_response = client.post("/api/v1/auth/login", json=login_payload)
    token = login_response.json()["data"]["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testcandidate@example.com"
