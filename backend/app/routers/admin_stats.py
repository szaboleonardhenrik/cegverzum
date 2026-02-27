from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models.chat import ChatMessage
from app.models.company import Company
from app.models.request_log import RequestLog
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    active_users = (
        db.query(User)
        .filter(User.is_active == True, User.hashed_password.isnot(None))
        .count()
    )
    admin_count = db.query(User).filter(User.is_admin == True).count()

    # Users by package
    pkg_rows = (
        db.query(User.package, sa_func.count(User.id))
        .group_by(User.package)
        .all()
    )
    users_by_package = {"free": 0, "basic": 0, "pro": 0, "enterprise": 0}
    for pkg, cnt in pkg_rows:
        if pkg in users_by_package:
            users_by_package[pkg] = cnt

    total_companies = db.query(Company).count()

    total_chat_messages = db.query(ChatMessage).count()

    # Monthly revenue = sum of monthly_price for active users
    monthly_revenue = (
        db.query(sa_func.coalesce(sa_func.sum(User.monthly_price), 0))
        .filter(User.is_active == True)
        .scalar()
    )

    # Recent users (last 10)
    recent_users_rows = (
        db.query(User).order_by(User.created_at.desc()).limit(10).all()
    )
    recent_users = []
    for u in recent_users_rows:
        recent_users.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "has_registered": u.hashed_password is not None,
            "package": u.package or "free",
            "monthly_price": u.monthly_price or 0,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    # --- Enhanced fields ---

    # Daily active users (unique user_ids in request_logs last 24h)
    now = datetime.now(timezone.utc)
    dau = (
        db.query(sa_func.count(sa_func.distinct(RequestLog.user_id)))
        .filter(RequestLog.created_at >= now - timedelta(hours=24))
        .filter(RequestLog.user_id.isnot(None))
        .scalar()
    ) or 0

    # Signups last 30 days (day-by-day)
    thirty_days_ago = now - timedelta(days=30)
    signup_rows = (
        db.query(
            sa_func.strftime("%Y-%m-%d", User.created_at).label("day"),
            sa_func.count(User.id).label("cnt"),
        )
        .filter(User.created_at >= thirty_days_ago)
        .group_by(sa_func.strftime("%Y-%m-%d", User.created_at))
        .order_by(sa_func.strftime("%Y-%m-%d", User.created_at))
        .all()
    )
    signups_last_30_days = [{"date": row[0], "count": row[1]} for row in signup_rows]

    # Average response time (from request_logs)
    avg_response_time_ms = (
        db.query(sa_func.coalesce(sa_func.avg(RequestLog.response_time_ms), 0))
        .scalar()
    )

    # Top searched companies (top paths matching /companies with query)
    top_searched_rows = (
        db.query(
            RequestLog.path,
            sa_func.count(RequestLog.id).label("cnt"),
        )
        .filter(RequestLog.path.like("/companies%"))
        .filter(RequestLog.method == "GET")
        .group_by(RequestLog.path)
        .order_by(sa_func.count(RequestLog.id).desc())
        .limit(10)
        .all()
    )
    top_searched_companies = [{"path": row[0], "count": row[1]} for row in top_searched_rows]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_count": admin_count,
        "users_by_package": users_by_package,
        "total_companies": total_companies,
        "total_chat_messages": total_chat_messages,
        "monthly_revenue": monthly_revenue,
        "recent_users": recent_users,
        "daily_active_users": dau,
        "signups_last_30_days": signups_last_30_days,
        "avg_response_time_ms": round(avg_response_time_ms, 2),
        "top_searched_companies": top_searched_companies,
    }
