from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey

from app.core.database import Base


class PolicyWeight(Base):
    __tablename__ = "policy_weights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_weight = Column(Float, default=0.35, nullable=False)
    qualification_weight = Column(Float, default=0.20, nullable=False)
    location_weight = Column(Float, default=0.15, nullable=False)
    sector_weight = Column(Float, default=0.15, nullable=False)
    fairness_weight = Column(Float, default=0.15, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    def __repr__(self):
        return f"<PolicyWeight(id={self.id}, active={self.is_active})>"
