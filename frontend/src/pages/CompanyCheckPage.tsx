import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import type { NavTaxpayerResponse } from '../types'

interface PublicCompany {
  id: number
  nev: string
  szekhely: string | null
  statusz: string
  cegforma: string | null
}

function isAdoszam(q: string): boolean {
  const clean = q.trim().replace(/[\s-]/g, '')
  return /^\d{8,}$/.test(clean)
}

const t = {
  hu: {
    brandPrefix: 'Cég',
    brandSuffix: 'verzum',
    navHome: 'Főoldal',
    navLogin: 'Bejelentkezés',
    navRegister: 'Regisztráció',
    badge: 'NAV adatbázissal összekapcsolva',
    pageTitle: 'Cégellenőrző',
    pageSubtitle: 'Adószám vagy cégnév alapján kereshet bármely magyar cégre. Az adószámos keresés a NAV hivatalos adatbázisából ad eredményt.',
    searchPlaceholder: 'pl. 24107369 vagy Teszt Kft.',
    searchButton: 'Keresés',
    searchTip: 'Tipp: Adószámmal keresve a NAV hivatalos adatait kapja, cégnévvel a helyi adatbázisunkból keresünk.',
    navQuerying: 'NAV adatbázis lekérdezése...',
    navOfficialHeader: 'NAV — Hivatalos adóhatósági adat',
    labelTaxNumber: 'Adószám',
    labelSeat: 'Székhely',
    labelVatPayer: 'ÁFA alany',
    vatYes: 'Igen',
    vatNo: 'Nem',
    labelType: 'Típus',
    incorporationOrganization: 'Szervezet',
    incorporationSelfEmployed: 'Egyéni vállalkozó',
    incorporationTaxablePerson: 'Adóalany',
    localDbResults: 'Helyi adatbázis találatok',
    noResultsTitle: 'Nincs találat',
    noResultsDesc: 'Próbáljon más keresőszót vagy adjon meg egy 8 számjegyű adószámot a NAV adatbázisból való lekérdezéshez.',
    blurredTaxNumber: 'Adószám',
    blurredRegNumber: 'Cégjegyzékszám',
    blurredRevenue: 'Árbevétel',
    blurredRisk: 'Kockázat',
    subscriptionRequired: 'Előfizetés szükséges',
    subscriptionDesc: 'A teljes céginformáció, pénzügyi adatok és kockázatelemzés megtekintéséhez válasszon előfizetési csomagot.',
    viewPlans: 'Csomagok megtekintése',
    featureTaxSearch: 'Adószám keresés',
    featureTaxSearchDesc: 'NAV adatbázisból',
    featureNameSearch: 'Cégnév keresés',
    featureNameSearchDesc: 'Helyi adatbázisból',
    featureOfficialData: 'Hivatalos adat',
    featureOfficialDataDesc: 'NAV által hitelesítve',
    errorNoTaxpayer: 'Az adószámhoz nem tartozik adózó.',
    errorGeneric: 'Hiba történt',
    errorNetwork: 'Hálózati hiba — próbálja újra.',
  },
  en: {
    brandPrefix: 'Cég',
    brandSuffix: 'verzum',
    navHome: 'Home',
    navLogin: 'Log in',
    navRegister: 'Register',
    badge: 'Connected to NAV database',
    pageTitle: 'Company Checker',
    pageSubtitle: 'Search for any Hungarian company by tax number or company name. Tax number searches return results from the official NAV database.',
    searchPlaceholder: 'e.g. 24107369 or Test Kft.',
    searchButton: 'Search',
    searchTip: 'Tip: Searching by tax number returns official NAV data; searching by company name queries our local database.',
    navQuerying: 'Querying NAV database...',
    navOfficialHeader: 'NAV — Official tax authority data',
    labelTaxNumber: 'Tax number',
    labelSeat: 'Registered seat',
    labelVatPayer: 'VAT payer',
    vatYes: 'Yes',
    vatNo: 'No',
    labelType: 'Type',
    incorporationOrganization: 'Organization',
    incorporationSelfEmployed: 'Self-employed',
    incorporationTaxablePerson: 'Taxable person',
    localDbResults: 'Local database results',
    noResultsTitle: 'No results',
    noResultsDesc: 'Try a different search term or enter an 8-digit tax number to query the NAV database.',
    blurredTaxNumber: 'Tax number',
    blurredRegNumber: 'Registration number',
    blurredRevenue: 'Revenue',
    blurredRisk: 'Risk',
    subscriptionRequired: 'Subscription required',
    subscriptionDesc: 'To view full company information, financial data and risk analysis, please choose a subscription plan.',
    viewPlans: 'View plans',
    featureTaxSearch: 'Tax number search',
    featureTaxSearchDesc: 'From NAV database',
    featureNameSearch: 'Company name search',
    featureNameSearchDesc: 'From local database',
    featureOfficialData: 'Official data',
    featureOfficialDataDesc: 'Verified by NAV',
    errorNoTaxpayer: 'No taxpayer found for this tax number.',
    errorGeneric: 'An error occurred',
    errorNetwork: 'Network error — please try again.',
  },
}

export function CompanyCheckPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const incorporationLabels: Record<string, string> = {
    ORGANIZATION: s.incorporationOrganization,
    SELF_EMPLOYED: s.incorporationSelfEmployed,
    TAXABLE_PERSON: s.incorporationTaxablePerson,
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [dbResults, setDbResults] = useState<PublicCompany[]>([])
  const [navResult, setNavResult] = useState<NavTaxpayerResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [navLoading, setNavLoading] = useState(false)
  const [navError, setNavError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<PublicCompany | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q || q.length < 2) return

    setLoading(true)
    setHasSearched(true)
    setSelectedCompany(null)
    setNavResult(null)
    setNavError(null)

    const isAdoszamQuery = isAdoszam(q)

    // NAV lookup for tax numbers
    if (isAdoszamQuery) {
      setNavLoading(true)
      const clean = q.replace(/[\s-]/g, '').slice(0, 8)
      fetch(`/api/integrations/nav/lookup/${clean}`)
        .then(async res => {
          if (res.ok) {
            const data: NavTaxpayerResponse = await res.json()
            if (data.success) setNavResult(data)
            else setNavError(data.message || s.errorNoTaxpayer)
          } else {
            const err = await res.json().catch(() => ({ detail: s.errorGeneric }))
            setNavError(err.detail || `${s.errorGeneric}: ${res.status}`)
          }
        })
        .catch(() => setNavError(s.errorNetwork))
        .finally(() => setNavLoading(false))
    }

    // Local DB search (always)
    try {
      const res = await fetch(`/api/companies/public?q=${encodeURIComponent(q)}`)
      if (res.ok) setDbResults(await res.json())
      else setDbResults([])
    } catch {
      setDbResults([])
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (st: string) => {
    if (st === 'aktív') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (st === 'megszűnt') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  const showNoResults = hasSearched && !loading && !navLoading && !navResult && dbResults.length === 0 && !navError

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-gray-800 dark:text-gray-200">
      <SEO title="Cégellenőrző" description="Ellenőrizd üzleti partnered hátterét ingyen." />
      {/* Nav */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight no-underline text-gray-900 dark:text-white">
            <span className="text-gold">{s.brandPrefix}</span>{s.brandSuffix}
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white no-underline">
              {s.navHome}
            </Link>
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg px-4 py-2 no-underline">
              {s.navLogin}
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-gold hover:bg-gold-light rounded-lg px-4 py-2 no-underline">
              {s.navRegister}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + Search */}
      <section className="pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 tracking-wide uppercase">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {s.badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {s.pageTitle}
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            {s.pageSubtitle}
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={s.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-slate-700 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white dark:bg-slate-800 dark:text-white shadow-sm"
              />
              {searchQuery && isAdoszam(searchQuery) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 pointer-events-none">
                  NAV
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || navLoading || searchQuery.trim().length < 2}
              className="bg-gold hover:bg-gold-light disabled:opacity-40 text-white font-bold rounded-2xl px-8 py-4 transition-all border-none cursor-pointer text-base shadow-sm hover:shadow-md"
            >
              {loading || navLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : s.searchButton}
            </button>
          </form>

          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {s.searchTip}
          </p>
        </div>
      </section>

      {/* Results area */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* NAV loading */}
          {navLoading && (
            <div className="mb-6 flex items-center gap-3 p-5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl">
              <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{s.navQuerying}</span>
            </div>
          )}

          {/* NAV result */}
          {navResult && !navLoading && (
            <div className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-semibold text-white">{s.navOfficialHeader}</span>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{navResult.taxpayerName}</h2>
                {navResult.taxpayerShortName && navResult.taxpayerShortName !== navResult.taxpayerName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{navResult.taxpayerShortName}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  {navResult.taxNumberDetail && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <svg className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.labelTaxNumber}</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                          {navResult.taxNumberDetail.taxpayerId}-{navResult.taxNumberDetail.vatCode}-{navResult.taxNumberDetail.countyCode}
                        </div>
                      </div>
                    </div>
                  )}

                  {navResult.taxpayerAddressFormatted && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                        <svg className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.labelSeat}</div>
                        <div className="font-medium text-gray-900 dark:text-white mt-0.5">{navResult.taxpayerAddressFormatted}</div>
                      </div>
                    </div>
                  )}

                  {navResult.taxNumberDetail?.vatCode && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${navResult.taxNumberDetail.vatCode === '2' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
                        <svg className={`w-4.5 h-4.5 ${navResult.taxNumberDetail.vatCode === '2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.labelVatPayer}</div>
                        <div className={`font-bold mt-0.5 ${navResult.taxNumberDetail.vatCode === '2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {navResult.taxNumberDetail.vatCode === '2' ? s.vatYes : s.vatNo}
                        </div>
                      </div>
                    </div>
                  )}

                  {navResult.incorporation && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                        <svg className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.labelType}</div>
                        <div className="font-medium text-gray-900 dark:text-white mt-0.5">
                          {incorporationLabels[navResult.incorporation] || navResult.incorporation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NAV error */}
          {navError && !navLoading && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {navError}
            </div>
          )}

          {/* DB loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-1/3 bg-gray-100 dark:bg-slate-700/50 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DB results */}
          {!loading && dbResults.length > 0 && !selectedCompany && (
            <div className="space-y-3 animate-fade-in">
              {navResult && (
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{s.localDbResults}</p>
              )}
              {dbResults.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompany(c)}
                  className="w-full text-left bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate text-base">{c.nev}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                      {c.cegforma && <span>{c.cegforma}</span>}
                      {c.cegforma && c.szekhely && <span className="text-gray-300 dark:text-gray-600">|</span>}
                      {c.szekhely && <span>{c.szekhely}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(c.statusz)}`}>
                      {c.statusz}
                    </span>
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results at all */}
          {showNoResults && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{s.noResultsTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                {s.noResultsDesc}
              </p>
            </div>
          )}

          {/* Subscription wall for DB result detail */}
          {selectedCompany && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg animate-fade-in">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCompany.nev}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedCompany.cegforma} &middot; {selectedCompany.szekhely}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="relative p-6">
                <div className="blur-sm select-none pointer-events-none opacity-60">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[s.blurredTaxNumber, s.blurredRegNumber, s.blurredRevenue, s.blurredRisk].map(label => (
                      <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                        <div className="text-xs text-gray-400 mb-1">{label}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">••••••••</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-[2px]">
                  <div className="text-center p-6 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.subscriptionRequired}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{s.subscriptionDesc}</p>
                    <Link
                      to="/#arak"
                      className="inline-block bg-gold hover:bg-gold-light text-white font-semibold rounded-xl px-6 py-2.5 transition-colors no-underline text-sm"
                    >
                      {s.viewPlans}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial empty state */}
          {!hasSearched && !loading && (
            <div className="text-center py-16">
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14', label: s.featureTaxSearch, desc: s.featureTaxSearchDesc },
                  { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: s.featureNameSearch, desc: s.featureNameSearchDesc },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: s.featureOfficialData, desc: s.featureOfficialDataDesc },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
