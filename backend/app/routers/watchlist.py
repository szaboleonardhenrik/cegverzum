from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.company import Company
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import (
    WatchlistAdd,
    WatchlistItemRead,
    WatchlistItemWithCompany,
    WatchlistStatus,
    WatchlistUpdate,
)

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

PACKAGE_LIMITS: dict[str, int | None] = {
    "free": 3,
    "basic": 10,
    "pro": 50,
    "enterprise": None,
}


def _get_limit(user: User) -> int | None:
    return PACKAGE_LIMITS.get(user.package, 3)


@router.get("", response_model=list[WatchlistItemWithCompany])
def list_watchlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(WatchlistItem, Company)
        .join(Company, WatchlistItem.company_id == Company.id)
        .filter(WatchlistItem.user_id == user.id)
        .order_by(WatchlistItem.created_at.desc())
        .all()
    )
    result = []
    for item, company in rows:
        data = WatchlistItemWithCompany(
            id=item.id,
            company_id=item.company_id,
            note=item.note,
            created_at=item.created_at,
            company=company,
        )
        result.append(data)
    return result


@router.get("/count")
def watchlist_count(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    count = db.query(WatchlistItem).filter(WatchlistItem.user_id == user.id).count()
    limit = _get_limit(user)
    return {"count": count, "limit": limit}


@router.get("/ids")
def watchlist_ids(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(WatchlistItem.company_id)
        .filter(WatchlistItem.user_id == user.id)
        .all()
    )
    return {"ids": [r[0] for r in rows]}


@router.get("/check/{company_id}", response_model=WatchlistStatus)
def check_watched(company_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user.id, WatchlistItem.company_id == company_id)
        .first()
    )
    if item:
        return WatchlistStatus(is_watched=True, watchlist_item_id=item.id)
    return WatchlistStatus(is_watched=False, watchlist_item_id=None)


@router.post("", response_model=WatchlistItemRead, status_code=201)
def add_to_watchlist(
    body: WatchlistAdd,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    company = db.get(Company, body.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="A cég nem található")

    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user.id, WatchlistItem.company_id == body.company_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A cég már a figyelőlistán van")

    limit = _get_limit(user)
    if limit is not None:
        count = db.query(WatchlistItem).filter(WatchlistItem.user_id == user.id).count()
        if count >= limit:
            raise HTTPException(
                status_code=400,
                detail=f"Elérte a figyelőlista limitjét ({limit} cég). Frissítse csomagját a bővítéshez.",
            )

    item = WatchlistItem(user_id=user.id, company_id=body.company_id, note=body.note)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=WatchlistItemRead)
def update_watchlist_item(
    item_id: int,
    body: WatchlistUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.id == item_id, WatchlistItem.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="A figyelőlista elem nem található")

    item.note = body.note
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{company_id}", status_code=204)
def remove_from_watchlist(
    company_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user.id, WatchlistItem.company_id == company_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="A cég nincs a figyelőlistán")

    db.delete(item)
    db.commit()
