def test_invite_partner(client, admin_headers):
    resp = client.post("/admin/partners", json={"email": "partner@example.com"}, headers=admin_headers)
    assert resp.status_code == 201
    assert resp.json()["email"] == "partner@example.com"
    assert resp.json()["has_registered"] is False


def test_invite_duplicate(client, admin_headers, test_user):
    resp = client.post("/admin/partners", json={"email": "test@example.com"}, headers=admin_headers)
    assert resp.status_code == 400


def test_list_partners(client, admin_headers, test_user):
    resp = client.get("/admin/partners", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["email"] == "test@example.com"


def test_deactivate_partner(client, admin_headers, test_user):
    resp = client.patch(f"/admin/partners/{test_user.id}/deactivate", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


def test_activate_partner(client, admin_headers, db, test_user):
    test_user.is_active = False
    db.commit()

    resp = client.patch(f"/admin/partners/{test_user.id}/activate", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is True


def test_non_admin_cannot_access(client, auth_headers):
    resp = client.get("/admin/partners", headers=auth_headers)
    assert resp.status_code == 403


def test_unauthenticated_cannot_access(client):
    resp = client.get("/admin/partners")
    assert resp.status_code == 401
