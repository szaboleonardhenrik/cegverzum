from datetime import datetime

from sqlalchemy import Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FinancialReport(Base):
    __tablename__ = "financial_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id"), index=True)
    ev: Mapped[int] = mapped_column(Integer)

    # Eredménykimutatás (ezer HUF)
    netto_arbevetel: Mapped[float | None] = mapped_column(Float)
    uzemi_eredmeny: Mapped[float | None] = mapped_column(Float)
    adozas_elotti_eredmeny: Mapped[float | None] = mapped_column(Float)
    adozott_eredmeny: Mapped[float | None] = mapped_column(Float)

    # Mérleg - Eszközök (ezer HUF)
    eszkozok_osszesen: Mapped[float | None] = mapped_column(Float)
    befektetett_eszkozok: Mapped[float | None] = mapped_column(Float)
    forgoeszkozok: Mapped[float | None] = mapped_column(Float)
    penzeszkozok: Mapped[float | None] = mapped_column(Float)
    aktiv_idobeli_elhatarolasok: Mapped[float | None] = mapped_column(Float)

    # Mérleg - Források (ezer HUF)
    sajat_toke: Mapped[float | None] = mapped_column(Float)
    celtaralekok: Mapped[float | None] = mapped_column(Float)
    kotelezettsegek: Mapped[float | None] = mapped_column(Float)
    adofizetesi_kotelezettseg: Mapped[float | None] = mapped_column(Float)
    rovid_lejaratu_kotelezettsegek: Mapped[float | None] = mapped_column(Float)
    hosszu_lejaratu_kotelezettsegek: Mapped[float | None] = mapped_column(Float)
    passziv_idobeli_elhatarolasok: Mapped[float | None] = mapped_column(Float)

    # Pénzügyi mutatók
    eladosodottsag_foka: Mapped[float | None] = mapped_column(Float)
    eladosodottsag_merteke: Mapped[float | None] = mapped_column(Float)
    arbevetel_aranyos_eredmeny: Mapped[float | None] = mapped_column(Float)
    likviditasi_gyorsrata: Mapped[float | None] = mapped_column(Float)
    ebitda: Mapped[float | None] = mapped_column(Float)
    roe: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Officer(Base):
    __tablename__ = "officers"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id"), index=True)
    nev: Mapped[str] = mapped_column(String(300))
    anyja_neve: Mapped[str | None] = mapped_column(String(300))
    titulus: Mapped[str | None] = mapped_column(String(200))

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
