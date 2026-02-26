import { useState, useEffect, useRef } from 'react'
import { companiesApi } from '../../api/companies'
import type { CompanyListItem } from '../../types'

interface Props {
  onSelect: (company: CompanyListItem) => void
  placeholder?: string
  selectedCompany?: CompanyListItem | null
  onClear?: () => void
}

export function CompanySearchInput({ onSelect, placeholder = 'Cég keresése...', selectedCompany, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CompanyListItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await companiesApi.search({ q: query, limit: 10 })
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  if (selectedCompany) {
    return (
      <div className="flex items-center gap-2 bg-navy/5 dark:bg-navy-light/10 border border-navy/20 dark:border-navy-light/20 rounded-xl px-4 py-2.5">
        <svg className="w-4 h-4 text-navy dark:text-navy-light flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{selectedCompany.nev}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{selectedCompany.adoszam}</span>
        {onClear && (
          <button onClick={onClear} className="ml-1 text-gray-400 hover:text-red-500 transition-colors" aria-label="Clear selection">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-navy-light/30 focus:border-navy dark:focus:border-navy-light transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-navy rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.map(company => (
            <button
              key={company.id}
              onClick={() => {
                onSelect(company)
                setQuery('')
                setResults([])
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{company.nev}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-3 mt-0.5">
                {company.adoszam && <span>Adószám: {company.adoszam}</span>}
                {company.szekhely && <span>{company.szekhely}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Nem található cég
        </div>
      )}
    </div>
  )
}
