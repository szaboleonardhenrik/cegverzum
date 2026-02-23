from unittest.mock import patch


def test_list_integration_statuses(client, auth_headers):
    resp = client.get("/integrations/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    slugs = [item["slug"] for item in data]
    assert "nav" in slugs
    assert "cegbirosag" in slugs
    assert "ksh" in slugs


def test_nav_status(client, auth_headers):
    resp = client.get("/integrations/nav/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "nav"
    assert "configured" in data


@patch("app.routers.integrations._nav_configured", return_value=False)
def test_nav_query_unconfigured(mock_configured, client, auth_headers):
    """NAV query should return 503 when API credentials are not set."""
    resp = client.post("/integrations/nav/query/12345678", headers=auth_headers)
    assert resp.status_code == 503


@patch("app.routers.integrations._nav_configured", return_value=True)
@patch("app.routers.integrations.query_taxpayer")
def test_nav_query_success(mock_query, mock_configured, client, auth_headers):
    mock_query.return_value = {
        "success": True,
        "funcCode": "OK",
        "errorCode": None,
        "message": None,
        "taxpayerName": "Teszt Kft.",
        "taxpayerShortName": "Teszt",
        "taxNumberDetail": {"taxpayerId": "12345678", "vatCode": "2", "countyCode": "41"},
        "taxpayerAddress": {"postalCode": "1052", "city": "Budapest", "streetName": "Deák Ferenc", "publicPlaceCategory": "tér", "number": "1"},
        "taxpayerAddressFormatted": "1052, Budapest, Deák Ferenc tér 1",
        "incorporation": "ORGANIZATION",
        "vatGroupMembership": None,
        "taxpayerValidity": {"taxpayerValidityStartDate": "2010-01-01", "taxpayerValidityEndDate": None, "lastUpdateTimestamp": None},
    }

    resp = client.post("/integrations/nav/query/12345678", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["taxpayerName"] == "Teszt Kft."
    assert data["taxNumberDetail"]["vatCode"] == "2"


@patch("app.routers.integrations._nav_configured", return_value=True)
@patch("app.routers.integrations.query_taxpayer")
def test_nav_query_not_found(mock_query, mock_configured, client, auth_headers):
    mock_query.return_value = {
        "success": False,
        "funcCode": "ERROR",
        "errorCode": "INVALID_TAXPAYER_ID",
        "message": "A megadott adószám nem található",
    }

    resp = client.post("/integrations/nav/query/99999999", headers=auth_headers)
    assert resp.status_code == 422


@patch("app.routers.integrations._nav_configured", return_value=True)
@patch("app.routers.integrations.query_taxpayer")
def test_nav_query_sync_updates_company(mock_query, mock_configured, client, auth_headers, sample_company):
    mock_query.return_value = {
        "success": True,
        "funcCode": "OK",
        "errorCode": None,
        "message": None,
        "taxpayerName": "Teszt Kft. (NAV frissítés)",
        "taxpayerShortName": "Teszt",
        "taxNumberDetail": {"taxpayerId": "12345678", "vatCode": "2", "countyCode": "41"},
        "taxpayerAddress": None,
        "taxpayerAddressFormatted": "1052, Budapest, Deák Ferenc tér 1",
        "incorporation": None,
        "vatGroupMembership": None,
        "taxpayerValidity": {"taxpayerValidityStartDate": "2010-01-01", "taxpayerValidityEndDate": None, "lastUpdateTimestamp": None},
    }

    resp = client.post("/integrations/nav/query/12345678?sync=true", headers=auth_headers)
    assert resp.status_code == 200

    # Verify the company was updated
    company_resp = client.get(f"/companies/{sample_company.id}", headers=auth_headers)
    assert company_resp.status_code == 200
    assert company_resp.json()["nev"] == "Teszt Kft. (NAV frissítés)"


def test_cegbirosag_query_not_implemented(client, auth_headers):
    resp = client.post("/integrations/cegbirosag/query/01-09-123456", headers=auth_headers)
    assert resp.status_code == 501


def test_ksh_query_not_implemented(client, auth_headers):
    resp = client.post("/integrations/ksh/query/12345678", headers=auth_headers)
    assert resp.status_code == 501


def test_integrations_require_auth(client):
    resp = client.get("/integrations/status")
    assert resp.status_code == 401

    resp = client.get("/integrations/nav/status")
    assert resp.status_code == 401

    resp = client.post("/integrations/nav/query/12345678")
    assert resp.status_code == 401
