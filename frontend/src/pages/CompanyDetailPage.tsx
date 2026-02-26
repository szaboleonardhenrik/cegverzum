import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { companiesApi } from '../api/companies'
import { watchlistApi } from '../api/watchlist'
import { Badge } from '../components/common/Badge'
import type { Company, FinancialReport, Officer } from '../types'

/* ── helpers ─────────────────────────────────────────────────────── */

function fmt(v: number | null | undefined): string {
  if (v == null) return '–'
  return v.toLocaleString('hu-HU') + ' eFt'
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return '–'
  return v.toFixed(2) + '%'
}

function fmtNum(v: number | null | undefined): string {
  if (v == null) return '–'
  return v.toLocaleString('hu-HU')
}

const CHART_COLORS = {
  gold: '#D29B01',
  teal: '#46A0A0',
  navy: '#2F6482',
  red: '#E74C3C',
  green: '#27AE60',
  purple: '#8E44AD',
  orange: '#F39C12',
}

const PIE_COLORS = ['#2F6482', '#46A0A0', '#D29B01', '#E74C3C', '#8E44AD']

/* ── export helpers ──────────────────────────────────────────── */

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(company: Company, financials: FinancialReport[], officers: Officer[]) {
  const lines: string[] = []
  lines.push('Cégadatok')
  lines.push(`Név,${company.nev}`)
  lines.push(`Adószám,${company.adoszam || ''}`)
  lines.push(`Cégjegyzékszám,${company.cegjegyzekszam || ''}`)
  lines.push(`Székhely,"${company.szekhely || ''}"`)
  lines.push(`TEÁOR,${company.teaor_kod || ''} ${company.teaor_megnevezes || ''}`)
  lines.push(`Cégforma,${company.cegforma || ''}`)
  lines.push(`Státusz,${company.statusz}`)
  lines.push(`Alapítás,${company.alapitas_datuma || ''}`)
  lines.push('')

  if (financials.length > 0) {
    lines.push('Pénzügyi adatok (eFt)')
    const headers = ['Év', 'Nettó árbevétel', 'Üzemi eredmény', 'Adózott eredmény', 'Eszközök', 'Saját tőke', 'Kötelezettségek', 'EBITDA']
    lines.push(headers.join(','))
    for (const f of financials) {
      lines.push([f.ev, f.netto_arbevetel, f.uzemi_eredmeny, f.adozott_eredmeny, f.eszkozok_osszesen, f.sajat_toke, f.kotelezettsegek, f.ebitda].join(','))
    }
    lines.push('')
  }

  if (officers.length > 0) {
    lines.push('Tisztségviselők')
    lines.push('Név,Anyja neve,Titulus')
    for (const o of officers) {
      lines.push(`"${o.nev}","${o.anyja_neve || ''}","${o.titulus || ''}"`)
    }
  }

  const slug = company.nev.replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, '_').substring(0, 40)
  downloadFile(lines.join('\n'), `${slug}_cegriport.csv`, 'text/csv')
}

function exportJSON(company: Company, financials: FinancialReport[], officers: Officer[]) {
  const data = { company, financials, officers }
  const slug = company.nev.replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, '_').substring(0, 40)
  downloadFile(JSON.stringify(data, null, 2), `${slug}_cegriport.json`, 'application/json')
}

function FieldRow({ label, value, noData }: { label: string; value: string | null | undefined; noData?: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">
        {value || <span className="text-gray-300">{noData || 'N/A'}</span>}
      </span>
    </div>
  )
}

function Section({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`px-5 py-3 ${color} flex items-center gap-2`}>
        {icon}
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  )
}

/* ── i18n ─────────────────────────────────────────────────────── */

const t = {
  hu: {
    backToSearch: 'Vissza a kereséshez',
    companyNotFound: 'Cég nem található',
    errorOccurred: 'Hiba történt',
    noData: 'Nincs adat',
    taxNumber: 'Adószám',
    companyRegNumber: 'Cégjegyzékszám',
    watching: 'Figyelve',
    watch: 'Figyelés',
    networkMap: 'Kapcsolati háló',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    print: 'Nyomtatás',
    negativeEvents: 'Negatív események',
    negLiquidation: 'Felszámolás',
    negBankruptcy: 'Csődeljárás',
    negDissolution: 'Végelszámolás',
    negForcedDeletion: 'Kényszertörlés',
    netRevenue: 'Nettó árbevétel',
    profitAfterTax: 'Adózott eredmény',
    ebitda: 'EBITDA',
    riskIndex: 'Kockázati index',
    vsPrevYear: 'vs előző év',
    basicData: 'Alapadatok',
    registeredSeat: 'Székhely',
    foundingDate: 'Alapítás dátuma',
    legalForm: 'Cégforma',
    status: 'Státusz',
    headcount: 'Létszám',
    registeredCapital: 'Jegyzett tőke',
    activity: 'Tevékenység',
    teaorCode: 'TEÁOR kód',
    teaorName: 'TEÁOR megnevezés',
    mainActivity: 'Fő tevékenység',
    navData: 'NAV adatok',
    vatSubject: 'ÁFA alany',
    taxNumberValid: 'Adószám érvényes',
    riskClassification: 'Kockázati besorolás',
    yes: 'Igen',
    no: 'Nem',
    deleted: 'Törölve',
    valid: 'Érvényes',
    averageRisk: 'Átlagos kockázat',
    positiveInfo: 'Pozitív információk',
    negativeInfo: 'Negatív információk',
    activeCompany: 'Aktív státuszú cég',
    vatSubjectPositive: 'ÁFA alany',
    validTaxNumberNAV: 'Érvényes adószám (NAV)',
    noNegativeEvents: 'Nincs negatív esemény',
    positiveProfit: 'Pozitív adózott eredmény',
    taxNumberDeletedNAV: 'Adószám törölve (NAV)',
    dissolvedCompany: 'Megszűnt cég',
    negativeProfit: 'Negatív adózott eredmény',
    noNegativeInfo: 'Nincs negatív információ',
    officers: 'Cégjegyzésre jogosultak',
    motherName: 'an',
    revenueAndProfit: 'Árbevétel és adózott eredmény',
    ebitdaAndOperating: 'EBITDA és üzemi eredmény',
    operatingResult: 'Üzemi eredmény',
    equityAndCapital: 'Saját tőke és jegyzett tőke',
    equity: 'Saját tőke',
    liabilities: 'Kötelezettségek',
    assetDistribution: 'Eszközök megoszlása',
    sourceDistribution: 'Források megoszlása',
    fixedAssets: 'Befektetett eszközök',
    currentAssets: 'Forgóeszközök',
    accruedAssetsShort: 'Aktív időbeli elhat.',
    equityPie: 'Saját tőke',
    shortTermLiab: 'Rövid lej. köt.',
    longTermLiab: 'Hosszú lej. köt.',
    accruedLiabShort: 'Passzív elhat.',
    detailedFinancials: 'Részletes pénzügyi adatok (eFt)',
    designation: 'Megnevezés',
    netRevenueTable: 'Nettó árbevétel',
    operatingResultTable: 'Üzemi eredmény',
    profitBeforeTax: 'Adózás előtti eredmény',
    profitAfterTaxTable: 'Adózott eredmény',
    totalAssets: 'Eszközök összesen',
    fixedAssetsTable: 'Befektetett eszközök',
    currentAssetsTable: 'Forgóeszközök',
    cashAndEquivalents: 'Pénzeszközök',
    equityTable: 'Saját tőke',
    liabilitiesTable: 'Kötelezettségek',
    shortTermLiabTable: 'Rövid lej. kötelezettségek',
    longTermLiabTable: 'Hosszú lej. kötelezettségek',
    ebitdaTable: 'EBITDA',
    financialIndicators: 'Pénzügyi mutatók',
    indicator: 'Mutató',
    debtRatio: 'Eladósodottság foka',
    debtLevel: 'Eladósodottság mértéke',
    revenueProfitRatio: 'Árbevétel arányos eredmény',
    quickRatio: 'Likviditási gyorsráta',
    roe: 'ROE',
    liquidityIndicators: 'Likviditási mutatók',
    quickRatioChart: 'Likviditási gyorsráta',
    debtRatioChart: 'Eladósodottság foka',
    contact: 'Elérhetőségek',
    email: 'Email',
    phone: 'Telefon',
    website: 'Weboldal',
    dataSource: 'Adatok forrása: NAV Online Számla API, Cégbíróság — Utolsó frissítés:',
    yearSuffix: '. év',
  },
  en: {
    backToSearch: 'Back to search',
    companyNotFound: 'Company not found',
    errorOccurred: 'An error occurred',
    noData: 'No data',
    taxNumber: 'Tax number',
    companyRegNumber: 'Registration number',
    watching: 'Watching',
    watch: 'Watch',
    networkMap: 'Network map',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    print: 'Print',
    negativeEvents: 'Negative events',
    negLiquidation: 'Liquidation',
    negBankruptcy: 'Bankruptcy',
    negDissolution: 'Dissolution',
    negForcedDeletion: 'Forced deletion',
    netRevenue: 'Net revenue',
    profitAfterTax: 'Profit after tax',
    ebitda: 'EBITDA',
    riskIndex: 'Risk index',
    vsPrevYear: 'vs previous year',
    basicData: 'Basic data',
    registeredSeat: 'Registered seat',
    foundingDate: 'Founding date',
    legalForm: 'Legal form',
    status: 'Status',
    headcount: 'Headcount',
    registeredCapital: 'Registered capital',
    activity: 'Activity',
    teaorCode: 'NACE code',
    teaorName: 'NACE description',
    mainActivity: 'Main activity',
    navData: 'Tax authority data',
    vatSubject: 'VAT subject',
    taxNumberValid: 'Tax number valid',
    riskClassification: 'Risk classification',
    yes: 'Yes',
    no: 'No',
    deleted: 'Deleted',
    valid: 'Valid',
    averageRisk: 'Average risk',
    positiveInfo: 'Positive information',
    negativeInfo: 'Negative information',
    activeCompany: 'Active company',
    vatSubjectPositive: 'VAT subject',
    validTaxNumberNAV: 'Valid tax number (NAV)',
    noNegativeEvents: 'No negative events',
    positiveProfit: 'Positive profit after tax',
    taxNumberDeletedNAV: 'Tax number deleted (NAV)',
    dissolvedCompany: 'Dissolved company',
    negativeProfit: 'Negative profit after tax',
    noNegativeInfo: 'No negative information',
    officers: 'Authorized signatories',
    motherName: 'mother',
    revenueAndProfit: 'Revenue and profit after tax',
    ebitdaAndOperating: 'EBITDA and operating result',
    operatingResult: 'Operating result',
    equityAndCapital: 'Equity and registered capital',
    equity: 'Equity',
    liabilities: 'Liabilities',
    assetDistribution: 'Asset distribution',
    sourceDistribution: 'Source distribution',
    fixedAssets: 'Fixed assets',
    currentAssets: 'Current assets',
    accruedAssetsShort: 'Accrued assets',
    equityPie: 'Equity',
    shortTermLiab: 'Short-term liab.',
    longTermLiab: 'Long-term liab.',
    accruedLiabShort: 'Accrued liab.',
    detailedFinancials: 'Detailed financial data (kHUF)',
    designation: 'Designation',
    netRevenueTable: 'Net revenue',
    operatingResultTable: 'Operating result',
    profitBeforeTax: 'Profit before tax',
    profitAfterTaxTable: 'Profit after tax',
    totalAssets: 'Total assets',
    fixedAssetsTable: 'Fixed assets',
    currentAssetsTable: 'Current assets',
    cashAndEquivalents: 'Cash and equivalents',
    equityTable: 'Equity',
    liabilitiesTable: 'Liabilities',
    shortTermLiabTable: 'Short-term liabilities',
    longTermLiabTable: 'Long-term liabilities',
    ebitdaTable: 'EBITDA',
    financialIndicators: 'Financial indicators',
    indicator: 'Indicator',
    debtRatio: 'Debt ratio',
    debtLevel: 'Debt level',
    revenueProfitRatio: 'Revenue-proportional profit',
    quickRatio: 'Quick ratio',
    roe: 'ROE',
    liquidityIndicators: 'Liquidity indicators',
    quickRatioChart: 'Quick ratio',
    debtRatioChart: 'Debt ratio',
    contact: 'Contact',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    dataSource: 'Data source: NAV Online Invoice API, Company Court — Last update:',
    yearSuffix: ' year',
  },
}

/* ── main component ──────────────────────────────────────────────── */

export function CompanyDetailPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [financials, setFinancials] = useState<FinancialReport[]>([])
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isWatched, setIsWatched] = useState(false)
  const [watchLoading, setWatchLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const cid = Number(id)
    Promise.all([
      companiesApi.getById(cid),
      companiesApi.getFinancials(cid),
      companiesApi.getOfficers(cid),
    ])
      .then(([c, f, o]) => { setCompany(c); setFinancials(f); setOfficers(o) })
      .catch(err => setError(err instanceof Error ? err.message : s.errorOccurred))
      .finally(() => setLoading(false))

    watchlistApi.check(cid)
      .then(s => setIsWatched(s.is_watched))
      .catch(() => {})
  }, [id])

  const toggleWatch = async () => {
    if (!id || watchLoading) return
    const cid = Number(id)
    setWatchLoading(true)
    try {
      if (isWatched) {
        await watchlistApi.remove(cid)
        setIsWatched(false)
      } else {
        await watchlistApi.add(cid)
        setIsWatched(true)
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : s.errorOccurred)
    } finally {
      setWatchLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 text-lg">{error || s.companyNotFound}</p>
        <Link to="/search" className="text-teal hover:text-teal-dark mt-4 inline-block">{s.backToSearch}</Link>
      </div>
    )
  }

  const negativeEvents = [
    { key: 'felszamolas', label: s.negLiquidation, value: company.felszamolas },
    { key: 'csodeljras', label: s.negBankruptcy, value: company.csodeljras },
    { key: 'vegelszamolas', label: s.negDissolution, value: company.vegelszamolas },
    { key: 'kenyszertorles', label: s.negForcedDeletion, value: company.kenyszertorles },
  ].filter(e => e.value === true)

  const hasNegative = negativeEvents.length > 0
  const latest = financials.length > 0 ? financials[financials.length - 1] : null
  const prev = financials.length > 1 ? financials[financials.length - 2] : null

  const revenueChange = latest && prev && prev.netto_arbevetel
    ? ((latest.netto_arbevetel! - prev.netto_arbevetel) / prev.netto_arbevetel * 100)
    : null

  // Pie chart data for latest balance sheet
  const balancePie = latest ? [
    { name: s.fixedAssets, value: latest.befektetett_eszkozok || 0 },
    { name: s.currentAssets, value: latest.forgoeszkozok || 0 },
    { name: s.accruedAssetsShort, value: latest.aktiv_idobeli_elhatarolasok || 0 },
  ].filter(d => d.value > 0) : []

  const liabPie = latest ? [
    { name: s.equityPie, value: Math.max(0, latest.sajat_toke || 0) },
    { name: s.shortTermLiab, value: latest.rovid_lejaratu_kotelezettsegek || 0 },
    { name: s.longTermLiab, value: latest.hosszu_lejaratu_kotelezettsegek || 0 },
    { name: s.accruedLiabShort, value: latest.passziv_idobeli_elhatarolasok || 0 },
  ].filter(d => d.value > 0) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SEO title="Cégadatok" description="Részletes céginformáció." />
      {/* Back link */}
      <Link to="/search" className="text-sm text-teal hover:text-teal-dark mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        {s.backToSearch}
      </Link>

      {/* ═══ HEADER CARD ═══ */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl shadow-lg p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">{company.nev}</h1>
            {company.rovidnev && company.rovidnev !== company.nev && (
              <p className="text-white/70 text-sm mt-1">{company.rovidnev}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge text={company.statusz} />
              {company.cegforma && <Badge text={company.cegforma} variant="neutral" />}
              {company.letszam_kategoria && <Badge text={company.letszam_kategoria} variant="neutral" />}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            {company.adoszam && (
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider">{s.taxNumber}</span>
                <p className="font-mono font-semibold text-lg">{company.adoszam}</p>
              </div>
            )}
            {company.cegjegyzekszam && (
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wider">{s.companyRegNumber}</span>
                <p className="font-mono font-semibold text-lg">{company.cegjegyzekszam}</p>
              </div>
            )}
          </div>
        </div>
        {/* Export & watch buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
          <button
            onClick={toggleWatch}
            disabled={watchLoading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white ${
              isWatched ? 'bg-yellow-500/30 hover:bg-yellow-500/40' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            {isWatched ? s.watching : s.watch}
          </button>
          <button
            onClick={() => navigate(`/market-map?company=${id}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {s.networkMap}
          </button>
          <button
            onClick={() => exportCSV(company, financials, officers)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {s.exportCSV}
          </button>
          <button
            onClick={() => exportJSON(company, financials, officers)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {s.exportJSON}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {s.print}
          </button>
        </div>
      </div>

      {/* ═══ NEGATIVE EVENTS ALERT ═══ */}
      {hasNegative && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-bold text-red-800 mb-2">{s.negativeEvents}</h2>
          <div className="flex gap-2 flex-wrap">
            {negativeEvents.map(e => <Badge key={e.key} text={e.label} variant="danger" />)}
          </div>
        </div>
      )}

      {/* ═══ KPI CARDS ═══ */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label={`${s.netRevenue} (${latest.ev})`}
            value={fmt(latest.netto_arbevetel)}
            sub={revenueChange != null ? `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(0)}% ${s.vsPrevYear}` : undefined}
            color="bg-emerald-50 text-emerald-900"
          />
          <StatCard
            label={`${s.profitAfterTax} (${latest.ev})`}
            value={fmt(latest.adozott_eredmeny)}
            color={(latest.adozott_eredmeny ?? 0) >= 0 ? 'bg-blue-50 text-blue-900' : 'bg-red-50 text-red-900'}
          />
          <StatCard
            label={`${s.ebitda} (${latest.ev})`}
            value={fmt(latest.ebitda)}
            color="bg-purple-50 text-purple-900"
          />
          <StatCard
            label={s.riskIndex}
            value={company.nav_kockazat || '–'}
            color="bg-amber-50 text-amber-900"
          />
        </div>
      )}

      {/* ═══ MAIN 2-COLUMN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* LEFT: Alapadatok */}
        <Section
          title={s.basicData}
          color="bg-navy"
          icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        >
          <FieldRow label={s.registeredSeat} value={company.szekhely} noData={s.noData} />
          <FieldRow label={s.foundingDate} value={company.alapitas_datuma} noData={s.noData} />
          <FieldRow label={s.legalForm} value={company.cegforma} noData={s.noData} />
          <FieldRow label={s.status} value={company.statusz} noData={s.noData} />
          <FieldRow label={s.headcount} value={company.letszam_kategoria} noData={s.noData} />
          <FieldRow label={s.registeredCapital} value={company.jegyzett_toke ? `${company.jegyzett_toke} ${company.jegyzett_toke_penznem || 'HUF'}` : null} noData={s.noData} />
        </Section>

        {/* RIGHT: Tevékenység + NAV */}
        <div className="flex flex-col gap-6">
          <Section
            title={s.activity}
            color="bg-teal"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          >
            <FieldRow label={s.teaorCode} value={company.teaor_kod} noData={s.noData} />
            <FieldRow label={s.teaorName} value={company.teaor_megnevezes} noData={s.noData} />
            <FieldRow label={s.mainActivity} value={company.fotevekenyseg} noData={s.noData} />
          </Section>

          <Section
            title={s.navData}
            color="bg-gray-700"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          >
            <FieldRow label={s.vatSubject} value={company.afa_alany === null ? null : company.afa_alany ? s.yes : s.no} noData={s.noData} />
            <FieldRow label={s.taxNumberValid} value={company.nav_torlesve === null ? null : company.nav_torlesve ? s.deleted : s.valid} noData={s.noData} />
            <FieldRow label={s.riskClassification} value={company.nav_kockazat ? `${company.nav_kockazat} — ${s.averageRisk}` : null} noData={s.noData} />
          </Section>
        </div>
      </div>

      {/* ═══ POZITÍV/NEGATÍV INFO ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section
          title={s.positiveInfo}
          color="bg-green-600"
          icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          <div className="space-y-2">
            {company.statusz === 'aktív' && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700">{s.activeCompany}</span>
              </div>
            )}
            {company.afa_alany === true && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700">{s.vatSubjectPositive}</span>
              </div>
            )}
            {company.nav_torlesve === false && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700">{s.validTaxNumberNAV}</span>
              </div>
            )}
            {!hasNegative && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700">{s.noNegativeEvents}</span>
              </div>
            )}
            {latest && (latest.adozott_eredmeny ?? 0) > 0 && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700">{s.positiveProfit} ({latest.ev})</span>
              </div>
            )}
          </div>
        </Section>

        <Section
          title={s.negativeInfo}
          color="bg-red-600"
          icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        >
          {hasNegative || company.nav_torlesve === true || company.statusz === 'megszűnt' ? (
            <div className="space-y-2">
              {company.nav_torlesve === true && (
                <div className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-gray-700">{s.taxNumberDeletedNAV}</span>
                </div>
              )}
              {company.statusz === 'megszűnt' && (
                <div className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-gray-700">{s.dissolvedCompany}</span>
                </div>
              )}
              {negativeEvents.map(e => (
                <div key={e.key} className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-gray-700">{e.label}</span>
                </div>
              ))}
              {latest && (latest.adozott_eredmeny ?? 0) < 0 && (
                <div className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-gray-700">{s.negativeProfit} ({latest.ev})</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.noNegativeInfo}</p>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ═══ TISZTSÉGVISELŐK ═══ */}
      {officers.length > 0 && (
        <div className="mb-6">
          <Section
            title={s.officers}
            color="bg-indigo-600"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {officers.map(o => (
                <div key={o.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="font-semibold text-gray-900">{o.nev}</p>
                  {o.anyja_neve && <p className="text-xs text-gray-500 mt-0.5">{s.motherName}: {o.anyja_neve}</p>}
                  {o.titulus && (
                    <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {o.titulus}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ═══ ÁRBEVÉTEL ÉS EREDMÉNY CHART ═══ */}
      {financials.length > 0 && (
        <div className="mb-6">
          <Section
            title={s.revenueAndProfit}
            color="bg-gold"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={financials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}M`} />
                <Tooltip formatter={(v) => fmt(Number(v))} labelFormatter={l => `${l}${s.yearSuffix}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="netto_arbevetel" name={s.netRevenue} fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} />
                <Bar dataKey="adozott_eredmeny" name={s.profitAfterTax} fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>
      )}

      {/* ═══ SECOND ROW: EBITDA & SAJÁT TŐKE CHARTS ═══ */}
      {financials.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Section
            title={s.ebitdaAndOperating}
            color="bg-purple-600"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={financials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(Number(v))} labelFormatter={l => `${l}${s.yearSuffix}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="ebitda" name={s.ebitda} stroke={CHART_COLORS.purple} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="uzemi_eredmeny" name={s.operatingResult} stroke={CHART_COLORS.orange} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Section>

          <Section
            title={s.equityAndCapital}
            color="bg-teal-dark"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={financials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(Number(v))} labelFormatter={l => `${l}${s.yearSuffix}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sajat_toke" name={s.equity} fill={CHART_COLORS.navy} radius={[4, 4, 0, 0]} />
                <Bar dataKey="kotelezettsegek" name={s.liabilities} fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>
      )}

      {/* ═══ ESZKÖZ STRUKTÚRA PIE CHARTS ═══ */}
      {latest && (balancePie.length > 0 || liabPie.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {balancePie.length > 0 && (
            <Section
              title={`${s.assetDistribution} (${latest.ev})`}
              color="bg-navy"
              icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            >
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={balancePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {balancePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </Section>
          )}
          {liabPie.length > 0 && (
            <Section
              title={`${s.sourceDistribution} (${latest.ev})`}
              color="bg-teal"
              icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            >
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={liabPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {liabPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </Section>
          )}
        </div>
      )}

      {/* ═══ FINANCIAL DATA TABLE ═══ */}
      {financials.length > 0 && (
        <div className="mb-6">
          <Section
            title={s.detailedFinancials}
            color="bg-gray-700"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">{s.designation}</th>
                    {financials.map(f => (
                      <th key={f.ev} className="text-right py-2 px-2 text-gray-500 font-medium min-w-[90px]">{f.ev}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {([
                    [s.netRevenueTable, 'netto_arbevetel'],
                    [s.operatingResultTable, 'uzemi_eredmeny'],
                    [s.profitBeforeTax, 'adozas_elotti_eredmeny'],
                    [s.profitAfterTaxTable, 'adozott_eredmeny'],
                    [s.totalAssets, 'eszkozok_osszesen'],
                    [s.fixedAssetsTable, 'befektetett_eszkozok'],
                    [s.currentAssetsTable, 'forgoeszkozok'],
                    [s.cashAndEquivalents, 'penzeszkozok'],
                    [s.equityTable, 'sajat_toke'],
                    [s.liabilitiesTable, 'kotelezettsegek'],
                    [s.shortTermLiabTable, 'rovid_lejaratu_kotelezettsegek'],
                    [s.longTermLiabTable, 'hosszu_lejaratu_kotelezettsegek'],
                    [s.ebitdaTable, 'ebitda'],
                  ] as const).map(([label, key]) => (
                    <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{label}</td>
                      {financials.map(f => {
                        const val = f[key as keyof FinancialReport] as number | null
                        return (
                          <td key={f.ev} className={`text-right py-2 px-2 font-mono ${val != null && val < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {fmtNum(val)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {/* ═══ PÉNZÜGYI MUTATÓK TABLE ═══ */}
      {financials.length > 0 && (
        <div className="mb-6">
          <Section
            title={s.financialIndicators}
            color="bg-gold-dark"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">{s.indicator}</th>
                    {financials.map(f => (
                      <th key={f.ev} className="text-right py-2 px-2 text-gray-500 font-medium min-w-[90px]">{f.ev}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {([
                    [s.debtRatio, 'eladosodottsag_foka', false],
                    [s.debtLevel, 'eladosodottsag_merteke', false],
                    [s.revenueProfitRatio, 'arbevetel_aranyos_eredmeny', true],
                    [s.quickRatio, 'likviditasi_gyorsrata', false],
                    [s.roe, 'roe', false],
                  ] as const).map(([label, key, isPct]) => (
                    <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{label}</td>
                      {financials.map(f => {
                        const val = f[key as keyof FinancialReport] as number | null
                        return (
                          <td key={f.ev} className={`text-right py-2 px-2 font-mono ${val != null && val < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {isPct ? fmtPct(val) : val != null ? val.toFixed(2) : '–'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {/* ═══ LIKVIDITÁSI GYORSRÁTA CHART ═══ */}
      {financials.length > 0 && (
        <div className="mb-6">
          <Section
            title={s.liquidityIndicators}
            color="bg-cyan-700"
            icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={financials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip formatter={(v) => Number(v).toFixed(2)} labelFormatter={l => `${l}${s.yearSuffix}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="likviditasi_gyorsrata" name={s.quickRatioChart} stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="eladosodottsag_foka" name={s.debtRatioChart} stroke={CHART_COLORS.red} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Section>
        </div>
      )}

      {/* ═══ ELÉRHETŐSÉGEK ═══ */}
      <div className="mb-6">
        <Section
          title={s.contact}
          color="bg-sky-600"
          icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        >
          <FieldRow label={s.registeredSeat} value={company.szekhely} noData={s.noData} />
          <FieldRow label={s.email} value={company.email} noData={s.noData} />
          <FieldRow label={s.phone} value={company.telefon} noData={s.noData} />
          {company.weboldal ? (
            <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-500">{s.website}</span>
              <a href={company.weboldal.startsWith('http') ? company.weboldal : `https://${company.weboldal}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal hover:text-teal-dark">
                {company.weboldal}
              </a>
            </div>
          ) : (
            <FieldRow label={s.website} value={null} noData={s.noData} />
          )}
        </Section>
      </div>

      {/* ═══ FOOTER INFO ═══ */}
      <div className="text-center text-xs text-gray-400 py-4">
        {s.dataSource} {new Date().toLocaleDateString('hu-HU')}
      </div>
    </div>
  )
}
