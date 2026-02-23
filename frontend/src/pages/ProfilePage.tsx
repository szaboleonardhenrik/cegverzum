import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'

const TABS = [
  { key: 'profil', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { key: 'jelszo', label: 'Jelszó változtatás', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { key: 'elofizetes', label: 'Előfizetés', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'penzugyek', label: 'Pénzügyek', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'beallitasok', label: 'Beállítások', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { key: 'naplo', label: 'Eseménynapló', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'kapcsolat', label: 'Kapcsolat', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'profil'
  const [activeTab, setActiveTab] = useState(tabParam)

  // Password change
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  // Settings
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))
  const [lang, setLang] = useState(localStorage.getItem('cegverzum_lang') || 'hu')

  useEffect(() => { setActiveTab(tabParam) }, [tabParam])

  if (!user) return null

  const handleTabClick = (key: string) => {
    setActiveTab(key)
    navigate(`/profile?tab=${key}`, { replace: true })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(''); setPwErr('')
    if (newPw !== confirmPw) { setPwErr('Az új jelszavak nem egyeznek'); return }
    if (newPw.length < 8) { setPwErr('Az új jelszónak legalább 8 karakter hosszúnak kell lennie'); return }
    try {
      const res = await authApi.changePassword(oldPw, newPw)
      setPwMsg(res.message)
      setOldPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  const handleDarkToggle = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('cegverzum_dark', next ? '1' : '0')
  }

  const handleLangChange = (l: string) => {
    setLang(l)
    localStorage.setItem('cegverzum_lang', l)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const mockEvents = [
    { date: '2026-02-21 14:56', action: 'Bejelentkezés', detail: 'Sikeres bejelentkezés' },
    { date: '2026-02-21 14:57', action: 'Cégkeresés', detail: 'Keresés: "Tudatos Diák"' },
    { date: '2026-02-21 14:58', action: 'Cégadatlap megtekintés', detail: 'Tudatos Diák Iskolaszövetkezet' },
    { date: '2026-02-20 09:12', action: 'Bejelentkezés', detail: 'Sikeres bejelentkezés' },
    { date: '2026-02-19 16:30', action: 'Jelszó változtatás', detail: 'Jelszó sikeresen megváltoztatva' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6">Fiókom</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Avatar header */}
            <div className="bg-gradient-to-r from-navy to-navy-light p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-2xl font-bold text-white mx-auto">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-medium text-sm mt-3">{user.email}</p>
              <p className="text-white/60 text-xs">{user.is_admin ? 'Adminisztrátor' : 'Partner'}</p>
            </div>

            {/* Tab nav */}
            <nav className="p-2">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => handleTabClick(t.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left border-none cursor-pointer transition-colors ${
                    activeTab === t.key
                      ? 'bg-gold/10 text-gold font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-none cursor-pointer bg-transparent text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Kijelentkezés
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

            {/* ── Profil ── */}
            {activeTab === 'profil' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Profil adatok</h2>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Szerepkör</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.is_admin ? 'Adminisztrátor' : 'Partner'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Státusz</span>
                    <span className="text-sm font-medium text-green-600">{user.is_active ? 'Aktív' : 'Inaktív'}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-gray-500">Regisztráció dátuma</span>
                    <span className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('hu-HU')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Jelszó változtatás ── */}
            {activeTab === 'jelszo' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Jelszó változtatás</h2>
                <form onSubmit={handlePasswordChange} className="max-w-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jelenlegi jelszó</label>
                    <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Új jelszó</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Új jelszó megerősítése</label>
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}
                  {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
                  <button type="submit" className="bg-gold hover:bg-gold-light text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors border-none cursor-pointer">
                    Jelszó megváltoztatása
                  </button>
                </form>
              </div>
            )}

            {/* ── Előfizetés ── */}
            {activeTab === 'elofizetes' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Előfizetés</h2>
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl p-5 mb-6 border border-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gold-dark">Jelenlegi csomag</p>
                      <p className="text-2xl font-bold text-navy dark:text-white mt-1">{user.is_admin ? 'Admin' : 'Partner'}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Aktív</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">A modulok aktiválását az adminisztrátor végzi. Kérdés esetén vegye fel a kapcsolatot az ügyfélszolgálattal.</p>
              </div>
            )}

            {/* ── Pénzügyek ── */}
            {activeTab === 'penzugyek' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Pénzügyek</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Számlázási funkció hamarosan elérhető</p>
                  <p className="text-sm text-gray-400 mt-1">A számlák és fizetési előzmények itt lesznek megtekinthetők.</p>
                </div>
              </div>
            )}

            {/* ── Beállítások ── */}
            {activeTab === 'beallitasok' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Beállítások</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Éjszakai mód</p>
                      <p className="text-xs text-gray-500">Sötét háttér a kényelmesebb olvasásért</p>
                    </div>
                    <button
                      onClick={handleDarkToggle}
                      className={`relative w-11 h-6 rounded-full transition-colors border-none cursor-pointer ${darkMode ? 'bg-gold' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Nyelv</p>
                      <p className="text-xs text-gray-500">Felület nyelve</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLangChange('hu')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border-none cursor-pointer transition-colors ${lang === 'hu' ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                      >
                        Magyar
                      </button>
                      <button
                        onClick={() => handleLangChange('en')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border-none cursor-pointer transition-colors ${lang === 'en' ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email értesítések</p>
                      <p className="text-xs text-gray-500">Értesítések cégadatok változásáról</p>
                    </div>
                    <button className="relative w-11 h-6 rounded-full bg-gray-300 transition-colors border-none cursor-pointer">
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Eseménynapló ── */}
            {activeTab === 'naplo' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Eseménynapló</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Dátum</th>
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Esemény</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Részletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEvents.map((e, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2.5 pr-4 text-gray-500 font-mono text-xs whitespace-nowrap">{e.date}</td>
                          <td className="py-2.5 pr-4 font-medium">{e.action}</td>
                          <td className="py-2.5 text-gray-600 dark:text-gray-400">{e.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Kapcsolat ── */}
            {activeTab === 'kapcsolat' && (
              <div>
                <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Kapcsolat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-teal">support@cegverzum.hu</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Telefon</p>
                        <p className="text-sm text-teal">+36 1 234 5678</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
                  <p className="text-sm font-medium mb-2">Ügyfélszolgálati időszak</p>
                  <p className="text-sm text-gray-500">Hétfő - Péntek: 9:00 - 17:00</p>
                  <p className="text-sm text-gray-500">Szombat - Vasárnap: zárva</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
