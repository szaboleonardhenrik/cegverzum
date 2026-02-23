import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.auth import hash_password, create_access_token
from app.database import Base, get_db
from app.main import app
from app.models.company import Company
from app.models.user import User

SQLITE_URL = "sqlite:///./test.db"

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    user = User(email="test@example.com", hashed_password=hash_password("testpass123"), is_admin=False, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db):
    user = User(email="admin@example.com", hashed_password=hash_password("adminpass123"), is_admin=True, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(test_user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(admin_user):
    token = create_access_token(admin_user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_company(db):
    company = Company(
        nev="Teszt Kft.",
        adoszam="12345678-1-41",
        cegjegyzekszam="01-09-123456",
        szekhely="1052 Budapest, Deák Ferenc tér 1.",
        teaor_kod="6201",
        statusz="aktív",
        cegforma="Kft.",
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
