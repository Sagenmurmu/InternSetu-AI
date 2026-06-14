from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.services import export_service
from app.models.audit_log_model import AuditLog
from app.repositories import employer_repository, candidate_repository

router = APIRouter(prefix="/exports", tags=["Exports"])


@router.get("/admin/candidates")
def export_admin_candidates(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported candidates report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_candidates_csv(db)


@router.get("/admin/internships")
def export_admin_internships(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported internships report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_internships_csv(db)


@router.get("/admin/applications")
def export_admin_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported applications report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_applications_csv(db)


@router.get("/admin/matches")
def export_admin_matches(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported match results report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_match_results_csv(db)


@router.get("/admin/capacity")
def export_admin_capacity(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported capacity utilization report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_capacity_report_csv(db)


@router.get("/admin/fairness")
def export_admin_fairness(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported fairness report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_fairness_report_csv(db)


@router.get("/admin/audit-logs")
def export_admin_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
):
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description="Admin exported audit logs report as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_audit_logs_csv(db)


@router.get("/employer/applications")
def export_employer_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    company = employer_repository.get_company_by_user_id(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
        
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description=f"Employer '{company.company_name}' exported applications as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_employer_applications_csv(db, company.id)


@router.get("/employer/selected-candidates")
def export_employer_selected_candidates(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("employer")),
):
    company = employer_repository.get_company_by_user_id(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
        
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description=f"Employer '{company.company_name}' exported selected candidates as CSV"
    )
    db.add(audit)
    db.commit()
    
    from fastapi.responses import StreamingResponse
    import csv
    from io import StringIO
    from app.models.application_model import Application
    from app.models.internship_model import Internship
    from app.core.constants import ApplicationStatus
    
    applications = db.query(Application).join(Internship).filter(
        Internship.company_id == company.id,
        Application.status == ApplicationStatus.SELECTED
    ).all()
    
    headers = ["Application ID", "Candidate Name", "Candidate Email", "Internship Title", "Selected At"]
    rows = []
    for app in applications:
        cand_name = app.candidate.user.name if (app.candidate and app.candidate.user) else "N/A"
        cand_email = app.candidate.user.email if (app.candidate and app.candidate.user) else "N/A"
        job_title = app.internship.title if app.internship else "N/A"
        rows.append([
            app.id, cand_name, cand_email, job_title, app.updated_at
        ])
        
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)
    f.seek(0)
    
    response = StreamingResponse(iter([f.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = 'attachment; filename="employer_selected_candidates.csv"'
    return response


@router.get("/candidate/applications")
def export_candidate_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("candidate")),
):
    candidate = candidate_repository.get_candidate_by_user_id(db, current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
        
    audit = AuditLog(
        user_id=current_user.id, user_role=current_user.role, action="EXPORT_REPORT",
        description=f"Candidate '{current_user.name}' exported application history as CSV"
    )
    db.add(audit)
    db.commit()
    return export_service.export_candidate_applications_csv(db, candidate.id)
