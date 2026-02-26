from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.company import Company
from app.models.notification import Notification
from app.models.user import User
from app.models.watchlist import WatchlistItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

PACKAGE_LIMITS: dict[str, int | None] = {
    "free": 3,
    "basic": 10,
    "pro": 50,
    "enterprise": None,
}


@router.get("")
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total_companies = db.query(Company).count()

    watchlist_count = (
        db.query(WatchlistItem).filter(WatchlistItem.user_id == user.id).count()
    )
    watchlist_limit = PACKAGE_LIMITS.get(user.package, 3)

    unread_notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.is_read == False)
        .count()
    )

    # Recent watchlist items with company data
    recent_rows = (
        db.query(WatchlistItem, Company)
        .join(Company, WatchlistItem.company_id == Company.id)
        .filter(WatchlistItem.user_id == user.id)
        .order_by(WatchlistItem.created_at.desc())
        .limit(5)
        .all()
    )

    recent_watchlist = []
    for item, company in recent_rows:
        recent_watchlist.append({
            "id": item.id,
            "company_id": item.company_id,
            "note": item.note,
            "created_at": item.created_at.isoformat(),
            "company": {
                "id": company.id,
                "nev": company.nev,
                "statusz": company.statusz,
                "szekhely": company.szekhely,
            },
        })

    return {
        "total_companies": total_companies,
        "watchlist_count": watchlist_count,
        "watchlist_limit": watchlist_limit,
        "unread_notifications": unread_notifications,
        "package": user.package or "free",
        "recent_watchlist": recent_watchlist,
    }
