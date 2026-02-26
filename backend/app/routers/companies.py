import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, func as sa_func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.company import Company
from app.models.financial import FinancialReport, Officer
from app.models.user import User
from app.schemas.company import CompanyRead, CompanyListItem, CompanyPublicItem, MarketingExportRequest
from app.schemas.financial import FinancialReportRead, OfficerRead

router = APIRouter(prefix="/companies", tags=["companies"])

ORDER_BY_MAP = {
    "nev_asc": Company.nev.asc(),
    "nev_desc": Company.nev.desc(),
    "alapitas_asc": Company.alapitas_datuma.asc(),
    "alapitas_desc": Company.alapitas_datuma.desc(),
    "statusz_asc": Company.statusz.asc(),
    "statusz_desc": Company.statusz.desc(),
}


def _apply_filters(query, params: dict):
    """Apply shared filter logic for list and count endpoints."""
    q = params.get("q")
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                Company.nev.ilike(pattern),
                Company.adoszam.ilike(pattern),
                Company.cegjegyzekszam.ilike(pattern),
            )
        )
    if params.get("statusz"):
        query = query.filter(Company.statusz == params["statusz"])
    if params.get("cegforma"):
        query = query.filter(Company.cegforma.ilike(f"%{params['cegforma']}%"))
    if params.get("teaor_kod"):
        query = query.filter(Company.teaor_kod == params["teaor_kod"])
    if params.get("fotevekenyseg"):
        query = query.filter(Company.fotevekenyseg.ilike(f"%{params['fotevekenyseg']}%"))
    if params.get("szekhely"):
        query = query.filter(Company.szekhely.ilike(f"%{params['szekhely']}%"))
    if params.get("alapitas_tol"):
        query = query.filter(Company.alapitas_datuma >= params["alapitas_tol"])
    if params.get("alapitas_ig"):
        query = query.filter(Company.alapitas_datuma <= params["alapitas_ig"])
    if params.get("letszam_kategoria"):
        query = query.filter(Company.letszam_kategoria == params["letszam_kategoria"])

    # Boolean filters
    for field in ("felszamolas", "csodeljras", "vegelszamolas", "kenyszertorles", "afa_alany"):
        val = params.get(field)
        if val is not None:
            query = query.filter(getattr(Company, field) == val)

    return query


def _collect_filter_params(
    q, statusz, cegforma, teaor_kod, fotevekenyseg, szekhely,
    alapitas_tol, alapitas_ig, letszam_kategoria,
    felszamolas, csodeljras, vegelszamolas, kenyszertorles, afa_alany,
):
    return {
        "q": q, "statusz": statusz, "cegforma": cegforma, "teaor_kod": teaor_kod,
        "fotevekenyseg": fotevekenyseg, "szekhely": szekhely,
        "alapitas_tol": alapitas_tol, "alapitas_ig": alapitas_ig,
        "letszam_kategoria": letszam_kategoria,
        "felszamolas": felszamolas, "csodeljras": csodeljras,
        "vegelszamolas": vegelszamolas, "kenyszertorles": kenyszertorles,
        "afa_alany": afa_alany,
    }


@router.get("/public", response_model=list[CompanyPublicItem])
def public_search(
    q: str = Query(..., min_length=2, description="Keresés név, adószám vagy cégjegyzékszám alapján"),
    db: Session = Depends(get_db),
):
    """Public search endpoint — no auth required, returns limited fields, max 10 results."""
    pattern = f"%{q}%"
    results = (
        db.query(Company)
        .filter(
            or_(
                Company.nev.ilike(pattern),
                Company.adoszam.ilike(pattern),
                Company.cegjegyzekszam.ilike(pattern),
            )
        )
        .order_by(Company.nev)
        .limit(10)
        .all()
    )
    return results


@router.get("/", response_model=list[CompanyListItem])
def list_companies(
    q: str | None = Query(None, description="Keresés név, adószám vagy cégjegyzékszám alapján"),
    statusz: str | None = Query(None),
    cegforma: str | None = Query(None),
    teaor_kod: str | None = Query(None),
    fotevekenyseg: str | None = Query(None),
    szekhely: str | None = Query(None, description="Részleges egyezés a címre"),
    alapitas_tol: date | None = Query(None),
    alapitas_ig: date | None = Query(None),
    letszam_kategoria: str | None = Query(None),
    felszamolas: bool | None = Query(None),
    csodeljras: bool | None = Query(None),
    vegelszamolas: bool | None = Query(None),
    kenyszertorles: bool | None = Query(None),
    afa_alany: bool | None = Query(None),
    order_by: str | None = Query(None, description="Rendezés: nev_asc, nev_desc, alapitas_asc, alapitas_desc, statusz_asc, statusz_desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    params = _collect_filter_params(
        q, statusz, cegforma, teaor_kod, fotevekenyseg, szekhely,
        alapitas_tol, alapitas_ig, letszam_kategoria,
        felszamolas, csodeljras, vegelszamolas, kenyszertorles, afa_alany,
    )
    query = _apply_filters(db.query(Company), params)
    if order_by and order_by in ORDER_BY_MAP:
        query = query.order_by(ORDER_BY_MAP[order_by])
    return query.offset(skip).limit(limit).all()


@router.get("/count")
def count_companies(
    q: str | None = Query(None),
    statusz: str | None = Query(None),
    cegforma: str | None = Query(None),
    teaor_kod: str | None = Query(None),
    fotevekenyseg: str | None = Query(None),
    szekhely: str | None = Query(None),
    alapitas_tol: date | None = Query(None),
    alapitas_ig: date | None = Query(None),
    letszam_kategoria: str | None = Query(None),
    felszamolas: bool | None = Query(None),
    csodeljras: bool | None = Query(None),
    vegelszamolas: bool | None = Query(None),
    kenyszertorles: bool | None = Query(None),
    afa_alany: bool | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    params = _collect_filter_params(
        q, statusz, cegforma, teaor_kod, fotevekenyseg, szekhely,
        alapitas_tol, alapitas_ig, letszam_kategoria,
        felszamolas, csodeljras, vegelszamolas, kenyszertorles, afa_alany,
    )
    query = _apply_filters(db.query(Company), params)
    return {"count": query.count()}


@router.get("/export/csv")
def export_csv(
    q: str | None = Query(None),
    statusz: str | None = Query(None),
    cegforma: str | None = Query(None),
    teaor_kod: str | None = Query(None),
    fotevekenyseg: str | None = Query(None),
    szekhely: str | None = Query(None),
    alapitas_tol: date | None = Query(None),
    alapitas_ig: date | None = Query(None),
    letszam_kategoria: str | None = Query(None),
    felszamolas: bool | None = Query(None),
    csodeljras: bool | None = Query(None),
    vegelszamolas: bool | None = Query(None),
    kenyszertorles: bool | None = Query(None),
    afa_alany: bool | None = Query(None),
    order_by: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    params = _collect_filter_params(
        q, statusz, cegforma, teaor_kod, fotevekenyseg, szekhely,
        alapitas_tol, alapitas_ig, letszam_kategoria,
        felszamolas, csodeljras, vegelszamolas, kenyszertorles, afa_alany,
    )
    query = _apply_filters(db.query(Company), params)
    if order_by and order_by in ORDER_BY_MAP:
        query = query.order_by(ORDER_BY_MAP[order_by])
    rows = query.limit(5000).all()

    columns = [
        ("Cégnév", "nev"),
        ("Adószám", "adoszam"),
        ("Cégjegyzékszám", "cegjegyzekszam"),
        ("Székhely", "szekhely"),
        ("Cégforma", "cegforma"),
        ("Státusz", "statusz"),
        ("TEÁOR kód", "teaor_kod"),
        ("Fő tevékenység", "fotevekenyseg"),
        ("Alapítás dátuma", "alapitas_datuma"),
        ("Létszám kategória", "letszam_kategoria"),
    ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([col[0] for col in columns])
    for row in rows:
        writer.writerow([getattr(row, col[1], "") or "" for col in columns])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cegverzum_export.csv"},
    )


@router.post("/export/marketing")
def export_marketing_csv(
    body: MarketingExportRequest,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    rows = db.query(Company).filter(Company.id.in_(body.ids)).all()

    columns = [
        ("Cégnév", "nev"),
        ("Rövidnév", "rovidnev"),
        ("Adószám", "adoszam"),
        ("Cégjegyzékszám", "cegjegyzekszam"),
        ("Székhely", "szekhely"),
        ("Cégforma", "cegforma"),
        ("Státusz", "statusz"),
        ("TEÁOR kód", "teaor_kod"),
        ("Fő tevékenység", "fotevekenyseg"),
        ("Alapítás dátuma", "alapitas_datuma"),
        ("Létszám kategória", "letszam_kategoria"),
        ("Email", "email"),
        ("Telefon", "telefon"),
        ("Weboldal", "weboldal"),
    ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([col[0] for col in columns])
    for row in rows:
        writer.writerow([getattr(row, col[1], "") or "" for col in columns])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cegverzum_marketing.csv"},
    )


@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Cég nem található")
    return company


@router.get("/{company_id}/financials", response_model=list[FinancialReportRead])
def get_financials(company_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Cég nem található")
    return db.query(FinancialReport).filter(FinancialReport.company_id == company_id).order_by(FinancialReport.ev).all()


@router.get("/{company_id}/officers", response_model=list[OfficerRead])
def get_officers(company_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Cég nem található")
    return db.query(Officer).filter(Officer.company_id == company_id).all()


@router.get("/{company_id}/network")
def get_network(company_id: int, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Build a 2-level connection graph through shared officers."""
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Cég nem található")

    # Level 1: officers of this company
    officers = db.query(Officer).filter(Officer.company_id == company_id).all()

    nodes_map: dict[int, dict] = {
        company.id: {"id": company.id, "nev": company.nev, "statusz": company.statusz, "is_center": True}
    }
    links_map: dict[tuple[int, int], list[str]] = {}

    for officer in officers:
        # Find other companies where this officer also appears
        other_officers = (
            db.query(Officer)
            .filter(Officer.nev == officer.nev, Officer.company_id != company_id)
            .all()
        )
        for other_off in other_officers:
            other_company = db.get(Company, other_off.company_id)
            if not other_company:
                continue

            if other_company.id not in nodes_map:
                nodes_map[other_company.id] = {
                    "id": other_company.id,
                    "nev": other_company.nev,
                    "statusz": other_company.statusz,
                    "is_center": False,
                }

            link_key = (min(company_id, other_company.id), max(company_id, other_company.id))
            if link_key not in links_map:
                links_map[link_key] = []
            if officer.nev not in links_map[link_key]:
                links_map[link_key].append(officer.nev)

            # Level 2: officers of connected companies → find their other companies
            level2_officers = (
                db.query(Officer)
                .filter(Officer.company_id == other_company.id)
                .all()
            )
            for l2_off in level2_officers:
                l2_others = (
                    db.query(Officer)
                    .filter(
                        Officer.nev == l2_off.nev,
                        Officer.company_id != other_company.id,
                        Officer.company_id != company_id,
                    )
                    .all()
                )
                for l2_other in l2_others:
                    l2_company = db.get(Company, l2_other.company_id)
                    if not l2_company:
                        continue
                    if l2_company.id not in nodes_map:
                        nodes_map[l2_company.id] = {
                            "id": l2_company.id,
                            "nev": l2_company.nev,
                            "statusz": l2_company.statusz,
                            "is_center": False,
                        }
                    l2_key = (
                        min(other_company.id, l2_company.id),
                        max(other_company.id, l2_company.id),
                    )
                    if l2_key not in links_map:
                        links_map[l2_key] = []
                    if l2_off.nev not in links_map[l2_key]:
                        links_map[l2_key].append(l2_off.nev)

    nodes = list(nodes_map.values())
    links = [
        {"source": src, "target": tgt, "officers": names}
        for (src, tgt), names in links_map.items()
    ]

    return {"nodes": nodes, "links": links}
