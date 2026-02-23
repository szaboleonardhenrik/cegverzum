from datetime import datetime

from pydantic import BaseModel

from app.schemas.company import CompanyListItem


class WatchlistItemRead(BaseModel):
    id: int
    user_id: int
    company_id: int
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class WatchlistItemWithCompany(BaseModel):
    id: int
    company_id: int
    note: str | None
    created_at: datetime
    company: CompanyListItem

    model_config = {"from_attributes": True}


class WatchlistAdd(BaseModel):
    company_id: int
    note: str | None = None


class WatchlistUpdate(BaseModel):
    note: str | None = None


class WatchlistStatus(BaseModel):
    is_watched: bool
    watchlist_item_id: int | None = None
