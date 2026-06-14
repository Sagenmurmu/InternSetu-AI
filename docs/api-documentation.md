# InternSetu AI — API Documentation

All API requests are prefixed with `/api/v1` and follow standard HTTP verbs. Success responses return a JSON envelope, and protected endpoints expect a JWT bearer token in the `Authorization` header.

---

## 1. Authentication Envelopes & Routing

### 1.1. User Registration
*   **Method & Endpoint**: `POST /api/v1/auth/register`
*   **Request Payload**:
    ```json
    {
      "name": "Arjun Kumar",
      "email": "arjun.kumar@example.com",
      "password": "securepassword123",
      "role": "candidate"
    }
    ```
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Registration successful",
      "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "user": {
          "id": 1,
          "name": "Arjun Kumar",
          "email": "arjun.kumar@example.com",
          "role": "candidate",
          "is_active": true
        }
      }
    }
    ```

### 1.2. User Login
*   **Method & Endpoint**: `POST /api/v1/auth/login`
*   **Request Payload**:
    ```json
    {
      "email": "arjun.kumar@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "user": {
          "id": 1,
          "name": "Arjun Kumar",
          "email": "arjun.kumar@example.com",
          "role": "candidate",
          "is_active": true
        }
      }
    }
    ```

### 1.3. Retrieve Profile Details
*   **Method & Endpoint**: `GET /api/v1/auth/me`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Profile retrieved",
      "data": {
        "id": 1,
        "name": "Arjun Kumar",
        "email": "arjun.kumar@example.com",
        "role": "candidate",
        "candidate_profile": {
          "id": 1,
          "age": 22,
          "gender": "Male",
          "category": "OBC",
          "rural_or_urban": "Rural",
          "skills": ["Python", "SQL", "FastAPI"]
        }
      }
    }
    ```

---

## 2. Internship Management

### 2.1. Post a New Internship (Employer only)
*   **Method & Endpoint**: `POST /api/v1/internships`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Request Payload**:
    ```json
    {
      "title": "Backend Engineering Intern",
      "description": "Develop and maintain high-performance API endpoints.",
      "sector": "IT / Software",
      "required_skills": "[\"Python\", \"FastAPI\", \"SQL\"]",
      "required_qualification": "B.Tech / B.E.",
      "location": "Bengaluru",
      "district": "Bengaluru Rural",
      "state": "Karnataka",
      "duration": "6 Months",
      "stipend": 15000.00,
      "capacity": 3,
      "mode": "Remote"
    }
    ```
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Internship created successfully",
      "data": {
        "id": 5,
        "company_id": 1,
        "title": "Backend Engineering Intern",
        "capacity": 3,
        "mode": "Remote",
        "is_active": true
      }
    }
    ```

### 2.2. List All Active Internships
*   **Method & Endpoint**: `GET /api/v1/internships`
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Internships retrieved successfully",
      "data": [
        {
          "id": 5,
          "company_id": 1,
          "title": "Backend Engineering Intern",
          "stipend": 15000.0,
          "location": "Bengaluru",
          "is_active": true
        }
      ]
    }
    ```

---

## 3. Applications and Status Workflows

### 3.1. Submit Internship Application
*   **Method & Endpoint**: `POST /api/v1/applications`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Request Payload**:
    ```json
    {
      "candidate_id": 1,
      "internship_id": 5
    }
    ```
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Application submitted successfully",
      "data": {
        "id": 12,
        "candidate_id": 1,
        "internship_id": 5,
        "status": "applied",
        "applied_at": "2026-06-14T01:13:00Z"
      }
    }
    ```

### 3.2. Update Application Status (Employer only)
*   **Method & Endpoint**: `PUT /api/v1/applications/{application_id}/status`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Request Payload**:
    ```json
    {
      "status": "shortlisted",
      "decision_reason": "Excellent skills match on Python and FastAPI"
    }
    ```
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Application status updated to shortlisted",
      "data": {
        "id": 12,
        "status": "shortlisted",
        "decision_reason": "Excellent skills match on Python and FastAPI"
      }
    }
    ```

---

## 4. AI Recommendation & Ranking

### 4.1. Run Recommendations for a Candidate
*   **Method & Endpoint**: `POST /api/v1/matching/candidate/{candidate_id}/generate`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Generated 5 recommendations",
      "data": [
        {
          "id": 101,
          "candidate_id": 1,
          "internship_id": 5,
          "skill_score": 100.0,
          "qualification_score": 100.0,
          "location_score": 80.0,
          "sector_score": 100.0,
          "fairness_score": 70.0,
          "final_score": 93.0,
          "explanation": [
            "Strong skill match — candidate has most of the required skills for this role.",
            "Qualification match — candidate's B.Tech meets the requirement.",
            "Remote mode — remote opportunity matches criteria.",
            "Sector interest aligned — candidate is interested in this sector.",
            "Fairness bonus applied — supporting diversity and inclusion in allocation."
          ]
        }
      ]
    }
    ```

---

## 5. Administration & Auditing

### 5.1. Retrieve Metrics Dashboard
*   **Method & Endpoint**: `GET /api/v1/admin/analytics`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Analytics retrieved",
      "data": {
        "total_users": 150,
        "total_candidates": 98,
        "total_companies": 42,
        "total_internships": 120,
        "total_applications": 340,
        "applications_by_status": {
          "applied": 150,
          "shortlisted": 100,
          "selected": 50,
          "rejected": 40
        },
        "average_matching_score": 76.5,
        "fairness_demographics": {
          "rural_percentage": 64.2,
          "sc_st_percentage": 28.5,
          "female_percentage": 42.1
        }
      }
    }
    ```

### 5.2. View Platform Audit Logs
*   **Method & Endpoint**: `GET /api/v1/admin/audit-logs`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Audit logs retrieved",
      "data": [
        {
          "id": 129,
          "user_id": 1,
          "user_role": "admin",
          "action": "MATCHING_RUN",
          "entity_type": "candidate",
          "entity_id": 1,
          "description": "Generated 5 recommendations for candidate #1",
          "timestamp": "2026-06-14T01:13:00Z"
        }
      ]
    }
    ```
