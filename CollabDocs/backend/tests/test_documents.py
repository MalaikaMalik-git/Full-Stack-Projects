from .conftest import login, auth_headers


def test_create_and_fetch_document(client):
    token = login(client, "alice")
    create_resp = client.post("/documents", json={"title": "My Doc"}, headers=auth_headers(token))
    assert create_resp.status_code == 201
    doc = create_resp.json()
    assert doc["title"] == "My Doc"
    assert doc["is_owner"] is True
    assert doc["content"] == ""

    get_resp = client.get(f"/documents/{doc['id']}", headers=auth_headers(token))
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == doc["id"]


def test_update_document_content_persists(client):
    token = login(client, "alice")
    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(token)).json()

    update_resp = client.put(
        f"/documents/{doc['id']}",
        json={"content": "<p>Hello world</p>"},
        headers=auth_headers(token),
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["content"] == "<p>Hello world</p>"

    # Refetching (simulating a page refresh) should show the same content.
    refetch = client.get(f"/documents/{doc['id']}", headers=auth_headers(token))
    assert refetch.json()["content"] == "<p>Hello world</p>"


def test_update_with_empty_title_is_rejected(client):
    token = login(client, "alice")
    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(token)).json()

    resp = client.put(f"/documents/{doc['id']}", json={"title": "   "}, headers=auth_headers(token))
    assert resp.status_code == 422


def test_document_list_is_scoped_to_owner(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")

    client.post("/documents", json={"title": "Alice's doc"}, headers=auth_headers(alice_token))

    bob_docs = client.get("/documents", headers=auth_headers(bob_token)).json()
    assert bob_docs == []

    alice_docs = client.get("/documents", headers=auth_headers(alice_token)).json()
    assert len(alice_docs) == 1


def test_non_owner_cannot_access_document(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")

    doc = client.post("/documents", json={"title": "Private"}, headers=auth_headers(alice_token)).json()

    resp = client.get(f"/documents/{doc['id']}", headers=auth_headers(bob_token))
    assert resp.status_code == 403


def test_fetching_nonexistent_document_returns_404(client):
    token = login(client, "alice")
    resp = client.get("/documents/does-not-exist", headers=auth_headers(token))
    assert resp.status_code == 404


def test_only_owner_can_delete_document(client):
    alice_token = login(client, "alice")
    bob_token = login(client, "bob")

    doc = client.post("/documents", json={"title": "Doc"}, headers=auth_headers(alice_token)).json()

    resp = client.delete(f"/documents/{doc['id']}", headers=auth_headers(bob_token))
    assert resp.status_code == 403

    resp2 = client.delete(f"/documents/{doc['id']}", headers=auth_headers(alice_token))
    assert resp2.status_code == 204
