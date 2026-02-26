import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { riskAnalysisApi } from '../api/riskAnalysis'
import { CompanySearchInput } from '../components/common/CompanySearchInput'
import { SEO } from '../components/SEO'
import type { CompanyListItem, RiskAnalysis, WatchlistOverview, WatchlistRiskItem } from '../types'

const RISK_COLORS: Record<string, string> = {
  green: '#27AE60',
  yellow: '#F1C40F',
  orange: '#E67E22',
  red: '#E74C3C',
}

const CATEGORY_ICONS: Record<string, string> = {
  negative_event: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  status: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 005.636 5.636',
  nav: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  financial: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  age: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

const RATING_STYLES: Record<string, string> = {
  ajánlott: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  óvatosság: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  'magas kockázat': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

const t = {
  hu: {
    pageTitle: 'Kockázatelemzés',
    pageSubtitle: 'Kockázati pontszám, partner minősítés és figyelőlista áttekintés',
    tabCompany: 'Cég kockázata',
    tabWatchlist: 'Figyelőlista áttekintés',
    selectCompanyLabel: 'Válasszon céget a kockázatelemzéshez',
    searchPlaceholder: 'Cég neve vagy adószáma...',
    errorLoadRisk: 'Nem sikerült betölteni a kockázati adatokat',
    riskScore: 'Kockázati pontszám',
    partnerRating: 'Partner minősítés',
    ratingAjanlott: 'A cég megbízható partnernek tűnik a vizsgált adatok alapján.',
    ratingOvatossag: 'A cég esetében fokozott óvatosság ajánlott. Érdemes további vizsgálatot végezni.',
    ratingMagasKockazat: 'A cég magas kockázatot mutat. Partnerkapcsolat előtt alapos átvilágítás szükséges.',
    generalInfo: 'Általános adatok',
    labelCompanyName: 'Cégnév',
    labelStatus: 'Státusz',
    labelFounded: 'Alapítás',
    labelTeaor: 'TEÁOR',
    labelNavRisk: 'NAV kockázat',
    noData: 'Nincs adat',
    fullCompanyProfile: 'Teljes cégadatlap',
    csvExport: 'CSV export',
    riskFactorsTitle: 'Kockázati tényezők részletezése',
    noRiskFactors: 'Nem találtunk kockázati tényezőt',
    points: 'pont',
    negativeEventsTitle: 'Negatív események',
    noNegativeEvents: 'Nincs negatív esemény',
    labelDebt: 'Eladósodottság',
    labelEquity: 'Saját tőke',
    labelLiquidity: 'Likviditás',
    labelNetIncome: 'Adózott eredmény',
    thousandHuf: 'ezer Ft',
    selectCompanyEmpty: 'Válasszon ki egy céget a kockázatelemzéshez',
    levelLow: 'Alacsony kockázat',
    levelMedium: 'Közepes kockázat',
    levelHigh: 'Magas kockázat',
    levelCritical: 'Kritikus kockázat',
    watchlistEmpty: 'A figyelőlista üres',
    watchlistAddCompanies: 'Cégek hozzáadása',
    tableCompanyName: 'Cégnév',
    tableStatus: 'Státusz',
    tableScore: 'Pontszám',
    tableLevel: 'Szint',
    tableRating: 'Minősítés',
    tableDetails: 'Részletek',
    csvReportTitle: 'Kockázati jelentés',
    csvCompanyName: 'Cégnév',
    csvStatus: 'Státusz',
    csvScore: 'Pontszám',
    csvLevel: 'Szint',
    csvPartnerRating: 'Partner minősítés',
    csvRiskFactors: 'Kockázati tényezők',
    csvCategory: 'Kategória',
    csvDescription: 'Leírás',
    csvDeduction: 'Levonás',
    csvNegativeEvents: 'Negatív események',
    csvNone: 'Nincs',
    csvFinancialIndicators: 'Pénzügyi mutatók',
    csvDebt: 'Eladósodottság',
    csvEquity: 'Saját tőke',
    csvLiquidity: 'Likviditás',
    csvNetIncome: 'Adózott eredmény',
    csvFilePrefix: 'kockazat',
  },
  en: {
    pageTitle: 'Risk Analysis',
    pageSubtitle: 'Risk score, partner rating and watchlist overview',
    tabCompany: 'Company Risk',
    tabWatchlist: 'Watchlist Overview',
    selectCompanyLabel: 'Select a company for risk analysis',
    searchPlaceholder: 'Company name or tax number...',
    errorLoadRisk: 'Failed to load risk data',
    riskScore: 'Risk Score',
    partnerRating: 'Partner Rating',
    ratingAjanlott: 'The company appears to be a reliable partner based on the examined data.',
    ratingOvatossag: 'Caution is recommended for this company. Further investigation is advised.',
    ratingMagasKockazat: 'The company shows high risk. Thorough due diligence is required before partnering.',
    generalInfo: 'General Information',
    labelCompanyName: 'Company Name',
    labelStatus: 'Status',
    labelFounded: 'Founded',
    labelTeaor: 'NACE Code',
    labelNavRisk: 'Tax Authority Risk',
    noData: 'No data',
    fullCompanyProfile: 'Full company profile',
    csvExport: 'CSV export',
    riskFactorsTitle: 'Risk Factor Details',
    noRiskFactors: 'No risk factors found',
    points: 'pts',
    negativeEventsTitle: 'Negative Events',
    noNegativeEvents: 'No negative events',
    labelDebt: 'Debt Ratio',
    labelEquity: 'Equity',
    labelLiquidity: 'Liquidity',
    labelNetIncome: 'Net Income',
    thousandHuf: 'thousand HUF',
    selectCompanyEmpty: 'Select a company for risk analysis',
    levelLow: 'Low Risk',
    levelMedium: 'Medium Risk',
    levelHigh: 'High Risk',
    levelCritical: 'Critical Risk',
    watchlistEmpty: 'The watchlist is empty',
    watchlistAddCompanies: 'Add companies',
    tableCompanyName: 'Company Name',
    tableStatus: 'Status',
    tableScore: 'Score',
    tableLevel: 'Level',
    tableRating: 'Rating',
    tableDetails: 'Details',
    csvReportTitle: 'Risk Report',
    csvCompanyName: 'Company Name',
    csvStatus: 'Status',
    csvScore: 'Score',
    csvLevel: 'Level',
    csvPartnerRating: 'Partner Rating',
    csvRiskFactors: 'Risk Factors',
    csvCategory: 'Category',
    csvDescription: 'Description',
    csvDeduction: 'Deduction',
    csvNegativeEvents: 'Negative Events',
    csvNone: 'None',
    csvFinancialIndicators: 'Financial Indicators',
    csvDebt: 'Debt Ratio',
    csvEquity: 'Equity',
    csvLiquidity: 'Liquidity',
    csvNetIncome: 'Net Income',
    csvFilePrefix: 'risk',
  },
}

export function RiskAnalysisPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const LEVEL_LABELS: Record<string, string> = {
    alacsony: s.levelLow,
    közepes: s.levelMedium,
    magas: s.levelHigh,
    kritikus: s.levelCritical,
  }

  const [tab, setTab] = useState<'company' | 'watchlist'>('company')

  // Company risk tab
  const [selectedCompany, setSelectedCompany] = useState<CompanyListItem | null>(null)
  const [risk, setRisk] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Watchlist tab
  const [watchlistData, setWatchlistData] = useState<WatchlistOverview | null>(null)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [sortField, setSortField] = useState<'risk_score' | 'company_name'>('risk_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  async function handleSelectCompany(company: CompanyListItem) {
    setSelectedCompany(company)
    setLoading(true)
    setError('')
    try {
      const data = await riskAnalysisApi.getRisk(company.id)
      setRisk(data)
    } catch (err) {
      setRisk(null)
      setError(err instanceof Error ? err.message : s.errorLoadRisk)
    } finally {
      setLoading(false)
    }
  }

  function handleClearCompany() {
    setSelectedCompany(null)
    setRisk(null)
    setError('')
  }

  function exportRiskCsv() {
    if (!risk) return
    const lines = [
      s.csvReportTitle,
      `${s.csvCompanyName};${risk.company_name}`,
      `${s.csvStatus};${risk.statusz}`,
      `${s.csvScore};${risk.risk_score}/100`,
      `${s.csvLevel};${LEVEL_LABELS[risk.risk_level] ?? risk.risk_level}`,
      `${s.csvPartnerRating};${risk.partner_rating}`,
      '',
      s.csvRiskFactors,
      `${s.csvCategory};${s.csvDescription};${s.csvDeduction}`,
      ...risk.factors.map(f => `${f.category};${f.description};-${f.points_deducted}`),
      '',
      s.csvNegativeEvents,
      ...(risk.negative_events.length > 0 ? risk.negative_events : [s.csvNone]),
      '',
      s.csvFinancialIndicators,
      `${s.csvDebt};${risk.eladosodottsag_foka != null ? (risk.eladosodottsag_foka * 100).toFixed(1) + '%' : '–'}`,
      `${s.csvEquity};${risk.sajat_toke != null ? Math.round(risk.sajat_toke).toLocaleString('hu-HU') + ` ${s.thousandHuf}` : '–'}`,
      `${s.csvLiquidity};${risk.likviditasi_gyorsrata?.toFixed(2) ?? '–'}`,
      `${s.csvNetIncome};${risk.adozott_eredmeny != null ? Math.round(risk.adozott_eredmeny).toLocaleString('hu-HU') + ` ${s.thousandHuf}` : '–'}`,
    ]
    const csv = lines.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${s.csvFilePrefix}_${risk.company_name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (tab === 'watchlist' && !watchlistData) {
      setWatchlistLoading(true)
      riskAnalysisApi.watchlistOverview()
        .then(setWatchlistData)
        .catch(() => setWatchlistData(null))
        .finally(() => setWatchlistLoading(false))
    }
  }, [tab, watchlistData])

  function toggleSort(field: 'risk_score' | 'company_name') {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedWatchlist = watchlistData?.items ? [...watchlistData.items].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortField === 'risk_score') return (a.risk_score - b.risk_score) * mul
    return a.company_name.localeCompare(b.company_name) * mul
  }) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-fade-in">
      <SEO title="Kockázatelemzés" description="Üzleti partnerek kockázati elemzése." />
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-dark to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold">{s.pageTitle}</h1>
          </div>
          <p className="text-white/70 text-sm">{s.pageSubtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 w-fit">
          <button
            onClick={() => setTab('company')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'company' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {s.tabCompany}
          </button>
          <button
            onClick={() => setTab('watchlist')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'watchlist' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {s.tabWatchlist}
          </button>
        </div>

        {/* COMPANY RISK TAB */}
        {tab === 'company' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{s.selectCompanyLabel}</label>
              <CompanySearchInput
                onSelect={handleSelectCompany}
                selectedCompany={selectedCompany}
                onClear={handleClearCompany}
                placeholder={s.searchPlaceholder}
              />
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-navy rounded-full animate-spin" />
              </div>
            )}

            {error && !loading && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {risk && !loading && (
              <>
                {/* Gauge + Cards Row */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Gauge */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">{s.riskScore}</h3>
                    <div className="relative" style={{ width: 200, height: 120 }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadialBarChart
                          cx="50%"
                          cy="100%"
                          innerRadius="60%"
                          outerRadius="90%"
                          startAngle={180}
                          endAngle={0}
                          barSize={16}
                          data={[
                            { value: 100, fill: '#e5e7eb' },
                            { value: risk.risk_score, fill: RISK_COLORS[risk.risk_color] || '#999' },
                          ]}
                        >
                          <RadialBar dataKey="value" cornerRadius={8} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                        <div className="text-3xl font-bold" style={{ color: RISK_COLORS[risk.risk_color] }}>{risk.risk_score}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">/100</div>
                      </div>
                    </div>
                    <span
                      className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: RISK_COLORS[risk.risk_color] }}
                    >
                      {LEVEL_LABELS[risk.risk_level] ?? risk.risk_level}
                    </span>
                  </div>

                  {/* Partner Rating */}
                  <div className={`rounded-2xl shadow-sm border p-5 ${RATING_STYLES[risk.partner_rating] ?? 'bg-gray-50 border-gray-200'}`}>
                    <h3 className="text-sm font-bold mb-3">{s.partnerRating}</h3>
                    <div className="text-2xl font-bold capitalize mb-2">{risk.partner_rating}</div>
                    <p className="text-sm opacity-80">
                      {risk.partner_rating === 'ajánlott' && s.ratingAjanlott}
                      {risk.partner_rating === 'óvatosság' && s.ratingOvatossag}
                      {risk.partner_rating === 'magas kockázat' && s.ratingMagasKockazat}
                    </p>
                  </div>

                  {/* General Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">{s.generalInfo}</h3>
                    <div className="space-y-2 text-sm">
                      <InfoRow label={s.labelCompanyName} value={risk.company_name} />
                      <InfoRow label={s.labelStatus} value={risk.statusz} />
                      <InfoRow label={s.labelFounded} value={risk.alapitas_datuma ?? '–'} />
                      <InfoRow label={s.labelTeaor} value={risk.teaor_kod ?? '–'} />
                      <InfoRow label={s.labelNavRisk} value={risk.nav_kockazat ?? s.noData} />
                    </div>
                    <Link
                      to={`/company/${risk.company_id}`}
                      className="block mt-3 text-xs text-navy dark:text-navy-light hover:underline"
                    >
                      {s.fullCompanyProfile} &rarr;
                    </Link>
                  </div>
                </div>

                {/* Export */}
                <div className="flex justify-end">
                  <button
                    onClick={exportRiskCsv}
                    className="flex items-center gap-1.5 text-xs text-navy dark:text-navy-light hover:underline px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {s.csvExport}
                  </button>
                </div>

                {/* Risk Factors */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.riskFactorsTitle}</h3>
                  {risk.factors.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium">{s.noRiskFactors}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {risk.factors.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
                          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[f.category] ?? CATEGORY_ICONS.financial} />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{f.description}</span>
                          <span className="text-sm font-bold text-red-500 flex-shrink-0">-{f.points_deducted} {s.points}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Negative Events */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.negativeEventsTitle}</h3>
                  {risk.negative_events.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium">{s.noNegativeEvents}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {risk.negative_events.map((e, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-red-700 dark:text-red-400 font-medium">{e}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Risk Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MiniIndicator label={s.labelDebt} value={risk.eladosodottsag_foka} threshold={0.7} format={v => (v * 100).toFixed(1) + '%'} invertColor />
                  <MiniIndicator label={s.labelEquity} value={risk.sajat_toke} threshold={0} format={v => Math.round(v).toLocaleString('hu-HU') + ` ${s.thousandHuf}`} />
                  <MiniIndicator label={s.labelLiquidity} value={risk.likviditasi_gyorsrata} threshold={0.5} format={v => v.toFixed(2)} />
                  <MiniIndicator label={s.labelNetIncome} value={risk.adozott_eredmeny} threshold={0} format={v => Math.round(v).toLocaleString('hu-HU') + ` ${s.thousandHuf}`} />
                </div>
              </>
            )}

            {!selectedCompany && !loading && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm">{s.selectCompanyEmpty}</p>
              </div>
            )}
          </div>
        )}

        {/* WATCHLIST TAB */}
        {tab === 'watchlist' && (
          <div className="space-y-6">
            {watchlistLoading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-navy rounded-full animate-spin" />
              </div>
            )}

            {watchlistData && !watchlistLoading && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryCard label={s.levelLow} count={watchlistData.summary.green ?? 0} color="#27AE60" />
                  <SummaryCard label={s.levelMedium} count={watchlistData.summary.yellow ?? 0} color="#F1C40F" />
                  <SummaryCard label={s.levelHigh} count={watchlistData.summary.orange ?? 0} color="#E67E22" />
                  <SummaryCard label={s.levelCritical} count={watchlistData.summary.red ?? 0} color="#E74C3C" />
                </div>

                {/* Table */}
                {watchlistData.items.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{s.watchlistEmpty}</p>
                    <Link to="/watchlist" className="text-sm text-navy dark:text-navy-light hover:underline">{s.watchlistAddCompanies} &rarr;</Link>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
                            <th
                              className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                              onClick={() => toggleSort('company_name')}
                            >
                              {s.tableCompanyName} {sortField === 'company_name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">{s.tableStatus}</th>
                            <th
                              className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                              onClick={() => toggleSort('risk_score')}
                            >
                              {s.tableScore} {sortField === 'risk_score' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">{s.tableLevel}</th>
                            <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">{s.tableRating}</th>
                            <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedWatchlist.map((item: WatchlistRiskItem) => (
                            <tr key={item.company_id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                              <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                <Link to={`/company/${item.company_id}`} className="hover:text-navy dark:hover:text-navy-light hover:underline">
                                  {item.company_name}
                                </Link>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.statusz}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold" style={{ color: RISK_COLORS[item.risk_color] }}>{item.risk_score}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: RISK_COLORS[item.risk_color] }}
                                >
                                  {LEVEL_LABELS[item.risk_level] ?? item.risk_level}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-xs font-medium capitalize">{item.partner_rating}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setTab('company')
                                    handleSelectCompany({ id: item.company_id, nev: item.company_name, statusz: item.statusz } as CompanyListItem)
                                  }}
                                  className="text-xs text-navy dark:text-navy-light hover:underline"
                                >
                                  {s.tableDetails}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Helper Components ---------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 font-medium">{value}</span>
    </div>
  )
}

function MiniIndicator({
  label, value, threshold, format, invertColor,
}: {
  label: string
  value: number | null
  threshold: number
  format: (v: number) => string
  invertColor?: boolean
}) {
  const ok = value == null ? null : invertColor ? value <= threshold : value >= threshold
  const color = ok === null ? 'border-gray-200 dark:border-gray-700' : ok ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'
  const dotColor = ok === null ? 'bg-gray-300' : ok ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 ${color} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {value != null ? format(value) : '–'}
      </div>
    </div>
  )
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{count}</div>
    </div>
  )
}
