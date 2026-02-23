from pydantic import BaseModel


class FinancialReportRead(BaseModel):
    id: int
    company_id: int
    ev: int
    netto_arbevetel: float | None
    uzemi_eredmeny: float | None
    adozas_elotti_eredmeny: float | None
    adozott_eredmeny: float | None
    eszkozok_osszesen: float | None
    befektetett_eszkozok: float | None
    forgoeszkozok: float | None
    penzeszkozok: float | None
    aktiv_idobeli_elhatarolasok: float | None
    sajat_toke: float | None
    celtaralekok: float | None
    kotelezettsegek: float | None
    adofizetesi_kotelezettseg: float | None
    rovid_lejaratu_kotelezettsegek: float | None
    hosszu_lejaratu_kotelezettsegek: float | None
    passziv_idobeli_elhatarolasok: float | None
    eladosodottsag_foka: float | None
    eladosodottsag_merteke: float | None
    arbevetel_aranyos_eredmeny: float | None
    likviditasi_gyorsrata: float | None
    ebitda: float | None
    roe: float | None

    model_config = {"from_attributes": True}


class OfficerRead(BaseModel):
    id: int
    company_id: int
    nev: str
    anyja_neve: str | None
    titulus: str | None

    model_config = {"from_attributes": True}
