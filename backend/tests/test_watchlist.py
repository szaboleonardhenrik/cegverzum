import pytest

from app.auth import create_access_token, hash_password
from app.models.company import Company
from app.models.user import User
from app.models.watchlist import WatchlistItem


@pytest.fixture
def second_company(db):
    company = Company(
        nev="Második Kft.",
        adoszam="87654321-2-42",
        cegjegyzekszam="01-09-654321",
        szekhely="1011 Budapest, Fő utca 1.",
        teaor_kod="4711",
        statusz="aktív",
        cegforma="Kft.",
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def other_user(db):
    user = User(
        email="other@example.com",
        hashed_password=hash_password("otherpass123"),
        is_admin=False,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def other_headers(other_user):
    token = create_access_token(other_user)
    return {"Authorization": f"Bearer {token}"}


# ── Add ──────────────────────────────────────────────────────────

def test_add_to_watchlist(client, auth_headers, sample_company):
    resp = client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["company_id"] == sample_company.id
    assert data["note"] is None


def test_add_with_note(client, auth_headers, sample_company):
    resp = client.post(
        "/watchlist",
        json={"company_id": sample_company.id, "note": "Fontos partner"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["note"] == "Fontos partner"


def test_add_nonexistent_company(client, auth_headers):
    resp = client.post("/watchlist", json={"company_id": 99999}, headers=auth_headers)
    assert resp.status_code == 404


def test_add_duplicate(client, auth_headers, sample_company):
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    resp = client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    assert resp.status_code == 400
    assert "már a figyelőlistán" in resp.json()["detail"]


# ── List ─────────────────────────────────────────────────────────

def test_list_empty(client, auth_headers):
    resp = client.get("/watchlist", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_with_items(client, auth_headers, sample_company, second_company):
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    client.post("/watchlist", json={"company_id": second_company.id}, headers=auth_headers)
    resp = client.get("/watchlist", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert "company" in data[0]
    assert data[0]["company"]["nev"] in ("Teszt Kft.", "Második Kft.")


# ── Count ────────────────────────────────────────────────────────

def test_count(client, auth_headers, sample_company):
    resp = client.get("/watchlist/count", headers=auth_headers)
    assert resp.json()["count"] == 0
    assert resp.json()["limit"] == 3  # free package default

    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)

    resp = client.get("/watchlist/count", headers=auth_headers)
    assert resp.json()["count"] == 1


# ── IDs ──────────────────────────────────────────────────────────

def test_ids(client, auth_headers, sample_company, second_company):
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    client.post("/watchlist", json={"company_id": second_company.id}, headers=auth_headers)

    resp = client.get("/watchlist/ids", headers=auth_headers)
    assert resp.status_code == 200
    assert set(resp.json()["ids"]) == {sample_company.id, second_company.id}


# ── Check ────────────────────────────────────────────────────────

def test_check_watched(client, auth_headers, sample_company):
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)

    resp = client.get(f"/watchlist/check/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["is_watched"] is True
    assert resp.json()["watchlist_item_id"] is not None


def test_check_not_watched(client, auth_headers, sample_company):
    resp = client.get(f"/watchlist/check/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["is_watched"] is False
    assert resp.json()["watchlist_item_id"] is None


# ── Update ───────────────────────────────────────────────────────

def test_update_note(client, auth_headers, sample_company):
    add_resp = client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)
    item_id = add_resp.json()["id"]

    resp = client.patch(f"/watchlist/{item_id}", json={"note": "Új jegyzet"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["note"] == "Új jegyzet"


def test_update_nonexistent(client, auth_headers):
    resp = client.patch("/watchlist/99999", json={"note": "test"}, headers=auth_headers)
    assert resp.status_code == 404


# ── Delete ───────────────────────────────────────────────────────

def test_remove_from_watchlist(client, auth_headers, sample_company):
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)

    resp = client.delete(f"/watchlist/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = client.get("/watchlist/ids", headers=auth_headers)
    assert sample_company.id not in resp.json()["ids"]


def test_remove_not_on_list(client, auth_headers, sample_company):
    resp = client.delete(f"/watchlist/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 404


# ── Limit ────────────────────────────────────────────────────────

def test_free_limit(client, auth_headers, db, test_user):
    # Free package limit is 3
    companies = []
    for i in range(4):
        c = Company(nev=f"Cég {i}", adoszam=f"1000000{i}", statusz="aktív")
        db.add(c)
        db.commit()
        db.refresh(c)
        companies.append(c)

    for c in companies[:3]:
        resp = client.post("/watchlist", json={"company_id": c.id}, headers=auth_headers)
        assert resp.status_code == 201

    resp = client.post("/watchlist", json={"company_id": companies[3].id}, headers=auth_headers)
    assert resp.status_code == 400
    assert "limitjét" in resp.json()["detail"]


# ── User isolation ───────────────────────────────────────────────

def test_user_isolation(client, auth_headers, other_headers, sample_company):
    # User A adds company
    client.post("/watchlist", json={"company_id": sample_company.id}, headers=auth_headers)

    # User B should not see it
    resp = client.get("/watchlist", headers=other_headers)
    assert resp.json() == []

    resp = client.get("/watchlist/ids", headers=other_headers)
    assert resp.json()["ids"] == []

    resp = client.get(f"/watchlist/check/{sample_company.id}", headers=other_headers)
    assert resp.json()["is_watched"] is False


# ── Unauthorized ─────────────────────────────────────────────────

def test_unauthorized(client):
    resp = client.get("/watchlist")
    assert resp.status_code == 401
