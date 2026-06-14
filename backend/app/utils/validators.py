"""Reusable validation utilities."""

import re
from app.core.constants import VALID_STATUS_TRANSITIONS


def validate_email_format(email: str) -> bool:
    """Check if an email address has a valid format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_status_transition(current_status: str, new_status: str) -> bool:
    """Check if an application status transition is allowed."""
    allowed = VALID_STATUS_TRANSITIONS.get(current_status, [])
    return new_status in allowed
