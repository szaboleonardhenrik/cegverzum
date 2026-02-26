from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.company import Company
from app.models.financial import FinancialReport
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.schemas.risk_analysis import (
    RiskAnalysisResponse,
    RiskFactor,
    WatchlistOverviewResponse,
    WatchlistRiskItem,
)

router = APIRouter(prefix="/risk", tags=["risk-analysis"])


def _calculate_risk(company: Company, latest_report: FinancialReport | None) -> tuple[int, list[RiskFactor], list[str]]:
    score = 100
    factors: list[RiskFactor] = []
    negative_events: list[str] = []

    # Negative events (-25 each)
    event_map = {
        "felszamolas": "Felszámolás alatt",
        "csodeljras": "Csődeljárás alatt",
        "vegelszamolas": "Végelszámolás alatt",
        "kenyszertorles": "Kényszertörlés alatt",
    }
    for attr, label in event_map.items():
        if getattr(company, attr, None):
            score -= 25
            negative_events.append(label)
            factors.append(RiskFactor(category="negative_event", description=label, points_deducted=25))

    # Status: "megszűnt" (-30)
    if company.statusz and "megszűnt" in company.statusz.lower():
        score -= 30
        factors.append(RiskFactor(category="status", description="Megszűnt státusz", points_deducted=30))

    # NAV deletion (-20)
    if company.nav_torlesve:
        score -= 20
        factors.append(RiskFactor(category="nav", description="NAV által törölt adószám", points_deducted=20))

    # NAV risk rating
    if company.nav_kockazat:
        risk_lower = company.nav_kockazat.lower()
        if "magas" in risk_lower or "high" in risk_lower:
            score -= 15
            factors.append(RiskFactor(category="nav", description="NAV magas kockázatú besorolás", points_deducted=15))
        elif "közepes" in risk_lower or "medium" in risk_lower:
            score -= 5
            factors.append(RiskFactor(category="nav", description="NAV közepes kockázatú besorolás", points_deducted=5))

    # Financial indicators from latest report
    if latest_report:
        # High debt ratio (>0.7) → -10
        if latest_report.eladosodottsag_foka is not None and latest_report.eladosodottsag_foka > 0.7:
            score -= 10
            factors.append(
                RiskFactor(
                    category="financial",
                    description=f"Magas eladósodottság ({latest_report.eladosodottsag_foka:.2f})",
                    points_deducted=10,
                )
            )

        # Negative equity → -15
        if latest_report.sajat_toke is not None and latest_report.sajat_toke < 0:
            score -= 15
            factors.append(RiskFactor(category="financial", description="Negatív saját tőke", points_deducted=15))

        # Low liquidity (<0.5) → -10
        if latest_report.likviditasi_gyorsrata is not None and latest_report.likviditasi_gyorsrata < 0.5:
            score -= 10
            factors.append(
                RiskFactor(
                    category="financial",
                    description=f"Alacsony likviditás ({latest_report.likviditasi_gyorsrata:.2f})",
                    points_deducted=10,
                )
            )

        # Negative net income → -5
        if latest_report.adozott_eredmeny is not None and latest_report.adozott_eredmeny < 0:
            score -= 5
            factors.append(RiskFactor(category="financial", description="Negatív adózott eredmény", points_deducted=5))

    # Young company (<2 years) → -5
    if company.alapitas_datuma:
        founding = company.alapitas_datuma
        if isinstance(founding, str):
            try:
                founding = datetime.strptime(founding, "%Y-%m-%d").date()
            except ValueError:
                founding = None
        if founding and isinstance(founding, date):
            age_days = (date.today() - founding).days
            if age_days < 730:  # ~2 years
                score -= 5
                factors.append(RiskFactor(category="age", description="Fiatal cég (kevesebb mint 2 éves)", points_deducted=5))

    score = max(0, min(100, score))
    return score, factors, negative_events


def _risk_level(score: int) -> tuple[str, str]:
    if score >= 80:
        return "alacsony", "green"
    if score >= 60:
        return "közepes", "yellow"
    if score >= 40:
        return "magas", "orange"
    return "kritikus", "red"


def _partner_rating(score: int) -> str:
    if score >= 70:
        return "ajánlott"
    if score >= 45:
        return "óvatosság"
    return "magas kockázat"


# IMPORTANT: /watchlist-overview BEFORE /{company_id}
@router.get("/watchlist-overview", response_model=WatchlistOverviewResponse)
def watchlist_risk_overview(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    watchlist_rows = (
        db.query(WatchlistItem, Company)
        .join(Company, WatchlistItem.company_id == Company.id)
        .filter(WatchlistItem.user_id == user.id)
        .all()
    )

    items: list[WatchlistRiskItem] = []
    summary: dict[str, int] = {"green": 0, "yellow": 0, "orange": 0, "red": 0}

    for wi, company in watchlist_rows:
        latest_report = (
            db.query(FinancialReport)
            .filter(FinancialReport.company_id == company.id)
            .order_by(FinancialReport.ev.desc())
            .first()
        )
        score, _, _ = _calculate_risk(company, latest_report)
        level, color = _risk_level(score)
        rating = _partner_rating(score)

        items.append(
            WatchlistRiskItem(
                company_id=company.id,
                company_name=company.nev,
                statusz=company.statusz or "ismeretlen",
                risk_score=score,
                risk_level=level,
                risk_color=color,
                partner_rating=rating,
            )
        )
        summary[color] = summary.get(color, 0) + 1

    return WatchlistOverviewResponse(items=items, summary=summary)


@router.get("/{company_id}", response_model=RiskAnalysisResponse)
def get_risk_analysis(
    company_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="A cég nem található")

    latest_report = (
        db.query(FinancialReport)
        .filter(FinancialReport.company_id == company_id)
        .order_by(FinancialReport.ev.desc())
        .first()
    )

    score, factors, negative_events = _calculate_risk(company, latest_report)
    level, color = _risk_level(score)
    rating = _partner_rating(score)

    return RiskAnalysisResponse(
        company_id=company.id,
        company_name=company.nev,
        statusz=company.statusz or "ismeretlen",
        risk_score=score,
        risk_level=level,
        risk_color=color,
        partner_rating=rating,
        factors=factors,
        negative_events=negative_events,
        alapitas_datuma=str(company.alapitas_datuma) if company.alapitas_datuma else None,
        teaor_kod=company.teaor_kod,
        nav_torlesve=company.nav_torlesve,
        nav_kockazat=company.nav_kockazat,
        eladosodottsag_foka=latest_report.eladosodottsag_foka if latest_report else None,
        sajat_toke=latest_report.sajat_toke if latest_report else None,
        likviditasi_gyorsrata=latest_report.likviditasi_gyorsrata if latest_report else None,
        adozott_eredmeny=latest_report.adozott_eredmeny if latest_report else None,
    )
