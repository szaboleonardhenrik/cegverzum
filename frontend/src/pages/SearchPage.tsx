import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { companiesApi } from '../api/companies'
import { integrationsApi } from '../api/integrations'
import { watchlistApi } from '../api/watchlist'
import { SEO } from '../components/SEO'
import { CompanyCard } from '../components/search/CompanyCard'
import type { CompanyListItem, NavTaxpayerResponse, SearchParams } from '../types'

/* ───── adószám detection ───── */

function extractAdoszam(q: string): string | null {
  const clean = q.trim().replace(/[\s-]/g, '')
  if (/^\d{8,}$/.test(clean)) return clean.slice(0, 8)
  return null
}

const incorporationLabels: Record<string, string> = {
  ORGANIZATION: 'Szervezet',
  SELF_EMPLOYED: 'Egyéni vállalkozó',
  TAXABLE_PERSON: 'Adóalany',
}

/* ───── helpers ───── */

function FilterSection({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 border-none cursor-pointer text-left"
      >
        {title}
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800"

const FILTER_LABELS: Record<string, string> = {
  q: 'Keresés',
  statusz: 'Státusz',
  cegforma: 'Cégforma',
  teaor_kod: 'TEÁOR kód',
  fotevekenyseg: 'Fő tevékenység',
  szekhely: 'Székhely',
  alapitas_tol: 'Alapítás (-tól)',
  alapitas_ig: 'Alapítás (-ig)',
  letszam_kategoria: 'Létszám kat.',
  felszamolas: 'Felszámolás',
  csodeljras: 'Csődeljárás',
  vegelszamolas: 'Végelszámolás',
  kenyszertorles: 'Kényszertörlés',
  afa_alany: 'ÁFA alany',
}

const SORT_OPTIONS = [
  { value: '', label: 'Alapértelmezett' },
  { value: 'nev_asc', label: 'Név (A-Z)' },
  { value: 'nev_desc', label: 'Név (Z-A)' },
  { value: 'alapitas_desc', label: 'Alapítás (legújabb)' },
  { value: 'alapitas_asc', label: 'Alapítás (legrégebbi)' },
  { value: 'statusz_asc', label: 'Státusz (A-Z)' },
  { value: 'statusz_desc', label: 'Státusz (Z-A)' },
]

const PAGE_SIZES = [20, 50, 100]
const RECENT_SEARCHES_KEY = 'cegverzum_recent_searches'
const MAX_RECENT = 5

/* ───── URL ↔ state helpers ───── */

function parseBool(val: string | null): boolean | undefined {
  if (val === 'true') return true
  if (val === 'false') return false
  return undefined
}

function readFiltersFromUrl(urlParams: URLSearchParams) {
  return {
    query: urlParams.get('q') || '',
    statusz: urlParams.get('statusz') || '',
    cegforma: urlParams.get('cegforma') || '',
    teaorKod: urlParams.get('teaor_kod') || '',
    fotevekenyseg: urlParams.get('fotevekenyseg') || '',
    szekhely: urlParams.get('szekhely') || '',
    alapitasTol: urlParams.get('alapitas_tol') || '',
    alapitasIg: urlParams.get('alapitas_ig') || '',
    letszamKategoria: urlParams.get('letszam_kategoria') || '',
    felszamolas: parseBool(urlParams.get('felszamolas')),
    csodeljras: parseBool(urlParams.get('csodeljras')),
    vegelszamolas: parseBool(urlParams.get('vegelszamolas')),
    kenyszertorles: parseBool(urlParams.get('kenyszertorles')),
    afaAlany: parseBool(urlParams.get('afa_alany')),
    orderBy: urlParams.get('order_by') || '',
    page: parseInt(urlParams.get('page') || '0', 10),
    limit: parseInt(urlParams.get('limit') || '20', 10),
  }
}

/* ───── recent searches ───── */

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

function addRecentSearch(q: string) {
  if (!q.trim()) return
  const recent = getRecentSearches().filter(s => s !== q)
  recent.unshift(q)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

/* ───── pagination ───── */

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: (number | '...')[] = []
  pages.push(0)
  if (current > 2) pages.push('...')
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 3) pages.push('...')
  pages.push(total - 1)
  return pages
}

/* ───── main component ───── */

export function SearchPage() {
  const [urlParams, setUrlParams] = useSearchParams()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Read initial state from URL
  const initial = useMemo(() => readFiltersFromUrl(urlParams), []) // eslint-disable-line react-hooks/exhaustive-deps

  const [query, setQuery] = useState(initial.query)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches())

  // Alapadatok
  const [statusz, setStatusz] = useState(initial.statusz)
  const [cegforma, setCegforma] = useState(initial.cegforma)
  const [alapitasTol, setAlapitasTol] = useState(initial.alapitasTol)
  const [alapitasIg, setAlapitasIg] = useState(initial.alapitasIg)
  const [letszamKategoria, setLetszamKategoria] = useState(initial.letszamKategoria)

  // Tevékenység
  const [teaorKod, setTeaorKod] = useState(initial.teaorKod)
  const [fotevekenyseg, setFotevekenyseg] = useState(initial.fotevekenyseg)

  // Helyszín
  const [szekhely, setSzekhely] = useState(initial.szekhely)

  // Jogi státusz
  const [felszamolas, setFelszamolas] = useState<boolean | undefined>(initial.felszamolas)
  const [csodeljras, setCsodeljras] = useState<boolean | undefined>(initial.csodeljras)
  const [vegelszamolas, setVegelszamolas] = useState<boolean | undefined>(initial.vegelszamolas)
  const [kenyszertorles, setKenyszertorles] = useState<boolean | undefined>(initial.kenyszertorles)
  const [afaAlany, setAfaAlany] = useState<boolean | undefined>(initial.afaAlany)

  // Sort + pagination
  const [orderBy, setOrderBy] = useState(initial.orderBy)
  const [page, setPage] = useState(initial.page)
  const [limit, setLimit] = useState(initial.limit || 20)

  // Sections open state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ alap: true })

  // Results
  const [results, setResults] = useState<CompanyListItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Watchlist
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set())

  // NAV lookup
  const [navResult, setNavResult] = useState<NavTaxpayerResponse | null>(null)
  const [navLoading, setNavLoading] = useState(false)

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() =>
    (localStorage.getItem('cegverzum_view') as 'grid' | 'table') || 'grid'
  )

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const buildParams = useCallback((): SearchParams => ({
    q: query || undefined,
    statusz: statusz || undefined,
    cegforma: cegforma || undefined,
    teaor_kod: teaorKod || undefined,
    fotevekenyseg: fotevekenyseg || undefined,
    szekhely: szekhely || undefined,
    alapitas_tol: alapitasTol || undefined,
    alapitas_ig: alapitasIg || undefined,
    letszam_kategoria: letszamKategoria || undefined,
    felszamolas,
    csodeljras,
    vegelszamolas,
    kenyszertorles,
    afa_alany: afaAlany,
    order_by: orderBy || undefined,
    skip: page * limit,
    limit,
  }), [query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely, alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras, vegelszamolas, kenyszertorles, afaAlany, orderBy, page, limit])

  // Sync filters to URL
  const syncUrl = useCallback((params: SearchParams, currentPage: number, currentLimit: number) => {
    const next = new URLSearchParams()
    if (params.q) next.set('q', params.q)
    if (params.statusz) next.set('statusz', params.statusz)
    if (params.cegforma) next.set('cegforma', params.cegforma)
    if (params.teaor_kod) next.set('teaor_kod', params.teaor_kod)
    if (params.fotevekenyseg) next.set('fotevekenyseg', params.fotevekenyseg)
    if (params.szekhely) next.set('szekhely', params.szekhely)
    if (params.alapitas_tol) next.set('alapitas_tol', params.alapitas_tol)
    if (params.alapitas_ig) next.set('alapitas_ig', params.alapitas_ig)
    if (params.letszam_kategoria) next.set('letszam_kategoria', params.letszam_kategoria)
    if (params.felszamolas != null) next.set('felszamolas', String(params.felszamolas))
    if (params.csodeljras != null) next.set('csodeljras', String(params.csodeljras))
    if (params.vegelszamolas != null) next.set('vegelszamolas', String(params.vegelszamolas))
    if (params.kenyszertorles != null) next.set('kenyszertorles', String(params.kenyszertorles))
    if (params.afa_alany != null) next.set('afa_alany', String(params.afa_alany))
    if (params.order_by) next.set('order_by', params.order_by)
    if (currentPage > 0) next.set('page', String(currentPage))
    if (currentLimit !== 20) next.set('limit', String(currentLimit))
    setUrlParams(next, { replace: true })
  }, [setUrlParams])

  const doSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    setShowRecent(false)
    setNavResult(null)
    const params = buildParams()
    syncUrl(params, page, limit)
    if (params.q) {
      addRecentSearch(params.q)
      setRecentSearches(getRecentSearches())
    }

    // NAV lookup in parallel if the query looks like an adószám
    const adoszam = extractAdoszam(params.q || '')
    if (adoszam) {
      setNavLoading(true)
      integrationsApi.navQuery(adoszam)
        .then(data => { if (data.success) setNavResult(data) })
        .catch(() => {})
        .finally(() => setNavLoading(false))
    }

    try {
      const [data, countResp] = await Promise.all([
        companiesApi.search(params),
        companiesApi.count(params),
      ])
      setResults(data)
      setCount(countResp.count)
    } catch {
      setResults([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [buildParams, syncUrl, page, limit])

  // Auto-search if URL had filters on mount
  useEffect(() => {
    const hasFilters = Array.from(urlParams.keys()).some(k => k !== 'page' && k !== 'limit')
    if (hasFilters && !searched) doSearch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load watchlist IDs
  useEffect(() => {
    watchlistApi.ids()
      .then(data => setWatchedIds(new Set(data.ids)))
      .catch(() => {})
  }, [])

  // Re-search when page or order changes (after initial search)
  useEffect(() => {
    if (searched) doSearch()
  }, [page, orderBy]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    doSearch()
  }

  const handleReset = () => {
    setStatusz(''); setCegforma(''); setAlapitasTol(''); setAlapitasIg('')
    setTeaorKod(''); setFotevekenyseg(''); setSzekhely('')
    setLetszamKategoria('')
    setFelszamolas(undefined); setCsodeljras(undefined); setVegelszamolas(undefined)
    setKenyszertorles(undefined); setAfaAlany(undefined)
  }

  const handleToggleWatch = async (companyId: number) => {
    try {
      if (watchedIds.has(companyId)) {
        await watchlistApi.remove(companyId)
        setWatchedIds(prev => { const next = new Set(prev); next.delete(companyId); return next })
      } else {
        await watchlistApi.add(companyId)
        setWatchedIds(prev => new Set(prev).add(companyId))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  const handleExport = async () => {
    try {
      await companiesApi.exportCsv(buildParams())
    } catch { /* ignore */ }
  }

  const handleViewChange = (mode: 'grid' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('cegverzum_view', mode)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(0)
    setTimeout(() => doSearch(), 0)
  }

  const handleRecentClick = (q: string) => {
    setQuery(q)
    setShowRecent(false)
    setPage(0)
    setTimeout(() => doSearch(), 0)
  }

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
    setRecentSearches([])
  }

  const totalPages = Math.ceil(count / limit)

  const triStateNext = (v: boolean | undefined): boolean | undefined => {
    if (v === undefined) return true
    if (v === true) return false
    return undefined
  }

  const triStateLabel = (v: boolean | undefined): string => {
    if (v === true) return 'Igen'
    if (v === false) return 'Nem'
    return 'Mind'
  }

  const triStateColor = (v: boolean | undefined): string => {
    if (v === true) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    if (v === false) return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
  }

  /* ───── active filter chips ───── */

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; value: string; onRemove: () => void }[] = []
    if (query) chips.push({ key: 'q', label: FILTER_LABELS.q, value: query, onRemove: () => setQuery('') })
    if (statusz) chips.push({ key: 'statusz', label: FILTER_LABELS.statusz, value: statusz, onRemove: () => setStatusz('') })
    if (cegforma) chips.push({ key: 'cegforma', label: FILTER_LABELS.cegforma, value: cegforma, onRemove: () => setCegforma('') })
    if (teaorKod) chips.push({ key: 'teaor_kod', label: FILTER_LABELS.teaor_kod, value: teaorKod, onRemove: () => setTeaorKod('') })
    if (fotevekenyseg) chips.push({ key: 'fotevekenyseg', label: FILTER_LABELS.fotevekenyseg, value: fotevekenyseg, onRemove: () => setFotevekenyseg('') })
    if (szekhely) chips.push({ key: 'szekhely', label: FILTER_LABELS.szekhely, value: szekhely, onRemove: () => setSzekhely('') })
    if (alapitasTol) chips.push({ key: 'alapitas_tol', label: FILTER_LABELS.alapitas_tol, value: alapitasTol, onRemove: () => setAlapitasTol('') })
    if (alapitasIg) chips.push({ key: 'alapitas_ig', label: FILTER_LABELS.alapitas_ig, value: alapitasIg, onRemove: () => setAlapitasIg('') })
    if (letszamKategoria) chips.push({ key: 'letszam_kategoria', label: FILTER_LABELS.letszam_kategoria, value: letszamKategoria, onRemove: () => setLetszamKategoria('') })
    if (felszamolas != null) chips.push({ key: 'felszamolas', label: FILTER_LABELS.felszamolas, value: felszamolas ? 'Igen' : 'Nem', onRemove: () => setFelszamolas(undefined) })
    if (csodeljras != null) chips.push({ key: 'csodeljras', label: FILTER_LABELS.csodeljras, value: csodeljras ? 'Igen' : 'Nem', onRemove: () => setCsodeljras(undefined) })
    if (vegelszamolas != null) chips.push({ key: 'vegelszamolas', label: FILTER_LABELS.vegelszamolas, value: vegelszamolas ? 'Igen' : 'Nem', onRemove: () => setVegelszamolas(undefined) })
    if (kenyszertorles != null) chips.push({ key: 'kenyszertorles', label: FILTER_LABELS.kenyszertorles, value: kenyszertorles ? 'Igen' : 'Nem', onRemove: () => setKenyszertorles(undefined) })
    if (afaAlany != null) chips.push({ key: 'afa_alany', label: FILTER_LABELS.afa_alany, value: afaAlany ? 'Igen' : 'Nem', onRemove: () => setAfaAlany(undefined) })
    return chips
  }, [query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely, alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras, vegelszamolas, kenyszertorles, afaAlany])

  const handleChipRemove = (chip: typeof activeFilters[number]) => {
    chip.onRemove()
    setTimeout(() => doSearch(), 0)
  }

  /* ───── page numbers ───── */

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <SEO title="Keresés" description="Keress magyar cégek között." />
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text" value={query} onChange={e => { setQuery(e.target.value); if (!e.target.value) setShowRecent(false) }}
              onFocus={() => { if (recentSearches.length > 0 && !query) setShowRecent(true) }}
              onBlur={() => setTimeout(() => setShowRecent(false), 200)}
              placeholder="Keresés cégnév, adószám vagy cégjegyzékszám alapján..."
              className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
            />
            {/* NAV badge or Ctrl+K hint */}
            {query && extractAdoszam(query) ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 pointer-events-none">
                NAV
              </span>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-xs text-gray-400 pointer-events-none">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono border border-gray-200 dark:border-gray-600">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono border border-gray-200 dark:border-gray-600">K</kbd>
              </span>
            )}

            {/* Recent searches dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 font-medium">Korábbi keresések</span>
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); clearRecentSearches() }}
                    className="text-xs text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-0"
                  >
                    Törlés
                  </button>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); handleRecentClick(s) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="bg-gold hover:bg-gold-light text-white font-medium px-6 py-3 rounded-xl transition-colors border-none cursor-pointer btn-press">
            Keresés
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-teal hover:text-teal-dark bg-transparent border-none cursor-pointer p-0">
            {showAdvanced ? '- Részletes keresés elrejtése' : '+ Részletes keresés'}
          </button>
          {showAdvanced && (
            <button type="button" onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              Szűrők törlése
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="mt-3 space-y-2">
            {/* Alapadatok */}
            <FilterSection title="Alapadatok" open={openSections.alap || false} onToggle={() => toggleSection('alap')}>
              <Field label="Státusz">
                <select value={statusz} onChange={e => setStatusz(e.target.value)} className={inputCls}>
                  <option value="">Mind</option>
                  <option value="aktív">Aktív</option>
                  <option value="megszűnt">Megszűnt</option>
                  <option value="felszámolás alatt">Felszámolás alatt</option>
                  <option value="végelszámolás alatt">Végelszámolás alatt</option>
                </select>
              </Field>
              <Field label="Cégforma">
                <select value={cegforma} onChange={e => setCegforma(e.target.value)} className={inputCls}>
                  <option value="">Mind</option>
                  <option value="Kft.">Kft.</option>
                  <option value="Zrt.">Zrt.</option>
                  <option value="Nyrt.">Nyrt.</option>
                  <option value="Bt.">Bt.</option>
                  <option value="Kkt.">Kkt.</option>
                  <option value="Szövetkezet">Szövetkezet</option>
                  <option value="Egyéni vállalkozó">Egyéni vállalkozó</option>
                </select>
              </Field>
              <Field label="Létszám kategória">
                <select value={letszamKategoria} onChange={e => setLetszamKategoria(e.target.value)} className={inputCls}>
                  <option value="">Mind</option>
                  <option value="Mikrovállalkozás">Mikrovállalkozás</option>
                  <option value="Kisvállalkozás">Kisvállalkozás</option>
                  <option value="Középvállalkozás">Középvállalkozás</option>
                  <option value="Nagyvállalkozás">Nagyvállalkozás</option>
                </select>
              </Field>
              <Field label="Alapítás dátuma (-tól)">
                <input type="date" value={alapitasTol} onChange={e => setAlapitasTol(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Alapítás dátuma (-ig)">
                <input type="date" value={alapitasIg} onChange={e => setAlapitasIg(e.target.value)} className={inputCls} />
              </Field>
            </FilterSection>

            {/* Tevékenység */}
            <FilterSection title="Tevékenység" open={openSections.tev || false} onToggle={() => toggleSection('tev')}>
              <Field label="TEÁOR kód">
                <input type="text" value={teaorKod} onChange={e => setTeaorKod(e.target.value)} placeholder="pl. 6201" className={inputCls} />
              </Field>
              <Field label="Fő tevékenység">
                <input type="text" value={fotevekenyseg} onChange={e => setFotevekenyseg(e.target.value)} placeholder="pl. szoftverfejlesztés" className={inputCls} />
              </Field>
            </FilterSection>

            {/* Helyszín */}
            <FilterSection title="Helyszín" open={openSections.hely || false} onToggle={() => toggleSection('hely')}>
              <Field label="Székhely">
                <input type="text" value={szekhely} onChange={e => setSzekhely(e.target.value)} placeholder="pl. Budapest" className={inputCls} />
              </Field>
            </FilterSection>

            {/* Jogi státusz */}
            <FilterSection title="Jogi státusz" open={openSections.jogi || false} onToggle={() => toggleSection('jogi')}>
              <Field label="ÁFA alany">
                <button type="button" onClick={() => setAfaAlany(triStateNext(afaAlany))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer w-full ${triStateColor(afaAlany)}`}>
                  {triStateLabel(afaAlany)}
                </button>
              </Field>
              <Field label="Felszámolás">
                <button type="button" onClick={() => setFelszamolas(triStateNext(felszamolas))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer w-full ${triStateColor(felszamolas)}`}>
                  {triStateLabel(felszamolas)}
                </button>
              </Field>
              <Field label="Csődeljárás">
                <button type="button" onClick={() => setCsodeljras(triStateNext(csodeljras))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer w-full ${triStateColor(csodeljras)}`}>
                  {triStateLabel(csodeljras)}
                </button>
              </Field>
              <Field label="Végelszámolás">
                <button type="button" onClick={() => setVegelszamolas(triStateNext(vegelszamolas))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer w-full ${triStateColor(vegelszamolas)}`}>
                  {triStateLabel(vegelszamolas)}
                </button>
              </Field>
              <Field label="Kényszertörlés">
                <button type="button" onClick={() => setKenyszertorles(triStateNext(kenyszertorles))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer w-full ${triStateColor(kenyszertorles)}`}>
                  {triStateLabel(kenyszertorles)}
                </button>
              </Field>
            </FilterSection>
          </div>
        )}
      </form>

      {/* Active filter chips */}
      {searched && activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(chip => (
            <span key={chip.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal-light border border-teal/20">
              <span className="text-gray-500 dark:text-gray-400">{chip.label}:</span> {chip.value}
              <button
                type="button"
                onClick={() => handleChipRemove(chip)}
                className="ml-0.5 hover:text-red-500 bg-transparent border-none cursor-pointer p-0 text-current"
                aria-label={`Remove ${chip.label} filter`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* NAV lookup result */}
      {navLoading && (
        <div className="mb-5 flex items-center gap-3 p-5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl">
          <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">NAV adatbázis lekérdezése...</span>
        </div>
      )}

      {navResult && !navLoading && (
        <div className="mb-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
          {/* Gradient header bar */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-semibold text-white">NAV — Hivatalos adóhatósági adat</span>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white">{navResult.taxpayerName}</h3>
            {navResult.taxpayerShortName && navResult.taxpayerShortName !== navResult.taxpayerName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{navResult.taxpayerShortName}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {navResult.taxNumberDetail && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Adószám</div>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {navResult.taxNumberDetail.taxpayerId}-{navResult.taxNumberDetail.vatCode}-{navResult.taxNumberDetail.countyCode}
                    </div>
                  </div>
                </div>
              )}

              {navResult.taxpayerAddressFormatted && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Székhely</div>
                    <div className="font-medium text-gray-900 dark:text-white mt-0.5">{navResult.taxpayerAddressFormatted}</div>
                  </div>
                </div>
              )}

              {navResult.taxNumberDetail?.vatCode && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${navResult.taxNumberDetail.vatCode === '2' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
                    <svg className={`w-4 h-4 ${navResult.taxNumberDetail.vatCode === '2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">ÁFA alany</div>
                    <div className={`font-bold mt-0.5 ${navResult.taxNumberDetail.vatCode === '2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {navResult.taxNumberDetail.vatCode === '2' ? 'Igen' : 'Nem'}
                    </div>
                  </div>
                </div>
              )}

              {navResult.incorporation && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Típus</div>
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

      {/* Loading — skeleton cards */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && !navResult && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Nincs találat</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
            Próbáljon más keresési feltételeket, vagy adjon meg egy 8 számjegyű adószámot a NAV lekérdezéshez.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="animate-fade-in">
          {/* Toolbar: count, sort, export, view toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{count} találat</p>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={orderBy}
                onChange={e => { setOrderBy(e.target.value); setPage(0) }}
                className="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Export */}
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer btn-press"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>

              {/* View toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleViewChange('grid')}
                  className={`p-1.5 cursor-pointer border-none ${viewMode === 'grid' ? 'bg-gold text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange('table')}
                  className={`p-1.5 cursor-pointer border-none border-l border-gray-300 dark:border-gray-600 ${viewMode === 'table' ? 'bg-gold text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  aria-label="Table view"
                  aria-pressed={viewMode === 'table'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(company => (
                <CompanyCard key={company.id} company={company} isWatched={watchedIds.has(company.id)} onToggleWatch={handleToggleWatch} />
              ))}
            </div>
          )}

          {/* Table view */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Cégnév</th>
                    <th className="px-4 py-3">Adószám</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Cégj.szám</th>
                    <th className="px-4 py-3 hidden md:table-cell">Székhely</th>
                    <th className="px-4 py-3">Cégforma</th>
                    <th className="px-4 py-3">Státusz</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Alapítás</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map(company => (
                    <tr
                      key={company.id}
                      onClick={() => navigate(`/company/${company.id}`)}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-navy dark:text-blue-300 max-w-[250px] truncate">{company.nev}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{company.adoszam || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">{company.cegjegyzekszam || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate hidden md:table-cell">{company.szekhely || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{company.cegforma || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          company.statusz === 'aktív' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {company.statusz}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">{company.alapitas_datuma || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {/* Previous */}
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 cursor-pointer"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg border cursor-pointer transition-colors ${
                      p === page
                        ? 'bg-gold text-white border-gold font-medium'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {p + 1}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 cursor-pointer"
                aria-label="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Results per page */}
              <select
                value={limit}
                onChange={e => handleLimitChange(Number(e.target.value))}
                className="ml-4 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>{size} / oldal</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Initial empty state */}
      {!searched && !loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Keresse meg a kívánt céget</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Írja be a cégnevet, adószámot vagy cégjegyzékszámot. Adószámmal keresve a NAV hivatalos adatait is megkapja.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              NAV összekapcsolva
            </div>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Cégnév keresés
            </div>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV export
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
