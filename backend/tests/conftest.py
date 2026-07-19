import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database.session import Base, get_db
from app.main import app
from app import models  # noqa: F401 ensure models are registered

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_session():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client, db_session):
    """Creates a throwaway user directly (skipping the /register endpoint's
    starter-forms onboarding, so existing forms/questions/responses tests
    stay isolated) and returns headers with a valid access token."""
    from app.core.security import create_access_token
    from app.crud.user import create_user
    from app.schemas.auth import UserCreate

    user = create_user(
        db_session,
        UserCreate(name="Test User", email="test@example.com", password="password123"),
    )
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}
