from datetime import datetime, timezone

from app.models.request_log import RequestLog


def _seed_logs(db, count=5):
    for i in range(count):
        db.add(RequestLog(
            method="GET",
            path=f"/companies/{i}",
            status_code=200 if i % 2 == 0 else 500,
            response_time_ms=10.0 + i,
            user_id=1 if i < 3 else None,
            ip="127.0.0.1",
            user_agent="TestAgent",
            created_at=datetime.now(timezone.utc),
        ))
    db.commit()


# --- /admin/logs tests ---

def test_get_logs_requires_auth(client):
    resp = client.get("/admin/logs")
    assert resp.status_code == 401


def test_get_logs_requires_admin(client, auth_headers):
    resp = client.get("/admin/logs", headers=auth_headers)
    assert resp.status_code == 403


def test_get_logs_empty(client, admin_headers):
    resp = client.get("/admin/logs", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_logs_returns_logs(client, admin_headers, db):
    _seed_logs(db, 3)
    resp = client.get("/admin/logs", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    # Most recent first
    assert data[0]["id"] > data[-1]["id"]


def test_get_logs_pagination(client, admin_headers, db):
    _seed_logs(db, 10)
    resp = client.get("/admin/logs?skip=0&limit=3", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 3

    resp2 = client.get("/admin/logs?skip=3&limit=3", headers=admin_headers)
    assert resp2.status_code == 200
    assert len(resp2.json()) == 3
    # No overlap
    ids1 = {r["id"] for r in resp.json()}
    ids2 = {r["id"] for r in resp2.json()}
    assert ids1.isdisjoint(ids2)


def test_get_logs_filter_method(client, admin_headers, db):
    db.add(RequestLog(method="POST", path="/auth/login", status_code=200, response_time_ms=5.0, created_at=datetime.now(timezone.utc)))
    _seed_logs(db, 3)
    db.commit()
    resp = client.get("/admin/logs?method=POST", headers=admin_headers)
    assert resp.status_code == 200
    assert all(r["method"] == "POST" for r in resp.json())


def test_get_logs_filter_path(client, admin_headers, db):
    _seed_logs(db, 5)
    resp = client.get("/admin/logs?path=companies/2", headers=admin_headers)
    assert resp.status_code == 200
    assert all("companies/2" in r["path"] for r in resp.json())


def test_get_logs_filter_status_code(client, admin_headers, db):
    _seed_logs(db, 5)
    resp = client.get("/admin/logs?status_code=500", headers=admin_headers)
    assert resp.status_code == 200
    assert all(r["status_code"] == 500 for r in resp.json())


def test_get_logs_filter_user_id(client, admin_headers, db):
    _seed_logs(db, 5)
    resp = client.get("/admin/logs?user_id=1", headers=admin_headers)
    assert resp.status_code == 200
    assert all(r["user_id"] == 1 for r in resp.json())


# --- /admin/logs/stats tests ---

def test_get_log_stats_requires_auth(client):
    resp = client.get("/admin/logs/stats")
    assert resp.status_code == 401


def test_get_log_stats_requires_admin(client, auth_headers):
    resp = client.get("/admin/logs/stats", headers=auth_headers)
    assert resp.status_code == 403


def test_get_log_stats_empty(client, admin_headers):
    resp = client.get("/admin/logs/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_requests"] == 0
    assert data["error_rate"] == 0
    assert data["avg_response_time_ms"] == 0
    assert data["top_endpoints"] == []
    assert data["hourly_breakdown"] == []


def test_get_log_stats_with_data(client, admin_headers, db):
    _seed_logs(db, 10)
    resp = client.get("/admin/logs/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_requests"] == 10
    assert data["error_rate"] > 0  # some 500s in seed
    assert data["avg_response_time_ms"] > 0
    assert len(data["top_endpoints"]) > 0
    assert len(data["hourly_breakdown"]) > 0
