-- Seed Data for InternSetu AI Database

-- Delete existing records (if any) in correct foreign key order
DELETE FROM audit_logs;
DELETE FROM match_results;
DELETE FROM applications;
DELETE FROM internships;
DELETE FROM companies;
DELETE FROM candidates;
DELETE FROM users;

-- Reset SQLite primary keys
DELETE FROM sqlite_sequence WHERE name IN ('users', 'candidates', 'companies', 'internships', 'applications', 'match_results', 'audit_logs');

-- 1. Insert Users (Admin, candidates, employers)
-- Passwords: adminpassword for admin, password123 for others
INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES
(1, 'System Admin', 'admin@example.com', '$2b$12$sEK3nb4A1KcAbpFi33lBc.chR6yKkT6LgKgZBU64zYHGTG1KkMcQ6', 'admin', 1),
(2, 'Priya Sharma', 'priya@example.com', '$2b$12$lbWKD7zqlHMFE.xhEwDuWuTOgo6ro6T9vBZmCeNHdNQ67clv8Zwze', 'candidate', 1),
(3, 'Rahul Verma', 'rahul@example.com', '$2b$12$lbWKD7zqlHMFE.xhEwDuWuTOgo6ro6T9vBZmCeNHdNQ67clv8Zwze', 'candidate', 1),
(4, 'Ananya Mishra', 'ananya@example.com', '$2b$12$lbWKD7zqlHMFE.xhEwDuWuTOgo6ro6T9vBZmCeNHdNQ67clv8Zwze', 'candidate', 1),
(5, 'TechNova Solutions Partner', 'technova@example.com', '$2b$12$lbWKD7zqlHMFE.xhEwDuWuTOgo6ro6T9vBZmCeNHdNQ67clv8Zwze', 'employer', 1),
(6, 'Bharat Manufacturing Partner', 'bharat@example.com', '$2b$12$lbWKD7zqlHMFE.xhEwDuWuTOgo6ro6T9vBZmCeNHdNQ67clv8Zwze', 'employer', 1);

-- 2. Insert Candidates
INSERT INTO candidates (id, user_id, age, gender, category, rural_or_urban, district, state, qualification, course, college, skills, sector_interest, location_preference, willing_to_relocate, past_participation, profile_completion) VALUES
(1, 2, 21, 'Female', 'SC', 'Rural', 'Bhopal', 'Madhya Pradesh', 'B.Tech / B.E.', 'Computer Science', 'LNCT Bhopal', '["Python", "React", "SQL"]', 'IT / Software', 'Bhopal', 1, 0, 90.0),
(2, 3, 22, 'Male', 'OBC', 'Urban', 'Mumbai', 'Maharashtra', 'B.Sc', 'Information Technology', 'KC College Mumbai', '["JavaScript", "Java", "HTML/CSS"]', 'IT / Software', 'Mumbai', 0, 1, 85.0),
(3, 4, 20, 'Female', 'General', 'Urban', 'New Delhi', 'Delhi', 'B.Com', 'Commerce', 'SRCC Delhi', '["Excel", "Communication", "Data Analysis"]', 'Finance / Banking', 'Delhi', 1, 0, 95.0);

-- 3. Insert Companies
INSERT INTO companies (id, user_id, company_name, sector, description, district, state, address, contact_person, total_capacity) VALUES
(1, 5, 'TechNova Solutions', 'IT / Software', 'Leading provider of cutting-edge software solutions.', 'Bengaluru', 'Karnataka', 'Tech Park, Phase 2, Bengaluru', 'John Doe', 10),
(2, 6, 'Bharat Manufacturing Ltd', 'Manufacturing', 'High-quality mechanical components manufacturer.', 'Pune', 'Maharashtra', 'MIDC Area, Pune', 'Ramesh Kumar', 5);

-- 4. Insert Internships
INSERT INTO internships (id, company_id, title, description, sector, required_skills, required_qualification, location, district, state, duration, stipend, capacity, selected_count, mode, is_active) VALUES
(1, 1, 'Software Development Intern', 'Build scalable web applications using FastAPI and React.', 'IT / Software', '["Python", "FastAPI", "React"]', 'B.Tech / B.E.', 'Bengaluru', 'Bengaluru', 'Karnataka', '6 Months', 15000.0, 3, 0, 'Hybrid', 1),
(2, 1, 'Front-End Developer Intern', 'Design and implement beautiful responsive web UIs using React and modern CSS frameworks.', 'IT / Software', '["React", "JavaScript", "HTML/CSS"]', 'Diploma', 'Bengaluru', 'Bengaluru', 'Karnataka', '3 Months', 10000.0, 2, 0, 'Remote', 1),
(3, 1, 'Data Analyst Intern', 'Perform data cleanup, analysis, and generate reports using Excel and Power BI.', 'IT / Software', '["Excel", "Data Analysis", "Power BI"]', 'B.Sc', 'Bengaluru', 'Bengaluru', 'Karnataka', '6 Months', 12000.0, 2, 1, 'Remote', 1),
(4, 2, 'Mechanical Design Intern', 'Assist with manufacturing process control and mechanical design blueprints.', 'Manufacturing', '["Communication", "Excel"]', 'Diploma', 'Pune', 'Pune', 'Maharashtra', '6 Months', 8000.0, 2, 0, 'On-site', 1),
(5, 2, 'Operations Analyst Intern', 'Monitor operations flow, inspect quality standards, and track metrics.', 'Manufacturing', '["Data Analysis", "Excel", "Communication"]', 'B.Com', 'Pune', 'Pune', 'Maharashtra', '3 Months', 9000.0, 1, 0, 'Hybrid', 1);

-- 5. Insert Applications
INSERT INTO applications (id, candidate_id, internship_id, status, decision_reason) VALUES
(1, 1, 1, 'applied', NULL),
(2, 1, 2, 'shortlisted', 'Good frontend skills'),
(3, 2, 1, 'rejected', 'Lacks required FastAPI skills'),
(4, 2, 4, 'applied', NULL),
(5, 3, 3, 'selected', 'Excellent Excel and analytics skills'),
(6, 3, 5, 'applied', NULL);

-- 6. Insert Audit Logs
INSERT INTO audit_logs (id, user_id, user_role, action, entity_type, entity_id, description) VALUES
(1, 1, 'admin', 'USER_REGISTER', 'user', 1, 'Admin user seeded'),
(2, 2, 'candidate', 'USER_REGISTER', 'user', 2, 'User priya@example.com registered as candidate'),
(3, 3, 'candidate', 'USER_REGISTER', 'user', 3, 'User rahul@example.com registered as candidate'),
(4, 4, 'candidate', 'USER_REGISTER', 'user', 4, 'User ananya@example.com registered as candidate'),
(5, 5, 'employer', 'USER_REGISTER', 'user', 5, 'User technova@example.com registered as employer'),
(6, 6, 'employer', 'USER_REGISTER', 'user', 6, 'User bharat@example.com registered as employer'),
(7, 5, 'employer', 'COMPANY_CREATED', 'company', 1, 'Company TechNova Solutions created'),
(8, 6, 'employer', 'COMPANY_CREATED', 'company', 2, 'Company Bharat Manufacturing Ltd created'),
(9, 5, 'employer', 'INTERNSHIP_CREATED', 'internship', 1, 'Internship Software Development Intern created'),
(10, 2, 'candidate', 'APPLICATION_SUBMITTED', 'application', 1, 'Priya Sharma applied to Software Development Intern'),
(11, 3, 'candidate', 'APPLICATION_SUBMITTED', 'application', 3, 'Rahul Verma applied to Software Development Intern'),
(12, 5, 'employer', 'CANDIDATE_REJECTED', 'application', 3, 'Application #3 status updated to rejected'),
(13, 4, 'candidate', 'APPLICATION_SUBMITTED', 'application', 5, 'Ananya Mishra applied to Data Analyst Intern'),
(14, 5, 'employer', 'CANDIDATE_SELECTED', 'application', 5, 'Application #5 status updated to selected');
