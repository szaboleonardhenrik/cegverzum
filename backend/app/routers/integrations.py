import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from httpx import HTTPError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.nav import NavIntegrationStatus, NavTaxpayerResponse
from app.services.nav_client import query_taxpayer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["integrations"])


def _nav_configured() -> bool:
    return bool(settings.nav_login and settings.nav_password and settings.nav_signature_key)


def _get_integrations() -> list[dict]:
    nav_ok = _nav_configured()
    return [
        {
            "name": "NAV",
            "slug": "nav",
            "status": "active" if nav_ok else "pending",
            "message": "NAV Online Számla API csatlakozva" if nav_ok else "NAV API nincs konfigurálva (.env)",
            "configured": nav_ok,
        },
        {
            "name": "Cégbíróság",
            "slug": "cegbirosag",
            "status": "pending",
            "message": "Cégbírósági API integrálás folyamatban",
            "configured": False,
        },
        {
            "name": "KSH",
            "slug": "ksh",
            "status": "pending",
            "message": "KSH API integrálás tervezett",
            "configured": False,
        },
    ]


@router.get("/status")
def list_integration_statuses(_user: User = Depends(get_current_user)):
    return _get_integrations()


@router.get("/nav/status", response_model=NavIntegrationStatus)
def nav_status(_user: User = Depends(get_current_user)):
    return _get_integrations()[0]


@router.get("/cegbirosag/status")
def cegbirosag_status(_user: User = Depends(get_current_user)):
    return _get_integrations()[1]


@router.get("/ksh/status")
def ksh_status(_user: User = Depends(get_current_user)):
    return _get_integrations()[2]


@router.post("/nav/query/{adoszam}", response_model=NavTaxpayerResponse)
def nav_query(
    adoszam: str,
    sync: bool = Query(False, description="Ha true, frissíti a cég adatait az adatbázisban"),
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adózó lekérdezése a NAV Online Számla API-ból adószám alapján.

    Az adószám lehet 8 számjegyű (pl. 12345678) vagy teljes formátumú (pl. 12345678-2-42).
    Ha sync=true, a lekérdezett adatok frissülnek az adatbázisban.
    """
    if not _nav_configured():
        raise HTTPException(
            status_code=503,
            detail="NAV API nincs konfigurálva. Állítsd be a NAV_LOGIN, NAV_PASSWORD és NAV_SIGNATURE_KEY környezeti változókat.",
        )

    try:
        result = query_taxpayer(adoszam)
    except HTTPError as exc:
        logger.error("NAV API hálózati hiba: %s", exc)
        raise HTTPException(status_code=502, detail=f"NAV API nem elérhető: {exc}") from exc

    if not result.get("success"):
        raise HTTPException(
            status_code=422,
            detail=result.get("message") or f"NAV hiba: {result.get('errorCode', 'ismeretlen')}",
        )

    # Optionally sync to database
    if sync and result.get("taxpayerName"):
        clean = adoszam.strip().replace("-", "")[:8]
        company = db.query(Company).filter(Company.adoszam.like(f"{clean}%")).first()
        if company:
            company.nev = result["taxpayerName"]
            if result.get("taxpayerShortName"):
                company.rovidnev = result["taxpayerShortName"]
            if result.get("taxpayerAddressFormatted"):
                company.szekhely = result["taxpayerAddressFormatted"]
            if result.get("incorporation"):
                company.cegforma = result["incorporation"]
            # VAT status: if vatCode is "2" the entity is VAT-registered
            tn = result.get("taxNumberDetail") or {}
            if tn.get("vatCode"):
                company.afa_alany = tn["vatCode"] == "2"
            # Check validity — if end date is set, taxpayer is deleted
            validity = result.get("taxpayerValidity") or {}
            if validity.get("taxpayerValidityEndDate"):
                company.nav_torlesve = True
            else:
                company.nav_torlesve = False
            db.commit()
            db.refresh(company)

    return result


@router.get("/nav/lookup/{adoszam}", response_model=NavTaxpayerResponse)
def nav_public_lookup(adoszam: str):
    """Publikus adózó lekérdezés — nem igényel bejelentkezést."""
    if not _nav_configured():
        raise HTTPException(status_code=503, detail="NAV API nincs konfigurálva")

    try:
        result = query_taxpayer(adoszam)
    except HTTPError as exc:
        logger.error("NAV API hálózati hiba: %s", exc)
        raise HTTPException(status_code=502, detail=f"NAV API nem elérhető: {exc}") from exc

    if not result.get("success"):
        raise HTTPException(
            status_code=422,
            detail=result.get("message") or f"NAV hiba: {result.get('errorCode', 'ismeretlen')}",
        )

    return result


@router.post("/cegbirosag/query/{cegjegyzekszam}")
def cegbirosag_query(cegjegyzekszam: str, _user: User = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="Cégbírósági API még nem elérhető")


@router.post("/ksh/query/{adoszam}")
def ksh_query(adoszam: str, _user: User = Depends(get_current_user)):
    raise HTTPException(status_code=501, detail="KSH API még nem elérhető")
