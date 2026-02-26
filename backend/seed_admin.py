"""Create the initial admin user and seed company data. Run: python seed_admin.py"""
from datetime import date, datetime, timezone

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.company import Company
from app.models.financial import FinancialReport, Officer
from app.models.module import Module, UserModule
from app.models.notification import Notification
from app.models.watchlist import WatchlistItem  # noqa: F401 — ensure table is created
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Admin user ---
admin = db.query(User).filter(User.email == "admin@cegverzum.hu").first()
if not admin:
    admin = User(
        email="admin@cegverzum.hu",
        hashed_password=hash_password("admin123"),
        is_admin=True,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("Admin created: admin@cegverzum.hu / admin123")
else:
    print("Admin already exists")


def seed_company(data: dict, financials_data: list, officers_data: list):
    """Seed a single company with financials and officers."""
    existing = db.query(Company).filter(Company.adoszam == data["adoszam"]).first()
    if existing:
        print(f"  Company already exists: {data['nev']}")
        return existing

    company = Company(**data)
    db.add(company)
    db.commit()
    print(f"  Company seeded: {data['nev']}")

    for f in financials_data:
        db.add(FinancialReport(company_id=company.id, **f))
    if financials_data:
        db.commit()
        print(f"    {len(financials_data)} financial reports seeded")

    for o in officers_data:
        db.add(Officer(company_id=company.id, **o))
    if officers_data:
        db.commit()
        print(f"    {len(officers_data)} officers seeded")

    return company


# ═══════════════════════════════════════════════════════════════
# COMPANY 1: Tudatos Diák Iskolaszövetkezet
# ═══════════════════════════════════════════════════════════════
print("\n--- Company 1 ---")
seed_company(
    data=dict(
        nev="Tudatos Diák Iskolaszövetkezet",
        rovidnev="Tudatos Diák Iskolaszövetkezet",
        adoszam="26777748-2-43",
        cegjegyzekszam="01 02 054584",
        szekhely="1117 Budapest, Dombóvári út 9. 4. em.",
        teaor_kod="8299",
        teaor_megnevezes="M.n.s. egyéb üzletmenetet támogató szolgáltatás",
        alapitas_datuma=date(2019, 5, 22),
        statusz="aktív",
        cegforma="Szövetkezet",
        fotevekenyseg="8299 M.n.s. egyéb üzletmenetet támogató szolgáltatás",
        letszam_kategoria="5 fő",
        afa_alany=True,
        nav_torlesve=False,
        nav_kockazat="AVG",
        felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False,
    ),
    financials_data=[
        dict(ev=2020, netto_arbevetel=34303, uzemi_eredmeny=-594, adozas_elotti_eredmeny=-594, adozott_eredmeny=-594,
             eszkozok_osszesen=2509, befektetett_eszkozok=0, forgoeszkozok=2460, penzeszkozok=1579,
             aktiv_idobeli_elhatarolasok=49, sajat_toke=-896, celtaralekok=0, kotelezettsegek=3405,
             adofizetesi_kotelezettseg=0, rovid_lejaratu_kotelezettsegek=905, hosszu_lejaratu_kotelezettsegek=2500,
             passziv_idobeli_elhatarolasok=0, eladosodottsag_foka=1.36, eladosodottsag_merteke=-3.80,
             arbevetel_aranyos_eredmeny=-1.73, likviditasi_gyorsrata=2.72, ebitda=-399, roe=0.66),
        dict(ev=2021, netto_arbevetel=32159, uzemi_eredmeny=1055, adozas_elotti_eredmeny=1055, adozott_eredmeny=1055,
             eszkozok_osszesen=11357, befektetett_eszkozok=0, forgoeszkozok=11344, penzeszkozok=3891,
             aktiv_idobeli_elhatarolasok=13, sajat_toke=159, celtaralekok=0, kotelezettsegek=11153,
             adofizetesi_kotelezettseg=0, rovid_lejaratu_kotelezettsegek=8653, hosszu_lejaratu_kotelezettsegek=2500,
             passziv_idobeli_elhatarolasok=45, eladosodottsag_foka=0.98, eladosodottsag_merteke=70.14,
             arbevetel_aranyos_eredmeny=3.28, likviditasi_gyorsrata=1.31, ebitda=1161, roe=6.64),
        dict(ev=2022, netto_arbevetel=83165, uzemi_eredmeny=3301, adozas_elotti_eredmeny=3301, adozott_eredmeny=3301,
             eszkozok_osszesen=19954, befektetett_eszkozok=599, forgoeszkozok=18928, penzeszkozok=7923,
             aktiv_idobeli_elhatarolasok=427, sajat_toke=3460, celtaralekok=0, kotelezettsegek=16494,
             adofizetesi_kotelezettseg=0, rovid_lejaratu_kotelezettsegek=13994, hosszu_lejaratu_kotelezettsegek=2500,
             passziv_idobeli_elhatarolasok=0, eladosodottsag_foka=0.83, eladosodottsag_merteke=4.77,
             arbevetel_aranyos_eredmeny=3.97, likviditasi_gyorsrata=1.35, ebitda=3854, roe=0.95),
        dict(ev=2023, netto_arbevetel=240183, uzemi_eredmeny=1499, adozas_elotti_eredmeny=1090, adozott_eredmeny=375,
             eszkozok_osszesen=69555, befektetett_eszkozok=2721, forgoeszkozok=66146, penzeszkozok=8441,
             aktiv_idobeli_elhatarolasok=688, sajat_toke=3835, celtaralekok=0, kotelezettsegek=65720,
             adofizetesi_kotelezettseg=715, rovid_lejaratu_kotelezettsegek=49087, hosszu_lejaratu_kotelezettsegek=16633,
             passziv_idobeli_elhatarolasok=0, eladosodottsag_foka=0.94, eladosodottsag_merteke=17.14,
             arbevetel_aranyos_eredmeny=0.16, likviditasi_gyorsrata=1.35, ebitda=1971, roe=0.10),
        dict(ev=2024, netto_arbevetel=723311, uzemi_eredmeny=3863, adozas_elotti_eredmeny=2750, adozott_eredmeny=1654,
             eszkozok_osszesen=160505, befektetett_eszkozok=3377, forgoeszkozok=156333, penzeszkozok=5194,
             aktiv_idobeli_elhatarolasok=795, sajat_toke=5489, celtaralekok=0, kotelezettsegek=154965,
             adofizetesi_kotelezettseg=1096, rovid_lejaratu_kotelezettsegek=144492, hosszu_lejaratu_kotelezettsegek=10473,
             passziv_idobeli_elhatarolasok=51, eladosodottsag_foka=0.97, eladosodottsag_merteke=28.23,
             arbevetel_aranyos_eredmeny=0.23, likviditasi_gyorsrata=1.08, ebitda=5558, roe=0.30),
    ],
    officers_data=[
        dict(nev="Szabó Leonárd Henrik", anyja_neve="Jakab Enikő", titulus="igazgatósági tag (vezető tisztségviselő)"),
        dict(nev="Varga Gábor", anyja_neve="Balog Katalin", titulus="igazgatósági tag (vezető tisztségviselő)"),
        dict(nev="Yilmaz Attila Zoltán", anyja_neve="Katona Éva", titulus="igazgatóság elnöke (vezető tisztségviselő)"),
    ],
)

# ═══════════════════════════════════════════════════════════════
# COMPANY 2: T-Cloud Solutions Kft.
# ═══════════════════════════════════════════════════════════════
print("\n--- Company 2 ---")
seed_company(
    data=dict(
        nev="T-Cloud Solutions Kft.",
        rovidnev="T-Cloud Solutions Kft.",
        adoszam="32710148-2-43",
        cegjegyzekszam="01 09 438601",
        szekhely="1114 Budapest, Bukarest utca 17. 4. em. 16. ajtó",
        teaor_kod="6310",
        teaor_megnevezes="Számítástechnikai infrastruktúra, adatfeldolgozás, tárhelyszolgáltatás és kapcsolódó szolgáltatások",
        alapitas_datuma=date(2024, 12, 10),
        statusz="aktív",
        cegforma="Kft.",
        fotevekenyseg="6310 Számítástechnikai infrastruktúra, adatfeldolgozás, tárhelyszolgáltatás",
        letszam_kategoria="Mikrovállalkozás",
        afa_alany=True,
        nav_torlesve=False,
        nav_kockazat="AVG",
        felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False,
    ),
    financials_data=[
        dict(ev=2024, netto_arbevetel=500, uzemi_eredmeny=485, adozas_elotti_eredmeny=485, adozott_eredmeny=441,
             eszkozok_osszesen=3635, befektetett_eszkozok=0, forgoeszkozok=3635, penzeszkozok=3000,
             aktiv_idobeli_elhatarolasok=0, sajat_toke=3441, celtaralekok=0, kotelezettsegek=194,
             adofizetesi_kotelezettseg=44, rovid_lejaratu_kotelezettsegek=194, hosszu_lejaratu_kotelezettsegek=0,
             passziv_idobeli_elhatarolasok=0, eladosodottsag_foka=0.05, eladosodottsag_merteke=0.06,
             arbevetel_aranyos_eredmeny=88.20, likviditasi_gyorsrata=18.74, ebitda=485, roe=0.13),
    ],
    officers_data=[
        dict(nev="Eltigani Amir Abdelmagid", anyja_neve="Lénárt Eszter", titulus="ügyvezető (vezető tisztségviselő)"),
        dict(nev="Yilmaz Attila Zoltán", anyja_neve="Katona Éva", titulus="ügyvezető (vezető tisztségviselő)"),
    ],
)

# ═══════════════════════════════════════════════════════════════
# COMPANY 3: Tudatos Dolgozók Szociális Szövetkezet
# ═══════════════════════════════════════════════════════════════
print("\n--- Company 3 ---")
seed_company(
    data=dict(
        nev="Tudatos Dolgozók Szociális Szövetkezet",
        rovidnev="Tudatos Dolgozók Szociális Szövetkezet",
        adoszam="32644953-2-13",
        cegjegyzekszam="13 02 051561",
        szekhely="2161 Csomád, Kossuth Lajos út 103.",
        teaor_kod="7820",
        teaor_megnevezes="Munkaerő-kölcsönzés, egyéb emberierőforrás-ellátás, -gazdálkodás",
        alapitas_datuma=date(2024, 8, 27),
        statusz="aktív",
        cegforma="Szövetkezet",
        fotevekenyseg="7820 Munkaerő-kölcsönzés, egyéb emberierőforrás-ellátás, -gazdálkodás",
        letszam_kategoria="3 fő",
        afa_alany=True,
        nav_torlesve=False,
        nav_kockazat="C",
        felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False,
    ),
    financials_data=[
        dict(ev=2024, netto_arbevetel=1300, uzemi_eredmeny=-627, adozas_elotti_eredmeny=-890, adozott_eredmeny=-892,
             eszkozok_osszesen=18060, befektetett_eszkozok=615, forgoeszkozok=17445, penzeszkozok=15794,
             aktiv_idobeli_elhatarolasok=0, sajat_toke=-812, celtaralekok=0, kotelezettsegek=18609,
             adofizetesi_kotelezettseg=2, rovid_lejaratu_kotelezettsegek=18609, hosszu_lejaratu_kotelezettsegek=0,
             passziv_idobeli_elhatarolasok=263, eladosodottsag_foka=1.03, eladosodottsag_merteke=-22.92,
             arbevetel_aranyos_eredmeny=-68.62, likviditasi_gyorsrata=0.94, ebitda=-620, roe=1.10),
    ],
    officers_data=[
        dict(nev="Szabó Leonárd Henrik", anyja_neve="Jakab Enikő", titulus="igazgató elnök (vezető tisztségviselő)"),
    ],
)

# ═══════════════════════════════════════════════════════════════
# COMPANY 4: TERRA-SZ Ipari, Szolgáltató és Kereskedelmi Bt.
# ═══════════════════════════════════════════════════════════════
print("\n--- Company 4 ---")
seed_company(
    data=dict(
        nev="TERRA-SZ Ipari, Szolgáltató és Kereskedelmi Bt.",
        rovidnev="TERRA-SZ Bt.",
        adoszam="22157090-2-43",
        cegjegyzekszam="01 06 768939",
        szekhely="1114 Budapest, Móricz Zsigmond körtér 3/b.",
        teaor_kod="5611",
        teaor_megnevezes="Éttermi vendéglátás",
        alapitas_datuma=date(2005, 3, 16),
        statusz="aktív",
        cegforma="Bt.",
        fotevekenyseg="5611 Éttermi vendéglátás",
        letszam_kategoria="1 fő",
        afa_alany=True,
        nav_torlesve=False,
        nav_kockazat="B",
        felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False,
    ),
    financials_data=[
        dict(ev=2020, netto_arbevetel=10334, uzemi_eredmeny=-2060, adozas_elotti_eredmeny=-2060, adozott_eredmeny=-2080,
             eszkozok_osszesen=1438, befektetett_eszkozok=503, forgoeszkozok=883, penzeszkozok=85,
             aktiv_idobeli_elhatarolasok=52, sajat_toke=-9873, celtaralekok=0, kotelezettsegek=11297,
             adofizetesi_kotelezettseg=20, rovid_lejaratu_kotelezettsegek=2087, hosszu_lejaratu_kotelezettsegek=9210,
             passziv_idobeli_elhatarolasok=14, eladosodottsag_foka=7.86, eladosodottsag_merteke=-1.14,
             arbevetel_aranyos_eredmeny=-20.13, likviditasi_gyorsrata=0.10, ebitda=-1928, roe=0.21),
        dict(ev=2021, netto_arbevetel=12710, uzemi_eredmeny=207, adozas_elotti_eredmeny=207, adozott_eredmeny=182,
             eszkozok_osszesen=1285, befektetett_eszkozok=433, forgoeszkozok=852, penzeszkozok=212,
             aktiv_idobeli_elhatarolasok=0, sajat_toke=-9691, celtaralekok=0, kotelezettsegek=10928,
             adofizetesi_kotelezettseg=25, rovid_lejaratu_kotelezettsegek=790, hosszu_lejaratu_kotelezettsegek=10138,
             passziv_idobeli_elhatarolasok=48, eladosodottsag_foka=8.50, eladosodottsag_merteke=-1.13,
             arbevetel_aranyos_eredmeny=1.43, likviditasi_gyorsrata=0.46, ebitda=288, roe=-0.02),
        dict(ev=2022, netto_arbevetel=18934, uzemi_eredmeny=1624, adozas_elotti_eredmeny=1624, adozott_eredmeny=1548,
             eszkozok_osszesen=1779, befektetett_eszkozok=367, forgoeszkozok=1408, penzeszkozok=562,
             aktiv_idobeli_elhatarolasok=4, sajat_toke=-8143, celtaralekok=0, kotelezettsegek=9785,
             adofizetesi_kotelezettseg=76, rovid_lejaratu_kotelezettsegek=607, hosszu_lejaratu_kotelezettsegek=9178,
             passziv_idobeli_elhatarolasok=137, eladosodottsag_foka=5.50, eladosodottsag_merteke=-1.20,
             arbevetel_aranyos_eredmeny=8.18, likviditasi_gyorsrata=1.76, ebitda=1866, roe=-0.19),
        dict(ev=2023, netto_arbevetel=23181, uzemi_eredmeny=2127, adozas_elotti_eredmeny=2127, adozott_eredmeny=2030,
             eszkozok_osszesen=1593, befektetett_eszkozok=301, forgoeszkozok=1290, penzeszkozok=1091,
             aktiv_idobeli_elhatarolasok=2, sajat_toke=-6113, celtaralekok=0, kotelezettsegek=7678,
             adofizetesi_kotelezettseg=97, rovid_lejaratu_kotelezettsegek=840, hosszu_lejaratu_kotelezettsegek=6838,
             passziv_idobeli_elhatarolasok=28, eladosodottsag_foka=4.82, eladosodottsag_merteke=-1.26,
             arbevetel_aranyos_eredmeny=8.76, likviditasi_gyorsrata=1.39, ebitda=2900, roe=-0.33),
        dict(ev=2024, netto_arbevetel=23541, uzemi_eredmeny=1122, adozas_elotti_eredmeny=1122, adozott_eredmeny=1072,
             eszkozok_osszesen=2228, befektetett_eszkozok=427, forgoeszkozok=1777, penzeszkozok=925,
             aktiv_idobeli_elhatarolasok=24, sajat_toke=-5041, celtaralekok=0, kotelezettsegek=7185,
             adofizetesi_kotelezettseg=50, rovid_lejaratu_kotelezettsegek=963, hosszu_lejaratu_kotelezettsegek=6222,
             passziv_idobeli_elhatarolasok=84, eladosodottsag_foka=3.22, eladosodottsag_merteke=-1.43,
             arbevetel_aranyos_eredmeny=4.55, likviditasi_gyorsrata=1.69, ebitda=1621, roe=-0.21),
    ],
    officers_data=[
        dict(nev="Szabó Tamás", anyja_neve="Body Anna", titulus="üzletvezetésre jogosult tag (vezető tisztségviselő)"),
    ],
)

# ═══════════════════════════════════════════════════════════════
# COMPANY 5: T-DIGITAL Solutions Kft.
# ═══════════════════════════════════════════════════════════════
print("\n--- Company 5 ---")
seed_company(
    data=dict(
        nev="T-DIGITAL Solutions Kft.",
        rovidnev="T-DIGITAL Solutions Kft.",
        adoszam="32526620-2-43",
        cegjegyzekszam="01 09 428831",
        szekhely="1117 Budapest, Nándorfejérvári út 32. 1. em. 4. ajtó",
        teaor_kod="7020",
        teaor_megnevezes="Üzletviteli, egyéb üzletvezetési tanácsadás",
        alapitas_datuma=date(2024, 3, 27),
        statusz="aktív",
        cegforma="Kft.",
        fotevekenyseg="7020 Üzletviteli, egyéb üzletvezetési tanácsadás",
        letszam_kategoria="2 fő",
        afa_alany=True,
        nav_torlesve=False,
        nav_kockazat="C",
        felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False,
    ),
    financials_data=[
        dict(ev=2024, netto_arbevetel=54499, uzemi_eredmeny=-5077, adozas_elotti_eredmeny=-5182, adozott_eredmeny=-5459,
             eszkozok_osszesen=25714, befektetett_eszkozok=4163, forgoeszkozok=10646, penzeszkozok=575,
             aktiv_idobeli_elhatarolasok=10905, sajat_toke=-3856, celtaralekok=0, kotelezettsegek=29466,
             adofizetesi_kotelezettseg=277, rovid_lejaratu_kotelezettsegek=29466, hosszu_lejaratu_kotelezettsegek=0,
             passziv_idobeli_elhatarolasok=104, eladosodottsag_foka=1.15, eladosodottsag_merteke=-7.64,
             arbevetel_aranyos_eredmeny=-10.02, likviditasi_gyorsrata=0.36, ebitda=-4544, roe=1.42),
    ],
    officers_data=[
        dict(nev="Szabó Leonárd Henrik", anyja_neve="Jakab Enikő", titulus="ügyvezető (vezető tisztségviselő)"),
        dict(nev="Yilmaz Attila Zoltán", anyja_neve="Katona Éva", titulus="ügyvezető (vezető tisztségviselő)"),
    ],
)

# --- Seed modules ---
if db.query(Module).count() == 0:
    modules = [
        Module(slug="ceginformacio", display_name="Céginformáció", description="Cégadatok, beszámolók, tisztségviselők lekérdezése"),
        Module(slug="marketing_db", display_name="Marketing adatbázis", description="Célzott céglista készítés marketing célokra"),
        Module(slug="piacterkep", display_name="Piactérkép", description="Iparági és piaci elemzések, versenytárs-feltérképezés"),
        Module(slug="api_osszekottetes", display_name="API összeköttetés", description="REST API hozzáférés külső rendszerek integrációjához"),
        Module(slug="cegfigyeles", display_name="Cégfigyelés", description="Automatikus értesítések cégadatok változásáról"),
        Module(slug="penzugyi_elemzes", display_name="Pénzügyi elemzés", description="Részletes pénzügyi mutatók és trendek elemzése"),
        Module(slug="kockazatelemzes", display_name="Kockázatelemzés", description="Kockázati scoring és fizetőképességi előrejelzés"),
    ]
    db.add_all(modules)
    db.commit()
    print("\nModules seeded (7 modules)")
else:
    print("\nModules already exist")

# --- Seed sample notifications for admin ---
if db.query(Notification).filter(Notification.user_id == admin.id).count() == 0:
    notifs = [
        Notification(user_id=admin.id, title="Üdvözöljük a Cégverzumban!", message="Fiókja sikeresen létrehozva. Fedezze fel a funkciókat!", category="system"),
        Notification(user_id=admin.id, title="Új cégadat elérhető", message="Tudatos Diák Iskolaszövetkezet 2024-es beszámolója feltöltve.", category="company"),
        Notification(user_id=admin.id, title="T-DIGITAL Solutions Kft. hozzáadva", message="Új cég került az adatbázisba: T-DIGITAL Solutions Kft.", category="company"),
        Notification(user_id=admin.id, title="NAV API integráció", message="A NAV API visszajelzésre vár. Értesítjük, ha elérhető.", category="system"),
        Notification(user_id=admin.id, title="TERRA-SZ Bt. beszámoló", message="TERRA-SZ Bt. 2024-es pénzügyi beszámolója elérhető.", category="company"),
    ]
    db.add_all(notifs)
    db.commit()
    print("Sample notifications seeded (5)")
else:
    print("Notifications already exist")

db.close()
print("\nDone!")
