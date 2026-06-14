import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from main import app

# Import all models to ensure they are registered on metadata
from app.models.user_model import User
from app.models.candidate_model import Candidate
from app.models.company_model import Company
from app.models.internship_model import Internship
from app.models.application_model import Application
from app.models.match_result_model import MatchResult
from app.models.audit_log_model import AuditLog
from app.models.policy_weight_model import PolicyWeight


@pytest.fixture(scope="function")
def db_session():
    """Create a clean database session for each test function."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Override get_db and yield a TestClient."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
