import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { financialAnalysisApi } from '../api/financialAnalysis'
import { CompanySearchInput } from '../components/common/CompanySearchInput'
import type { CompanyListItem, FinancialAnalysis, CompareResponse, BenchmarkResponse } from '../types'

const COLORS = ['#2F6482', '#D29B01', '#46A0A0', '#E74C3C', '#8E44AD']

const t = {
  hu: {
    pageTitle: 'Pénzügyi elemzés',
    pageSubtitle: 'Részletes pénzügyi mutatók, trendek, iparági benchmark és cég-összehasonlítás',
    tabAnalysis: 'Elemzés',
    tabCompare: 'Összehasonlítás',
    selectCompanyLabel: 'Válasszon céget az elemzéshez',
    searchPlaceholder: 'Cég neve vagy adószáma...',
    errorLoadFailed: 'Nem sikerült betölteni a pénzügyi adatokat',
    kpiRevenue: 'Árbevétel',
    kpiRevenueUnit: 'ezer Ft',
    kpiProfitMargin: 'Profitmarzs',
    kpiRoe: 'ROE',
    kpiDebtRatio: 'Eladósodottság',
    kpiLiquidity: 'Likviditás',
    kpiCagr: 'CAGR',
    chartRevenueGrowth: 'Árbevétel és növekedési trend',
    chartRevenueName: 'Árbevétel (ezer Ft)',
    chartGrowthName: 'Növekedés (%)',
    tooltipGrowth: 'Növekedés',
    tooltipRevenue: 'Árbevétel',
    chartProfitability: 'Jövedelmezőség',
    chartOperatingResult: 'Üzemi eredmény',
    chartNetResult: 'Adózott eredmény',
    chartEbitda: 'EBITDA',
    chartCapitalStructure: 'Tőkeszerkezet',
    chartEquity: 'Saját tőke',
    chartLiabilities: 'Kötelezettségek',
    benchmarkTitle: 'Iparági benchmark',
    benchmarkTeaor: 'TEÁOR',
    benchmarkCompanyCount: 'cég',
    yearlyDataTitle: 'Éves adatok',
    csvExport: 'CSV export',
    detailedCompanyData: 'Részletes cégadatok',
    thYear: 'Év',
    thRevenue: 'Árbevétel',
    thGrowth: 'Növekedés',
    thProfitMargin: 'Profitmarzs',
    thRoe: 'ROE',
    thDebtRatio: 'Eladósodottság',
    thLiquidity: 'Likviditás',
    emptyAnalysis: 'Válasszon ki egy céget a pénzügyi elemzés megtekintéséhez',
    compareSelectTitle: 'Cégek kiválasztása (max. 5)',
    compareSearchPlaceholder: (n: number) => `${n}. cég keresése...`,
    addCompany: 'Cég hozzáadása',
    compareLoading: 'Betöltés...',
    compareButton: 'Összehasonlítás',
    kpiCompareTitle: 'KPI összehasonlítás',
    compareMetric: 'Mutató',
    compareAvgProfitMargin: 'Átl. profitmarzs',
    compareAvgRoe: 'Átl. ROE',
    compareAvgDebtRatio: 'Átl. eladósodottság',
    compareAvgLiquidity: 'Átl. likviditás',
    compareRevenueChart: 'Árbevétel összehasonlítás',
    compareProfitMarginChart: 'Profitmarzs összehasonlítás',
    emptyCompare: 'Válasszon ki legalább 2 céget az összehasonlításhoz',
    csvHeaderYear: 'Év',
    csvHeaderRevenue: 'Árbevétel (ezer Ft)',
    csvHeaderGrowth: 'Növekedés (%)',
    csvHeaderProfitMargin: 'Profitmarzs',
    csvHeaderRoe: 'ROE',
    csvHeaderDebtRatio: 'Eladósodottság',
    csvHeaderLiquidity: 'Likviditás',
    csvHeaderEbitda: 'EBITDA',
    metricProfitMargin: 'Profitmarzs',
    metricRoe: 'ROE',
    metricDebtRatio: 'Eladósodottság',
    metricLiquidity: 'Likviditás',
    metricRevenue: 'Árbevétel (ezer Ft)',
    metricEbitda: 'EBITDA (ezer Ft)',
    benchmarkAbove: 'Átlag felett',
    benchmarkBelow: 'Átlag alatt',
    benchmarkAverage: 'Átlagos',
  },
  en: {
    pageTitle: 'Financial Analysis',
    pageSubtitle: 'Detailed financial indicators, trends, industry benchmarks and company comparison',
    tabAnalysis: 'Analysis',
    tabCompare: 'Comparison',
    selectCompanyLabel: 'Select a company for analysis',
    searchPlaceholder: 'Company name or tax number...',
    errorLoadFailed: 'Failed to load financial data',
    kpiRevenue: 'Revenue',
    kpiRevenueUnit: 'thousand HUF',
    kpiProfitMargin: 'Profit Margin',
    kpiRoe: 'ROE',
    kpiDebtRatio: 'Debt Ratio',
    kpiLiquidity: 'Liquidity',
    kpiCagr: 'CAGR',
    chartRevenueGrowth: 'Revenue and growth trend',
    chartRevenueName: 'Revenue (thousand HUF)',
    chartGrowthName: 'Growth (%)',
    tooltipGrowth: 'Growth',
    tooltipRevenue: 'Revenue',
    chartProfitability: 'Profitability',
    chartOperatingResult: 'Operating result',
    chartNetResult: 'Net result',
    chartEbitda: 'EBITDA',
    chartCapitalStructure: 'Capital structure',
    chartEquity: 'Equity',
    chartLiabilities: 'Liabilities',
    benchmarkTitle: 'Industry benchmark',
    benchmarkTeaor: 'NACE',
    benchmarkCompanyCount: 'companies',
    yearlyDataTitle: 'Yearly data',
    csvExport: 'CSV export',
    detailedCompanyData: 'Detailed company data',
    thYear: 'Year',
    thRevenue: 'Revenue',
    thGrowth: 'Growth',
    thProfitMargin: 'Profit Margin',
    thRoe: 'ROE',
    thDebtRatio: 'Debt Ratio',
    thLiquidity: 'Liquidity',
    emptyAnalysis: 'Select a company to view the financial analysis',
    compareSelectTitle: 'Select companies (max. 5)',
    compareSearchPlaceholder: (n: number) => `Search company ${n}...`,
    addCompany: 'Add company',
    compareLoading: 'Loading...',
    compareButton: 'Compare',
    kpiCompareTitle: 'KPI comparison',
    compareMetric: 'Metric',
    compareAvgProfitMargin: 'Avg. profit margin',
    compareAvgRoe: 'Avg. ROE',
    compareAvgDebtRatio: 'Avg. debt ratio',
    compareAvgLiquidity: 'Avg. liquidity',
    compareRevenueChart: 'Revenue comparison',
    compareProfitMarginChart: 'Profit margin comparison',
    emptyCompare: 'Select at least 2 companies for comparison',
    csvHeaderYear: 'Year',
    csvHeaderRevenue: 'Revenue (thousand HUF)',
    csvHeaderGrowth: 'Growth (%)',
    csvHeaderProfitMargin: 'Profit Margin',
    csvHeaderRoe: 'ROE',
    csvHeaderDebtRatio: 'Debt Ratio',
    csvHeaderLiquidity: 'Liquidity',
    csvHeaderEbitda: 'EBITDA',
    metricProfitMargin: 'Profit Margin',
    metricRoe: 'ROE',
    metricDebtRatio: 'Debt Ratio',
    metricLiquidity: 'Liquidity',
    metricRevenue: 'Revenue (thousand HUF)',
    metricEbitda: 'EBITDA (thousand HUF)',
    benchmarkAbove: 'Above average',
    benchmarkBelow: 'Below average',
    benchmarkAverage: 'Average',
  },
}

function fmt(val: number | null | undefined): string {
  if (val == null) return '–'
  if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + ' M'
  return val.toLocaleString('hu-HU', { maximumFractionDigits: 2 })
}

function pct(val: number | null | undefined): string {
  if (val == null) return '–'
  return (val * 100).toFixed(1) + '%'
}

function pctRaw(val: number | null | undefined): string {
  if (val == null) return '–'
  return val.toFixed(1) + '%'
}

export function FinancialAnalysisPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const METRIC_LABELS: Record<string, string> = {
    profit_margin: s.metricProfitMargin,
    roe: s.metricRoe,
    debt_ratio: s.metricDebtRatio,
    liquidity: s.metricLiquidity,
    revenue: s.metricRevenue,
    ebitda: s.metricEbitda,
  }

  const [tab, setTab] = useState<'analysis' | 'compare'>('analysis')

  // Analysis tab state
  const [selectedCompany, setSelectedCompany] = useState<CompanyListItem | null>(null)
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null)
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Compare tab state
  const [compareCompanies, setCompareCompanies] = useState<(CompanyListItem | null)[]>([null, null, null])
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)

  async function handleSelectCompany(company: CompanyListItem) {
    setSelectedCompany(company)
    setLoading(true)
    setError('')
    try {
      const [analysisData, benchmarkData] = await Promise.all([
        financialAnalysisApi.getAnalysis(company.id),
        financialAnalysisApi.benchmark(company.id).catch(() => null),
      ])
      setAnalysis(analysisData)
      setBenchmark(benchmarkData)
    } catch (err) {
      setAnalysis(null)
      setBenchmark(null)
      setError(err instanceof Error ? err.message : s.errorLoadFailed)
    } finally {
      setLoading(false)
    }
  }

  function handleClearCompany() {
    setSelectedCompany(null)
    setAnalysis(null)
    setBenchmark(null)
    setError('')
  }

  function exportCsv() {
    if (!analysis) return
    const headers = [s.csvHeaderYear, s.csvHeaderRevenue, s.csvHeaderGrowth, s.csvHeaderProfitMargin, s.csvHeaderRoe, s.csvHeaderDebtRatio, s.csvHeaderLiquidity, s.csvHeaderEbitda]
    const rows = analysis.yearly_metrics.map(m => [
      m.ev,
      m.netto_arbevetel ?? '',
      m.novekedesi_rata ?? '',
      m.arbevetel_aranyos_eredmeny != null ? (m.arbevetel_aranyos_eredmeny * 100).toFixed(1) + '%' : '',
      m.roe != null ? (m.roe * 100).toFixed(1) + '%' : '',
      m.eladosodottsag_foka != null ? (m.eladosodottsag_foka * 100).toFixed(1) + '%' : '',
      m.likviditasi_gyorsrata?.toFixed(2) ?? '',
      m.ebitda ?? '',
    ])
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `penzugyi_elemzes_${analysis.company_name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function setCompareCompany(index: number, company: CompanyListItem | null) {
    const next = [...compareCompanies]
    next[index] = company
    setCompareCompanies(next)
    setCompareResult(null)
  }

  async function handleCompare() {
    const ids = compareCompanies.filter(Boolean).map(c => c!.id)
    if (ids.length < 2) return
    setCompareLoading(true)
    try {
      const data = await financialAnalysisApi.compare(ids)
      setCompareResult(data)
    } catch {
      setCompareResult(null)
    } finally {
      setCompareLoading(false)
    }
  }

  const metrics = analysis?.yearly_metrics ?? []
  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-fade-in">
      <SEO title="Pénzügyi Elemzés" description="Cégek pénzügyi elemzése." />
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-dark to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
            onClick={() => setTab('analysis')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'analysis' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {s.tabAnalysis}
          </button>
          <button
            onClick={() => setTab('compare')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'compare' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {s.tabCompare}
          </button>
        </div>

        {/* ANALYSIS TAB */}
        {tab === 'analysis' && (
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

            {analysis && !loading && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <KpiCard label={s.kpiRevenue} value={fmt(latestMetric?.netto_arbevetel)} unit={s.kpiRevenueUnit} color="bg-navy" />
                  <KpiCard label={s.kpiProfitMargin} value={pct(analysis.avg_profit_margin)} color="bg-teal" />
                  <KpiCard label={s.kpiRoe} value={pct(analysis.avg_roe)} color="bg-gold" />
                  <KpiCard label={s.kpiDebtRatio} value={pct(analysis.avg_debt_ratio)} color="bg-red-500" />
                  <KpiCard label={s.kpiLiquidity} value={analysis.avg_liquidity?.toFixed(2) ?? '–'} color="bg-purple-500" />
                  <KpiCard label={s.kpiCagr} value={pctRaw(analysis.revenue_cagr)} color="bg-accent" />
                </div>

                {/* Revenue + Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.chartRevenueGrowth}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" />
                      <Tooltip formatter={(val, name) => [name === 'novekedesi_rata' ? val + '%' : fmt(val as number), name === 'novekedesi_rata' ? s.tooltipGrowth : s.tooltipRevenue]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="netto_arbevetel" name={s.chartRevenueName} fill="#2F6482" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="novekedesi_rata" name={s.chartGrowthName} stroke="#D29B01" strokeWidth={2} dot={{ r: 4 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Two-column charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Profitability */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.chartProfitability}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val) => fmt(val as number)} />
                        <Legend />
                        <Line type="monotone" dataKey="uzemi_eredmeny" name={s.chartOperatingResult} stroke="#2F6482" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="adozott_eredmeny" name={s.chartNetResult} stroke="#46A0A0" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="ebitda" name={s.chartEbitda} stroke="#D29B01" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Capital structure */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.chartCapitalStructure}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val) => fmt(val as number)} />
                        <Legend />
                        <Bar dataKey="sajat_toke" name={s.chartEquity} fill="#27AE60" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="kotelezettsegek" name={s.chartLiabilities} fill="#E74C3C" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Benchmark */}
                {benchmark && benchmark.metrics.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.benchmarkTitle}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {s.benchmarkTeaor}: {benchmark.teaor_kod} — {benchmark.teaor_megnevezes} ({benchmark.industry_company_count} {s.benchmarkCompanyCount})
                      </span>
                    </div>
                    <div className="space-y-3">
                      {benchmark.metrics.map(m => (
                        <BenchmarkRow key={m.metric} metric={m} metricLabels={METRIC_LABELS} lang={lang} />
                      ))}
                    </div>
                  </div>
                )}

                {/* YoY Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.yearlyDataTitle}</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={exportCsv}
                        className="flex items-center gap-1.5 text-xs text-navy dark:text-navy-light hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {s.csvExport}
                      </button>
                      <Link
                        to={`/company/${analysis.company_id}`}
                        className="text-xs text-navy dark:text-navy-light hover:underline"
                      >
                        {s.detailedCompanyData} &rarr;
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thYear}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thRevenue}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thGrowth}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thProfitMargin}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thRoe}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thDebtRatio}</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.thLiquidity}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map(m => (
                          <tr key={m.ev} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{m.ev}</td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{fmt(m.netto_arbevetel)}</td>
                            <td className="py-2 px-3 text-right">
                              {m.novekedesi_rata != null ? (
                                <span className={m.novekedesi_rata >= 0 ? 'text-green-600' : 'text-red-500'}>
                                  {m.novekedesi_rata > 0 ? '+' : ''}{m.novekedesi_rata}%
                                </span>
                              ) : '–'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{pct(m.arbevetel_aranyos_eredmeny)}</td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{pct(m.roe)}</td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{pct(m.eladosodottsag_foka)}</td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{m.likviditasi_gyorsrata?.toFixed(2) ?? '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!selectedCompany && !loading && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">{s.emptyAnalysis}</p>
              </div>
            )}
          </div>
        )}

        {/* COMPARE TAB */}
        {tab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.compareSelectTitle}</h3>
              <div className="space-y-3">
                {compareCompanies.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS[i] }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <CompanySearchInput
                        onSelect={company => setCompareCompany(i, company)}
                        selectedCompany={c}
                        onClear={() => setCompareCompany(i, null)}
                        placeholder={s.compareSearchPlaceholder(i + 1)}
                      />
                    </div>
                  </div>
                ))}
                {compareCompanies.length < 5 && (
                  <button
                    onClick={() => setCompareCompanies([...compareCompanies, null])}
                    className="text-sm text-navy dark:text-navy-light hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {s.addCompany}
                  </button>
                )}
              </div>
              <button
                onClick={handleCompare}
                disabled={compareCompanies.filter(Boolean).length < 2 || compareLoading}
                className="mt-4 px-6 py-2.5 bg-navy text-white text-sm font-medium rounded-xl hover:bg-navy-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {compareLoading ? s.compareLoading : s.compareButton}
              </button>
            </div>

            {compareResult && (
              <>
                {/* KPI Comparison Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.kpiCompareTitle}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{s.compareMetric}</th>
                          {compareResult.companies.map((c, i) => (
                            <th key={c.company_id} className="text-right py-2 px-3 font-medium" style={{ color: COLORS[i] }}>
                              {c.company_name.length > 20 ? c.company_name.slice(0, 20) + '...' : c.company_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{s.compareAvgProfitMargin}</td>
                          {compareResult.companies.map(c => (
                            <td key={c.company_id} className="py-2 px-3 text-right text-gray-800 dark:text-gray-200">{pct(c.avg_profit_margin)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{s.compareAvgRoe}</td>
                          {compareResult.companies.map(c => (
                            <td key={c.company_id} className="py-2 px-3 text-right text-gray-800 dark:text-gray-200">{pct(c.avg_roe)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{s.compareAvgDebtRatio}</td>
                          {compareResult.companies.map(c => (
                            <td key={c.company_id} className="py-2 px-3 text-right text-gray-800 dark:text-gray-200">{pct(c.avg_debt_ratio)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{s.compareAvgLiquidity}</td>
                          {compareResult.companies.map(c => (
                            <td key={c.company_id} className="py-2 px-3 text-right text-gray-800 dark:text-gray-200">{c.avg_liquidity?.toFixed(2) ?? '–'}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overlapping Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.compareRevenueChart}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={buildCompareChartData(compareResult)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val) => fmt(val as number)} />
                      <Legend />
                      {compareResult.companies.map((c, i) => (
                        <Line
                          key={c.company_id}
                          type="monotone"
                          dataKey={`company_${c.company_id}`}
                          name={c.company_name.length > 25 ? c.company_name.slice(0, 25) + '...' : c.company_name}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Overlapping Profitability Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">{s.compareProfitMarginChart}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={buildCompareChartData(compareResult, 'arbevetel_aranyos_eredmeny')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="ev" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={v => (v * 100).toFixed(0) + '%'} />
                      <Tooltip formatter={(val) => pct(val as number)} />
                      <Legend />
                      {compareResult.companies.map((c, i) => (
                        <Line
                          key={c.company_id}
                          type="monotone"
                          dataKey={`company_${c.company_id}`}
                          name={c.company_name.length > 25 ? c.company_name.slice(0, 25) + '...' : c.company_name}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {!compareResult && !compareLoading && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <svg className="w-14 h-14 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <p className="text-sm">{s.emptyCompare}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Helper Components ---------- */

function KpiCard({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</div>
      {unit && <div className="text-xs text-gray-400">{unit}</div>}
    </div>
  )
}

function BenchmarkRow({ metric, metricLabels, lang }: { metric: { metric: string; company_value: number | null; industry_avg: number | null; position: string | null }; metricLabels: Record<string, string>; lang: 'hu' | 'en' }) {
  const label = metricLabels[metric.metric] ?? metric.metric
  const isMonetary = metric.metric === 'revenue' || metric.metric === 'ebitda'
  const fmtVal = (v: number | null) => {
    if (v == null) return '–'
    return isMonetary ? fmt(v) : pct(v)
  }

  const posColor = metric.position === 'above' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : metric.position === 'below' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 bg-gray-50 dark:bg-gray-700'
  const posLabel = metric.position === 'above' ? t[lang].benchmarkAbove : metric.position === 'below' ? t[lang].benchmarkBelow : t[lang].benchmarkAverage

  // Calculate bar widths
  const maxVal = Math.max(Math.abs(metric.company_value ?? 0), Math.abs(metric.industry_avg ?? 0)) || 1
  const companyPct = Math.abs(metric.company_value ?? 0) / maxVal * 100
  const industryPct = Math.abs(metric.industry_avg ?? 0) / maxVal * 100

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-32 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{label}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-5 rounded-full bg-navy/80" style={{ width: `${companyPct}%`, minWidth: '4px' }} />
          <span className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmtVal(metric.company_value)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 rounded-full bg-gray-300 dark:bg-gray-600" style={{ width: `${industryPct}%`, minWidth: '4px' }} />
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtVal(metric.industry_avg)}</span>
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${posColor}`}>{posLabel}</span>
    </div>
  )
}

/* ---------- Data helpers ---------- */

function buildCompareChartData(result: CompareResponse, field: string = 'netto_arbevetel'): Record<string, unknown>[] {
  const yearSet = new Set<number>()
  for (const c of result.companies) {
    for (const m of c.yearly_metrics) yearSet.add(m.ev)
  }
  const years = Array.from(yearSet).sort()
  return years.map(ev => {
    const row: Record<string, unknown> = { ev }
    for (const c of result.companies) {
      const m = c.yearly_metrics.find(x => x.ev === ev)
      row[`company_${c.company_id}`] = m ? (m as unknown as Record<string, unknown>)[field] ?? null : null
    }
    return row
  })
}
