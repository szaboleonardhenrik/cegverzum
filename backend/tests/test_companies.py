def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["version"] == "0.2.0"


def test_list_requires_auth(client):
    resp = client.get("/companies/")
    assert resp.status_code == 401


def test_list_companies(client, auth_headers, sample_company):
    resp = client.get("/companies/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["nev"] == "Teszt Kft."


def test_search_companies(client, auth_headers, db):
    from app.models.company import Company

    db.add(Company(nev="Alpha Kft.", adoszam="11111111-1-11"))
    db.add(Company(nev="Beta Zrt.", adoszam="22222222-2-22"))
    db.commit()

    resp = client.get("/companies/", params={"q": "Alpha"}, headers=auth_headers)
    assert len(resp.json()) == 1
    assert resp.json()[0]["nev"] == "Alpha Kft."


def test_count_companies(client, auth_headers, sample_company):
    resp = client.get("/companies/count", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["count"] == 1


def test_get_company(client, auth_headers, sample_company):
    resp = client.get(f"/companies/{sample_company.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["nev"] == "Teszt Kft."
    assert resp.json()["adoszam"] == "12345678-1-41"


def test_get_company_not_found(client, auth_headers):
    resp = client.get("/companies/9999", headers=auth_headers)
    assert resp.status_code == 404
