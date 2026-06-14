# InternSetu AI — Deployment Guide

This guide details the steps to deploy InternSetu AI in both local development and containerized production environments.

---

## 1. Prerequisites

Ensure you have the following installed:
*   **Python**: Version 3.11+
*   **Node.js**: Version 20+ (with npm)
*   **SQLite** (for local development) or **PostgreSQL 15+** (for production)
*   **Docker & Docker Compose** (for containerized deployments)

---

## 2. Local Development Setup

### 2.1. Backend Setup
1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment**:
    *   **Windows**:
        ```powershell
        python -m venv .venv
        .venv\Scripts\Activate.ps1
        ```
    *   **Linux/macOS**:
        ```bash
        python -m venv .venv
        source .venv/bin/activate
        ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Create an environment file**:
    Copy `backend/.env.example` to `backend/.env` and adjust the variables if necessary. By default, SQLite is used:
    ```ini
    DATABASE_URL=sqlite:///./internsetu.db
    ENVIRONMENT=development
    DEBUG=true
    ```
5.  **Initialize the Database and Run Migrations**:
    ```bash
    alembic upgrade head
    ```
6.  **Seed Demographics and Mock Data**:
    ```bash
    python app/seed/seed_all.py
    ```
7.  **Start the Backend Dev Server**:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *   Swagger documentation is available at `http://localhost:8000/docs`.
    *   Redoc documentation is available at `http://localhost:8000/redoc`.

### 2.2. Frontend Setup
1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install npm packages**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Verify that `frontend/.env` has:
    ```ini
    VITE_API_URL=http://localhost:8000/api/v1
    VITE_USE_MOCK_FALLBACK=false
    ```
4.  **Start the Dev Server**:
    ```bash
    npm run dev
    ```
    *   The frontend app will launch at `http://localhost:5173`.

---

## 3. Production Deployment via Docker Compose

Production is orchestrated using Docker Compose to launch a PostgreSQL database, the FastAPI backend, and the React frontend served by Nginx.

### 3.1. Build and Run Containers
1.  **Configure the root environment**:
    Copy the root `.env.example` to `.env`. Modify details like `SECRET_KEY` and passwords.
2.  **Build and start all services**:
    ```bash
    docker compose up --build -d
    ```
    This command orchestrates:
    *   **Database**: PostgreSQL 15, exposing port `5432` internally and on the host. Persistent data is saved in the `postgres_data` volume.
    *   **Backend API**: FastAPI running under Python 3.11, exposing port `8000`. It connects to PostgreSQL after the database healthcheck passes.
    *   **Frontend**: React client SPA compiled inside a Node 20 environment, copied to Nginx, and served on port `5173` (Nginx port 80).

### 3.2. Run Migrations and Seeding inside Docker
After the containers are active, apply database migrations and seed data within the backend container:
1.  **Apply Alembic Migrations**:
    ```bash
    docker exec -it internsetu_backend alembic upgrade head
    ```
2.  **Seed Database**:
    ```bash
    docker exec -it internsetu_backend python app/seed/seed_all.py
    ```

---

## 4. Alembic Database Migrations

Alembic manages incremental schema modifications.

*   **Apply migrations to the current database version**:
    ```bash
    alembic upgrade head
    ```
*   **Revert the last migration**:
    ```bash
    alembic downgrade -1
    ```
*   **Generate a new migration script**:
    When you edit SQLAlchemy models, generate a migration version by comparing files against a database:
    ```bash
    alembic revision --autogenerate -m "describe_change"
    ```

---

## 5. Seed Account Credentials

The database seed script generates pre-configured accounts for test logins:

*   **Administrator**:
    *   *Email*: `admin@internsetu.gov.in`
    *   *Password*: `admin123`
*   **Employer (Company)**:
    *   *Email*: `employer@tcs.com`
    *   *Password*: `employer123`
*   **Candidate**:
    *   *Email*: `candidate@gmail.com`
    *   *Password*: `candidate123`
