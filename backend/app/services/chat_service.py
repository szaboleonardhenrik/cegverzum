import re
from typing import Generator

import anthropic
from sqlalchemy.orm import Session

from app.config import settings
from app.models.company import Company
from app.models.financial import FinancialReport, Officer


def find_company_context(message: str, db: Session) -> tuple[Company | None, str]:
    """Extract company name/tax number from message and look up in DB."""
    # Try tax number match (8-digit number)
    tax_match = re.search(r"\b(\d{8})\b", message)
    if tax_match:
        company = (
            db.query(Company)
            .filter(Company.adoszam.like(f"{tax_match.group(1)}%"))
            .first()
        )
        if company:
            return company, _build_company_text(company, db)

    # Try name search — extract quoted names or longer capitalized words
    # First try quoted text
    quoted = re.findall(r'[""„]([^""„"]+)["""]', message)
    for name in quoted:
        company = db.query(Company).filter(Company.nev.ilike(f"%{name}%")).first()
        if company:
            return company, _build_company_text(company, db)

    # Try common Hungarian company suffixes
    pattern = r"([\w\s\-\.]+(?:Kft|Zrt|Nyrt|Bt|Kkt|Kht|Zrt|Egyesület|Alapítvány)\.?)"
    suffix_matches = re.findall(pattern, message, re.IGNORECASE)
    for name in suffix_matches:
        name = name.strip()
        if len(name) >= 3:
            company = db.query(Company).filter(Company.nev.ilike(f"%{name}%")).first()
            if company:
                return company, _build_company_text(company, db)

    # Fallback: try each word longer than 3 chars as company name (less precise)
    words = [w for w in message.split() if len(w) > 3 and w[0].isupper()]
    for word in words:
        company = db.query(Company).filter(Company.nev.ilike(f"%{word}%")).first()
        if company:
            return company, _build_company_text(company, db)

    return None, ""


def _build_company_text(company: Company, db: Session) -> str:
    """Build a formatted text summary of a company for the AI context."""
    lines = [
        f"=== Cégadatok: {company.nev} ===",
        f"Név: {company.nev}",
    ]
    if company.rovidnev:
        lines.append(f"Rövidnév: {company.rovidnev}")
    if company.adoszam:
        lines.append(f"Adószám: {company.adoszam}")
    if company.cegjegyzekszam:
        lines.append(f"Cégjegyzékszám: {company.cegjegyzekszam}")
    if company.szekhely:
        lines.append(f"Székhely: {company.szekhely}")
    lines.append(f"Státusz: {company.statusz}")
    if company.cegforma:
        lines.append(f"Cégforma: {company.cegforma}")
    if company.alapitas_datuma:
        lines.append(f"Alapítás dátuma: {company.alapitas_datuma}")
    if company.fotevekenyseg:
        lines.append(f"Főtevékenység: {company.fotevekenyseg}")
    if company.teaor_kod:
        lines.append(f"TEÁOR kód: {company.teaor_kod}")
        if company.teaor_megnevezes:
            lines[-1] += f" — {company.teaor_megnevezes}"
    if company.letszam_kategoria:
        lines.append(f"Létszám kategória: {company.letszam_kategoria}")
    if company.jegyzett_toke:
        toke = company.jegyzett_toke
        if company.jegyzett_toke_penznem:
            toke += f" {company.jegyzett_toke_penznem}"
        lines.append(f"Jegyzett tőke: {toke}")
    if company.email:
        lines.append(f"Email: {company.email}")
    if company.telefon:
        lines.append(f"Telefon: {company.telefon}")
    if company.weboldal:
        lines.append(f"Weboldal: {company.weboldal}")

    # NAV data
    nav_info = []
    if company.afa_alany is not None:
        nav_info.append(f"ÁFA alany: {'Igen' if company.afa_alany else 'Nem'}")
    if company.nav_torlesve:
        nav_info.append("NAV-nál törölve: Igen")
    if company.nav_kockazat:
        nav_info.append(f"NAV kockázati besorolás: {company.nav_kockazat}")
    if nav_info:
        lines.append("")
        lines.append("NAV adatok:")
        lines.extend(f"  {info}" for info in nav_info)

    # Negative events
    negatives = []
    if company.felszamolas:
        negatives.append("Felszámolás alatt")
    if company.csodeljras:
        negatives.append("Csődeljárás alatt")
    if company.vegelszamolas:
        negatives.append("Végelszámolás alatt")
    if company.kenyszertorles:
        negatives.append("Kényszertörlés alatt")
    if negatives:
        lines.append("")
        lines.append("FIGYELMEZTETÉS — Negatív események:")
        lines.extend(f"  - {n}" for n in negatives)

    # Financial reports (latest 3 years)
    reports = (
        db.query(FinancialReport)
        .filter(FinancialReport.company_id == company.id)
        .order_by(FinancialReport.ev.desc())
        .limit(3)
        .all()
    )
    if reports:
        lines.append("")
        lines.append("Pénzügyi adatok (ezer HUF):")
        for r in reports:
            lines.append(f"  {r.ev}. év:")
            if r.netto_arbevetel is not None:
                lines.append(f"    Nettó árbevétel: {r.netto_arbevetel:,.0f}")
            if r.uzemi_eredmeny is not None:
                lines.append(f"    Üzemi eredmény: {r.uzemi_eredmeny:,.0f}")
            if r.adozott_eredmeny is not None:
                lines.append(f"    Adózott eredmény: {r.adozott_eredmeny:,.0f}")
            if r.sajat_toke is not None:
                lines.append(f"    Saját tőke: {r.sajat_toke:,.0f}")
            if r.eszkozok_osszesen is not None:
                lines.append(f"    Eszközök összesen: {r.eszkozok_osszesen:,.0f}")
            if r.ebitda is not None:
                lines.append(f"    EBITDA: {r.ebitda:,.0f}")
            if r.roe is not None:
                lines.append(f"    ROE: {r.roe:.1f}%")

    # Officers
    officers = (
        db.query(Officer)
        .filter(Officer.company_id == company.id)
        .all()
    )
    if officers:
        lines.append("")
        lines.append("Tisztségviselők:")
        for o in officers:
            entry = f"  - {o.nev}"
            if o.titulus:
                entry += f" ({o.titulus})"
            lines.append(entry)

    return "\n".join(lines)


def build_system_prompt(context: str) -> str:
    """Build the system prompt for Claude."""
    base = (
        "Te a Cégverzum AI asszisztense vagy. A Cégverzum egy magyar céginformációs rendszer, "
        "amely a NAV, Cégbíróság és KSH adataiból gyűjti össze a cégek adatait.\n\n"
        "Feladatod:\n"
        "- Magyarul válaszolj a felhasználó kérdéseire.\n"
        "- Ha kapsz cégadatokat kontextusként, azok alapján válaszolj pontosan és tényszerűen.\n"
        "- Ha nincs elég adat a válaszhoz, jelezd, hogy az adatbázisban nem található elegendő információ.\n"
        "- Légy tömör és informatív. Számokat formázz olvashatóan.\n"
        "- Ha kockázati jelzések vannak (felszámolás, csőd stb.), mindig hívd fel rá a figyelmet.\n"
        "- Ne találj ki adatokat — csak az adatbázisban tárolt információkra hivatkozz.\n"
    )
    if context:
        base += f"\nA felhasználó által kérdezett cég adatai:\n\n{context}\n"
    return base


def stream_response(
    messages: list[dict[str, str]],
    context: str,
) -> Generator[str, None, None]:
    """Stream Claude's response token by token."""
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    system_prompt = build_system_prompt(context)

    with client.messages.stream(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text
