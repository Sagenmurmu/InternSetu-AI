# InternSetu AI — AI-Based Smart Internship Allocation Platform

InternSetu AI is a final-year/resume-grade full-stack platform designed to optimize and streamline internship allocations. By matching candidates with available positions using an AI recommendation model that considers skills, qualifications, location, and demographic fairness parameters, InternSetu AI provides an equitable and efficient allocation system.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC)**: Personalized dashboards and functionalities for Candidates, Employers, and Government Admins.
*   **AI-Powered Matching Engine**: Calculates multi-factor alignment (Skill Overlap, Qualifications, Proximity, Sector Interests) and outputs natural-language matching rationale.
*   **Demographic Fairness Boosting**: Systemic bonuses for female, rural, and category candidates (SC/ST/OBC/EWS) to promote diversity and inclusion.
*   **Robust Administration Tools**: Real-time analytics charts, capacity tracking, demographic metrics, and immutable audit logs.
*   **Production Cloud Ready**: Configured for zero-hassle native deployment on **Vercel** (Frontend) and **Render** (Backend & PostgreSQL).
*   **Database Migrations & Auto-Creation**: Integrated database scheme migrations via Alembic, with automatic table creation on startup.

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
│   │   ├── context/               # Global state contexts (Auth)
│   │   ├── data/                  # Mock and demo data
│   │   ├── layouts/               # Dashboard layout components
│   │   ├── pages/                 # Candidate, Employer, and Admin views
│   │   └── services/              # Axios API clients
│   ├── index.html                 # App gateway index file
│   ├── package.json               # NPM script definitions
│   ├── vercel.json                # Vercel SPA routing rules
│   └── vite.config.js             # Vite compilation and proxy configs
│
├── docs/                          # Detailed system documentation
│   ├── system-architecture.md     # Architectural design and flow diagrams
│   ├── database-schema.md         # Database tables, columns, and ER diagrams
│   ├── api-documentation.md       # API routers and JSON payload formats
│   └── matching-algorithm.md      # AI match scores and demographic fairness bonuses
├── render.yaml                    # Render Blueprint specification (Backend & Database)
└── vercel.json                    # Root Vercel deployment specification
```

---

## ⚡ Quick Start (Local Development)

1.  **Run Backend (SQLite / Local Python)**:
    ```bash
    cd backend
    python -m venv .venv
    # Windows: .venv\Scripts\activate.ps1  |  Linux: source .venv/bin/activate
    pip install -r requirements.txt
    python app/seed/seed_all.py
    python -m uvicorn main:app --reload
    ```
    API will run at `http://localhost:8000`. Swagger docs available at `http://localhost:8000/docs`.

2.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173`.

---

## ☁️ Cloud Deployment (Vercel + Render)

### 1. Deploy Backend & Database on Render

#### Option A: 1-Click Render Blueprint (Recommended)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` to provision:
   * A Python Web Service for the FastAPI backend.
   * A free managed PostgreSQL database.

#### Option B: Manual Web Service on Render
1. Create a **PostgreSQL** database on Render (free tier). Copy the **Internal Database URL**.
2. Click **New +** → **Web Service** and connect your repo:
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   * `DATABASE_URL`: *(Your Render PostgreSQL connection string)*
   * `SECRET_KEY`: *(A random secret string)*
   * `FRONTEND_URL`: `https://your-frontend.vercel.app`
   * `ENVIRONMENT`: `production`

---

### 2. Deploy Frontend on Vercel

1. In the [Vercel Dashboard](https://vercel.com/), click **Add New...** → **Project** and import your GitHub repository.
2. Configure project settings:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite` (auto-detected)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. In **Environment Variables**, add:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`
4. Click **Deploy**. Vercel will build the frontend with SPA client-side routing rewrites pre-configured.

---

## 🧪 Testing Backend Code

Run the full pytest suite to verify all backend authentication, admin, candidate, and matching routes work:
```bash
cd backend
python -m pytest
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

For detailed breakdowns of specific features, refer to the guides in the `docs/` directory:
*   **System Architecture (`docs/system-architecture.md`)**: Client-server design and cloud deployment stacks.
*   **Database Schema (`docs/database-schema.md`)**: Tables, primary keys, relationships, and ER diagrams.
*   **API Reference (`docs/api-documentation.md`)**: REST endpoints and JSON example payloads.
*   **Matching Engine Details (`docs/matching-algorithm.md`)**: Demographic diversity algorithms and weights.
