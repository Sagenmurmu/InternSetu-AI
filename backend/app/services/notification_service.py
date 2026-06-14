from sqlalchemy.orm import Session
from app.models.audit_log_model import AuditLog
from app.services.email_service import send_email


def notify_application_submitted(db: Session, candidate, internship, company):
    """Send candidate email confirming application submission and record audit log."""
    candidate_user = candidate.user
    if not candidate_user or not candidate_user.email:
        return
        
    subject = f"Application Submitted: {internship.title} at {company.company_name}"
    html_body = f"""
    <html>
      <body>
        <h3>Hello {candidate_user.name},</h3>
        <p>Your application for the position of <strong>{internship.title}</strong> at <strong>{company.company_name}</strong> has been successfully submitted.</p>
        <p>You will be notified once the employer reviews your profile.</p>
        <br/>
        <p>Best regards,<br/>InternSetu AI Team</p>
      </body>
    </html>
    """
    text_body = f"Hello {candidate_user.name},\n\nYour application for the position of {internship.title} at {company.company_name} has been successfully submitted."
    
    send_email(candidate_user.email, subject, html_body, text_body)
    
    # Audit log
    audit = AuditLog(
        user_id=candidate_user.id,
        user_role=candidate_user.role,
        action="EMAIL_NOTIFICATION",
        entity_type="application",
        description=f"Email notification queued/sent to candidate {candidate_user.email} for application submission"
    )
    db.add(audit)
    db.commit()


def notify_application_status_changed(db: Session, candidate, internship, new_status: str):
    """Send candidate email confirming application status transition and record audit log."""
    candidate_user = candidate.user
    if not candidate_user or not candidate_user.email:
        return
        
    subject = f"Application Status Update: {internship.title}"
    html_body = f"""
    <html>
      <body>
        <h3>Hello {candidate_user.name},</h3>
        <p>The status of your application for <strong>{internship.title}</strong> has been updated to: <span style="font-weight: bold; text-transform: uppercase; color: #1e3a8a;">{new_status}</span>.</p>
        <p>Please check your candidate dashboard for details.</p>
        <br/>
        <p>Best regards,<br/>InternSetu AI Team</p>
      </body>
    </html>
    """
    text_body = f"Hello {candidate_user.name},\n\nThe status of your application for {internship.title} has been updated to: {new_status.upper()}."
    
    send_email(candidate_user.email, subject, html_body, text_body)
    
    # Audit log
    audit = AuditLog(
        user_id=candidate_user.id,
        user_role=candidate_user.role,
        action="EMAIL_NOTIFICATION",
        entity_type="application",
        description=f"Email notification queued/sent to candidate {candidate_user.email} regarding status change to {new_status}"
    )
    db.add(audit)
    db.commit()


def notify_employer_new_application(db: Session, company_user, candidate, internship):
    """Send employer email notifying them of a new application receipt and record audit log."""
    if not company_user or not company_user.email:
        return
        
    candidate_name = candidate.user.name if candidate.user else "A candidate"
    subject = f"New Application Received: {internship.title}"
    html_body = f"""
    <html>
      <body>
        <h3>Hello {company_user.name},</h3>
        <p>You have received a new application from <strong>{candidate_name}</strong> for your internship posting: <strong>{internship.title}</strong>.</p>
        <p>Please log in to your employer dashboard to review their profile and matching scores.</p>
        <br/>
        <p>Best regards,<br/>InternSetu AI Team</p>
      </body>
    </html>
    """
    text_body = f"Hello {company_user.name},\n\nYou have received a new application from {candidate_name} for your internship: {internship.title}."
    
    send_email(company_user.email, subject, html_body, text_body)
    
    # Audit log
    audit = AuditLog(
        user_id=company_user.id,
        user_role=company_user.role,
        action="EMAIL_NOTIFICATION",
        entity_type="application",
        description=f"Email notification queued/sent to employer {company_user.email} for new application"
    )
    db.add(audit)
    db.commit()
