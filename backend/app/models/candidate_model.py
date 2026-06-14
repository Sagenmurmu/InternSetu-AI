from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    category = Column(String(50), nullable=True)  # General, OBC, SC, ST, EWS
    rural_or_urban = Column(String(20), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    qualification = Column(String(100), nullable=True)
    course = Column(String(200), nullable=True)
    college = Column(String(300), nullable=True)
    skills = Column(Text, nullable=True)  # JSON array stored as text
    sector_interest = Column(String(200), nullable=True)
    location_preference = Column(String(200), nullable=True)
    willing_to_relocate = Column(Boolean, default=True)
    past_participation = Column(Boolean, default=False)
    profile_completion = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="candidate")
    applications = relationship("Application", back_populates="candidate")
    match_results = relationship("MatchResult", back_populates="candidate")

    def __repr__(self):
        return f"<Candidate(id={self.id}, user_id={self.user_id})>"
