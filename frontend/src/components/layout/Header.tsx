import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi } from '../../api/notifications'
import type { Notification } from '../../types'

const services = [
  { label: 'Céginformáció', labelEn: 'Company Info', href: '/search', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Marketing adatbázis', labelEn: 'Marketing DB', href: '/marketing', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Piactérkép', labelEn: 'Market Map', href: '/market-map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { label: 'API összeköttetés', labelEn: 'API Connect', href: '/api-connect', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { label: 'Cégfigyelés', labelEn: 'Monitoring', href: '/watchlist', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { label: 'Pénzügyi elemzés', labelEn: 'Financial Analysis', href: '/financial-analysis', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Kockázatelemzés', labelEn: 'Risk Analysis', href: '/risk-analysis', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
]

function SvgIcon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'most'
  if (mins < 60) return `${mins} perce`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} órája`
  const days = Math.floor(hours / 24)
  return `${days} napja`
}

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [lang, setLang] = useState<'hu' | 'en'>(() => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu')
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  const hu = lang === 'hu'

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load notifications
  useEffect(() => {
    if (!user) return
    notificationsApi.unreadCount().then(r => setUnreadCount(r.count)).catch(() => {})
    const interval = setInterval(() => {
      notificationsApi.unreadCount().then(r => setUnreadCount(r.count)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  const openNotifications = async () => {
    setNotifOpen(!notifOpen)
    setProfileOpen(false)
    if (!notifOpen) {
      try {
        const data = await notificationsApi.list()
        setNotifications(data)
      } catch { /* */ }
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch { /* */ }
  }

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('cegverzum_dark', next ? '1' : '0')
  }

  const toggleLang = () => {
    const next = lang === 'hu' ? 'en' : 'hu'
    setLang(next)
    localStorage.setItem('cegverzum_lang', next)
  }

  const handleLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  const categoryIcon = (cat: string) => {
    if (cat === 'company') return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    if (cat === 'alert') return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
    return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }

  const categoryColor = (cat: string) => {
    if (cat === 'company') return 'text-teal'
    if (cat === 'alert') return 'text-red-500'
    return 'text-gold'
  }

  return (
    <header className="bg-navy dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* LEFT: Logo */}
          <Link to={user ? '/search' : '/'} className="flex items-center no-underline text-white shrink-0">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gold">Cég</span>verzum
            </span>
          </Link>

          {/* CENTER: Search bar (desktop) */}
          {user && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={hu ? 'Cégnév, adószám vagy cégjegyzékszám...' : 'Company name, tax ID...'}
                  className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white/15 transition-colors"
                />
              </div>
            </form>
          )}

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white/70 hover:text-white text-xs font-bold uppercase"
              title={hu ? 'Switch to English' : 'Váltás magyarra'}
            >
              {lang === 'hu' ? 'EN' : 'HU'}
            </button>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white/70 hover:text-white"
              title={hu ? 'Éjszakai mód' : 'Dark mode'}
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notification bell */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={openNotifications}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white/70 hover:text-white relative"
                  title={hu ? 'Értesítések' : 'Notifications'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {hu ? 'Értesítések' : 'Notifications'}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-gold hover:text-gold-light bg-transparent border-none cursor-pointer"
                        >
                          {hu ? 'Összes olvasott' : 'Mark all read'}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                          {hu ? 'Nincsenek értesítések' : 'No notifications'}
                        </div>
                      ) : notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 transition-colors bg-transparent border-none cursor-pointer ${
                            n.is_read
                              ? 'opacity-60'
                              : 'bg-gold/5 dark:bg-gold/10'
                          } hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                        >
                          <div className="flex gap-3">
                            <div className={`shrink-0 mt-0.5 ${categoryColor(n.category)}`}>
                              <SvgIcon d={categoryIcon(n.category)} className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                                {!n.is_read && <span className="w-2 h-2 bg-gold rounded-full shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Login */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                  className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-sm font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm hidden lg:inline">{user.email}</span>
                  <svg className="w-4 h-4 text-white/60 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.is_admin ? (hu ? 'Adminisztrátor' : 'Administrator') : (hu ? 'Partner' : 'Partner')}
                      </p>
                    </div>
                    {([
                      { to: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: hu ? 'Profil' : 'Profile' },
                      { to: '/profile?tab=elofizetes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: hu ? 'Előfizetés' : 'Subscription' },
                      { to: '/profile?tab=penzugyek', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: hu ? 'Pénzügyek' : 'Billing' },
                      { to: '/profile?tab=beallitasok', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: hu ? 'Beállítások' : 'Settings' },
                      { to: '/profile?tab=naplo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: hu ? 'Eseménynapló' : 'Activity Log' },
                      { to: '/profile?tab=kapcsolat', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: hu ? 'Kapcsolat' : 'Contact' },
                    ] as const).map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 no-underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                        {item.label}
                      </Link>
                    ))}
                    {user.is_admin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 no-underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        {hu ? 'Admin panel' : 'Admin Panel'}
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left border-none bg-transparent cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {hu ? 'Kijelentkezés' : 'Log out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gold hover:bg-gold-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors no-underline"
              >
                {hu ? 'Belépés' : 'Log in'}
              </Link>
            )}

            {/* Mobile hamburger */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border-none cursor-pointer text-white"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SERVICES NAV BAR (desktop) */}
      {user && (
        <div className="hidden md:block bg-navy-dark dark:bg-gray-950 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
              {services.map(s => (
                <Link
                  key={s.label}
                  to={s.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap no-underline transition-colors ${
                    s.href !== '#' && location.pathname === s.href
                      ? 'bg-gold/20 text-gold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <SvgIcon d={s.icon} className="w-4 h-4" />
                  {hu ? s.label : s.labelEn}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {user && mobileOpen && (
        <div className="md:hidden bg-navy-dark dark:bg-gray-950 border-t border-white/10">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={hu ? 'Keresés...' : 'Search...'}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {services.map(s => (
                <Link
                  key={s.label}
                  to={s.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                    s.href !== '#' && location.pathname === s.href
                      ? 'bg-gold/20 text-gold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <SvgIcon d={s.icon} className="w-4 h-4 shrink-0" />
                  <span className="truncate">{hu ? s.label : s.labelEn}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
