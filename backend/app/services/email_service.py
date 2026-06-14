import os
import smtplib
from email.message import EmailMessage
from app.utils.logger import logger


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
    """Send an email using SMTP or log it to the console if disabled in environment."""
    enabled = os.getenv("EMAIL_NOTIFICATIONS_ENABLED", "false").lower() in ("true", "1", "yes")
    
    if not enabled:
        logger.info("=========================================")
        logger.info("EMAIL NOTIFICATION LOG (DISABLED IN ENV)")
        logger.info(f"To      : {to_email}")
        logger.info(f"Subject : {subject}")
        logger.info(f"Body (Text) : {text_body or '(HTML-only)'}")
        logger.info("-----------------------")
        logger.info(f"Body (HTML) : {html_body[:300]}...")
        logger.info("=========================================")
        return True
        
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", "no-reply@internsetu.ai")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    
    if text_body:
        msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")
    
    try:
        if use_tls:
            server = smtplib.SMTP(host, port)
            server.ehlo()
            server.starttls()
            server.ehlo()
        else:
            server = smtplib.SMTP_SSL(host, port)
            server.ehlo()
            
        if username and password:
            server.login(username, password)
            
        server.send_message(msg)
        server.close()
        logger.info(f"Email notification successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification to {to_email}: {str(e)}")
        return False
