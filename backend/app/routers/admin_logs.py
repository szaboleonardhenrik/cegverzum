from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func as sa_func
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models.request_log import RequestLog
from app.models.user import User
from app.schemas.request_log import (
    HourlyBucket,
    LogAggregateStats,
    RequestLogRead,
    TopEndpoint,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/logs", response_model=list[RequestLogRead])
def get_logs(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    method: str | None = Query(None),
    path: str | None = Query(None),
    status_code: int | None = Query(None),
    user_id: int | None = Query(None),
):
    q = db.query(RequestLog)
    if method:
        q = q.filter(RequestLog.method == method.upper())
    if path:
        q = q.filter(RequestLog.path.ilike(f"%{path}%"))
    if status_code is not None:
        q = q.filter(RequestLog.status_code == status_code)
    if user_id is not None:
        q = q.filter(RequestLog.user_id == user_id)
    return q.order_by(RequestLog.id.desc()).offset(skip).limit(limit).all()


@router.get("/logs/stats", response_model=LogAggregateStats)
def get_log_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    last_hour = now - timedelta(hours=1)

    total_requests = db.query(RequestLog).count()

    requests_last_hour = (
        db.query(RequestLog)
        .filter(RequestLog.created_at >= last_hour)
        .count()
    )

    # Error rate (4xx + 5xx) over total
    error_count = (
        db.query(RequestLog)
        .filter(RequestLog.status_code >= 400)
        .count()
    )
    error_rate = round((error_count / total_requests * 100) if total_requests > 0 else 0, 2)

    avg_response_time = (
        db.query(sa_func.coalesce(sa_func.avg(RequestLog.response_time_ms), 0))
        .scalar()
    )

    # Top 10 endpoints by request count
    top_rows = (
        db.query(
            RequestLog.path,
            sa_func.count(RequestLog.id).label("cnt"),
            sa_func.avg(RequestLog.response_time_ms).label("avg_ms"),
        )
        .group_by(RequestLog.path)
        .order_by(sa_func.count(RequestLog.id).desc())
        .limit(10)
        .all()
    )
    top_endpoints = [
        TopEndpoint(path=row[0], count=row[1], avg_response_time_ms=round(row[2], 2))
        for row in top_rows
    ]

    # Hourly breakdown (last 24h) — compatible with both Postgres and SQLite
    hourly_rows = (
        db.query(
            sa_func.strftime("%Y-%m-%d %H:00", RequestLog.created_at).label("hour"),
            sa_func.count(RequestLog.id).label("cnt"),
            sa_func.sum(
                case((RequestLog.status_code >= 400, 1), else_=0)
            ).label("err_cnt"),
            sa_func.avg(RequestLog.response_time_ms).label("avg_ms"),
        )
        .filter(RequestLog.created_at >= last_24h)
        .group_by(sa_func.strftime("%Y-%m-%d %H:00", RequestLog.created_at))
        .order_by(sa_func.strftime("%Y-%m-%d %H:00", RequestLog.created_at))
        .all()
    )
    hourly_breakdown = [
        HourlyBucket(
            hour=row[0],
            count=row[1],
            error_count=row[2] or 0,
            avg_response_time_ms=round(row[3], 2),
        )
        for row in hourly_rows
    ]

    return LogAggregateStats(
        total_requests=total_requests,
        requests_last_hour=requests_last_hour,
        error_rate=error_rate,
        avg_response_time_ms=round(avg_response_time, 2),
        top_endpoints=top_endpoints,
        hourly_breakdown=hourly_breakdown,
    )
