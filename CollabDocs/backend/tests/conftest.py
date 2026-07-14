"""Shared pytest fixtures.

Each test gets a fresh in-memory SQLite database (not the real
collabdocs.db file), so tests never touch or depend on real data and can
run in any order without side effects.
"""
import pytest
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.seed import seed_users


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Seed the same demo users the real app seeds on startup, so tests can
    # log in the same way a reviewer would.
    seed_db = TestingSessionLocal()
    seed_users(seed_db)
    seed_db.close()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def login(client, username="alice", password="password123"):
    resp = client.post("/auth/login", json={"username": username, "password": password})
    assert resp.status_code == 200
    return resp.json()["token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
