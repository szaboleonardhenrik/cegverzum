from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.company import Company
from app.models.financial import FinancialReport
from app.models.user import User
from app.schemas.financial_analysis import (
    BenchmarkMetric,
    BenchmarkResponse,
    CompanyCompareItem,
    CompareResponse,
    FinancialAnalysisResponse,
    YearlyMetric,
)

router = APIRouter(prefix="/financial-analysis", tags=["financial-analysis"])


def _build_yearly_metrics(reports: list[FinancialReport]) -> list[YearlyMetric]:
    sorted_reports = sorted(reports, key=lambda r: r.ev)
    metrics: list[YearlyMetric] = []
    prev_revenue: float | None = None

    for r in sorted_reports:
        growth: float | None = None
        if prev_revenue and prev_revenue != 0 and r.netto_arbevetel is not None:
            growth = round(((r.netto_arbevetel - prev_revenue) / abs(prev_revenue)) * 100, 2)

        metrics.append(
            YearlyMetric(
                ev=r.ev,
                netto_arbevetel=r.netto_arbevetel,
                uzemi_eredmeny=r.uzemi_eredmeny,
                adozott_eredmeny=r.adozott_eredmeny,
                sajat_toke=r.sajat_toke,
                kotelezettsegek=r.kotelezettsegek,
                eszkozok_osszesen=r.eszkozok_osszesen,
                forgoeszkozok=r.forgoeszkozok,
                rovid_lejaratu_kotelezettsegek=r.rovid_lejaratu_kotelezettsegek,
                eladosodottsag_foka=r.eladosodottsag_foka,
                arbevetel_aranyos_eredmeny=r.arbevetel_aranyos_eredmeny,
                likviditasi_gyorsrata=r.likviditasi_gyorsrata,
                roe=r.roe,
                ebitda=r.ebitda,
                novekedesi_rata=growth,
            )
        )
        prev_revenue = r.netto_arbevetel

    return metrics


def _safe_avg(values: list[float | None]) -> float | None:
    valid = [v for v in values if v is not None]
    if not valid:
        return None
    return round(sum(valid) / len(valid), 4)


def _calc_cagr(reports: list[FinancialReport]) -> float | None:
    sorted_r = sorted(reports, key=lambda r: r.ev)
    revenues = [(r.ev, r.netto_arbevetel) for r in sorted_r if r.netto_arbevetel and r.netto_arbevetel > 0]
    if len(revenues) < 2:
        return None
    first_year, first_val = revenues[0]
    last_year, last_val = revenues[-1]
    years = last_year - first_year
    if years <= 0 or first_val <= 0:
        return None
    cagr = ((last_val / first_val) ** (1 / years) - 1) * 100
    return round(cagr, 2)


# IMPORTANT: /compare and /benchmark BEFORE /{company_id} to avoid path conflict
@router.get("/compare", response_model=CompareResponse)
def compare_companies(
    ids: str = Query(..., description="Comma-separated company IDs (max 5)"),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    try:
        id_list = [int(x.strip()) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Hibás ID formátum")

    if len(id_list) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 cég hasonlítható össze")
    if len(id_list) < 2:
        raise HTTPException(status_code=400, detail="Legalább 2 cég szükséges az összehasonlításhoz")

    companies_data: list[CompanyCompareItem] = []
    for cid in id_list:
        company = db.get(Company, cid)
        if not company:
            raise HTTPException(status_code=404, detail=f"A(z) {cid} ID-jú cég nem található")

        reports = (
            db.query(FinancialReport)
            .filter(FinancialReport.company_id == cid)
            .order_by(FinancialReport.ev)
            .all()
        )
        metrics = _build_yearly_metrics(reports)

        companies_data.append(
            CompanyCompareItem(
                company_id=company.id,
                company_name=company.nev,
                yearly_metrics=metrics,
                avg_profit_margin=_safe_avg([r.arbevetel_aranyos_eredmeny for r in reports]),
                avg_roe=_safe_avg([r.roe for r in reports]),
                avg_debt_ratio=_safe_avg([r.eladosodottsag_foka for r in reports]),
                avg_liquidity=_safe_avg([r.likviditasi_gyorsrata for r in reports]),
            )
        )

    return CompareResponse(companies=companies_data)


@router.get("/benchmark", response_model=BenchmarkResponse)
def industry_benchmark(
    company_id: int = Query(...),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="A cég nem található")

    if not company.teaor_kod:
        raise HTTPException(status_code=400, detail="A cégnek nincs TEÁOR kódja, benchmark nem készíthető")

    # Get company's latest report
    latest_report = (
        db.query(FinancialReport)
        .filter(FinancialReport.company_id == company_id)
        .order_by(FinancialReport.ev.desc())
        .first()
    )

    # SQL aggregation for industry averages — only latest year per company in same TEÁOR
    # Subquery: latest year per company in industry
    industry_company_ids = (
        db.query(Company.id)
        .filter(Company.teaor_kod == company.teaor_kod, Company.id != company.id)
        .subquery()
    )

    latest_years = (
        db.query(
            FinancialReport.company_id,
            sa_func.max(FinancialReport.ev).label("max_ev"),
        )
        .filter(FinancialReport.company_id.in_(db.query(industry_company_ids.c.id)))
        .group_by(FinancialReport.company_id)
        .subquery()
    )

    industry_avgs = (
        db.query(
            sa_func.avg(FinancialReport.arbevetel_aranyos_eredmeny).label("avg_profit_margin"),
            sa_func.avg(FinancialReport.roe).label("avg_roe"),
            sa_func.avg(FinancialReport.eladosodottsag_foka).label("avg_debt_ratio"),
            sa_func.avg(FinancialReport.likviditasi_gyorsrata).label("avg_liquidity"),
            sa_func.avg(FinancialReport.netto_arbevetel).label("avg_revenue"),
            sa_func.avg(FinancialReport.ebitda).label("avg_ebitda"),
            sa_func.count(FinancialReport.company_id).label("cnt"),
        )
        .join(
            latest_years,
            (FinancialReport.company_id == latest_years.c.company_id)
            & (FinancialReport.ev == latest_years.c.max_ev),
        )
        .first()
    )

    industry_count = industry_avgs.cnt if industry_avgs and industry_avgs.cnt else 0

    def _position(company_val: float | None, industry_val: float | None) -> str | None:
        if company_val is None or industry_val is None:
            return None
        if company_val > industry_val:
            return "above"
        if company_val < industry_val:
            return "below"
        return "equal"

    def _round(val: float | None) -> float | None:
        return round(val, 4) if val is not None else None

    metrics: list[BenchmarkMetric] = []

    if latest_report and industry_avgs:
        pairs = [
            ("profit_margin", latest_report.arbevetel_aranyos_eredmeny, industry_avgs.avg_profit_margin),
            ("roe", latest_report.roe, industry_avgs.avg_roe),
            ("debt_ratio", latest_report.eladosodottsag_foka, industry_avgs.avg_debt_ratio),
            ("liquidity", latest_report.likviditasi_gyorsrata, industry_avgs.avg_liquidity),
            ("revenue", latest_report.netto_arbevetel, industry_avgs.avg_revenue),
            ("ebitda", latest_report.ebitda, industry_avgs.avg_ebitda),
        ]

        for name, c_val, i_val in pairs:
            # For debt ratio, lower is better — invert position
            pos = _position(c_val, i_val)
            if name == "debt_ratio" and pos:
                pos = "above" if pos == "below" else ("below" if pos == "above" else "equal")

            metrics.append(
                BenchmarkMetric(
                    metric=name,
                    company_value=_round(c_val),
                    industry_avg=_round(i_val),
                    position=pos,
                )
            )

    return BenchmarkResponse(
        company_id=company.id,
        company_name=company.nev,
        teaor_kod=company.teaor_kod,
        teaor_megnevezes=company.teaor_megnevezes,
        industry_company_count=industry_count,
        metrics=metrics,
    )


@router.get("/{company_id}", response_model=FinancialAnalysisResponse)
def get_financial_analysis(
    company_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="A cég nem található")

    reports = (
        db.query(FinancialReport)
        .filter(FinancialReport.company_id == company_id)
        .order_by(FinancialReport.ev)
        .all()
    )

    metrics = _build_yearly_metrics(reports)

    return FinancialAnalysisResponse(
        company_id=company.id,
        company_name=company.nev,
        teaor_kod=company.teaor_kod,
        yearly_metrics=metrics,
        avg_profit_margin=_safe_avg([r.arbevetel_aranyos_eredmeny for r in reports]),
        avg_roe=_safe_avg([r.roe for r in reports]),
        avg_debt_ratio=_safe_avg([r.eladosodottsag_foka for r in reports]),
        avg_liquidity=_safe_avg([r.likviditasi_gyorsrata for r in reports]),
        revenue_cagr=_calc_cagr(reports),
    )
