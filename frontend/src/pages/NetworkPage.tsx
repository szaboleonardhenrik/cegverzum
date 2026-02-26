import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { companiesApi } from '../api/companies'
import type { CompanyListItem, NetworkData } from '../types'

export function NetworkPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'

  const t = {
    hu: {
      pageTitle: 'Kapcsolati háló',
      searchPlaceholder: 'Keress egy céget a kapcsolati háló megtekintéséhez...',
      loading: 'Kapcsolati háló betöltése...',
      emptyTitle: 'Keress egy céget a kapcsolati háló megtekintéséhez',
      emptySubtitle: 'A gráf a közös tisztségviselőkön keresztüli kapcsolatokat mutatja',
      legendCenter: 'Központi',
      legendConnected: 'Kapcsolt',
      statsCompanies: 'cég',
      statsConnections: 'kapcsolat',
      navHint: 'Kattints egy cégre a hálóban a részletek megtekintéséhez, vagy az új központi cégként való betöltéshez.',
    },
    en: {
      pageTitle: 'Network Graph',
      searchPlaceholder: 'Search for a company to view its network...',
      loading: 'Loading network graph...',
      emptyTitle: 'Search for a company to view its network',
      emptySubtitle: 'The graph shows connections through shared officers',
      legendCenter: 'Center',
      legendConnected: 'Connected',
      statsCompanies: 'companies',
      statsConnections: 'connections',
      navHint: 'Click on a company in the graph to view its details or load it as the new center.',
    },
  }
  const s = t[lang]

  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<CompanyListItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const graphRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const loadNetwork = useCallback(async (companyId: number) => {
    setLoading(true)
    try {
      const data = await companiesApi.getNetwork(companyId)
      setNetworkData(data)
      const center = data.nodes.find(n => n.is_center)
      if (center) setSelectedCompany(center.nev)
    } catch {
      setNetworkData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load from URL param on mount
  useEffect(() => {
    const companyId = searchParams.get('company')
    if (companyId) {
      loadNetwork(Number(companyId))
    }
  }, [searchParams, loadNetwork])

  const handleSearchChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await companiesApi.search({ q: value, limit: 8 })
        setSuggestions(results)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }, 300)
  }

  const selectCompany = (company: CompanyListItem) => {
    setQuery(company.nev)
    setShowSuggestions(false)
    setSuggestions([])
    setSearchParams({ company: String(company.id) })
  }

  const handleNodeClick = useCallback((node: { id?: string | number }) => {
    if (!node.id) return
    setSearchParams({ company: String(node.id) })
  }, [setSearchParams])

  // Graph data transformation
  const graphData = networkData ? {
    nodes: networkData.nodes.map(n => ({
      id: n.id,
      name: n.nev,
      statusz: n.statusz,
      isCenter: n.is_center,
      val: n.is_center ? 8 : 3,
    })),
    links: networkData.links.map(l => ({
      source: l.source,
      target: l.target,
      officers: l.officers,
    })),
  } : { nodes: [], links: [] }

  const nodeColor = (node: { isCenter?: boolean; statusz?: string }) => {
    if (node.isCenter) return '#D4A017'
    if (node.statusz === 'aktív') return '#0D9488'
    if (node.statusz === 'megszűnt') return '#EF4444'
    return '#6B7280'
  }

  const containerHeight = graphRef.current?.clientHeight || 500

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6">{s.pageTitle}</h1>

      {/* Search bar */}
      <div className="relative mb-6 max-w-xl">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={s.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map(c => (
              <button
                key={c.id}
                onMouseDown={() => selectCompany(c)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 bg-transparent border-none cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.nev}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.adoszam && <span className="mr-3">{c.adoszam}</span>}
                  {c.szekhely}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Graph container */}
      <div
        ref={graphRef}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500">{s.loading}</p>
            </div>
          </div>
        )}

        {!loading && !networkData && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">{s.emptyTitle}</p>
              <p className="text-gray-400 text-xs mt-1">{s.emptySubtitle}</p>
            </div>
          </div>
        )}

        {!loading && networkData && (
          <>
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600 text-xs">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{selectedCompany}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gold inline-block" /> {s.legendCenter}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-teal inline-block" /> {s.legendConnected}
                </span>
              </div>
              <p className="text-gray-400 mt-1">{networkData.nodes.length} {s.statsCompanies}, {networkData.links.length} {s.statsConnections}</p>
            </div>

            <ForceGraph2D
              graphData={graphData}
              width={graphRef.current?.clientWidth || 800}
              height={containerHeight}
              nodeColor={nodeColor}
              nodeLabel={(node: { name?: string }) => node.name || ''}
              nodeRelSize={6}
              linkColor={() => 'rgba(156, 163, 175, 0.4)'}
              linkWidth={1.5}
              linkLabel={(link: { officers?: string[] }) => (link.officers || []).join(', ')}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              nodeCanvasObject={(node: { x?: number; y?: number; isCenter?: boolean; name?: string }, ctx: CanvasRenderingContext2D) => {
                const x = node.x || 0
                const y = node.y || 0
                const r = node.isCenter ? 8 : 5
                ctx.beginPath()
                ctx.arc(x, y, r, 0, 2 * Math.PI, false)
                ctx.fillStyle = nodeColor(node)
                ctx.fill()
                ctx.strokeStyle = 'white'
                ctx.lineWidth = 1.5
                ctx.stroke()

                // Label
                const label = node.name || ''
                ctx.font = `${node.isCenter ? 'bold ' : ''}${node.isCenter ? 11 : 9}px sans-serif`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'top'
                ctx.fillStyle = '#374151'
                ctx.fillText(label, x, y + r + 2)
              }}
            />
          </>
        )}
      </div>

      {/* Navigation hint */}
      {networkData && networkData.nodes.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          {s.navHint}
        </p>
      )}
    </div>
  )
}
