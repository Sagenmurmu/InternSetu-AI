"""Helper utilities for seeding the database."""

from sqlalchemy.orm import Session
from app.models.user_model import User


def is_already_seeded(db: Session) -> bool:
    """Check if the database already contains seed data."""
    return db.query(User).first() is not None
