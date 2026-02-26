from datetime import date

import pytest

from app.models.company import Company
from app.models.financial import FinancialReport


@pytest.fixture
def company_with_financials(db):
    company = Company(
        nev="Pénzügyi Kft.",
        adoszam="99999999-1-41",
        teaor_kod="6201",
        teaor_megnevezes="Számítógépes programozás",
        statusz="aktív",
        alapitas_datuma=date(2015, 3, 1),
    )
    db.add(company)
    db.flush()

    reports = [
        FinancialReport(
            company_id=company.id,
            ev=2021,
            netto_arbevetel=100_000,
            uzemi_eredmeny=15_000,
            adozott_eredmeny=12_000,
            sajat_toke=50_000,
            kotelezettsegek=30_000,
            eszkozok_osszesen=80_000,
            forgoeszkozok=40_000,
            rovid_lejaratu_kotelezettsegek=20_000,
            eladosodottsag_foka=0.375,
            arbevetel_aranyos_eredmeny=0.12,
            likviditasi_gyorsrata=2.0,
            roe=0.24,
            ebitda=18_000,
        ),
        FinancialReport(
            company_id=company.id,
            ev=2022,
            netto_arbevetel=120_000,
            uzemi_eredmeny=18_000,
            adozott_eredmeny=14_000,
            sajat_toke=60_000,
            kotelezettsegek=35_000,
            eszkozok_osszesen=95_000,
            forgoeszkozok=50_000,
            rovid_lejaratu_kotelezettsegek=25_000,
            eladosodottsag_foka=0.368,
            arbevetel_aranyos_eredmeny=0.117,
            likviditasi_gyorsrata=2.0,
            roe=0.233,
            ebitda=21_000,
        ),
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=150_000,
            uzemi_eredmeny=22_000,
            adozott_eredmeny=17_000,
            sajat_toke=75_000,
            kotelezettsegek=40_000,
            eszkozok_osszesen=115_000,
            forgoeszkozok=60_000,
            rovid_lejaratu_kotelezettsegek=28_000,
            eladosodottsag_foka=0.348,
            arbevetel_aranyos_eredmeny=0.113,
            likviditasi_gyorsrata=2.14,
            roe=0.227,
            ebitda=26_000,
        ),
    ]
    db.add_all(reports)
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def second_company_with_financials(db):
    company = Company(
        nev="Másik Zrt.",
        adoszam="88888888-2-42",
        teaor_kod="6201",
        teaor_megnevezes="Számítógépes programozás",
        statusz="aktív",
    )
    db.add(company)
    db.flush()

    db.add(
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=200_000,
            uzemi_eredmeny=30_000,
            adozott_eredmeny=24_000,
            sajat_toke=100_000,
            kotelezettsegek=50_000,
            eszkozok_osszesen=150_000,
            forgoeszkozok=80_000,
            rovid_lejaratu_kotelezettsegek=30_000,
            eladosodottsag_foka=0.333,
            arbevetel_aranyos_eredmeny=0.12,
            likviditasi_gyorsrata=2.67,
            roe=0.24,
            ebitda=35_000,
        )
    )
    db.commit()
    db.refresh(company)
    return company


# ── GET /financial-analysis/{company_id} ─────────────────────────────────────


def test_financial_analysis_requires_auth(client, sample_company):
    resp = client.get(f"/financial-analysis/{sample_company.id}")
    assert resp.status_code == 401


def test_financial_analysis_not_found(client, auth_headers):
    resp = client.get("/financial-analysis/9999", headers=auth_headers)
    assert resp.status_code == 404


def test_financial_analysis_empty_reports(client, auth_headers, sample_company):
    resp = client.get(f"/financial-analysis/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["company_id"] == sample_company.id
    assert data["company_name"] == "Teszt Kft."
    assert data["yearly_metrics"] == []
    assert data["avg_profit_margin"] is None
    assert data["revenue_cagr"] is None


def test_financial_analysis_with_reports(client, auth_headers, company_with_financials):
    resp = client.get(
        f"/financial-analysis/{company_with_financials.id}", headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["company_id"] == company_with_financials.id
    assert data["company_name"] == "Pénzügyi Kft."
    assert data["teaor_kod"] == "6201"

    # 3 years of data
    metrics = data["yearly_metrics"]
    assert len(metrics) == 3
    assert metrics[0]["ev"] == 2021
    assert metrics[1]["ev"] == 2022
    assert metrics[2]["ev"] == 2023

    # First year has no growth rate (no previous data)
    assert metrics[0]["novekedesi_rata"] is None
    # Second year: (120000-100000)/100000 * 100 = 20.0%
    assert metrics[1]["novekedesi_rata"] == 20.0
    # Third year: (150000-120000)/120000 * 100 = 25.0%
    assert metrics[2]["novekedesi_rata"] == 25.0

    # Averages should be populated
    assert data["avg_profit_margin"] is not None
    assert data["avg_roe"] is not None
    assert data["avg_debt_ratio"] is not None
    assert data["avg_liquidity"] is not None

    # CAGR: (150000/100000)^(1/2) - 1 ≈ 22.47%
    assert data["revenue_cagr"] is not None
    assert 22.0 < data["revenue_cagr"] < 23.0


# ── GET /financial-analysis/compare ──────────────────────────────────────────


def test_compare_requires_auth(client):
    resp = client.get("/financial-analysis/compare", params={"ids": "1,2"})
    assert resp.status_code == 401


def test_compare_too_few(client, auth_headers, company_with_financials):
    resp = client.get(
        "/financial-analysis/compare",
        params={"ids": str(company_with_financials.id)},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "Legalább 2" in resp.json()["detail"]


def test_compare_too_many(client, auth_headers, db):
    companies = []
    for i in range(6):
        c = Company(nev=f"Cég {i}", adoszam=f"1000000{i}-1-41", statusz="aktív")
        db.add(c)
        companies.append(c)
    db.commit()

    ids_str = ",".join(str(c.id) for c in companies)
    resp = client.get(
        "/financial-analysis/compare", params={"ids": ids_str}, headers=auth_headers
    )
    assert resp.status_code == 400
    assert "Maximum 5" in resp.json()["detail"]


def test_compare_invalid_ids(client, auth_headers):
    resp = client.get(
        "/financial-analysis/compare", params={"ids": "abc,def"}, headers=auth_headers
    )
    assert resp.status_code == 400


def test_compare_company_not_found(client, auth_headers, company_with_financials):
    resp = client.get(
        "/financial-analysis/compare",
        params={"ids": f"{company_with_financials.id},9999"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_compare_success(
    client, auth_headers, company_with_financials, second_company_with_financials
):
    ids = f"{company_with_financials.id},{second_company_with_financials.id}"
    resp = client.get(
        "/financial-analysis/compare", params={"ids": ids}, headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["companies"]) == 2
    names = {c["company_name"] for c in data["companies"]}
    assert "Pénzügyi Kft." in names
    assert "Másik Zrt." in names

    for company_data in data["companies"]:
        assert "yearly_metrics" in company_data
        assert "avg_profit_margin" in company_data
        assert "avg_roe" in company_data


# ── GET /financial-analysis/benchmark ────────────────────────────────────────


def test_benchmark_requires_auth(client):
    resp = client.get("/financial-analysis/benchmark", params={"company_id": 1})
    assert resp.status_code == 401


def test_benchmark_not_found(client, auth_headers):
    resp = client.get(
        "/financial-analysis/benchmark",
        params={"company_id": 9999},
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_benchmark_no_teaor(client, auth_headers, db):
    company = Company(nev="No TEÁOR Kft.", adoszam="77777777-1-41", statusz="aktív")
    db.add(company)
    db.commit()
    db.refresh(company)

    resp = client.get(
        "/financial-analysis/benchmark",
        params={"company_id": company.id},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "TEÁOR" in resp.json()["detail"]


def test_benchmark_success(
    client, auth_headers, company_with_financials, second_company_with_financials
):
    # Both share TEÁOR 6201 — second_company is the industry peer
    resp = client.get(
        "/financial-analysis/benchmark",
        params={"company_id": company_with_financials.id},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["company_id"] == company_with_financials.id
    assert data["teaor_kod"] == "6201"
    assert data["industry_company_count"] == 1  # one peer (second_company)

    # Should have 6 metrics
    assert len(data["metrics"]) == 6
    metric_names = {m["metric"] for m in data["metrics"]}
    assert metric_names == {"profit_margin", "roe", "debt_ratio", "liquidity", "revenue", "ebitda"}

    # Each metric should have company_value and industry_avg
    for m in data["metrics"]:
        assert m["company_value"] is not None
        assert m["industry_avg"] is not None
        assert m["position"] in ("above", "below", "equal")


def test_benchmark_no_peers(client, auth_headers, db):
    company = Company(
        nev="Egyedi Kft.",
        adoszam="66666666-1-41",
        teaor_kod="9999",
        statusz="aktív",
    )
    db.add(company)
    db.flush()
    db.add(
        FinancialReport(
            company_id=company.id,
            ev=2023,
            netto_arbevetel=50_000,
            arbevetel_aranyos_eredmeny=0.1,
            roe=0.15,
            eladosodottsag_foka=0.3,
            likviditasi_gyorsrata=1.5,
            ebitda=8_000,
        )
    )
    db.commit()
    db.refresh(company)

    resp = client.get(
        "/financial-analysis/benchmark",
        params={"company_id": company.id},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["industry_company_count"] == 0
