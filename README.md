# InternSetu AI — AI-Based Smart Internship Allocation Platform

InternSetu AI is a final-year/resume-grade full-stack platform designed to optimize and streamline internship allocations. By matching candidates with available positions using an AI recommendation model that considers skills, qualifications, location, and demographic fairness parameters, InternSetu AI provides an equitable and efficient allocation system.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC)**: Personalized dashboards and functionalities for Candidates, Employers, and Government Admins.
*   **AI-Powered Matching Engine**: Calculates multi-factor alignment (Skill Overlap, Qualifications, Proximity, Sector Interests) and outputs natural-language matching rationale.
*   **Demographic Fairness Boosting**: Systemic bonuses for female, rural, and category candidates (SC/ST/OBC/EWS) to promote diversity and inclusion.
*   **Robust Administration Tools**: Real-time analytics charts, capacity tracking, demographic metrics, and immutable audit logs.
*   **Docker Containerization**: Container configurations for development and production scaling.
*   **Database Migrations**: Integrated database scheme migrations via Alembic.

---

## 📁 Repository Structure

```text
├── backend/                       # FastAPI application
│   ├── alembic/                   # Alembic database migration scripts
│   ├── app/
│   │   ├── core/                  # Configurations, databases, and constants
│   │   ├── models/                # SQLAlchemy database models
│   │   ├── repositories/          # Database access layers
│   │   ├── routes/                # FastAPI endpoint routers
│   │   ├── schemas/               # Pydantic data schemas
│   │   ├── seed/                  # Idempotent database seed scripts
│   │   ├── services/              # AI matching & analytics engines
│   │   └── utils/                 # General helpers and response formatters
│   ├── tests/                     # Backend unit tests (Pytest)
│   ├── alembic.ini                # Alembic database config file
│   ├── main.py                    # API gateway startup script
│   └── requirements.txt           # Python application dependencies
│
├── frontend/                      # React SPA application
│   ├── src/
│   │   ├── context/               # Global state contexts (Auth, Theme)
│   │   ├── data/                  # Demo configurations
│   │   ├── layouts/               # Dashboard layout components
│   │   ├── pages/                 # Candidate, Employer, and Admin views
│   │   └── services/              # Axios API clients
│   ├── index.html                 # App gateway index file
│   ├── package.json               # NPM script definitions
│   └── vite.config.js             # Vite compilation and proxy configs
│
├── deployment/                    # Container build scripts
│   ├── Dockerfile.backend         # FastAPI backend image spec
│   ├── Dockerfile.frontend        # React + Nginx frontend image spec
│   └── nginx.conf                 # SPA routing and API reverse-proxy specs
│
├── docs/                          # Detailed system documentation
│   ├── system-architecture.md     # Architectural design and flow diagrams
│   ├── database-schema.md         # Database tables, columns, and ER diagrams
│   ├── api-documentation.md       # API routers and JSON payload formats
│   ├── matching-algorithm.md      # AI match scores and demographic fairness bonuses
│   └── system-architecture.md     # Architectural design and flow diagrams
├── docker-compose.yml             # Orchestration for multi-container launch
```

---

## ⚡ Quick Start

### Option A: Local Dev Quick Start

1.  **Run Backend (SQLite)**:
    ```bash
    cd backend
    python -m venv .venv
    # Windows: .venv\Scripts\activate.ps1  |  Linux: source .venv/bin/activate
    pip install -r requirements.txt
    alembic upgrade head
    python app/seed/seed_all.py
    uvicorn main:app --reload
    ```
2.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173`.

### Option B: Production Container Launch (PostgreSQL)

Launch the fully containerized platform using Docker Compose:
```bash
docker compose up --build -d
docker exec -it internsetu_backend alembic upgrade head
docker exec -it internsetu_backend python app/seed/seed_all.py
```
Open `http://localhost:5173`.

---

## 🧪 Testing Backend Code

Run the pytest suite to verify all backend authentication, admin, candidate, and matching routes work:
```bash
cd backend
.venv\Scripts\pytest
```

---

## 🤖 Advanced Matching Engine & ML Experiments

The matching engine implements semantic skill similarity, demographic diversity reranking, and academic hierarchies.

### Run ML Experiments & Scripts
Run these scripts to generate synthetic datasets and compute recommendation/fairness offline metrics:
*   **Generate Datasets (500 candidates, 100 internships)**:
    ```bash
    backend/.venv/Scripts/python ml-experiments/scripts/generate_synthetic_candidates.py
    backend/.venv/Scripts/python ml-experiments/scripts/generate_synthetic_internships.py
    ```
*   **Evaluate Matching & Fairness**:
    ```bash
    backend/.venv/Scripts/python ml-experiments/scripts/evaluate_matching.py
    ```

Model performance and fairness reports will be saved under `ml-experiments/datasets/`. Experiment notebooks are located in `ml-experiments/notebooks/`.

---

## 📖 In-Depth System Documentation

For detailed breakdowns of specific features, refer to the guides in the [docs/](file:///c:/Users/VICTUS/OneDrive/Desktop/internsetu-ai/docs) directory:
*   **[System Architecture](file:///c:/Users/VICTUS/OneDrive/Desktop/internsetu-ai/docs/system-architecture.md)**: Network diagrams, client-server design, and tech stacks.
*   **[Database Schema](file:///c:/Users/VICTUS/OneDrive/Desktop/internsetu-ai/docs/database-schema.md)**: Tables, primary keys, relationships, and ER diagrams.
*   **[API Reference](file:///c:/Users/VICTUS/OneDrive/Desktop/internsetu-ai/docs/api-documentation.md)**: REST endpoints and JSON example payloads.
*   **[Matching Engine Details](file:///c:/Users/VICTUS/OneDrive/Desktop/internsetu-ai/docs/matching-algorithm.md)**: Demographic diversity algorithms and weights.

