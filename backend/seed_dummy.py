"""Seed dummy companies, financial data, officers, and users."""
from datetime import date
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.company import Company
from app.models.financial import FinancialReport, Officer
from app.models.watchlist import WatchlistItem  # noqa: F401
from app.models.module import Module, UserModule  # noqa: F401
from app.models.notification import Notification
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ═══════════════════════════════════════════════════════════
# GALGÓCZI ANNA — full access user
# ═══════════════════════════════════════════════════════════
anna = db.query(User).filter(User.email == "galgoczi.anna@cegverzum.hu").first()
if not anna:
    anna = User(
        email="galgoczi.anna@cegverzum.hu",
        hashed_password=hash_password("Anna2026!"),
        full_name="Galgóczi Anna",
        is_admin=True,
        is_active=True,
        package="enterprise",
        monthly_price=0,
    )
    db.add(anna)
    db.commit()
    db.refresh(anna)
    print("Galgóczi Anna created: galgoczi.anna@cegverzum.hu / Anna2026!")
else:
    print("Galgóczi Anna already exists")


# ═══════════════════════════════════════════════════════════
# DUMMY COMPANIES
# ═══════════════════════════════════════════════════════════
def seed_company(data, financials_data=None, officers_data=None):
    existing = db.query(Company).filter(Company.adoszam == data["adoszam"]).first()
    if existing:
        return existing
    company = Company(**data)
    db.add(company)
    db.commit()
    db.refresh(company)
    print(f"  + {data['nev']}")
    for f in (financials_data or []):
        db.add(FinancialReport(company_id=company.id, **f))
    for o in (officers_data or []):
        db.add(Officer(company_id=company.id, **o))
    if financials_data or officers_data:
        db.commit()
    return company


print("\n--- Seeding companies ---")

seed_company(
    dict(nev="Budapesti Informatikai Kft.", rovidnev="BI Kft.", adoszam="11223344-2-41",
         cegjegyzekszam="01-09-100001", szekhely="1013 Budapest, Attila út 20.",
         teaor_kod="6201", teaor_megnevezes="Számítógépes programozás",
         alapitas_datuma=date(2015, 3, 10), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="6201 Számítógépes programozás", letszam_kategoria="25 fő",
         jegyzett_toke="3 000 000", jegyzett_toke_penznem="HUF",
         email="info@bi-kft.hu", telefon="+36-1-555-0001", weboldal="https://bi-kft.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2022, netto_arbevetel=450000, uzemi_eredmeny=85000, adozas_elotti_eredmeny=82000, adozott_eredmeny=67000,
          eszkozok_osszesen=320000, befektetett_eszkozok=45000, forgoeszkozok=270000, penzeszkozok=120000,
          aktiv_idobeli_elhatarolasok=5000, sajat_toke=180000, celtaralekok=0, kotelezettsegek=135000,
          adofizetesi_kotelezettseg=15000, rovid_lejaratu_kotelezettsegek=95000, hosszu_lejaratu_kotelezettsegek=40000,
          passziv_idobeli_elhatarolasok=5000, eladosodottsag_foka=0.42, eladosodottsag_merteke=0.75,
          arbevetel_aranyos_eredmeny=14.89, likviditasi_gyorsrata=2.84, ebitda=95000, roe=0.37),
     dict(ev=2023, netto_arbevetel=520000, uzemi_eredmeny=98000, adozas_elotti_eredmeny=95000, adozott_eredmeny=78000,
          eszkozok_osszesen=380000, befektetett_eszkozok=52000, forgoeszkozok=320000, penzeszkozok=145000,
          aktiv_idobeli_elhatarolasok=8000, sajat_toke=250000, celtaralekok=0, kotelezettsegek=125000,
          adofizetesi_kotelezettseg=18000, rovid_lejaratu_kotelezettsegek=85000, hosszu_lejaratu_kotelezettsegek=40000,
          passziv_idobeli_elhatarolasok=5000, eladosodottsag_foka=0.33, eladosodottsag_merteke=0.50,
          arbevetel_aranyos_eredmeny=15.0, likviditasi_gyorsrata=3.76, ebitda=110000, roe=0.31),
     dict(ev=2024, netto_arbevetel=610000, uzemi_eredmeny=115000, adozas_elotti_eredmeny=112000, adozott_eredmeny=92000,
          eszkozok_osszesen=450000, befektetett_eszkozok=60000, forgoeszkozok=380000, penzeszkozok=170000,
          aktiv_idobeli_elhatarolasok=10000, sajat_toke=335000, celtaralekok=0, kotelezettsegek=110000,
          adofizetesi_kotelezettseg=20000, rovid_lejaratu_kotelezettsegek=70000, hosszu_lejaratu_kotelezettsegek=40000,
          passziv_idobeli_elhatarolasok=5000, eladosodottsag_foka=0.24, eladosodottsag_merteke=0.33,
          arbevetel_aranyos_eredmeny=15.08, likviditasi_gyorsrata=5.43, ebitda=130000, roe=0.27)],
    [dict(nev="Kovács Péter", anyja_neve="Nagy Éva", titulus="ügyvezető (vezető tisztségviselő)"),
     dict(nev="Horváth Zoltán", anyja_neve="Tóth Mária", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Dunántúli Agrár Zrt.", rovidnev="Dunántúli Agrár Zrt.", adoszam="22334455-2-07",
         cegjegyzekszam="07-10-200002", szekhely="8200 Veszprém, Kossuth utca 15.",
         teaor_kod="0111", teaor_megnevezes="Gabonaféle (kivéve: rizs), hüvelyes növény, olajos mag termesztése",
         alapitas_datuma=date(2002, 7, 1), statusz="aktív", cegforma="Zrt.",
         fotevekenyseg="0111 Gabonaféle termesztése", letszam_kategoria="120 fő",
         jegyzett_toke="500 000 000", jegyzett_toke_penznem="HUF",
         email="info@dunantuliagrarzrt.hu", telefon="+36-88-555-100",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2023, netto_arbevetel=2800000, uzemi_eredmeny=320000, adozas_elotti_eredmeny=300000, adozott_eredmeny=250000,
          eszkozok_osszesen=3500000, befektetett_eszkozok=2100000, forgoeszkozok=1350000, penzeszkozok=200000,
          aktiv_idobeli_elhatarolasok=50000, sajat_toke=2200000, celtaralekok=0, kotelezettsegek=1250000,
          adofizetesi_kotelezettseg=45000, rovid_lejaratu_kotelezettsegek=450000, hosszu_lejaratu_kotelezettsegek=800000,
          passziv_idobeli_elhatarolasok=50000, eladosodottsag_foka=0.36, eladosodottsag_merteke=0.57,
          arbevetel_aranyos_eredmeny=8.93, likviditasi_gyorsrata=3.0, ebitda=520000, roe=0.11),
     dict(ev=2024, netto_arbevetel=3100000, uzemi_eredmeny=380000, adozas_elotti_eredmeny=365000, adozott_eredmeny=300000,
          eszkozok_osszesen=3800000, befektetett_eszkozok=2200000, forgoeszkozok=1500000, penzeszkozok=250000,
          aktiv_idobeli_elhatarolasok=100000, sajat_toke=2500000, celtaralekok=0, kotelezettsegek=1200000,
          adofizetesi_kotelezettseg=50000, rovid_lejaratu_kotelezettsegek=400000, hosszu_lejaratu_kotelezettsegek=800000,
          passziv_idobeli_elhatarolasok=100000, eladosodottsag_foka=0.32, eladosodottsag_merteke=0.48,
          arbevetel_aranyos_eredmeny=9.68, likviditasi_gyorsrata=3.75, ebitda=600000, roe=0.12)],
    [dict(nev="Dr. Szilágyi Tamás", anyja_neve="Farkas Anna", titulus="vezérigazgató"),
     dict(nev="Balogh Ferenc", anyja_neve="Kiss Erzsébet", titulus="igazgatósági tag")]
)

seed_company(
    dict(nev="MedPharma Gyógyszergyártó Kft.", rovidnev="MedPharma Kft.", adoszam="33445566-2-13",
         cegjegyzekszam="13-09-300003", szekhely="2100 Gödöllő, Ipar utca 8.",
         teaor_kod="2120", teaor_megnevezes="Gyógyszerkészítmény gyártása",
         alapitas_datuma=date(2010, 11, 20), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="2120 Gyógyszerkészítmény gyártása", letszam_kategoria="85 fő",
         jegyzett_toke="100 000 000", jegyzett_toke_penznem="HUF",
         email="office@medpharma.hu", telefon="+36-28-555-200", weboldal="https://medpharma.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2023, netto_arbevetel=1200000, uzemi_eredmeny=180000, adozas_elotti_eredmeny=170000, adozott_eredmeny=140000,
          eszkozok_osszesen=950000, befektetett_eszkozok=420000, forgoeszkozok=510000, penzeszkozok=80000,
          aktiv_idobeli_elhatarolasok=20000, sajat_toke=600000, celtaralekok=0, kotelezettsegek=330000,
          adofizetesi_kotelezettseg=25000, rovid_lejaratu_kotelezettsegek=180000, hosszu_lejaratu_kotelezettsegek=150000,
          passziv_idobeli_elhatarolasok=20000, eladosodottsag_foka=0.35, eladosodottsag_merteke=0.55,
          arbevetel_aranyos_eredmeny=11.67, likviditasi_gyorsrata=2.83, ebitda=230000, roe=0.23),
     dict(ev=2024, netto_arbevetel=1450000, uzemi_eredmeny=220000, adozas_elotti_eredmeny=210000, adozott_eredmeny=173000,
          eszkozok_osszesen=1100000, befektetett_eszkozok=480000, forgoeszkozok=590000, penzeszkozok=110000,
          aktiv_idobeli_elhatarolasok=30000, sajat_toke=760000, celtaralekok=0, kotelezettsegek=310000,
          adofizetesi_kotelezettseg=30000, rovid_lejaratu_kotelezettsegek=160000, hosszu_lejaratu_kotelezettsegek=150000,
          passziv_idobeli_elhatarolasok=30000, eladosodottsag_foka=0.28, eladosodottsag_merteke=0.41,
          arbevetel_aranyos_eredmeny=11.93, likviditasi_gyorsrata=3.69, ebitda=280000, roe=0.23)],
    [dict(nev="Dr. Varga László", anyja_neve="Papp Judit", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Pannónia Építőipari és Szolgáltató Kft.", rovidnev="Pannónia Épító Kft.", adoszam="44556677-2-02",
         cegjegyzekszam="02-09-400004", szekhely="7621 Pécs, Király utca 32.",
         teaor_kod="4120", teaor_megnevezes="Lakó- és nem lakó épület építése",
         alapitas_datuma=date(2008, 5, 15), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="4120 Lakó- és nem lakó épület építése", letszam_kategoria="45 fő",
         jegyzett_toke="20 000 000", jegyzett_toke_penznem="HUF",
         email="iroda@pannoniaepito.hu", telefon="+36-72-555-300",
         afa_alany=True, nav_torlesve=False, nav_kockazat="B",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2023, netto_arbevetel=890000, uzemi_eredmeny=45000, adozas_elotti_eredmeny=40000, adozott_eredmeny=33000,
          eszkozok_osszesen=520000, befektetett_eszkozok=180000, forgoeszkozok=330000, penzeszkozok=55000,
          aktiv_idobeli_elhatarolasok=10000, sajat_toke=210000, celtaralekok=0, kotelezettsegek=300000,
          adofizetesi_kotelezettseg=12000, rovid_lejaratu_kotelezettsegek=220000, hosszu_lejaratu_kotelezettsegek=80000,
          passziv_idobeli_elhatarolasok=10000, eladosodottsag_foka=0.58, eladosodottsag_merteke=1.43,
          arbevetel_aranyos_eredmeny=3.71, likviditasi_gyorsrata=1.5, ebitda=75000, roe=0.16)],
    [dict(nev="Tóth Gábor", anyja_neve="Molnár Katalin", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Green Energy Solar Zrt.", rovidnev="Green Energy Zrt.", adoszam="55667788-2-41",
         cegjegyzekszam="01-10-500005", szekhely="1116 Budapest, Fehérvári út 168.",
         teaor_kod="3511", teaor_megnevezes="Villamosenergia-termelés",
         alapitas_datuma=date(2018, 9, 1), statusz="aktív", cegforma="Zrt.",
         fotevekenyseg="3511 Villamosenergia-termelés", letszam_kategoria="35 fő",
         jegyzett_toke="200 000 000", jegyzett_toke_penznem="HUF",
         email="info@greenenergy.hu", weboldal="https://greenenergy.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2023, netto_arbevetel=680000, uzemi_eredmeny=120000, adozas_elotti_eredmeny=110000, adozott_eredmeny=90000,
          eszkozok_osszesen=1500000, befektetett_eszkozok=1100000, forgoeszkozok=380000, penzeszkozok=150000,
          aktiv_idobeli_elhatarolasok=20000, sajat_toke=900000, celtaralekok=0, kotelezettsegek=580000,
          adofizetesi_kotelezettseg=15000, rovid_lejaratu_kotelezettsegek=180000, hosszu_lejaratu_kotelezettsegek=400000,
          passziv_idobeli_elhatarolasok=20000, eladosodottsag_foka=0.39, eladosodottsag_merteke=0.64,
          arbevetel_aranyos_eredmeny=13.24, likviditasi_gyorsrata=2.11, ebitda=220000, roe=0.10),
     dict(ev=2024, netto_arbevetel=820000, uzemi_eredmeny=155000, adozas_elotti_eredmeny=148000, adozott_eredmeny=121000,
          eszkozok_osszesen=1700000, befektetett_eszkozok=1200000, forgoeszkozok=470000, penzeszkozok=200000,
          aktiv_idobeli_elhatarolasok=30000, sajat_toke=1020000, celtaralekok=0, kotelezettsegek=650000,
          adofizetesi_kotelezettseg=20000, rovid_lejaratu_kotelezettsegek=200000, hosszu_lejaratu_kotelezettsegek=450000,
          passziv_idobeli_elhatarolasok=30000, eladosodottsag_foka=0.38, eladosodottsag_merteke=0.64,
          arbevetel_aranyos_eredmeny=14.76, likviditasi_gyorsrata=2.35, ebitda=280000, roe=0.12)],
    [dict(nev="Fehér Ádám", anyja_neve="Pál Zsófia", titulus="vezérigazgató"),
     dict(nev="Német Eszter", anyja_neve="Kis Ilona", titulus="igazgatósági tag")]
)

seed_company(
    dict(nev="Alföld Trans Logisztikai Kft.", rovidnev="Alföld Trans Kft.", adoszam="66778899-2-09",
         cegjegyzekszam="09-09-600006", szekhely="4024 Debrecen, Varga utca 22.",
         teaor_kod="4941", teaor_megnevezes="Közúti áruszállítás",
         alapitas_datuma=date(2011, 2, 14), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="4941 Közúti áruszállítás", letszam_kategoria="60 fő",
         jegyzett_toke="50 000 000", jegyzett_toke_penznem="HUF",
         email="info@alfoldtrans.hu", telefon="+36-52-555-400",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=1950000, uzemi_eredmeny=95000, adozas_elotti_eredmeny=85000, adozott_eredmeny=70000,
          eszkozok_osszesen=1400000, befektetett_eszkozok=950000, forgoeszkozok=420000, penzeszkozok=80000,
          aktiv_idobeli_elhatarolasok=30000, sajat_toke=500000, celtaralekok=0, kotelezettsegek=870000,
          adofizetesi_kotelezettseg=20000, rovid_lejaratu_kotelezettsegek=370000, hosszu_lejaratu_kotelezettsegek=500000,
          passziv_idobeli_elhatarolasok=30000, eladosodottsag_foka=0.62, eladosodottsag_merteke=1.74,
          arbevetel_aranyos_eredmeny=3.59, likviditasi_gyorsrata=1.14, ebitda=195000, roe=0.14)],
    [dict(nev="Juhász István", anyja_neve="Bíró Mária", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Tiszamenti Élelmiszeripari Nyrt.", rovidnev="Tiszamenti Nyrt.", adoszam="77889900-2-16",
         cegjegyzekszam="16-10-700007", szekhely="5000 Szolnok, Tisza part 5.",
         teaor_kod="1071", teaor_megnevezes="Kenyér, friss pékáru gyártása",
         alapitas_datuma=date(1995, 1, 1), statusz="aktív", cegforma="Nyrt.",
         fotevekenyseg="1071 Kenyér, friss pékáru gyártása", letszam_kategoria="250 fő",
         jegyzett_toke="1 000 000 000", jegyzett_toke_penznem="HUF",
         email="info@tiszamenti.hu", weboldal="https://tiszamenti.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2022, netto_arbevetel=5200000, uzemi_eredmeny=420000, adozas_elotti_eredmeny=400000, adozott_eredmeny=330000,
          eszkozok_osszesen=4500000, befektetett_eszkozok=2800000, forgoeszkozok=1600000, penzeszkozok=300000,
          aktiv_idobeli_elhatarolasok=100000, sajat_toke=2800000, celtaralekok=0, kotelezettsegek=1600000,
          adofizetesi_kotelezettseg=60000, rovid_lejaratu_kotelezettsegek=600000, hosszu_lejaratu_kotelezettsegek=1000000,
          passziv_idobeli_elhatarolasok=100000, eladosodottsag_foka=0.36, eladosodottsag_merteke=0.57,
          arbevetel_aranyos_eredmeny=6.35, likviditasi_gyorsrata=2.67, ebitda=650000, roe=0.12),
     dict(ev=2023, netto_arbevetel=5800000, uzemi_eredmeny=480000, adozas_elotti_eredmeny=460000, adozott_eredmeny=378000,
          eszkozok_osszesen=4900000, befektetett_eszkozok=3000000, forgoeszkozok=1800000, penzeszkozok=350000,
          aktiv_idobeli_elhatarolasok=100000, sajat_toke=3150000, celtaralekok=0, kotelezettsegek=1650000,
          adofizetesi_kotelezettseg=70000, rovid_lejaratu_kotelezettsegek=650000, hosszu_lejaratu_kotelezettsegek=1000000,
          passziv_idobeli_elhatarolasok=100000, eladosodottsag_foka=0.34, eladosodottsag_merteke=0.52,
          arbevetel_aranyos_eredmeny=6.52, likviditasi_gyorsrata=2.77, ebitda=720000, roe=0.12),
     dict(ev=2024, netto_arbevetel=6300000, uzemi_eredmeny=530000, adozas_elotti_eredmeny=510000, adozott_eredmeny=420000,
          eszkozok_osszesen=5200000, befektetett_eszkozok=3100000, forgoeszkozok=1900000, penzeszkozok=400000,
          aktiv_idobeli_elhatarolasok=200000, sajat_toke=3550000, celtaralekok=0, kotelezettsegek=1450000,
          adofizetesi_kotelezettseg=80000, rovid_lejaratu_kotelezettsegek=550000, hosszu_lejaratu_kotelezettsegek=900000,
          passziv_idobeli_elhatarolasok=200000, eladosodottsag_foka=0.28, eladosodottsag_merteke=0.41,
          arbevetel_aranyos_eredmeny=6.67, likviditasi_gyorsrata=3.45, ebitda=800000, roe=0.12)],
    [dict(nev="Dr. Papp Miklós", anyja_neve="Vass Ágnes", titulus="vezérigazgató"),
     dict(nev="Fekete András", anyja_neve="Szűcs Klára", titulus="igazgatósági tag"),
     dict(nev="Mészáros Katalin", anyja_neve="Lakatos Edit", titulus="felügyelőbizottság elnöke")]
)

seed_company(
    dict(nev="Kárpát Hotel Management Kft.", rovidnev="Kárpát Hotel Kft.", adoszam="88990011-2-05",
         cegjegyzekszam="05-09-800008", szekhely="3530 Miskolc, Széchenyi utca 12.",
         teaor_kod="5510", teaor_megnevezes="Szálláshely-szolgáltatás",
         alapitas_datuma=date(2016, 6, 1), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="5510 Szálláshely-szolgáltatás", letszam_kategoria="30 fő",
         email="booking@karpathotel.hu", weboldal="https://karpathotel.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=380000, uzemi_eredmeny=42000, adozas_elotti_eredmeny=35000, adozott_eredmeny=29000,
          eszkozok_osszesen=850000, befektetett_eszkozok=700000, forgoeszkozok=140000, penzeszkozok=45000,
          aktiv_idobeli_elhatarolasok=10000, sajat_toke=400000, celtaralekok=0, kotelezettsegek=440000,
          adofizetesi_kotelezettseg=8000, rovid_lejaratu_kotelezettsegek=140000, hosszu_lejaratu_kotelezettsegek=300000,
          passziv_idobeli_elhatarolasok=10000, eladosodottsag_foka=0.52, eladosodottsag_merteke=1.10,
          arbevetel_aranyos_eredmeny=7.63, likviditasi_gyorsrata=1.0, ebitda=92000, roe=0.07)],
    [dict(nev="Pintér László", anyja_neve="Rácz Erika", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="AutoPro Gépjárműkereskedés Kft.", rovidnev="AutoPro Kft.", adoszam="99001122-2-20",
         cegjegyzekszam="20-09-900009", szekhely="8000 Székesfehérvár, Budai út 50.",
         teaor_kod="4511", teaor_megnevezes="Személygépjármű, könnyű gépjármű kereskedelem",
         alapitas_datuma=date(2013, 4, 20), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="4511 Személygépjármű kereskedelem", letszam_kategoria="15 fő",
         email="sales@autopro.hu", telefon="+36-22-555-600",
         afa_alany=True, nav_torlesve=False, nav_kockazat="B",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=2200000, uzemi_eredmeny=110000, adozas_elotti_eredmeny=100000, adozott_eredmeny=82000,
          eszkozok_osszesen=800000, befektetett_eszkozok=120000, forgoeszkozok=660000, penzeszkozok=90000,
          aktiv_idobeli_elhatarolasok=20000, sajat_toke=320000, celtaralekok=0, kotelezettsegek=460000,
          adofizetesi_kotelezettseg=18000, rovid_lejaratu_kotelezettsegek=360000, hosszu_lejaratu_kotelezettsegek=100000,
          passziv_idobeli_elhatarolasok=20000, eladosodottsag_foka=0.58, eladosodottsag_merteke=1.44,
          arbevetel_aranyos_eredmeny=3.73, likviditasi_gyorsrata=1.83, ebitda=135000, roe=0.26)],
    [dict(nev="Sipos Béla", anyja_neve="Gulyás Ibolya", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="DigiMedia Marketing Ügynökség Kft.", rovidnev="DigiMedia Kft.", adoszam="10112233-2-41",
         cegjegyzekszam="01-09-110010", szekhely="1061 Budapest, Andrássy út 45.",
         teaor_kod="7311", teaor_megnevezes="Reklámügynöki tevékenység",
         alapitas_datuma=date(2019, 1, 15), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="7311 Reklámügynöki tevékenység", letszam_kategoria="12 fő",
         email="hello@digimedia.hu", weboldal="https://digimedia.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=290000, uzemi_eredmeny=55000, adozas_elotti_eredmeny=52000, adozott_eredmeny=43000,
          eszkozok_osszesen=180000, befektetett_eszkozok=25000, forgoeszkozok=150000, penzeszkozok=80000,
          aktiv_idobeli_elhatarolasok=5000, sajat_toke=120000, celtaralekok=0, kotelezettsegek=55000,
          adofizetesi_kotelezettseg=8000, rovid_lejaratu_kotelezettsegek=45000, hosszu_lejaratu_kotelezettsegek=10000,
          passziv_idobeli_elhatarolasok=5000, eladosodottsag_foka=0.31, eladosodottsag_merteke=0.46,
          arbevetel_aranyos_eredmeny=14.83, likviditasi_gyorsrata=3.33, ebitda=62000, roe=0.36)],
    [dict(nev="Gál Réka", anyja_neve="Orbán Szilvia", titulus="ügyvezető (vezető tisztségviselő)")]
)

# Negative event companies
seed_company(
    dict(nev="Alfa-Omega Kereskedelmi Bt.", rovidnev="Alfa-Omega Bt.", adoszam="12131415-1-41",
         cegjegyzekszam="01-06-120011", szekhely="1095 Budapest, Soroksári út 88.",
         teaor_kod="4690", teaor_megnevezes="Egyéb vegyes nagykereskedelem",
         alapitas_datuma=date(2006, 3, 1), statusz="felszámolás alatt", cegforma="Bt.",
         fotevekenyseg="4690 Egyéb vegyes nagykereskedelem", letszam_kategoria="0 fő",
         afa_alany=False, nav_torlesve=True, nav_kockazat="C",
         felszamolas=True, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [], [dict(nev="Kis János", anyja_neve="Nagy Mária", titulus="üzletvezetésre jogosult tag")]
)

seed_company(
    dict(nev="Beta Systems Informatikai Kft.", rovidnev="Beta Systems Kft.", adoszam="13141516-2-41",
         cegjegyzekszam="01-09-130012", szekhely="1134 Budapest, Váci út 35.",
         teaor_kod="6202", teaor_megnevezes="Információ-technológiai szaktanácsadás",
         alapitas_datuma=date(2017, 8, 10), statusz="végelszámolás alatt", cegforma="Kft.",
         fotevekenyseg="6202 Információ-technológiai szaktanácsadás", letszam_kategoria="0 fő",
         afa_alany=True, nav_torlesve=False, nav_kockazat="C",
         felszamolas=False, csodeljras=False, vegelszamolas=True, kenyszertorles=False),
    [], [dict(nev="Németh Csaba", anyja_neve="Deák Margit", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Sigma Invest Befektetési Zrt.", rovidnev="Sigma Invest Zrt.", adoszam="14151617-2-41",
         cegjegyzekszam="01-10-140013", szekhely="1054 Budapest, Szabadság tér 7.",
         teaor_kod="6430", teaor_megnevezes="Alapkezelés",
         alapitas_datuma=date(2012, 5, 5), statusz="aktív", cegforma="Zrt.",
         fotevekenyseg="6430 Alapkezelés", letszam_kategoria="20 fő",
         jegyzett_toke="500 000 000", jegyzett_toke_penznem="HUF",
         email="info@sigmainvest.hu", weboldal="https://sigmainvest.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=950000, uzemi_eredmeny=380000, adozas_elotti_eredmeny=370000, adozott_eredmeny=305000,
          eszkozok_osszesen=5500000, befektetett_eszkozok=4800000, forgoeszkozok=650000, penzeszkozok=400000,
          aktiv_idobeli_elhatarolasok=50000, sajat_toke=4200000, celtaralekok=0, kotelezettsegek=1250000,
          adofizetesi_kotelezettseg=55000, rovid_lejaratu_kotelezettsegek=250000, hosszu_lejaratu_kotelezettsegek=1000000,
          passziv_idobeli_elhatarolasok=50000, eladosodottsag_foka=0.23, eladosodottsag_merteke=0.30,
          arbevetel_aranyos_eredmeny=32.11, likviditasi_gyorsrata=2.6, ebitda=400000, roe=0.07)],
    [dict(nev="Dr. Lukács Péter", anyja_neve="Soós Ildikó", titulus="vezérigazgató"),
     dict(nev="Bakó Nóra", anyja_neve="Vincze Edit", titulus="igazgatósági tag")]
)

seed_company(
    dict(nev="Szegedi Textilipari Kft.", rovidnev="Szegedi Textil Kft.", adoszam="15161718-2-06",
         cegjegyzekszam="06-09-150014", szekhely="6720 Szeged, Tisza Lajos körút 50.",
         teaor_kod="1320", teaor_megnevezes="Szövet szövése",
         alapitas_datuma=date(1999, 12, 1), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="1320 Szövet szövése", letszam_kategoria="40 fő",
         email="info@szegeditextil.hu",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=420000, uzemi_eredmeny=28000, adozas_elotti_eredmeny=25000, adozott_eredmeny=20500,
          eszkozok_osszesen=350000, befektetett_eszkozok=180000, forgoeszkozok=160000, penzeszkozok=30000,
          aktiv_idobeli_elhatarolasok=10000, sajat_toke=200000, celtaralekok=0, kotelezettsegek=140000,
          adofizetesi_kotelezettseg=5000, rovid_lejaratu_kotelezettsegek=90000, hosszu_lejaratu_kotelezettsegek=50000,
          passziv_idobeli_elhatarolasok=10000, eladosodottsag_foka=0.40, eladosodottsag_merteke=0.70,
          arbevetel_aranyos_eredmeny=4.88, likviditasi_gyorsrata=1.78, ebitda=48000, roe=0.10)],
    [dict(nev="Hegedűs Mária", anyja_neve="Farkas Anna", titulus="ügyvezető (vezető tisztségviselő)")]
)

seed_company(
    dict(nev="Győri Autóalkatrész Kereskedés Kft.", rovidnev="Győri Autó Kft.", adoszam="16171819-2-08",
         cegjegyzekszam="08-09-160015", szekhely="9021 Győr, Szent István út 18.",
         teaor_kod="4531", teaor_megnevezes="Gépjárműalkatrész-nagykereskedelem",
         alapitas_datuma=date(2007, 10, 10), statusz="aktív", cegforma="Kft.",
         fotevekenyseg="4531 Gépjárműalkatrész-nagykereskedelem", letszam_kategoria="10 fő",
         email="rendeles@gyoriautokft.hu", telefon="+36-96-555-800",
         afa_alany=True, nav_torlesve=False, nav_kockazat="AVG",
         felszamolas=False, csodeljras=False, vegelszamolas=False, kenyszertorles=False),
    [dict(ev=2024, netto_arbevetel=750000, uzemi_eredmeny=38000, adozas_elotti_eredmeny=35000, adozott_eredmeny=29000,
          eszkozok_osszesen=400000, befektetett_eszkozok=80000, forgoeszkozok=310000, penzeszkozok=50000,
          aktiv_idobeli_elhatarolasok=10000, sajat_toke=180000, celtaralekok=0, kotelezettsegek=210000,
          adofizetesi_kotelezettseg=7000, rovid_lejaratu_kotelezettsegek=170000, hosszu_lejaratu_kotelezettsegek=40000,
          passziv_idobeli_elhatarolasok=10000, eladosodottsag_foka=0.53, eladosodottsag_merteke=1.17,
          arbevetel_aranyos_eredmeny=3.87, likviditasi_gyorsrata=1.82, ebitda=50000, roe=0.16)],
    [dict(nev="Takács Imre", anyja_neve="Szalai Judit", titulus="ügyvezető (vezető tisztségviselő)")]
)


# ═══════════════════════════════════════════════════════════
# NOTIFICATIONS for Anna
# ═══════════════════════════════════════════════════════════
if anna and db.query(Notification).filter(Notification.user_id == anna.id).count() == 0:
    notifs = [
        Notification(user_id=anna.id, title="Üdvözöljük, Anna!", message="Fiókja sikeresen létrehozva. Fedezze fel a Cégverzum funkcióit!", category="system"),
        Notification(user_id=anna.id, title="15 új cég az adatbázisban", message="A legutóbbi frissítés során 15 új cég került az adatbázisba.", category="company"),
    ]
    db.add_all(notifs)
    db.commit()
    print("\nNotifications created for Anna")

db.close()
print("\n=== Dummy seed complete! ===")
