from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    sector = Column(String(200), nullable=True)
    required_skills = Column(Text, nullable=True)  # JSON array stored as text
    required_qualification = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    stipend = Column(Float, default=0.0)
    capacity = Column(Integer, default=1, nullable=False)
    selected_count = Column(Integer, default=0, nullable=False)
    mode = Column(String(50), default="Remote")  # Remote, On-site, Hybrid
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    company = relationship("Company", back_populates="internships")
    applications = relationship("Application", back_populates="internship")
    match_results = relationship("MatchResult", back_populates="internship")

    def __repr__(self):
        return f"<Internship(id={self.id}, title='{self.title}')>"
