from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    skill_score = Column(Float, default=0.0)
    qualification_score = Column(Float, default=0.0)
    location_score = Column(Float, default=0.0)
    sector_score = Column(Float, default=0.0)
    fairness_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)  # JSON array stored as text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    candidate = relationship("Candidate", back_populates="match_results")
    internship = relationship("Internship", back_populates="match_results")

    def __repr__(self):
        return f"<MatchResult(id={self.id}, score={self.final_score})>"
