from pydantic import BaseModel


class RiskFactor(BaseModel):
    category: str
    description: str
    points_deducted: int


class RiskAnalysisResponse(BaseModel):
    company_id: int
    company_name: str
    statusz: str
    risk_score: int  # 0-100
    risk_level: str  # "alacsony" | "közepes" | "magas" | "kritikus"
    risk_color: str  # "green" | "yellow" | "orange" | "red"
    partner_rating: str  # "ajánlott" | "óvatosság" | "magas kockázat"
    factors: list[RiskFactor]
    negative_events: list[str]
    alapitas_datuma: str | None = None
    teaor_kod: str | None = None
    nav_torlesve: bool | None = None
    nav_kockazat: str | None = None
    eladosodottsag_foka: float | None = None
    sajat_toke: float | None = None
    likviditasi_gyorsrata: float | None = None
    adozott_eredmeny: float | None = None


class WatchlistRiskItem(BaseModel):
    company_id: int
    company_name: str
    statusz: str
    risk_score: int
    risk_level: str
    risk_color: str
    partner_rating: str


class WatchlistOverviewResponse(BaseModel):
    items: list[WatchlistRiskItem]
    summary: dict[str, int]  # {"green": X, "yellow": Y, "orange": Z, "red": W}
