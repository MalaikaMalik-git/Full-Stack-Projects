from .conftest import login, auth_headers


def test_login_with_valid_seeded_user_succeeds(client):
    resp = client.post("/auth/login", json={"username": "alice", "password": "password123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["username"] == "alice"
    assert body["token"]


def test_login_with_wrong_password_fails(client):
    resp = client.post("/auth/login", json={"username": "alice", "password": "wrongpassword"})
    assert resp.status_code == 401


def test_login_with_unknown_user_fails(client):
    resp = client.post("/auth/login", json={"username": "does-not-exist", "password": "whatever"})
    assert resp.status_code == 401


def test_signup_then_login_works(client):
    resp = client.post("/auth/signup", json={"username": "newuser1", "password": "password123"})
    assert resp.status_code == 201
    token = resp.json()["token"]
    resp2 = client.get("/auth/me", headers=auth_headers(token))
    assert resp2.status_code == 200
    assert resp2.json()["username"] == "newuser1"


def test_signup_with_duplicate_username_fails(client):
    client.post("/auth/signup", json={"username": "dupeuser", "password": "password123"})
    resp = client.post("/auth/signup", json={"username": "dupeuser", "password": "password456"})
    assert resp.status_code == 400


def test_signup_with_short_password_is_rejected(client):
    resp = client.post("/auth/signup", json={"username": "shortpassuser", "password": "abc"})
    assert resp.status_code == 422


def test_documents_endpoint_requires_auth(client):
    resp = client.get("/documents")
    assert resp.status_code == 401


def test_documents_endpoint_rejects_bad_token(client):
    resp = client.get("/documents", headers=auth_headers("not-a-real-token"))
    assert resp.status_code == 401
