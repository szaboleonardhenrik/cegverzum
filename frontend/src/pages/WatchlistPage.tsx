import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { watchlistApi } from '../api/watchlist'
import { CompanyCard } from '../components/search/CompanyCard'
import { SEO } from '../components/SEO'
import type { WatchlistItemWithCompany } from '../types'

/* ── Notification settings type ──────────────────────────────────── */

interface NotifSettings {
  emailEnabled: boolean
  emailFrequency: 'realtime' | 'daily' | 'weekly'
  systemEnabled: boolean
  onlyNegative: boolean
  financialChanges: boolean
  ownerChanges: boolean
  statusChanges: boolean
}

const DEFAULT_SETTINGS: NotifSettings = {
  emailEnabled: true,
  emailFrequency: 'daily',
  systemEnabled: true,
  onlyNegative: false,
  financialChanges: true,
  ownerChanges: true,
  statusChanges: true,
}

/* ── i18n translations ───────────────────────────────────────────── */

const t = {
  hu: {
    pageTitle: 'Cegfigyeles',
    pageDescription: 'Valos ideju ertesitesek a figyelt cegek valtozasairol',
    addCompany: 'Ceg hozzaadasa',
    watchedCompanies: 'Figyelt ceg',
    quota: 'Keret',
    negativeEvent: 'Negativ esemeny',
    withNote: 'Jegyzettel',
    usedSlots: 'Felhasznalt:',
    slotsWord: 'hely',
    tabList: 'Figyelt cegek',
    tabSettings: 'Ertesitesi beallitasok',
    emptyTitle: 'Meg nem figyel egyetlen ceget sem',
    emptyDescription: 'Keressen ra egy cegre, es adja hozza a figyelolistajahoz a csillag ikonra kattintva.',
    emptyAction: 'Cegkereses inditasa',
    addedOn: 'Hozzaadva:',
    errorLoadWatchlist: 'Nem sikerult betolteni a figyelolistat',
    errorGeneric: 'Hiba tortent',
    emailNotifications: 'E-mail ertesitesek',
    emailNotificationsDesc: 'Osszefoglalo a figyelt cegek valtozasairol',
    frequency: 'Gyakorisag',
    freqRealtime: 'Azonnal',
    freqRealtimeDesc: 'Minden valtozasnal',
    freqDaily: 'Naponta',
    freqDailyDesc: 'Napi osszefoglalo',
    freqWeekly: 'Hetente',
    freqWeeklyDesc: 'Heti osszefoglalo',
    systemNotifications: 'Rendszer ertesitesek',
    systemNotificationsDesc: 'Ertesitesek a Cegverzum feluleten',
    whatChanges: 'Milyen valtozasokrol ertesuljon?',
    onlyNegative: 'Csak negativ esemenyek',
    onlyNegativeDesc: 'Felszamolas, csod, vegelszamolas, kenyszertorles',
    financialChanges: 'Penzugyi valtozasok',
    financialChangesDesc: 'Uj merleg, arbevetel-valtozas, penzugyi mutatok',
    ownerChanges: 'Tulajdonos/tisztsegviselo valtozas',
    ownerChangesDesc: 'Uj ugyvezeto, tulajdonosvaltas, titulus-modositas',
    statusChanges: 'Statusz valtozas',
    statusChangesDesc: 'Aktiv/inaktiv, cegforma-modositas, szekhely-valtozas',
    settingsSaved: 'Beallitasok mentve',
    saveSettings: 'Beallitasok mentese',
  },
  en: {
    pageTitle: 'Company Watchlist',
    pageDescription: 'Real-time notifications about changes in your watched companies',
    addCompany: 'Add company',
    watchedCompanies: 'Watched',
    quota: 'Quota',
    negativeEvent: 'Negative event',
    withNote: 'With notes',
    usedSlots: 'Used:',
    slotsWord: 'slots',
    tabList: 'Watched companies',
    tabSettings: 'Notification settings',
    emptyTitle: 'You are not watching any companies yet',
    emptyDescription: 'Search for a company and add it to your watchlist by clicking the star icon.',
    emptyAction: 'Start company search',
    addedOn: 'Added:',
    errorLoadWatchlist: 'Failed to load the watchlist',
    errorGeneric: 'An error occurred',
    emailNotifications: 'Email notifications',
    emailNotificationsDesc: 'Summary of changes in your watched companies',
    frequency: 'Frequency',
    freqRealtime: 'Instant',
    freqRealtimeDesc: 'On every change',
    freqDaily: 'Daily',
    freqDailyDesc: 'Daily summary',
    freqWeekly: 'Weekly',
    freqWeeklyDesc: 'Weekly summary',
    systemNotifications: 'System notifications',
    systemNotificationsDesc: 'Notifications on the Cegverzum interface',
    whatChanges: 'What changes should you be notified about?',
    onlyNegative: 'Negative events only',
    onlyNegativeDesc: 'Liquidation, bankruptcy, dissolution, forced deletion',
    financialChanges: 'Financial changes',
    financialChangesDesc: 'New balance sheet, revenue changes, financial indicators',
    ownerChanges: 'Owner/officer changes',
    ownerChangesDesc: 'New managing director, ownership change, title modification',
    statusChanges: 'Status changes',
    statusChangesDesc: 'Active/inactive, legal form change, headquarters change',
    settingsSaved: 'Settings saved',
    saveSettings: 'Save settings',
  },
} as const

/* ── Helpers ─────────────────────────────────────────────────── */

function formatDate(d: string, lang: 'hu' | 'en') {
  const locale = lang === 'hu' ? 'hu-HU' : 'en-US'
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

function SvgIcon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

/* ── Component ────────────────────────────────────────────────── */

export function WatchlistPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const [items, setItems] = useState<WatchlistItemWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [countInfo, setCountInfo] = useState<{ count: number; limit: number | null }>({ count: 0, limit: null })
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')
  const [settings, setSettings] = useState<NotifSettings>(() => {
    const saved = localStorage.getItem('cegverzum_watchlist_settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const load = useCallback(async () => {
    try {
      const [listData, countData] = await Promise.all([
        watchlistApi.list(),
        watchlistApi.count(),
      ])
      setItems(listData)
      setCountInfo(countData)
    } catch (err: unknown) {
      setItems([])
      setCountInfo({ count: 0, limit: null })
      setError(err instanceof Error ? err.message : s.errorLoadWatchlist)
    } finally {
      setLoading(false)
    }
  }, [s.errorLoadWatchlist])

  useEffect(() => { load() }, [load])

  const handleRemove = async (companyId: number) => {
    try {
      await watchlistApi.remove(companyId)
      setItems(prev => prev.filter(i => i.company_id !== companyId))
      setCountInfo(prev => ({ ...prev, count: prev.count - 1 }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : s.errorGeneric)
    }
  }

  const saveSettings = () => {
    localStorage.setItem('cegverzum_watchlist_settings', JSON.stringify(settings))
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  const limitPercent = countInfo.limit
    ? Math.min(100, Math.round((countInfo.count / countInfo.limit) * 100))
    : 0

  const negativeCount = items.filter(i =>
    i.company.felszamolas || i.company.csodeljras || i.company.vegelszamolas || i.company.kenyszertorles
  ).length

  const withNoteCount = items.filter(i => i.note).length

  const frequencyOptions = [
    { value: 'realtime' as const, label: s.freqRealtime, desc: s.freqRealtimeDesc },
    { value: 'daily' as const, label: s.freqDaily, desc: s.freqDailyDesc },
    { value: 'weekly' as const, label: s.freqWeekly, desc: s.freqWeeklyDesc },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <SEO title="Cégfigyelő" description="Figyeld üzleti partnereid változásait." />
      <div className="max-w-6xl mx-auto">

        {/* ═══ PAGE HEADER ═══ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 dark:bg-gold/20 flex items-center justify-center">
                  <SvgIcon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" className="w-5 h-5 text-gold" />
                </div>
                {s.pageTitle}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {s.pageDescription}
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal text-white rounded-lg hover:bg-teal-light transition-colors text-sm font-medium no-underline shadow-sm"
            >
              <SvgIcon d="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
              {s.addCompany}
            </Link>
          </div>

          {/* ═══ SUMMARY CARDS ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Figyelt cégek */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal/10 dark:bg-teal/20 flex items-center justify-center shrink-0">
                  <SvgIcon d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{countInfo.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.watchedCompanies}</p>
                </div>
              </div>
            </div>

            {/* Limit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy/10 dark:bg-navy/20 flex items-center justify-center shrink-0">
                  <SvgIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {countInfo.limit != null ? countInfo.limit : <span className="text-lg">&infin;</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.quota}</p>
                </div>
              </div>
            </div>

            {/* Negatív esemény */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  negativeCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <SvgIcon
                    d={negativeCount > 0
                      ? 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
                      : 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
                    className={`w-5 h-5 ${negativeCount > 0 ? 'text-red-500' : 'text-green-500'}`}
                  />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${negativeCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {negativeCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.negativeEvent}</p>
                </div>
              </div>
            </div>

            {/* Jegyzettel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 dark:bg-gold/20 flex items-center justify-center shrink-0">
                  <SvgIcon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{withNoteCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.withNote}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ PROGRESS BAR ═══ */}
          {countInfo.limit != null && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {s.usedSlots} <span className="font-semibold text-gray-900 dark:text-white">{countInfo.count}</span> / {countInfo.limit} {s.slotsWord}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  limitPercent >= 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : limitPercent >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-teal/10 text-teal dark:bg-teal/20'
                }`}>
                  {limitPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    limitPercent >= 90 ? 'bg-red-500' : limitPercent >= 70 ? 'bg-yellow-500' : 'bg-teal'
                  }`}
                  style={{ width: `${limitPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${
              activeTab === 'list'
                ? 'bg-teal text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent'
            }`}
          >
            <SvgIcon d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-4 h-4" />
            {s.tabList} ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-teal text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent'
            }`}
          >
            <SvgIcon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-4 h-4" />
            {s.tabSettings}
          </button>
        </div>

        {/* ═══ ERROR ═══ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm flex items-center gap-2">
            <SvgIcon d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* ═══ LIST TAB ═══ */}
        {activeTab === 'list' && (
          <>
            {/* Loading skeleton */}
            {loading && (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {s.emptyTitle}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-sm mx-auto">
                  {s.emptyDescription}
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal-light transition-colors text-sm font-semibold no-underline shadow-sm"
                >
                  <SvgIcon d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" className="w-4 h-4" />
                  {s.emptyAction}
                </Link>
              </div>
            )}

            {/* Company grid */}
            {!loading && items.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="relative">
                    <CompanyCard
                      company={item.company}
                      isWatched={true}
                      onToggleWatch={handleRemove}
                    />
                    {/* Note badge */}
                    {item.note && (
                      <div className="mt-[-8px] mx-3 mb-2 px-3 py-2 bg-gold/5 dark:bg-gold/10 border border-gold/20 dark:border-gold/15 rounded-b-xl text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <SvgIcon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        <span>{item.note}</span>
                      </div>
                    )}
                    {/* Added date */}
                    <div className="px-3 pb-1 text-[11px] text-gray-400 dark:text-gray-600">
                      {s.addedOn} {formatDate(item.created_at, lang)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Email notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal/10 dark:bg-teal/20 flex items-center justify-center">
                  <SvgIcon d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className="w-5 h-5 text-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{s.emailNotifications}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.emailNotificationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={e => setSettings(s => ({ ...s, emailEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal" />
                </label>
              </div>
              {settings.emailEnabled && (
                <div className="px-6 py-4 space-y-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.frequency}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {frequencyOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSettings(s => ({ ...s, emailFrequency: opt.value }))}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          settings.emailFrequency === opt.value
                            ? 'border-teal bg-teal/5 dark:bg-teal/10 ring-1 ring-teal/30'
                            : 'border-gray-200 dark:border-gray-600 bg-transparent hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <p className={`text-sm font-medium ${
                          settings.emailFrequency === opt.value ? 'text-teal' : 'text-gray-700 dark:text-gray-300'
                        }`}>{opt.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* System notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-navy/10 dark:bg-navy/20 flex items-center justify-center">
                  <SvgIcon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" className="w-5 h-5 text-navy" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{s.systemNotifications}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.systemNotificationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.systemEnabled}
                    onChange={e => setSettings(s => ({ ...s, systemEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal" />
                </label>
              </div>
            </div>

            {/* Notification types */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <SvgIcon d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" className="w-4 h-4" />
                  {s.whatChanges}
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {/* Only negative */}
                <label className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                      <SvgIcon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.onlyNegative}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.onlyNegativeDesc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.onlyNegative}
                    onChange={e => setSettings(s => ({ ...s, onlyNegative: e.target.checked }))}
                    className="w-4 h-4 text-teal rounded border-gray-300 dark:border-gray-600 focus:ring-teal"
                  />
                </label>

                {/* Financial changes */}
                <label className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 dark:bg-gold/20 flex items-center justify-center shrink-0">
                      <SvgIcon d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.financialChanges}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.financialChangesDesc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financialChanges}
                    onChange={e => setSettings(s => ({ ...s, financialChanges: e.target.checked }))}
                    className="w-4 h-4 text-teal rounded border-gray-300 dark:border-gray-600 focus:ring-teal"
                  />
                </label>

                {/* Owner changes */}
                <label className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                      <SvgIcon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.ownerChanges}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.ownerChangesDesc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ownerChanges}
                    onChange={e => setSettings(s => ({ ...s, ownerChanges: e.target.checked }))}
                    className="w-4 h-4 text-teal rounded border-gray-300 dark:border-gray-600 focus:ring-teal"
                  />
                </label>

                {/* Status changes */}
                <label className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal/10 dark:bg-teal/20 flex items-center justify-center shrink-0">
                      <SvgIcon d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.statusChanges}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.statusChangesDesc}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.statusChanges}
                    onChange={e => setSettings(s => ({ ...s, statusChanges: e.target.checked }))}
                    className="w-4 h-4 text-teal rounded border-gray-300 dark:border-gray-600 focus:ring-teal"
                  />
                </label>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-end gap-3">
              {settingsSaved && (
                <span className="text-sm text-teal font-medium flex items-center gap-1">
                  <SvgIcon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
                  {s.settingsSaved}
                </span>
              )}
              <button
                onClick={saveSettings}
                className="px-6 py-2.5 bg-teal text-white rounded-lg hover:bg-teal-light transition-colors text-sm font-medium border-none cursor-pointer shadow-sm"
              >
                {s.saveSettings}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
