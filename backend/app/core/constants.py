"""
Application-wide constants and enumerations.
"""


class UserRole:
    CANDIDATE = "candidate"
    EMPLOYER = "employer"
    ADMIN = "admin"

    ALL = [CANDIDATE, EMPLOYER, ADMIN]


class ApplicationStatus:
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    SELECTED = "selected"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"

    ALL = [APPLIED, SHORTLISTED, SELECTED, REJECTED, WAITLISTED]


# Valid status transitions: current_status -> list of allowed next statuses
VALID_STATUS_TRANSITIONS = {
    ApplicationStatus.APPLIED: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WAITLISTED,
    ],
    ApplicationStatus.SHORTLISTED: [
        ApplicationStatus.SELECTED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.WAITLISTED: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
    ],
    ApplicationStatus.SELECTED: [],
    ApplicationStatus.REJECTED: [],
}


# AI Matching weights (must sum to 1.0)
MATCHING_WEIGHTS = {
    "skill": 0.35,
    "qualification": 0.20,
    "location": 0.15,
    "sector": 0.15,
    "fairness": 0.15,
}


SECTORS = [
    "IT / Software",
    "Manufacturing",
    "Finance / Banking",
    "Healthcare",
    "Education",
    "Retail / E-commerce",
    "Government",
    "Media / Entertainment",
    "Agriculture",
    "Logistics / Supply Chain",
]

QUALIFICATIONS = [
    "10th Pass",
    "12th Pass",
    "ITI",
    "Diploma",
    "B.Tech / B.E.",
    "B.Sc",
    "B.Com",
    "BBA / BMS",
    "M.Tech / M.E.",
    "MBA",
    "M.Sc",
    "PhD",
]

SKILLS = [
    "Python",
    "JavaScript",
    "React",
    "FastAPI",
    "SQL",
    "Excel",
    "Data Analysis",
    "Machine Learning",
    "Communication",
    "Java",
    "C++",
    "HTML/CSS",
    "Node.js",
    "MongoDB",
    "Tableau",
    "Power BI",
    "AWS",
    "Docker",
    "Git",
    "Figma",
]

GENDERS = ["Male", "Female", "Other"]

CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"]

RURAL_URBAN = ["Rural", "Urban"]

MODES = ["Remote", "On-site", "Hybrid"]

AUDIT_ACTIONS = {
    "USER_LOGIN": "User Login",
    "USER_REGISTER": "User Register",
    "APPLICATION_SUBMITTED": "Application Submitted",
    "INTERNSHIP_CREATED": "Internship Created",
    "CANDIDATE_SHORTLISTED": "Candidate Shortlisted",
    "CANDIDATE_SELECTED": "Candidate Selected",
    "CANDIDATE_REJECTED": "Candidate Rejected",
    "CANDIDATE_WAITLISTED": "Candidate Waitlisted",
    "MATCHING_RUN": "Matching Run",
    "PROFILE_UPDATE": "Profile Update",
    "COMPANY_CREATED": "Company Created",
}
