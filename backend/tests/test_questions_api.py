def _make_form(client, auth_headers, title="Test Form"):
    return client.post("/api/forms", json={"title": title}, headers=auth_headers).json()["id"]


def test_create_question(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    res = client.post(
        f"/api/forms/{form_id}/questions",
        json={"type": "short_text", "title": "Name?", "required": True},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Name?"
    assert data["required"] is True
    assert data["order"] == 0


def test_create_question_with_choices(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    res = client.post(
        f"/api/forms/{form_id}/questions",
        json={
            "type": "multiple_choice",
            "title": "Pick one",
            "choices": [{"label": "A", "order": 0}, {"label": "B", "order": 1}],
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    assert len(res.json()["choices"]) == 2


def test_question_order_increments(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    q1 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers).json()
    q2 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q2"}, headers=auth_headers).json()
    assert q1["order"] == 0
    assert q2["order"] == 1


def test_update_question(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    q = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Old"}, headers=auth_headers).json()
    res = client.patch(f"/api/forms/{form_id}/questions/{q['id']}", json={"title": "New"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "New"


def test_delete_question_resequences_order(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    q1 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers).json()
    q2 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q2"}, headers=auth_headers).json()
    q3 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q3"}, headers=auth_headers).json()

    client.delete(f"/api/forms/{form_id}/questions/{q1['id']}", headers=auth_headers)

    form = client.get(f"/api/forms/{form_id}", headers=auth_headers).json()
    orders = [q["order"] for q in form["questions"]]
    assert orders == [0, 1]
    ids = [q["id"] for q in form["questions"]]
    assert ids == [q2["id"], q3["id"]]


def test_duplicate_question(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    q = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Original"}, headers=auth_headers).json()
    res = client.post(f"/api/forms/{form_id}/questions/{q['id']}/duplicate", headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["title"] == "Original (copy)"
    assert res.json()["id"] != q["id"]


def test_reorder_questions(client, auth_headers):
    form_id = _make_form(client, auth_headers)
    q1 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q1"}, headers=auth_headers).json()
    q2 = client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Q2"}, headers=auth_headers).json()

    res = client.post(
        f"/api/forms/{form_id}/questions/reorder",
        json=[{"id": q1["id"], "order": 1}, {"id": q2["id"], "order": 0}],
        headers=auth_headers,
    )
    assert res.status_code == 204

    form = client.get(f"/api/forms/{form_id}", headers=auth_headers).json()
    assert form["questions"][0]["id"] == q2["id"]
    assert form["questions"][1]["id"] == q1["id"]
