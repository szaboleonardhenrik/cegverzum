import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { companiesApi } from '../api/companies'
import type { CompanyListItem, SearchParams } from '../types'

/* ═══════════ types & constants ═══════════ */

interface SavedSearch {
  id: string
  name: string
  savedAt: string
  filters: FilterState
}

interface FilterState {
  query: string; statusz: string; cegforma: string; teaorKod: string
  fotevekenyseg: string; szekhely: string; alapitasTol: string; alapitasIg: string
  letszamKategoria: string; felszamolas?: boolean; csodeljras?: boolean
  vegelszamolas?: boolean; kenyszertorles?: boolean; afaAlany?: boolean
}

const SAVED_KEY = 'cegverzum_marketing_saved'
const inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
const FILTER_LABELS: Record<string, string> = {
  q: 'Keresés', statusz: 'Státusz', cegforma: 'Cégforma', teaor_kod: 'TEÁOR kód',
  fotevekenyseg: 'Fő tevékenység', szekhely: 'Székhely', alapitas_tol: 'Alapítás (-tól)',
  alapitas_ig: 'Alapítás (-ig)', letszam_kategoria: 'Létszám kat.',
  felszamolas: 'Felszámolás', csodeljras: 'Csődeljárás', vegelszamolas: 'Végelszámolás',
  kenyszertorles: 'Kényszertörlés', afa_alany: 'ÁFA alany',
}
const SORT_OPTIONS = [
  { value: '', label: 'Alapértelmezett' }, { value: 'nev_asc', label: 'Név (A-Z)' },
  { value: 'nev_desc', label: 'Név (Z-A)' }, { value: 'alapitas_desc', label: 'Alapítás (legújabb)' },
  { value: 'alapitas_asc', label: 'Alapítás (legrégebbi)' },
]
const PAGE_SIZES = [20, 50, 100]

/* ═══════════ helpers ═══════════ */

function parseBool(val: string | null): boolean | undefined {
  if (val === 'true') return true; if (val === 'false') return false; return undefined
}
function readFiltersFromUrl(p: URLSearchParams): FilterState & { orderBy: string; page: number; limit: number } {
  return {
    query: p.get('q') || '', statusz: p.get('statusz') || '', cegforma: p.get('cegforma') || '',
    teaorKod: p.get('teaor_kod') || '', fotevekenyseg: p.get('fotevekenyseg') || '',
    szekhely: p.get('szekhely') || '', alapitasTol: p.get('alapitas_tol') || '',
    alapitasIg: p.get('alapitas_ig') || '', letszamKategoria: p.get('letszam_kategoria') || '',
    felszamolas: parseBool(p.get('felszamolas')), csodeljras: parseBool(p.get('csodeljras')),
    vegelszamolas: parseBool(p.get('vegelszamolas')), kenyszertorles: parseBool(p.get('kenyszertorles')),
    afaAlany: parseBool(p.get('afa_alany')), orderBy: p.get('order_by') || '',
    page: parseInt(p.get('page') || '0', 10), limit: parseInt(p.get('limit') || '20', 10),
  }
}
function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: (number | '...')[] = [0]
  if (current > 2) pages.push('...')
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i)
  if (current < total - 3) pages.push('...')
  pages.push(total - 1)
  return pages
}
function loadSaved(): SavedSearch[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') } catch { return [] }
}
function persistSaved(items: SavedSearch[]) { localStorage.setItem(SAVED_KEY, JSON.stringify(items)) }
function filterSummary(f: FilterState): string {
  const parts: string[] = []
  if (f.query) parts.push(`"${f.query}"`)
  if (f.statusz) parts.push(f.statusz)
  if (f.cegforma) parts.push(f.cegforma)
  if (f.szekhely) parts.push(f.szekhely)
  if (f.fotevekenyseg) parts.push(f.fotevekenyseg)
  if (f.teaorKod) parts.push(`TEÁOR: ${f.teaorKod}`)
  return parts.length > 0 ? parts.join(', ') : 'Nincs szűrő'
}

/* ═══════════ sub-components ═══════════ */

function SectionCard({ title, subtitle, open, onToggle, children }: {
  title: string; subtitle?: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border overflow-hidden transition-shadow ${open ? 'shadow-md border-gold/30 dark:border-gold/20' : 'shadow-sm border-gray-200 dark:border-gray-700'}`}>
      <button
        type="button" onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 border-none cursor-pointer text-left transition-colors ${
          open ? 'bg-gradient-to-r from-navy/5 to-teal/5 dark:from-navy/30 dark:to-teal/10' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
        }`}
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
          {!open && subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </button>
      {open && <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  )
}

function FilterRow({ label, open, onToggle, available = true, children }: {
  label: string; open: boolean; onToggle: () => void; available?: boolean; children?: React.ReactNode
}) {
  return (
    <div className={`border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 ${open ? 'bg-gold/[0.02] dark:bg-gold/[0.03]' : ''}`}>
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors border-none cursor-pointer text-left bg-transparent">
        <div className="flex items-center gap-2 min-w-0">
          {open && <span className="w-1 h-4 rounded-full bg-gold shrink-0" />}
          <span className={`text-sm ${available ? 'text-teal-dark dark:text-teal-light font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
          {!available && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">Hamarosan</span>}
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-4 pt-1">{available ? children : (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">Ez a szűrő hamarosan elérhető lesz.</p>
      )}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>{children}</div>
}

/* ═══════════ main component ═══════════ */

export function MarketingPage() {
  const [urlParams, setUrlParams] = useSearchParams()
  const navigate = useNavigate()
  const initial = useMemo(() => readFiltersFromUrl(urlParams), []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── tabs ─── */
  const [activeTab, setActiveTab] = useState<'ceg' | 'szemely' | 'cim' | 'mentett'>('ceg')

  /* ─── CÉG filter state ─── */
  const [query, setQuery] = useState(initial.query)
  const [statusz, setStatusz] = useState(initial.statusz)
  const [cegforma, setCegforma] = useState(initial.cegforma)
  const [alapitasTol, setAlapitasTol] = useState(initial.alapitasTol)
  const [alapitasIg, setAlapitasIg] = useState(initial.alapitasIg)
  const [letszamKategoria, setLetszamKategoria] = useState(initial.letszamKategoria)
  const [teaorKod, setTeaorKod] = useState(initial.teaorKod)
  const [fotevekenyseg, setFotevekenyseg] = useState(initial.fotevekenyseg)
  const [szekhely, setSzekhely] = useState(initial.szekhely)
  const [felszamolas, setFelszamolas] = useState<boolean | undefined>(initial.felszamolas)
  const [csodeljras, setCsodeljras] = useState<boolean | undefined>(initial.csodeljras)
  const [vegelszamolas, setVegelszamolas] = useState<boolean | undefined>(initial.vegelszamolas)
  const [kenyszertorles, setKenyszertorles] = useState<boolean | undefined>(initial.kenyszertorles)
  const [afaAlany, setAfaAlany] = useState<boolean | undefined>(initial.afaAlany)

  /* ─── SZEMÉLY tab state ─── */
  const [szemNev, setSzemNev] = useState('')
  const [szemAnyja, setSzemAnyja] = useState('')
  const [szemSzuletes, setSzemSzuletes] = useState('')
  const [szemIrsz, setSzemIrsz] = useState('')
  const [szemTelepules, setSzemTelepules] = useState('')
  const [szemCim, setSzemCim] = useState('')
  const [szemAdoazon, setSzemAdoazon] = useState('')

  /* ─── CÍM tab state ─── */
  const [cimIrsz, setCimIrsz] = useState('')
  const [cimTelepules, setCimTelepules] = useState('')
  const [cimUtca, setCimUtca] = useState('')
  const [cimHazszam, setCimHazszam] = useState('')

  /* ─── sort + pagination ─── */
  const [orderBy, setOrderBy] = useState(initial.orderBy)
  const [page, setPage] = useState(initial.page)
  const [limit, setLimit] = useState(initial.limit || 20)

  /* ─── ui state ─── */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ altalanos: true })
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<CompanyListItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [exporting, setExporting] = useState(false)

  /* ─── save search state ─── */
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSaved)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }))
  const toggleFilter = (k: string) => setOpenFilters(p => ({ ...p, [k]: !p[k] }))

  const getFilterState = useCallback((): FilterState => ({
    query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely,
    alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras,
    vegelszamolas, kenyszertorles, afaAlany,
  }), [query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely, alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras, vegelszamolas, kenyszertorles, afaAlany])

  const buildParams = useCallback((): SearchParams => ({
    q: query || undefined, statusz: statusz || undefined, cegforma: cegforma || undefined,
    teaor_kod: teaorKod || undefined, fotevekenyseg: fotevekenyseg || undefined,
    szekhely: szekhely || undefined, alapitas_tol: alapitasTol || undefined,
    alapitas_ig: alapitasIg || undefined, letszam_kategoria: letszamKategoria || undefined,
    felszamolas, csodeljras, vegelszamolas, kenyszertorles, afa_alany: afaAlany,
    order_by: orderBy || undefined, skip: page * limit, limit,
  }), [query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely, alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras, vegelszamolas, kenyszertorles, afaAlany, orderBy, page, limit])

  const syncUrl = useCallback((params: SearchParams, pg: number, lim: number) => {
    const n = new URLSearchParams()
    if (params.q) n.set('q', params.q)
    if (params.statusz) n.set('statusz', params.statusz)
    if (params.cegforma) n.set('cegforma', params.cegforma)
    if (params.teaor_kod) n.set('teaor_kod', params.teaor_kod)
    if (params.fotevekenyseg) n.set('fotevekenyseg', params.fotevekenyseg)
    if (params.szekhely) n.set('szekhely', params.szekhely)
    if (params.alapitas_tol) n.set('alapitas_tol', params.alapitas_tol)
    if (params.alapitas_ig) n.set('alapitas_ig', params.alapitas_ig)
    if (params.letszam_kategoria) n.set('letszam_kategoria', params.letszam_kategoria)
    if (params.felszamolas != null) n.set('felszamolas', String(params.felszamolas))
    if (params.csodeljras != null) n.set('csodeljras', String(params.csodeljras))
    if (params.vegelszamolas != null) n.set('vegelszamolas', String(params.vegelszamolas))
    if (params.kenyszertorles != null) n.set('kenyszertorles', String(params.kenyszertorles))
    if (params.afa_alany != null) n.set('afa_alany', String(params.afa_alany))
    if (params.order_by) n.set('order_by', params.order_by)
    if (pg > 0) n.set('page', String(pg))
    if (lim !== 20) n.set('limit', String(lim))
    setUrlParams(n, { replace: true })
  }, [setUrlParams])

  const doSearch = useCallback(async () => {
    setLoading(true); setSearched(true)
    const params = buildParams(); syncUrl(params, page, limit)
    try {
      const [data, countResp] = await Promise.all([companiesApi.search(params), companiesApi.count(params)])
      setResults(data); setCount(countResp.count)
    } catch { setResults([]); setCount(0) }
    finally { setLoading(false) }
  }, [buildParams, syncUrl, page, limit])

  useEffect(() => {
    const hasFilters = Array.from(urlParams.keys()).some(k => k !== 'page' && k !== 'limit')
    if (hasFilters && !searched) doSearch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (searched) doSearch() }, [page, orderBy]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => { setPage(0); doSearch() }
  const handleReset = () => {
    setQuery(''); setStatusz(''); setCegforma(''); setAlapitasTol(''); setAlapitasIg('')
    setTeaorKod(''); setFotevekenyseg(''); setSzekhely(''); setLetszamKategoria('')
    setFelszamolas(undefined); setCsodeljras(undefined); setVegelszamolas(undefined)
    setKenyszertorles(undefined); setAfaAlany(undefined)
  }
  const handleLimitChange = (v: number) => { setLimit(v); setPage(0); setTimeout(doSearch, 0) }

  /* ─── selection ─── */
  const toggleSelect = (id: number) => setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSelectAll = () => {
    const ids = results.map(r => r.id); const all = ids.every(id => selectedIds.has(id))
    setSelectedIds(p => { const n = new Set(p); ids.forEach(id => all ? n.delete(id) : n.add(id)); return n })
  }
  const clearSelection = () => setSelectedIds(new Set())
  const handleExport = async () => {
    if (!selectedIds.size) return; setExporting(true)
    try { await companiesApi.exportMarketingCsv(Array.from(selectedIds)) } catch { /* */ }
    finally { setExporting(false) }
  }

  /* ─── save/load searches ─── */
  const handleSave = () => {
    if (!saveName.trim()) return
    const item: SavedSearch = { id: Date.now().toString(), name: saveName.trim(), savedAt: new Date().toISOString(), filters: getFilterState() }
    const next = [item, ...savedSearches]
    setSavedSearches(next); persistSaved(next); setSaveName(''); setShowSaveDialog(false)
  }
  const handleDeleteSaved = (id: string) => {
    const next = savedSearches.filter(s => s.id !== id); setSavedSearches(next); persistSaved(next)
  }
  const handleLoadSaved = (s: SavedSearch) => {
    setQuery(s.filters.query); setStatusz(s.filters.statusz); setCegforma(s.filters.cegforma)
    setTeaorKod(s.filters.teaorKod); setFotevekenyseg(s.filters.fotevekenyseg)
    setSzekhely(s.filters.szekhely); setAlapitasTol(s.filters.alapitasTol)
    setAlapitasIg(s.filters.alapitasIg); setLetszamKategoria(s.filters.letszamKategoria)
    setFelszamolas(s.filters.felszamolas); setCsodeljras(s.filters.csodeljras)
    setVegelszamolas(s.filters.vegelszamolas); setKenyszertorles(s.filters.kenyszertorles)
    setAfaAlany(s.filters.afaAlany); setActiveTab('ceg')
  }
  const handleRenameStart = (s: SavedSearch) => { setEditingId(s.id); setEditName(s.name) }
  const handleRenameSave = () => {
    if (!editName.trim() || !editingId) return
    const next = savedSearches.map(s => s.id === editingId ? { ...s, name: editName.trim() } : s)
    setSavedSearches(next); persistSaved(next); setEditingId(null)
  }

  const totalPages = Math.ceil(count / limit)
  const triStateNext = (v: boolean | undefined): boolean | undefined => v === undefined ? true : v === true ? false : undefined
  const triStateLabel = (v: boolean | undefined) => v === true ? 'Igen' : v === false ? 'Nem' : 'Mind'
  const triStateColor = (v: boolean | undefined) =>
    v === true ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    : v === false ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'

  const activeFilters = useMemo(() => {
    const c: { key: string; label: string; value: string; onRemove: () => void }[] = []
    if (query) c.push({ key: 'q', label: FILTER_LABELS.q, value: query, onRemove: () => setQuery('') })
    if (statusz) c.push({ key: 'statusz', label: FILTER_LABELS.statusz, value: statusz, onRemove: () => setStatusz('') })
    if (cegforma) c.push({ key: 'cegforma', label: FILTER_LABELS.cegforma, value: cegforma, onRemove: () => setCegforma('') })
    if (teaorKod) c.push({ key: 'teaor_kod', label: FILTER_LABELS.teaor_kod, value: teaorKod, onRemove: () => setTeaorKod('') })
    if (fotevekenyseg) c.push({ key: 'fotevekenyseg', label: FILTER_LABELS.fotevekenyseg, value: fotevekenyseg, onRemove: () => setFotevekenyseg('') })
    if (szekhely) c.push({ key: 'szekhely', label: FILTER_LABELS.szekhely, value: szekhely, onRemove: () => setSzekhely('') })
    if (alapitasTol) c.push({ key: 'alapitas_tol', label: FILTER_LABELS.alapitas_tol, value: alapitasTol, onRemove: () => setAlapitasTol('') })
    if (alapitasIg) c.push({ key: 'alapitas_ig', label: FILTER_LABELS.alapitas_ig, value: alapitasIg, onRemove: () => setAlapitasIg('') })
    if (letszamKategoria) c.push({ key: 'letszam_kategoria', label: FILTER_LABELS.letszam_kategoria, value: letszamKategoria, onRemove: () => setLetszamKategoria('') })
    if (felszamolas != null) c.push({ key: 'felszamolas', label: FILTER_LABELS.felszamolas, value: felszamolas ? 'Igen' : 'Nem', onRemove: () => setFelszamolas(undefined) })
    if (csodeljras != null) c.push({ key: 'csodeljras', label: FILTER_LABELS.csodeljras, value: csodeljras ? 'Igen' : 'Nem', onRemove: () => setCsodeljras(undefined) })
    if (vegelszamolas != null) c.push({ key: 'vegelszamolas', label: FILTER_LABELS.vegelszamolas, value: vegelszamolas ? 'Igen' : 'Nem', onRemove: () => setVegelszamolas(undefined) })
    if (kenyszertorles != null) c.push({ key: 'kenyszertorles', label: FILTER_LABELS.kenyszertorles, value: kenyszertorles ? 'Igen' : 'Nem', onRemove: () => setKenyszertorles(undefined) })
    if (afaAlany != null) c.push({ key: 'afa_alany', label: FILTER_LABELS.afa_alany, value: afaAlany ? 'Igen' : 'Nem', onRemove: () => setAfaAlany(undefined) })
    return c
  }, [query, statusz, cegforma, teaorKod, fotevekenyseg, szekhely, alapitasTol, alapitasIg, letszamKategoria, felszamolas, csodeljras, vegelszamolas, kenyszertorles, afaAlany])

  const handleChipRemove = (chip: typeof activeFilters[number]) => { chip.onRemove(); setTimeout(doSearch, 0) }
  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages])
  const pageIds = results.map(r => r.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))
  const somePageSelected = pageIds.some(id => selectedIds.has(id))

  /* ═══════════ render ═══════════ */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* Sticky selection bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-40 mb-4 bg-gold/10 dark:bg-gold/20 border border-gold/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-sm shadow-sm">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedIds.size} cég kiválasztva</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={clearSelection} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">Törlés</button>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gold hover:bg-gold-light text-white rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50 btn-press">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {exporting ? 'Exportálás...' : `Export CSV (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* ╔══════════ SEARCH PANEL ══════════╗ */}
      <div className="mb-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* Panel header with gradient */}
        <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark px-6 py-4">
          <h1 className="text-lg font-bold text-white">Marketing adatbázis</h1>
          <p className="text-xs text-white/60 mt-0.5">Összetett keresés cégek, személyek és címek között</p>
        </div>

        {/* Tabs — pill style */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'ceg' as const, label: 'CÉG', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { id: 'szemely' as const, label: 'SZEMÉLY', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'cim' as const, label: 'CÍM', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
              { id: 'mentett' as const, label: 'MENTETT KERESÉSEK', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
            ]).map(tab => (
              <button
                key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide border-none cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold text-white shadow-md shadow-gold/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-col lg:flex-row">

          {/* ── LEFT: tab content area ── */}
          <div className="flex-1 p-6 min-w-0">

            {/* ════ CÉG TAB ════ */}
            {activeTab === 'ceg' && (
              <div className="space-y-3">
                {/* Általános keresési feltételek */}
                <SectionCard title="Általános keresési feltételek" subtitle="Szöveges keresés, cégforma, alapítás dátuma, cégállapot, főtevékenység, tevékenység, kapcsolt vállalkozások, export relációk, számlaszám" open={openSections.altalanos || false} onToggle={() => toggleSection('altalanos')}>
                  <FilterRow label="Szöveges keresés" open={openFilters.szoveges || false} onToggle={() => toggleFilter('szoveges')}>
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cégnév, adószám vagy cégjegyzékszám..." className={inputCls} />
                  </FilterRow>
                  <FilterRow label="Cégforma" open={openFilters.cegforma || false} onToggle={() => toggleFilter('cegforma')}>
                    <select value={cegforma} onChange={e => setCegforma(e.target.value)} className={inputCls}>
                      <option value="">Mind</option>
                      <option value="Kft.">Kft.</option><option value="Zrt.">Zrt.</option><option value="Nyrt.">Nyrt.</option>
                      <option value="Bt.">Bt.</option><option value="Kkt.">Kkt.</option>
                      <option value="Szövetkezet">Szövetkezet</option><option value="Egyéni vállalkozó">Egyéni vállalkozó</option>
                    </select>
                  </FilterRow>
                  <FilterRow label="Alapítás dátuma" open={openFilters.alapitas || false} onToggle={() => toggleFilter('alapitas')}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Dátum (-tól)"><input type="date" value={alapitasTol} onChange={e => setAlapitasTol(e.target.value)} className={inputCls} /></Field>
                      <Field label="Dátum (-ig)"><input type="date" value={alapitasIg} onChange={e => setAlapitasIg(e.target.value)} className={inputCls} /></Field>
                    </div>
                  </FilterRow>
                  <FilterRow label="Cégállapot" open={openFilters.cegallapot || false} onToggle={() => toggleFilter('cegallapot')}>
                    <div className="space-y-3">
                      <Field label="Státusz">
                        <select value={statusz} onChange={e => setStatusz(e.target.value)} className={inputCls}>
                          <option value="">Mind</option><option value="aktív">Aktív</option><option value="megszűnt">Megszűnt</option>
                          <option value="felszámolás alatt">Felszámolás alatt</option><option value="végelszámolás alatt">Végelszámolás alatt</option>
                        </select>
                      </Field>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {([
                          { label: 'ÁFA alany', value: afaAlany, set: setAfaAlany },
                          { label: 'Felszámolás', value: felszamolas, set: setFelszamolas },
                          { label: 'Csődeljárás', value: csodeljras, set: setCsodeljras },
                          { label: 'Végelszámolás', value: vegelszamolas, set: setVegelszamolas },
                          { label: 'Kényszertörlés', value: kenyszertorles, set: setKenyszertorles },
                        ] as const).map(item => (
                          <button key={item.label} type="button" onClick={() => item.set(triStateNext(item.value))}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer text-center ${triStateColor(item.value)}`}>
                            {item.label}: {triStateLabel(item.value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FilterRow>
                  <FilterRow label="Főtevékenység" open={openFilters.fotevekenyseg || false} onToggle={() => toggleFilter('fotevekenyseg')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="TEÁOR kód"><input type="text" value={teaorKod} onChange={e => setTeaorKod(e.target.value)} placeholder="pl. 6201" className={inputCls} /></Field>
                      <Field label="Fő tevékenység"><input type="text" value={fotevekenyseg} onChange={e => setFotevekenyseg(e.target.value)} placeholder="pl. szoftverfejlesztés" className={inputCls} /></Field>
                    </div>
                  </FilterRow>
                  <FilterRow label="Tevékenység" open={openFilters.tevekenyseg || false} onToggle={() => toggleFilter('tevekenyseg')} available={false} />
                  <FilterRow label="Kapcsolt vállalkozások" open={openFilters.kapcsolt || false} onToggle={() => toggleFilter('kapcsolt')} available={false} />
                  <FilterRow label="Export relációk" open={openFilters.export_rel || false} onToggle={() => toggleFilter('export_rel')} available={false} />
                  <FilterRow label="Számlaszám" open={openFilters.szamlaszam || false} onToggle={() => toggleFilter('szamlaszam')} available={false} />
                </SectionCard>

                {/* Címre keresés */}
                <SectionCard title="Címre keresés" subtitle="Címkeresés, ország, település, régiók, vármegyék, kerületek" open={openSections.cim_sec || false} onToggle={() => toggleSection('cim_sec')}>
                  <FilterRow label="Címkeresés" open={openFilters.cimkereses || false} onToggle={() => toggleFilter('cimkereses')}>
                    <input type="text" value={szekhely} onChange={e => setSzekhely(e.target.value)} placeholder="Település, utca, irányítószám..." className={inputCls} />
                  </FilterRow>
                  <FilterRow label="Ország" open={openFilters.orszag || false} onToggle={() => toggleFilter('orszag')} available={false} />
                  <FilterRow label="Település" open={openFilters.telepules || false} onToggle={() => toggleFilter('telepules')} available={false} />
                  <FilterRow label="Régiók, vármegyék, kerületek" open={openFilters.regiok || false} onToggle={() => toggleFilter('regiok')} available={false} />
                </SectionCard>

                {/* Pénzügyi adatokra vonatkozó keresés */}
                <SectionCard title="Pénzügyi adatokra vonatkozó keresés" subtitle="Alaptőke, nyereség/veszteség, mérlegfőösszeg, árbevétel, kötelezettségek, exportbevétel, létszámadatok" open={openSections.penzugyi || false} onToggle={() => toggleSection('penzugyi')}>
                  <FilterRow label="Alaptőke" open={openFilters.alaptoke || false} onToggle={() => toggleFilter('alaptoke')} available={false} />
                  <FilterRow label="Adózás előtti nyereség (2024)" open={openFilters.ae_ny || false} onToggle={() => toggleFilter('ae_ny')} available={false} />
                  <FilterRow label="Adózás előtti veszteség (2024)" open={openFilters.ae_veszt || false} onToggle={() => toggleFilter('ae_veszt')} available={false} />
                  <FilterRow label="Adózás utáni nyereség (2024)" open={openFilters.au_ny || false} onToggle={() => toggleFilter('au_ny')} available={false} />
                  <FilterRow label="Adózás utáni veszteség (2024)" open={openFilters.au_veszt || false} onToggle={() => toggleFilter('au_veszt')} available={false} />
                  <FilterRow label="Mérlegfőösszeg (2024)" open={openFilters.merleg || false} onToggle={() => toggleFilter('merleg')} available={false} />
                  <FilterRow label="Nettó árbevétel (2024)" open={openFilters.netto || false} onToggle={() => toggleFilter('netto')} available={false} />
                  <FilterRow label="Kötelezettség összege (2024)" open={openFilters.kotelezett || false} onToggle={() => toggleFilter('kotelezett')} available={false} />
                  <FilterRow label="Exportbevétel (2024)" open={openFilters.exportbev || false} onToggle={() => toggleFilter('exportbev')} available={false} />
                  <FilterRow label="Exportbevétel % (2024)" open={openFilters.exportbev_pct || false} onToggle={() => toggleFilter('exportbev_pct')} available={false} />
                  <FilterRow label="Adózás előtti eredmény éves változása (2023 - 2024)" open={openFilters.ae_valtozas || false} onToggle={() => toggleFilter('ae_valtozas')} available={false} />
                  <FilterRow label="Adózott eredmény éves változása (2023 - 2024)" open={openFilters.adozott_valtozas || false} onToggle={() => toggleFilter('adozott_valtozas')} available={false} />
                  <FilterRow label="Mérlegfőösszeg éves változása (2023 - 2024)" open={openFilters.merleg_valtozas || false} onToggle={() => toggleFilter('merleg_valtozas')} available={false} />
                  <FilterRow label="Nettó árbevétel éves változása (2023 - 2024)" open={openFilters.netto_valtozas || false} onToggle={() => toggleFilter('netto_valtozas')} available={false} />
                  <FilterRow label="Kötelezettség összegének éves változása (2023 - 2024)" open={openFilters.kotelezett_valtozas || false} onToggle={() => toggleFilter('kotelezett_valtozas')} available={false} />
                  <FilterRow label="Létszámadatok" open={openFilters.letszam || false} onToggle={() => toggleFilter('letszam')}>
                    <select value={letszamKategoria} onChange={e => setLetszamKategoria(e.target.value)} className={inputCls}>
                      <option value="">Mind</option><option value="Mikrovállalkozás">Mikrovállalkozás</option>
                      <option value="Kisvállalkozás">Kisvállalkozás</option><option value="Középvállalkozás">Középvállalkozás</option>
                      <option value="Nagyvállalkozás">Nagyvállalkozás</option>
                    </select>
                  </FilterRow>
                </SectionCard>
              </div>
            )}

            {/* ════ SZEMÉLY TAB ════ */}
            {activeTab === 'szemely' && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Személyes kapcsolati háló keresés</h2>
                <div className="max-w-xl space-y-4">
                  <Field label="Név"><input type="text" value={szemNev} onChange={e => setSzemNev(e.target.value)} placeholder="Vezetéknév Keresztnév" className={inputCls} /></Field>
                  <Field label="Anyja neve"><input type="text" value={szemAnyja} onChange={e => setSzemAnyja(e.target.value)} placeholder="Vezetéknév Keresztnév" className={inputCls} /></Field>
                  <Field label="Születés ideje"><input type="date" value={szemSzuletes} onChange={e => setSzemSzuletes(e.target.value)} className={inputCls} /></Field>
                  <Field label="Irányítószám"><input type="text" value={szemIrsz} onChange={e => setSzemIrsz(e.target.value)} placeholder="Irányítószám" className={inputCls} /></Field>
                  <Field label="Település *"><input type="text" value={szemTelepules} onChange={e => setSzemTelepules(e.target.value)} placeholder="Település" className={inputCls} /></Field>
                  <Field label="Cím *"><input type="text" value={szemCim} onChange={e => setSzemCim(e.target.value)} placeholder="Cím" className={inputCls} /></Field>
                  <Field label="Adóazonosító jel"><input type="text" value={szemAdoazon} onChange={e => setSzemAdoazon(e.target.value)} placeholder="Adóazonosító jel" className={inputCls} /></Field>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">*A település és a cím keresési feltétel mellé még egy keresési feltétel megadása szükséges.</p>
                </div>
              </div>
            )}

            {/* ════ CÍM TAB ════ */}
            {activeTab === 'cim' && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Keresés konkrét cím alapján</h2>
                <div className="max-w-xl space-y-4">
                  <Field label="Irányítószám"><input type="text" value={cimIrsz} onChange={e => setCimIrsz(e.target.value)} placeholder="pl. 1051" className={inputCls} /></Field>
                  <Field label="Település"><input type="text" value={cimTelepules} onChange={e => setCimTelepules(e.target.value)} placeholder="pl. Budapest" className={inputCls} /></Field>
                  <Field label="Utca, tér"><input type="text" value={cimUtca} onChange={e => setCimUtca(e.target.value)} placeholder="pl. Kossuth Lajos tér" className={inputCls} /></Field>
                  <Field label="Házszám"><input type="text" value={cimHazszam} onChange={e => setCimHazszam(e.target.value)} placeholder="pl. 1-3" className={inputCls} /></Field>
                </div>
              </div>
            )}

            {/* ════ MENTETT KERESÉSEK TAB ════ */}
            {activeTab === 'mentett' && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Mentett keresések</h2>
                {savedSearches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Még nincsenek mentett keresések.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Állítsa be a szűrőket a Cég fülön, majd mentse el.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedSearches.map(s => (
                      <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        {editingId === s.id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRenameSave()}
                              className={`${inputCls} flex-1`} autoFocus />
                            <button type="button" onClick={handleRenameSave} className="px-3 py-2 text-xs font-medium bg-gold text-white rounded-lg border-none cursor-pointer hover:bg-gold-light">Mentés</button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 text-xs text-gray-500 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700">Mégse</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(s.savedAt).toLocaleDateString('hu-HU')} - {filterSummary(s.filters)}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => handleLoadSaved(s)} title="Betöltés"
                                  className="p-1.5 rounded-lg text-teal hover:bg-teal/10 border-none bg-transparent cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </button>
                                <button type="button" onClick={() => handleRenameStart(s)} title="Átnevezés"
                                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-none bg-transparent cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button type="button" onClick={() => handleDeleteSaved(s.id)} title="Törlés"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-none bg-transparent cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="lg:w-60 shrink-0 p-6 lg:pl-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700">
            <div className="lg:sticky lg:top-20 space-y-3">
              {/* Active filters badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">Feltételek</span>
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-md bg-gold/10 text-gold text-xs font-bold">{activeFilters.length}</span>
              </div>

              <button type="button" onClick={handleReset} className="w-full text-xs text-teal hover:text-teal-dark dark:hover:text-teal-light bg-transparent border-none cursor-pointer text-left py-1 transition-colors">
                Összes feltétel törlése
              </button>

              {/* Save search */}
              {activeTab === 'ceg' && (
                <>
                  {showSaveDialog ? (
                    <div className="space-y-2">
                      <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                        placeholder="Keresés neve..." className={inputCls} autoFocus />
                      <div className="flex gap-2">
                        <button type="button" onClick={handleSave} disabled={!saveName.trim()}
                          className="flex-1 py-2 text-xs font-medium bg-teal hover:bg-teal-dark text-white rounded-lg border-none cursor-pointer disabled:opacity-40">Mentés</button>
                        <button type="button" onClick={() => { setShowSaveDialog(false); setSaveName('') }}
                          className="px-3 py-2 text-xs text-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700">Mégse</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowSaveDialog(true)}
                      className="w-full py-2.5 text-xs font-medium text-teal border border-teal/30 hover:bg-teal/5 dark:hover:bg-teal/10 rounded-lg cursor-pointer bg-transparent transition-colors">
                      Keresés mentése
                    </button>
                  )}
                </>
              )}

              <button type="button" onClick={handleSearch}
                className="w-full py-3 bg-gold hover:bg-gold-light text-white text-sm font-bold rounded-xl transition-colors border-none cursor-pointer btn-press shadow-md shadow-gold/20">
                KERESÉS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {searched && activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(chip => (
            <span key={chip.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal-light border border-teal/20">
              <span className="text-gray-500 dark:text-gray-400">{chip.label}:</span> {chip.value}
              <button type="button" onClick={() => handleChipRemove(chip)} className="ml-0.5 hover:text-red-500 bg-transparent border-none cursor-pointer p-0 text-current">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3"><div className="skeleton w-5 h-5 rounded" /><div className="skeleton h-4 w-1/3" /><div className="skeleton h-3 w-1/4 ml-auto" /></div>
          </div>
        ))}</div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Nincs találat</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Próbáljon más keresési feltételeket.</p>
        </div>
      )}

      {/* Results table */}
      {!loading && results.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{count} találat</p>
            <select value={orderBy} onChange={e => { setOrderBy(e.target.value); setPage(0) }}
              className="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allPageSelected} ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
                      onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer" />
                  </th>
                  <th className="px-4 py-3">Cégnév</th><th className="px-4 py-3">Adószám</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Székhely</th><th className="px-4 py-3 hidden md:table-cell">Cégforma</th>
                  <th className="px-4 py-3">Státusz</th><th className="px-4 py-3 hidden lg:table-cell">Alapítás</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map(c => (
                  <tr key={c.id} className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedIds.has(c.id) ? 'bg-gold/5 dark:bg-gold/10' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer" /></td>
                    <td className="px-4 py-3 font-medium text-navy dark:text-teal-light max-w-[250px] truncate cursor-pointer hover:underline" onClick={() => navigate(`/company/${c.id}`)}>{c.nev}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.adoszam || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate hidden lg:table-cell">{c.szekhely || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap hidden md:table-cell">{c.cegforma || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.statusz === 'aktív' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{c.statusz}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">{c.alapitas_datuma || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {pageNumbers.map((p, i) => p === '...' ? (
                <span key={`e-${i}`} className="px-2 text-sm text-gray-400">...</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg border cursor-pointer transition-colors ${p === page ? 'bg-gold text-white border-gold font-medium' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'}`}>
                  {p + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <select value={limit} onChange={e => handleLimitChange(Number(e.target.value))}
                className="ml-4 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / oldal</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Initial empty state */}
      {!searched && !loading && (
        <div className="text-center py-10 animate-fade-in">
          <p className="text-sm text-gray-400 dark:text-gray-500">Állítsa be a szűrőket, majd kattintson a <span className="font-semibold text-gold">KERESÉS</span> gombra.</p>
        </div>
      )}
    </div>
  )
}
