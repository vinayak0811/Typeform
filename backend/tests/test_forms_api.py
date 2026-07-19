def test_create_form(client, auth_headers):
    res = client.post("/api/forms", json={"title": "My Survey", "description": "desc"}, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "My Survey"
    assert data["status"] == "draft"
    assert data["questions"] == []


def test_create_form_requires_auth(client):
    res = client.post("/api/forms", json={"title": "My Survey"})
    assert res.status_code == 401


def test_list_forms_empty(client, auth_headers):
    res = client.get("/api/forms", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_list_forms_returns_counts(client, auth_headers):
    form_res = client.post("/api/forms", json={"title": "Form A"}, headers=auth_headers)
    form_id = form_res.json()["id"]
    client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers)

    res = client.get("/api/forms", headers=auth_headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    assert items[0]["question_count"] == 1
    assert items[0]["response_count"] == 0


def test_get_form_404(client, auth_headers):
    res = client.get("/api/forms/does-not-exist", headers=auth_headers)
    assert res.status_code == 404


def test_update_form(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Old title"}, headers=auth_headers).json()["id"]
    res = client.patch(f"/api/forms/{form_id}", json={"title": "New title"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "New title"


def test_delete_form(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "To delete"}, headers=auth_headers).json()["id"]
    res = client.delete(f"/api/forms/{form_id}", headers=auth_headers)
    assert res.status_code == 204
    assert client.get(f"/api/forms/{form_id}", headers=auth_headers).status_code == 404


def test_duplicate_form_copies_questions(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Original"}, headers=auth_headers).json()["id"]
    client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers)

    res = client.post(f"/api/forms/{form_id}/duplicate", headers=auth_headers)
    assert res.status_code == 201
    dup = res.json()
    assert dup["id"] != form_id
    assert dup["title"] == "Original (copy)"
    assert len(dup["questions"]) == 1


def test_publish_requires_questions(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Empty form"}, headers=auth_headers).json()["id"]
    res = client.post(f"/api/forms/{form_id}/publish", headers=auth_headers)
    assert res.status_code == 400


def test_publish_and_unpublish(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Form"}, headers=auth_headers).json()["id"]
    client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers)

    published = client.post(f"/api/forms/{form_id}/publish", headers=auth_headers)
    assert published.status_code == 200
    assert published.json()["status"] == "published"

    unpublished = client.post(f"/api/forms/{form_id}/unpublish", headers=auth_headers)
    assert unpublished.json()["status"] == "draft"


def test_forms_are_scoped_to_owner(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Mine"}, headers=auth_headers).json()["id"]

    other_res = client.post(
        "/api/auth/register",
        json={"name": "Other User", "email": "other@example.com", "password": "password123"},
    )
    other_headers = {"Authorization": f"Bearer {other_res.json()['access_token']}"}

    # Registering through the real endpoint grants onboarding starter forms,
    # but none of them should be "Mine" — ownership stays strictly isolated.
    other_forms = client.get("/api/forms", headers=other_headers).json()
    assert all(f["id"] != form_id for f in other_forms)
    assert client.get(f"/api/forms/{form_id}", headers=other_headers).status_code == 404
