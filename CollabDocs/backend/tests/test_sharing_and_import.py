import io

from .conftest import login, auth_headers


def test_owner_can_share_document_with_another_user(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")

    doc = client.post("/documents", json={"title": "Shared doc"}, headers=auth_headers(alice_token)).json()

    share_resp = client.post(
        f"/documents/{doc['id']}/share", json={"username": "bob"}, headers=auth_headers(alice_token)
    )
    assert share_resp.status_code == 200
    assert "bob" in share_resp.json()["shared_with"]

    bob_docs = client.get("/documents", headers=auth_headers(bob_token)).json()
    assert len(bob_docs) == 1
    assert bob_docs[0]["is_owner"] is False


def test_non_owner_cannot_share_document(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")
    login(client, "carol")

    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(alice_token)).json()
    client.post(f"/documents/{doc['id']}/share", json={"username": "bob"}, headers=auth_headers(alice_token))

    resp = client.post(
        f"/documents/{doc['id']}/share", json={"username": "carol"}, headers=auth_headers(bob_token)
    )
    assert resp.status_code == 403


def test_sharing_with_unknown_user_returns_404(client):
    token = login(client, "alice")
    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(token)).json()

    resp = client.post(
        f"/documents/{doc['id']}/share", json={"username": "ghost"}, headers=auth_headers(token)
    )
    assert resp.status_code == 404


def test_revoke_share_removes_access(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")

    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(alice_token)).json()
    client.post(f"/documents/{doc['id']}/share", json={"username": "bob"}, headers=auth_headers(alice_token))

    revoke_resp = client.delete(f"/documents/{doc['id']}/share/bob", headers=auth_headers(alice_token))
    assert revoke_resp.status_code == 200
    assert "bob" not in revoke_resp.json()["shared_with"]

    bob_docs = client.get("/documents", headers=auth_headers(bob_token)).json()
    assert bob_docs == []


def test_import_markdown_file_creates_formatted_document(client):
    token = login(client, "alice")
    md_content = b"# Title\n\nSome text.\n\n- one\n- two\n"
    files = {"file": ("notes.md", io.BytesIO(md_content), "text/markdown")}

    resp = client.post("/documents/import", files=files, headers=auth_headers(token))
    assert resp.status_code == 201
    doc = resp.json()
    assert doc["title"] == "notes"
    assert "<h1>Title</h1>" in doc["content"]
    assert "<li>one</li>" in doc["content"]


def test_import_rejects_unsupported_file_type(client):
    token = login(client, "alice")
    files = {"file": ("image.png", io.BytesIO(b"not really a png"), "image/png")}

    resp = client.post("/documents/import", files=files, headers=auth_headers(token))
    assert resp.status_code == 415
