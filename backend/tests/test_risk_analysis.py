from datetime import date, timedelta

import pytest

from app.models.company import Company
from app.models.financial import FinancialReport
from app.models.watchlist import WatchlistItem


@pytest.fixture
def healthy_company(db):
    """Company with no risk factors — should score 100."""
    company = Company(
        nev="Egészséges Kft.",
        adoszam="55555555-1-41",
        teaor_kod="6201",
        statusz="aktív",
        alapitas_datuma=date(2010, 1, 1),
    )
    db.add(company)
    db.flush()

    db.add(
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=200_000,
            adozott_eredmeny=30_000,
            sajat_toke=100_000,
            eladosodottsag_foka=0.3,
            likviditasi_gyorsrata=2.5,
        )
    )
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def risky_company(db):
    """Company with multiple risk factors — low score expected."""
    company = Company(
        nev="Kockázatos Zrt.",
        adoszam="44444444-2-42",
        statusz="aktív",
        felszamolas=True,
        nav_torlesve=True,
        nav_kockazat="magas kockázat",
        alapitas_datuma=date(2010, 6, 1),
    )
    db.add(company)
    db.flush()

    db.add(
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=50_000,
            adozott_eredmeny=-5_000,
            sajat_toke=-10_000,
            eladosodottsag_foka=0.9,
            likviditasi_gyorsrata=0.3,
        )
    )
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def defunct_company(db):
    """Defunct company with megszűnt status."""
    company = Company(
        nev="Megszűnt Bt.",
        adoszam="33333333-1-41",
        statusz="megszűnt",
        alapitas_datuma=date(2005, 1, 1),
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def young_company(db):
    """Company founded less than 2 years ago."""
    company = Company(
        nev="Új Startup Kft.",
        adoszam="22222222-1-41",
        statusz="aktív",
        alapitas_datuma=date.today() - timedelta(days=365),
    )
    db.add(company)
    db.flush()

    db.add(
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=20_000,
            adozott_eredmeny=2_000,
            sajat_toke=15_000,
            eladosodottsag_foka=0.4,
            likviditasi_gyorsrata=1.8,
        )
    )
    db.commit()
    db.refresh(company)
    return company


# ── GET /risk/{company_id} ───────────────────────────────────────────────────


def test_risk_requires_auth(client, sample_company):
    resp = client.get(f"/risk/{sample_company.id}")
    assert resp.status_code == 401


def test_risk_not_found(client, auth_headers):
    resp = client.get("/risk/9999", headers=auth_headers)
    assert resp.status_code == 404


def test_risk_healthy_company(client, auth_headers, healthy_company):
    resp = client.get(f"/risk/{healthy_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["company_id"] == healthy_company.id
    assert data["company_name"] == "Egészséges Kft."
    assert data["risk_score"] == 100
    assert data["risk_level"] == "alacsony"
    assert data["risk_color"] == "green"
    assert data["partner_rating"] == "ajánlott"
    assert data["factors"] == []
    assert data["negative_events"] == []


def test_risk_risky_company(client, auth_headers, risky_company):
    resp = client.get(f"/risk/{risky_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # Expected deductions:
    # felszámolás: -25 (negative_event)
    # NAV törlés: -20
    # NAV magas kockázat: -15
    # eladósodottság > 0.7: -10
    # negatív saját tőke: -15
    # likviditás < 0.5: -10
    # negatív eredmény: -5
    # Total: 100 - 100 = 0
    assert data["risk_score"] == 0
    assert data["risk_level"] == "kritikus"
    assert data["risk_color"] == "red"
    assert data["partner_rating"] == "magas kockázat"
    assert len(data["factors"]) == 7
    assert "Felszámolás alatt" in data["negative_events"]


def test_risk_defunct_company(client, auth_headers, defunct_company):
    resp = client.get(f"/risk/{defunct_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # megszűnt status: -30 → score 70
    assert data["risk_score"] == 70
    assert data["risk_level"] == "közepes"
    assert data["risk_color"] == "yellow"
    assert data["partner_rating"] == "ajánlott"  # score >= 70

    categories = [f["category"] for f in data["factors"]]
    assert "status" in categories


def test_risk_young_company(client, auth_headers, young_company):
    resp = client.get(f"/risk/{young_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # Only deduction: young company -5 → score 95
    assert data["risk_score"] == 95
    assert data["risk_level"] == "alacsony"
    assert data["risk_color"] == "green"

    descriptions = [f["description"] for f in data["factors"]]
    assert any("Fiatal" in d for d in descriptions)


def test_risk_no_financial_reports(client, auth_headers, sample_company):
    resp = client.get(f"/risk/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # sample_company: aktív, no financial risk factors, old enough
    assert data["risk_score"] == 100
    assert data["factors"] == []


def test_risk_response_includes_financial_fields(client, auth_headers, risky_company):
    resp = client.get(f"/risk/{risky_company.id}", headers=auth_headers)
    data = resp.json()

    # Financial fields from latest report should be included
    assert data["eladosodottsag_foka"] == 0.9
    assert data["sajat_toke"] == -10_000
    assert data["likviditasi_gyorsrata"] == 0.3
    assert data["adozott_eredmeny"] == -5_000


# ── GET /risk/watchlist-overview ─────────────────────────────────────────────


def test_watchlist_overview_requires_auth(client):
    resp = client.get("/risk/watchlist-overview")
    assert resp.status_code == 401


def test_watchlist_overview_empty(client, auth_headers, test_user):
    resp = client.get("/risk/watchlist-overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["items"] == []
    assert data["summary"] == {"green": 0, "yellow": 0, "orange": 0, "red": 0}


def test_watchlist_overview_with_items(
    client, auth_headers, test_user, db, healthy_company, risky_company, defunct_company
):
    # Add all three to user's watchlist
    for company in [healthy_company, risky_company, defunct_company]:
        db.add(WatchlistItem(user_id=test_user.id, company_id=company.id))
    db.commit()

    resp = client.get("/risk/watchlist-overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["items"]) == 3

    # Verify we have the right companies
    names = {item["company_name"] for item in data["items"]}
    assert "Egészséges Kft." in names
    assert "Kockázatos Zrt." in names
    assert "Megszűnt Bt." in names

    # Verify scores match individual analysis
    for item in data["items"]:
        if item["company_name"] == "Egészséges Kft.":
            assert item["risk_score"] == 100
            assert item["risk_color"] == "green"
        elif item["company_name"] == "Kockázatos Zrt.":
            assert item["risk_score"] == 0
            assert item["risk_color"] == "red"
        elif item["company_name"] == "Megszűnt Bt.":
            assert item["risk_score"] == 70
            assert item["risk_color"] == "yellow"

    # Summary should count colors correctly
    assert data["summary"]["green"] == 1
    assert data["summary"]["yellow"] == 1
    assert data["summary"]["red"] == 1
    assert data["summary"]["orange"] == 0
