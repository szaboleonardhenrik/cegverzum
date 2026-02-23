from datetime import date, datetime

from pydantic import BaseModel, field_validator


class MarketingExportRequest(BaseModel):
    ids: list[int]

    @field_validator("ids")
    @classmethod
    def validate_ids(cls, v: list[int]) -> list[int]:
        if len(v) == 0:
            raise ValueError("ids list must not be empty")
        if len(v) > 5000:
            raise ValueError("ids list must not exceed 5000 items")
        return v


class CompanyPublicItem(BaseModel):
    id: int
    nev: str
    szekhely: str | None
    statusz: str
    cegforma: str | None

    model_config = {"from_attributes": True}


class CompanyListItem(BaseModel):
    id: int
    nev: str
    adoszam: str | None
    cegjegyzekszam: str | None
    szekhely: str | None
    teaor_kod: str | None
    statusz: str
    cegforma: str | None
    alapitas_datuma: date | None
    fotevekenyseg: str | None
    letszam_kategoria: str | None
    felszamolas: bool | None
    csodeljras: bool | None
    vegelszamolas: bool | None
    kenyszertorles: bool | None

    model_config = {"from_attributes": True}


class CompanyRead(BaseModel):
    id: int
    nev: str
    rovidnev: str | None
    adoszam: str | None
    cegjegyzekszam: str | None
    szekhely: str | None
    teaor_kod: str | None
    teaor_megnevezes: str | None
    alapitas_datuma: date | None
    statusz: str
    cegforma: str | None
    fotevekenyseg: str | None
    letszam_kategoria: str | None
    jegyzett_toke: str | None
    jegyzett_toke_penznem: str | None
    email: str | None
    telefon: str | None
    weboldal: str | None
    afa_alany: bool | None
    nav_torlesve: bool | None
    nav_kockazat: str | None
    felszamolas: bool | None
    csodeljras: bool | None
    vegelszamolas: bool | None
    kenyszertorles: bool | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
