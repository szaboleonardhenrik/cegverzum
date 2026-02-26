from pydantic import BaseModel


class YearlyMetric(BaseModel):
    ev: int
    netto_arbevetel: float | None = None
    uzemi_eredmeny: float | None = None
    adozott_eredmeny: float | None = None
    sajat_toke: float | None = None
    kotelezettsegek: float | None = None
    eszkozok_osszesen: float | None = None
    forgoeszkozok: float | None = None
    rovid_lejaratu_kotelezettsegek: float | None = None
    eladosodottsag_foka: float | None = None
    arbevetel_aranyos_eredmeny: float | None = None
    likviditasi_gyorsrata: float | None = None
    roe: float | None = None
    ebitda: float | None = None
    novekedesi_rata: float | None = None  # YoY revenue growth %


class FinancialAnalysisResponse(BaseModel):
    company_id: int
    company_name: str
    teaor_kod: str | None = None
    yearly_metrics: list[YearlyMetric]
    avg_profit_margin: float | None = None
    avg_roe: float | None = None
    avg_debt_ratio: float | None = None
    avg_liquidity: float | None = None
    revenue_cagr: float | None = None  # Compound Annual Growth Rate


class CompanyCompareItem(BaseModel):
    company_id: int
    company_name: str
    yearly_metrics: list[YearlyMetric]
    avg_profit_margin: float | None = None
    avg_roe: float | None = None
    avg_debt_ratio: float | None = None
    avg_liquidity: float | None = None


class CompareResponse(BaseModel):
    companies: list[CompanyCompareItem]


class BenchmarkMetric(BaseModel):
    metric: str
    company_value: float | None = None
    industry_avg: float | None = None
    position: str | None = None  # "above" | "below" | "equal"


class BenchmarkResponse(BaseModel):
    company_id: int
    company_name: str
    teaor_kod: str | None = None
    teaor_megnevezes: str | None = None
    industry_company_count: int
    metrics: list[BenchmarkMetric]
