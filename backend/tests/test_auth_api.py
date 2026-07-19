def test_register_creates_user_and_returns_token(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "ada@example.com"
    assert body["access_token"]
    # refresh token must never appear in the JSON body
    assert "refresh_token" not in body
    assert res.cookies.get("refresh_token") is not None


def test_register_duplicate_email_rejected(client):
    payload = {"name": "Ada", "email": "ada@example.com", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 409


def test_register_weak_password_rejected(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "allletters"},
    )
    assert res.status_code == 422


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    res = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    res = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "wrongpass1"})
    assert res.status_code == 401


def test_me_requires_valid_token(client):
    assert client.get("/api/auth/me").status_code == 401

    token = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    ).json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "ada@example.com"


def test_refresh_issues_new_access_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    # TestClient persists Set-Cookie automatically for subsequent requests.
    res = client.post("/api/auth/refresh")
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_refresh_without_cookie_rejected(client):
    res = client.post("/api/auth/refresh")
    assert res.status_code == 401


def test_forgot_password_returns_generic_message_for_unknown_email(client):
    res = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    assert res.status_code == 200
    assert res.json()["debug_reset_token"] is None


def test_register_grants_starter_forms(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {res.json()['access_token']}"}

    forms = client.get("/api/forms", headers=headers).json()
    assert len(forms) == 3
    statuses = sorted(f["status"] for f in forms)
    assert statuses == ["draft", "published", "published"]


def test_forgot_and_reset_password_flow(client):
    client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    forgot_res = client.post("/api/auth/forgot-password", json={"email": "ada@example.com"})
    reset_token = forgot_res.json()["debug_reset_token"]
    assert reset_token

    reset_res = client.post(
        "/api/auth/reset-password", json={"token": reset_token, "new_password": "newpassword1"}
    )
    assert reset_res.status_code == 204

    old_login = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "password123"})
    assert old_login.status_code == 401

    new_login = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "newpassword1"})
    assert new_login.status_code == 200
