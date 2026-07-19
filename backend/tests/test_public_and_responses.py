def _make_published_form(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Feedback"}, headers=auth_headers).json()["id"]
    client.post(
        f"/api/forms/{form_id}/questions",
        json={"type": "short_text", "title": "Name?", "required": True},
        headers=auth_headers,
    )
    client.post(
        f"/api/forms/{form_id}/questions",
        json={"type": "email", "title": "Email?", "required": True},
        headers=auth_headers,
    )
    client.post(f"/api/forms/{form_id}/publish", headers=auth_headers)
    return client.get(f"/api/forms/{form_id}", headers=auth_headers).json()


def test_draft_form_not_publicly_accessible(client, auth_headers):
    form_id = client.post("/api/forms", json={"title": "Draft"}, headers=auth_headers).json()["id"]
    res = client.get(f"/api/public/forms/{form_id}")
    assert res.status_code == 404


def test_published_form_publicly_accessible(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    # Public form-filling requires no auth at all.
    res = client.get(f"/api/public/forms/{form['id']}")
    assert res.status_code == 200
    assert len(res.json()["questions"]) == 2


def test_submit_response_success(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    q1_id, q2_id = [q["id"] for q in form["questions"]]

    res = client.post(
        f"/api/public/forms/{form['id']}/responses",
        json={
            "completed": True,
            "answers": [
                {"question_id": q1_id, "value_text": "Alice"},
                {"question_id": q2_id, "value_text": "alice@example.com"},
            ],
        },
    )
    assert res.status_code == 201
    assert len(res.json()["answers"]) == 2


def test_submit_response_missing_required_field(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    q1_id = form["questions"][0]["id"]

    res = client.post(
        f"/api/public/forms/{form['id']}/responses",
        json={"completed": True, "answers": [{"question_id": q1_id, "value_text": "Alice"}]},
    )
    assert res.status_code == 422
    assert "errors" in res.json()["detail"]


def test_submit_response_invalid_email(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    q1_id, q2_id = [q["id"] for q in form["questions"]]

    res = client.post(
        f"/api/public/forms/{form['id']}/responses",
        json={
            "completed": True,
            "answers": [
                {"question_id": q1_id, "value_text": "Alice"},
                {"question_id": q2_id, "value_text": "not-an-email"},
            ],
        },
    )
    assert res.status_code == 422


def test_responses_dashboard_lists_submissions(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    q1_id, q2_id = [q["id"] for q in form["questions"]]
    client.post(
        f"/api/public/forms/{form['id']}/responses",
        json={"answers": [{"question_id": q1_id, "value_text": "Bob"}, {"question_id": q2_id, "value_text": "bob@example.com"}]},
    )

    res = client.get(f"/api/forms/{form['id']}/responses", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 1
    assert len(body["items"]) == 1


def test_analytics_computes_stats(client, auth_headers):
    form = _make_published_form(client, auth_headers)
    q1_id, q2_id = [q["id"] for q in form["questions"]]
    client.post(
        f"/api/public/forms/{form['id']}/responses",
        json={"answers": [{"question_id": q1_id, "value_text": "Bob"}, {"question_id": q2_id, "value_text": "bob@example.com"}]},
    )

    res = client.get(f"/api/forms/{form['id']}/analytics", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_responses"] == 1
    assert data["completed_responses"] == 1
    assert len(data["question_stats"]) == 2
