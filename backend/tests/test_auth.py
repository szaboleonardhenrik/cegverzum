def test_login_success(client, test_user):
    resp = client.post("/auth/login", json={"email": "test@example.com", "password": "testpass123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client, test_user):
    resp = client.post("/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = client.post("/auth/login", json={"email": "nobody@example.com", "password": "test"})
    assert resp.status_code == 401


def test_register_invited_user(client, db):
    from app.models.user import User

    db.add(User(email="invited@example.com", is_active=True))
    db.commit()

    resp = client.post("/auth/register", json={"email": "invited@example.com", "password": "newpass123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_register_not_invited(client):
    resp = client.post("/auth/register", json={"email": "random@example.com", "password": "newpass123"})
    assert resp.status_code == 404


def test_register_already_registered(client, test_user):
    resp = client.post("/auth/register", json={"email": "test@example.com", "password": "newpass123"})
    assert resp.status_code == 400


def test_register_short_password(client, db):
    from app.models.user import User

    db.add(User(email="short@example.com", is_active=True))
    db.commit()

    resp = client.post("/auth/register", json={"email": "short@example.com", "password": "abc"})
    assert resp.status_code == 400


def test_me(client, auth_headers):
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"
    assert resp.json()["is_admin"] is False


def test_me_unauthorized(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401
