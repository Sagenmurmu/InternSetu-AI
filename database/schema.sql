-- SQL Schema for InternSetu AI Database (SQLite compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- candidate, employer, admin
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    category VARCHAR(50), -- General, OBC, SC, ST, EWS
    rural_or_urban VARCHAR(20), -- Rural, Urban
    district VARCHAR(100),
    state VARCHAR(100),
    qualification VARCHAR(100),
    course VARCHAR(200),
    college VARCHAR(300),
    skills TEXT, -- JSON array string
    sector_interest VARCHAR(200),
    location_preference VARCHAR(200),
    willing_to_relocate BOOLEAN DEFAULT 1,
    past_participation BOOLEAN DEFAULT 0,
    profile_completion REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    company_name VARCHAR(300) NOT NULL,
    sector VARCHAR(200),
    description TEXT,
    district VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(200),
    total_capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Internships Table
CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    sector VARCHAR(200),
    required_skills TEXT, -- JSON array string
    required_qualification VARCHAR(100),
    location VARCHAR(200),
    district VARCHAR(100),
    state VARCHAR(100),
    duration VARCHAR(100),
    stipend REAL DEFAULT 0.0,
    capacity INTEGER NOT NULL DEFAULT 1,
    selected_count INTEGER NOT NULL DEFAULT 0,
    mode VARCHAR(50) DEFAULT 'Remote', -- Remote, On-site, Hybrid
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    internship_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'applied', -- applied, shortlisted, selected, rejected, waitlisted
    decision_reason TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, internship_id),
    FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY(internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- 6. Match Results Table
CREATE TABLE IF NOT EXISTS match_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    internship_id INTEGER NOT NULL,
    skill_score REAL DEFAULT 0.0,
    qualification_score REAL DEFAULT 0.0,
    location_score REAL DEFAULT 0.0,
    sector_score REAL DEFAULT 0.0,
    fairness_score REAL DEFAULT 0.0,
    final_score REAL DEFAULT 0.0,
    explanation TEXT, -- JSON array string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY(internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
