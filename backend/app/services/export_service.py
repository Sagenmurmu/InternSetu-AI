import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user_model import User
from app.models.candidate_model import Candidate
from app.models.company_model import Company
from app.models.internship_model import Internship
from app.models.application_model import Application
from app.models.match_result_model import MatchResult
from app.models.audit_log_model import AuditLog


def _to_csv_stream(headers: list, rows: list, filename: str) -> StreamingResponse:
    """Helper to write CSV content to a string buffer and return as streaming download response."""
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)
    f.seek(0)
    
    response = StreamingResponse(
        iter([f.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


def export_candidates_csv(db: Session) -> StreamingResponse:
    candidates = db.query(Candidate).all()
    headers = [
        "Candidate ID", "Name", "Email", "Age", "Gender", "Category", 
        "Geography (Rural/Urban)", "District", "State", "Qualification", 
        "Course", "College", "Skills", "Sector Interest", "Relocate Willingness"
    ]
    rows = []
    for cand in candidates:
        name = cand.user.name if cand.user else "N/A"
        email = cand.user.email if cand.user else "N/A"
        rows.append([
            cand.id, name, email, cand.age, cand.gender, cand.category,
            cand.rural_or_urban, cand.district, cand.state, cand.qualification,
            cand.course, cand.college, cand.skills, cand.sector_interest, cand.willing_to_relocate
        ])
    return _to_csv_stream(headers, rows, "candidates_report.csv")


def export_internships_csv(db: Session) -> StreamingResponse:
    internships = db.query(Internship).all()
    headers = [
        "Internship ID", "Company", "Title", "Sector", "Required Qualification",
        "Required Skills", "District", "State", "Work Mode", "Capacity", "Filled Slots"
    ]
    rows = []
    for job in internships:
        comp_name = job.company.company_name if job.company else "N/A"
        rows.append([
            job.id, comp_name, job.title, job.sector, job.required_qualification,
            job.required_skills, job.district, job.state, job.mode, job.capacity, job.selected_count
        ])
    return _to_csv_stream(headers, rows, "internships_report.csv")


def export_applications_csv(db: Session) -> StreamingResponse:
    applications = db.query(Application).all()
    headers = [
        "Application ID", "Candidate Name", "Candidate Email", 
        "Internship Title", "Company Name", "Status", "Reason", "Applied At"
    ]
    rows = []
    for app in applications:
        cand_name = app.candidate.user.name if (app.candidate and app.candidate.user) else "N/A"
        cand_email = app.candidate.user.email if (app.candidate and app.candidate.user) else "N/A"
        job_title = app.internship.title if app.internship else "N/A"
        comp_name = app.internship.company.company_name if (app.internship and app.internship.company) else "N/A"
        rows.append([
            app.id, cand_name, cand_email, job_title, comp_name, app.status, app.decision_reason, app.applied_at
        ])
    return _to_csv_stream(headers, rows, "all_applications_report.csv")


def export_match_results_csv(db: Session) -> StreamingResponse:
    matches = db.query(MatchResult).all()
    headers = [
        "Match ID", "Candidate Name", "Candidate Email", "Internship Title", 
        "Company Name", "Skill Score", "Qualification Score", "Location Score", 
        "Sector Score", "Fairness Score", "Final Score"
    ]
    rows = []
    for m in matches:
        cand_name = m.candidate.user.name if (m.candidate and m.candidate.user) else "N/A"
        cand_email = m.candidate.user.email if (m.candidate and m.candidate.user) else "N/A"
        job_title = m.internship.title if m.internship else "N/A"
        comp_name = m.internship.company.company_name if (m.internship and m.internship.company) else "N/A"
        rows.append([
            m.id, cand_name, cand_email, job_title, comp_name, m.skill_score,
            m.qualification_score, m.location_score, m.sector_score, m.fairness_score, m.final_score
        ])
    return _to_csv_stream(headers, rows, "match_results_report.csv")


def export_capacity_report_csv(db: Session) -> StreamingResponse:
    companies = db.query(Company).all()
    headers = [
        "Company Name", "Total Capacity", "Used Slots (Selected)", "Remaining Capacity", "Utilization Rate"
    ]
    rows = []
    for comp in companies:
        cap = comp.total_capacity or 0
        used = sum(i.selected_count for i in comp.internships) if comp.internships else 0
        pct = f"{(used / cap * 100):.2f}%" if cap > 0 else "0.00%"
        rows.append([
            comp.company_name, cap, used, cap - used, pct
        ])
    return _to_csv_stream(headers, rows, "capacity_utilization_report.csv")


def export_fairness_report_csv(db: Session) -> StreamingResponse:
    headers = ["Dimension", "Group", "Average Match Score"]
    rows = []
    
    # Rural/Urban averages
    rural_avg = db.query(func.avg(MatchResult.final_score)).join(Candidate).filter(Candidate.rural_or_urban == "Rural").scalar() or 0.0
    urban_avg = db.query(func.avg(MatchResult.final_score)).join(Candidate).filter(Candidate.rural_or_urban == "Urban").scalar() or 0.0
    rows.append(["Rural/Urban", "Rural", round(rural_avg, 2)])
    rows.append(["Rural/Urban", "Urban", round(urban_avg, 2)])
    
    # Category averages
    categories = db.query(Candidate.category).distinct().all()
    for (cat,) in categories:
        if cat:
            cat_avg = db.query(func.avg(MatchResult.final_score)).join(Candidate).filter(Candidate.category == cat).scalar() or 0.0
            rows.append(["Category", cat, round(cat_avg, 2)])
            
    # Gender averages
    genders = db.query(Candidate.gender).distinct().all()
    for (gender,) in genders:
        if gender:
            gender_avg = db.query(func.avg(MatchResult.final_score)).join(Candidate).filter(Candidate.gender == gender).scalar() or 0.0
            rows.append(["Gender", gender, round(gender_avg, 2)])
            
    return _to_csv_stream(headers, rows, "fairness_report.csv")


def export_audit_logs_csv(db: Session) -> StreamingResponse:
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    headers = ["Log ID", "User ID", "User Role", "Action", "Entity Type", "Entity ID", "Description", "Timestamp"]
    rows = []
    for log in logs:
        rows.append([
            log.id, log.user_id, log.user_role, log.action, log.entity_type, log.entity_id, log.description, log.timestamp
        ])
    return _to_csv_stream(headers, rows, "audit_logs_report.csv")


def export_employer_applications_csv(db: Session, company_id: int) -> StreamingResponse:
    applications = db.query(Application).join(Internship).filter(Internship.company_id == company_id).all()
    headers = ["Application ID", "Candidate Name", "Candidate Email", "Internship Title", "Status", "Reason", "Applied At"]
    rows = []
    for app in applications:
        cand_name = app.candidate.user.name if (app.candidate and app.candidate.user) else "N/A"
        cand_email = app.candidate.user.email if (app.candidate and app.candidate.user) else "N/A"
        job_title = app.internship.title if app.internship else "N/A"
        rows.append([
            app.id, cand_name, cand_email, job_title, app.status, app.decision_reason, app.applied_at
        ])
    return _to_csv_stream(headers, rows, "employer_applications_report.csv")


def export_candidate_applications_csv(db: Session, candidate_id: int) -> StreamingResponse:
    applications = db.query(Application).filter(Application.candidate_id == candidate_id).all()
    headers = ["Application ID", "Internship Title", "Company Name", "Status", "Reason", "Applied At"]
    rows = []
    for app in applications:
        job_title = app.internship.title if app.internship else "N/A"
        comp_name = app.internship.company.company_name if (app.internship and app.internship.company) else "N/A"
        rows.append([
            app.id, job_title, comp_name, app.status, app.decision_reason, app.applied_at
        ])
    return _to_csv_stream(headers, rows, "candidate_applications_report.csv")
