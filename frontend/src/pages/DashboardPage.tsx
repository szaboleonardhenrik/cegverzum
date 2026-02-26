import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardApi } from '../api/dashboard'
import { SEO } from '../components/SEO'
import type { DashboardStats } from '../types'
import { packageLabel } from '../config/pricing'

function statusBadgeColor(statusz: string): string {
  if (statusz === 'aktív') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (statusz === 'megszűnt') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

const t = {
  hu: {
    welcome: 'Üdv,',
    companiesInDb: 'Cégek az adatbázisban',
    watchlist: 'Figyelőlista',
    unreadNotifications: 'Olvasatlan értesítések',
    yourPackage: 'Csomagod',
    quickActions: 'Gyors műveletek',
    companySearch: 'Cégkeresés',
    companySearchDesc: 'Keresés név, adószám vagy cégjegyzékszám alapján',
    watchlistAction: 'Figyelőlista',
    watchlistActionDesc: 'Figyelt cégek és változáskövetés',
    financialAnalysis: 'Pénzügyi elemzés',
    financialAnalysisDesc: 'Mutatók, trendek és iparági benchmark',
    riskAnalysis: 'Kockázatelemzés',
    riskAnalysisDesc: 'Kockázati pontszám és partner minősítés',
    networkMap: 'Kapcsolati háló',
    networkMapDesc: 'Cégek közötti kapcsolatok vizualizációja',
    recentWatchlist: 'Legutóbbi figyelőlista elemek',
    viewAll: 'Összes megtekintése',
  },
  en: {
    welcome: 'Welcome,',
    companiesInDb: 'Companies in database',
    watchlist: 'Watchlist',
    unreadNotifications: 'Unread notifications',
    yourPackage: 'Your plan',
    quickActions: 'Quick actions',
    companySearch: 'Company search',
    companySearchDesc: 'Search by name, tax number, or registration number',
    watchlistAction: 'Watchlist',
    watchlistActionDesc: 'Watched companies and change tracking',
    financialAnalysis: 'Financial analysis',
    financialAnalysisDesc: 'Indicators, trends, and industry benchmarks',
    riskAnalysis: 'Risk analysis',
    riskAnalysisDesc: 'Risk score and partner rating',
    networkMap: 'Network map',
    networkMapDesc: 'Visualize connections between companies',
    recentWatchlist: 'Recent watchlist items',
    viewAll: 'View all',
  },
}

export function DashboardPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]
  const locale = lang === 'hu' ? 'hu-HU' : 'en-US'

  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <SEO title="Irányítópult" description="Cégverzum irányítópult." />
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy dark:text-white">
          {s.welcome} {user?.full_name || user?.email}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.companiesInDb}</p>
                <p className="text-2xl font-bold text-navy dark:text-white">{stats.total_companies.toLocaleString(locale)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.watchlist}</p>
                <p className="text-2xl font-bold text-gold">
                  {stats.watchlist_count}/{stats.watchlist_limit ?? '∞'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.unreadNotifications}</p>
                <p className="text-2xl font-bold text-teal">{stats.unread_notifications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.yourPackage}</p>
                <p className="text-2xl font-bold text-accent">{packageLabel(stats.package)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">{s.quickActions}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Link to="/search" className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gold/30 transition-all no-underline">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.companySearch}</h3>
          <p className="text-xs text-gray-500 mt-1">{s.companySearchDesc}</p>
        </Link>

        <Link to="/watchlist" className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-teal/30 transition-all no-underline">
          <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-3 group-hover:bg-teal/20 transition-colors">
            <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.watchlistAction}</h3>
          <p className="text-xs text-gray-500 mt-1">{s.watchlistActionDesc}</p>
        </Link>

        <Link to="/financial-analysis" className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-navy/30 transition-all no-underline">
          <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center mb-3 group-hover:bg-navy/20 transition-colors">
            <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.financialAnalysis}</h3>
          <p className="text-xs text-gray-500 mt-1">{s.financialAnalysisDesc}</p>
        </Link>

        <Link to="/risk-analysis" className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-red-500/30 transition-all no-underline">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3 group-hover:bg-red-500/20 transition-colors">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.riskAnalysis}</h3>
          <p className="text-xs text-gray-500 mt-1">{s.riskAnalysisDesc}</p>
        </Link>

        <Link to="/market-map" className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-accent/30 transition-all no-underline">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.networkMap}</h3>
          <p className="text-xs text-gray-500 mt-1">{s.networkMapDesc}</p>
        </Link>
      </div>

      {/* Recent watchlist */}
      {stats && stats.recent_watchlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-white">{s.recentWatchlist}</h2>
            <Link to="/watchlist" className="text-sm text-teal hover:text-teal-dark font-medium">
              {s.viewAll}
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {stats.recent_watchlist.map((item, i) => (
              <Link
                key={item.id}
                to={`/company/${item.company_id}`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors no-underline ${
                  i < stats.recent_watchlist.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center text-xs font-bold text-navy dark:text-blue-300 shrink-0">
                    {item.company.nev.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.company.nev}</p>
                    {item.company.szekhely && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.company.szekhely}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeColor(item.company.statusz)}`}>
                    {item.company.statusz}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString(locale)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
