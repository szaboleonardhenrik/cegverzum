from datetime import date, datetime

from sqlalchemy import String, Boolean, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    nev: Mapped[str] = mapped_column(String(500), index=True)
    rovidnev: Mapped[str | None] = mapped_column(String(500))
    adoszam: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    cegjegyzekszam: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    szekhely: Mapped[str | None] = mapped_column(String(500))
    teaor_kod: Mapped[str | None] = mapped_column(String(10))
    teaor_megnevezes: Mapped[str | None] = mapped_column(String(500))
    alapitas_datuma: Mapped[date | None] = mapped_column(Date)
    statusz: Mapped[str] = mapped_column(String(50), default="aktív")

    cegforma: Mapped[str | None] = mapped_column(String(100))
    fotevekenyseg: Mapped[str | None] = mapped_column(String(500))
    letszam_kategoria: Mapped[str | None] = mapped_column(String(50))
    jegyzett_toke: Mapped[str | None] = mapped_column(String(100))
    jegyzett_toke_penznem: Mapped[str | None] = mapped_column(String(10))
    email: Mapped[str | None] = mapped_column(String(320))
    telefon: Mapped[str | None] = mapped_column(String(50))
    weboldal: Mapped[str | None] = mapped_column(String(500))

    # NAV
    afa_alany: Mapped[bool | None] = mapped_column(Boolean, default=None)
    nav_torlesve: Mapped[bool | None] = mapped_column(Boolean, default=None)
    nav_kockazat: Mapped[str | None] = mapped_column(String(50))

    # Negatív események
    felszamolas: Mapped[bool | None] = mapped_column(Boolean, default=None)
    csodeljras: Mapped[bool | None] = mapped_column(Boolean, default=None)
    vegelszamolas: Mapped[bool | None] = mapped_column(Boolean, default=None)
    kenyszertorles: Mapped[bool | None] = mapped_column(Boolean, default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
