import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminApi } from '../api/admin'
import type { User, Module, UserModule, AdminStats } from '../types'

type Tab = 'felhasznalok' | 'modulok' | 'statisztikak'

const PACKAGES = [
  { value: 'free', label: 'Ingyenes', price: 0 },
  { value: 'basic', label: 'Basic', price: 9900 },
  { value: 'pro', label: 'Pro', price: 29900 },
  { value: 'enterprise', label: 'Enterprise', price: 99900 },
]

function packageLabel(pkg: string): string {
  return PACKAGES.find(p => p.value === pkg)?.label || pkg
}

function packageColor(pkg: string): string {
  switch (pkg) {
    case 'enterprise': return 'bg-purple-100 text-purple-800'
    case 'pro': return 'bg-gold/10 text-gold-dark'
    case 'basic': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function formatPrice(price: number): string {
  if (price === 0) return 'Ingyenes'
  return price.toLocaleString('hu-HU') + ' Ft/hó'
}

/* ───── Sparkline mini-chart ───── */

function Sparkline({ data, color = '#D4A017' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 60
  const h = 24
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="sparkline inline-block ml-2" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

// Mock 7-day trend data
const MOCK_TRENDS = {
  users: [3, 4, 4, 5, 5, 6, 6],
  admins: [1, 1, 1, 1, 2, 2, 2],
  active: [2, 3, 3, 4, 4, 5, 5],
  revenue: [19800, 29700, 29700, 39600, 49500, 59400, 69300],
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('felhasznalok')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create user modal
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createAdmin, setCreateAdmin] = useState(false)
  const [createPkg, setCreatePkg] = useState('free')
  const [createPrice, setCreatePrice] = useState(0)
  const [creating, setCreating] = useState(false)

  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPkg, setEditPkg] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editAdmin, setEditAdmin] = useState(false)
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Delete user modal
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Module state
  const [modules, setModules] = useState<Module[]>([])
  const [userModules, setUserModules] = useState<Record<number, UserModule[]>>({})
  const [modulesLoading, setModulesLoading] = useState(false)

  // Admin stats
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Search/filter
  const [search, setSearch] = useState('')
  const [filterPkg, setFilterPkg] = useState('')
  const [filterRole, setFilterRole] = useState('')

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await adminApi.listAllUsers()
      setUsers(data)
    } catch {
      setError('Nem sikerült betölteni a felhasználókat')
    } finally {
      setLoading(false)
    }
  }

  const loadModules = async () => {
    setModulesLoading(true)
    try {
      const [mods, allUsers] = await Promise.all([
        adminApi.listModules(),
        adminApi.listAllUsers(),
      ])
      setModules(mods)
      setUsers(allUsers)
      const nonAdmins = allUsers.filter(u => !u.is_admin)
      const umMap: Record<number, UserModule[]> = {}
      await Promise.all(nonAdmins.map(async (p) => {
        umMap[p.id] = await adminApi.listUserModules(p.id)
      }))
      setUserModules(umMap)
    } catch {
      setError('Nem sikerült betölteni a modulokat')
    } finally {
      setModulesLoading(false)
    }
  }

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await adminApi.getStats()
      setAdminStats(data)
    } catch {
      setError('Nem sikerült betölteni a statisztikákat')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { if (tab === 'modulok') loadModules() }, [tab])
  useEffect(() => { if (tab === 'statisztikak') loadStats() }, [tab])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setCreating(true)
    try {
      await adminApi.createUser({
        email: createEmail,
        full_name: createName || undefined,
        password: createPassword || undefined,
        is_admin: createAdmin,
        package: createPkg,
        monthly_price: createPrice,
      })
      setSuccess(`Felhasználó létrehozva: ${createName || createEmail}`)
      setShowCreate(false)
      setCreateName(''); setCreateEmail(''); setCreatePassword(''); setCreateAdmin(false); setCreatePkg('free'); setCreatePrice(0)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) await adminApi.deactivatePartner(userId)
      else await adminApi.activatePartner(userId)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  const handleToggleRole = async (userId: number) => {
    try {
      await adminApi.toggleUserRole(userId)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    setDeleting(true)
    try {
      await adminApi.deleteUser(deletingUser.id)
      setSuccess(`${deletingUser.full_name || deletingUser.email} törölve`)
      setDeletingUser(null)
      setSelectedUsers(prev => { const next = new Set(prev); next.delete(deletingUser.id); return next })
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    } finally {
      setDeleting(false)
    }
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setEditName(user.full_name || '')
    setEditEmail(user.email)
    setEditPkg(user.package)
    setEditPrice(user.monthly_price)
    setEditAdmin(user.is_admin)
    setEditActive(user.is_active)
  }

  const handleEditSave = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      const data: Record<string, unknown> = {}
      if (editName !== (editingUser.full_name || '')) data.full_name = editName || null
      if (editEmail !== editingUser.email) data.email = editEmail
      if (editPkg !== editingUser.package) data.package = editPkg
      if (editPrice !== editingUser.monthly_price) data.monthly_price = editPrice
      if (editAdmin !== editingUser.is_admin) data.is_admin = editAdmin
      if (editActive !== editingUser.is_active) data.is_active = editActive
      if (Object.keys(data).length === 0) {
        setEditingUser(null)
        return
      }
      await adminApi.updateUser(editingUser.id, data)
      setEditingUser(null)
      setSuccess(`${editingUser.full_name || editingUser.email} frissítve`)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleGlobalModule = async (moduleId: number) => {
    try {
      const updated = await adminApi.toggleModule(moduleId)
      setModules(prev => prev.map(m => m.id === moduleId ? updated : m))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  const handleToggleUserModule = async (userId: number, moduleId: number) => {
    try {
      const updated = await adminApi.toggleUserModule(userId, moduleId)
      setUserModules(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).map(um =>
          um.module_id === moduleId ? updated : um
        ),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    }
  }

  // Bulk selection helpers
  const toggleSelectUser = (userId: number) => {
    setSelectedUsers(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const exportSelectedCsv = () => {
    const selected = users.filter(u => selectedUsers.has(u.id))
    if (selected.length === 0) return
    const headers = ['Név', 'Email', 'Szerepkör', 'Státusz', 'Csomag', 'Havi díj', 'Regisztrált']
    const rows = selected.map(u => [
      u.full_name || '',
      u.email,
      u.is_admin ? 'Admin' : 'Partner',
      u.is_active ? 'Aktív' : 'Inaktív',
      packageLabel(u.package),
      u.monthly_price.toString(),
      u.has_registered ? 'Igen' : 'Nem',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `felhasznalok_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowBulkMenu(false)
    setSuccess(`${selected.length} felhasználó exportálva`)
  }

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      if (!u.email.toLowerCase().includes(q) && !(u.full_name || '').toLowerCase().includes(q)) return false
    }
    if (filterPkg && u.package !== filterPkg) return false
    if (filterRole === 'admin' && !u.is_admin) return false
    if (filterRole === 'normal' && u.is_admin) return false
    return true
  })

  // Stats
  const totalUsers = users.length
  const adminCount = users.filter(u => u.is_admin).length
  const activeCount = users.filter(u => u.is_active && u.has_registered).length
  const totalRevenue = users.reduce((acc, u) => acc + (u.monthly_price || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Admin panel</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors border-none cursor-pointer shadow-sm btn-press"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Új felhasználó regisztrálása
        </button>
      </div>

      {/* Stats cards with sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Összes felhasználó</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-navy dark:text-white">{totalUsers}</p>
            <Sparkline data={MOCK_TRENDS.users} color="#1E3A5F" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Adminok</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-purple-600 mt-1">{adminCount}</p>
            <Sparkline data={MOCK_TRENDS.admins} color="#9333ea" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Aktív partnerek</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
            <Sparkline data={MOCK_TRENDS.active} color="#16a34a" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Havi bevétel</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-gold mt-1">{totalRevenue.toLocaleString('hu-HU')} Ft</p>
            <Sparkline data={MOCK_TRENDS.revenue} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('felhasznalok')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
            tab === 'felhasznalok' ? 'bg-white dark:bg-gray-700 text-navy dark:text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Felhasználók
        </button>
        <button
          onClick={() => setTab('modulok')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
            tab === 'modulok' ? 'bg-white dark:bg-gray-700 text-navy dark:text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Modulok
        </button>
        <button
          onClick={() => setTab('statisztikak')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
            tab === 'statisztikak' ? 'bg-white dark:bg-gray-700 text-navy dark:text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Statisztikák
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between text-red-600 text-sm mb-4 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between text-green-600 text-sm mb-4 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 bg-transparent border-none cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* FELHASZNALOK TAB */}
      {tab === 'felhasznalok' && (
        <>
          {/* Search, filters, and bulk actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Keresés név vagy email alapján..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800"
              />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold">
              <option value="">Minden szerepkör</option>
              <option value="admin">Admin</option>
              <option value="normal">Partner</option>
            </select>
            <select value={filterPkg} onChange={e => setFilterPkg(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold">
              <option value="">Minden csomag</option>
              {PACKAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            {/* Bulk actions */}
            {selectedUsers.size > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span className="font-medium">{selectedUsers.size} kijelölve</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showBulkMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 w-48 overflow-hidden">
                    <button
                      onClick={exportSelectedCsv}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent border-none cursor-pointer transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      CSV exportálás
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Users table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="text-center px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 accent-gold cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Név</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Szerepkör</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Státusz</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Csomag</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Havi díj</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Reg.</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="px-5 py-8 text-center text-gray-400">Betöltés...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={9} className="px-5 py-8 text-center text-gray-400">Nincs találat</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="text-center px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center text-xs font-bold text-navy dark:text-blue-300 shrink-0">
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                            {user.full_name || <span className="text-gray-400 italic text-xs">Nincs megadva</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.is_admin ? 'Admin' : 'Partner'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Aktív' : 'Inaktív'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${packageColor(user.package)}`}>
                          {packageLabel(user.package)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-300">{formatPrice(user.monthly_price)}</td>
                      <td className="px-4 py-3 text-center">
                        {user.has_registered ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditUser(user)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors bg-gold/10 text-gold-dark hover:bg-gold/20"
                            title="Szerkesztés">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {!user.is_admin && (
                            <button onClick={() => handleToggle(user.id, user.is_active)}
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors ${user.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                              {user.is_active ? 'Tiltás' : 'Aktiválás'}
                            </button>
                          )}
                          <button onClick={() => handleToggleRole(user.id)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors bg-purple-50 text-purple-700 hover:bg-purple-100"
                            title={user.is_admin ? 'Partner-ré visszaállítás' : 'Admin-ná kinevezés'}>
                            {user.is_admin ? 'Partner' : 'Admin'}
                          </button>
                          <button onClick={() => setDeletingUser(user)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors bg-red-50 text-red-700 hover:bg-red-100"
                            title="Felhasználó törlése">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500">
              {filteredUsers.length} felhasználó{search || filterPkg || filterRole ? ` (szűrve ${users.length}-ből)` : ''}
            </div>
          </div>
        </>
      )}

      {/* MODULOK TAB */}
      {tab === 'modulok' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
            <h2 className="text-base font-semibold text-navy dark:text-white mb-3">Globális modulok</h2>
            <p className="text-xs text-gray-500 mb-4">Globálisan ki/bekapcsolható modulok. Kikapcsolt modul senkinek sem elérhető.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map(m => (
                <div key={m.id} className={`rounded-xl border p-4 transition-colors ${m.is_active ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 bg-gray-50/50 dark:bg-gray-700/30 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{m.display_name}</span>
                    <button onClick={() => handleToggleGlobalModule(m.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer ${m.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${m.is_active ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-base font-semibold text-navy dark:text-white">Felhasználói modul hozzáférés</h2>
            </div>
            {modulesLoading ? (
              <div className="px-5 py-8 text-center text-gray-400">Betöltés...</div>
            ) : users.filter(u => !u.is_admin).length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">Még nincsenek partnerek</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Partner</th>
                      {modules.map(m => (
                        <th key={m.id} className="text-center px-3 py-3 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">{m.display_name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => !u.is_admin).map(p => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                          <span className="font-medium">{p.full_name || p.email}</span>
                        </td>
                        {modules.map(m => {
                          const um = (userModules[p.id] || []).find(x => x.module_id === m.id)
                          const active = um?.is_active || false
                          return (
                            <td key={m.id} className="text-center px-3 py-3">
                              <button onClick={() => handleToggleUserModule(p.id, m.id)} disabled={!m.is_active}
                                className={`relative w-9 h-5 rounded-full transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-gold' : 'bg-gray-300'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-4' : ''}`} />
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* STATISZTIKAK TAB */}
      {tab === 'statisztikak' && (
        <>
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full" />
            </div>
          ) : adminStats ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Összes felhasználó</p>
                  <p className="text-2xl font-bold text-navy dark:text-white mt-1">{adminStats.total_users}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Aktív partnerek</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{adminStats.active_users}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Havi bevétel</p>
                  <p className="text-2xl font-bold text-gold mt-1">{adminStats.monthly_revenue.toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Chat üzenetek</p>
                  <p className="text-2xl font-bold text-teal mt-1">{adminStats.total_chat_messages.toLocaleString('hu-HU')}</p>
                </div>
              </div>

              {/* Additional info row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Cégek az adatbázisban</p>
                  <p className="text-2xl font-bold text-navy dark:text-white mt-1">{adminStats.total_companies.toLocaleString('hu-HU')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Adminok</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{adminStats.admin_count}</p>
                </div>
              </div>

              {/* Package chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
                <h3 className="text-base font-semibold text-navy dark:text-white mb-4">Felhasználók csomagok szerint</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: 'Free', count: adminStats.users_by_package.free || 0 },
                    { name: 'Basic', count: adminStats.users_by_package.basic || 0 },
                    { name: 'Pro', count: adminStats.users_by_package.pro || 0 },
                    { name: 'Enterprise', count: adminStats.users_by_package.enterprise || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Felhasználók" fill="#D4A017" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent registrations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-base font-semibold text-navy dark:text-white">Legutóbbi regisztrációk</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Név</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Csomag</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Dátum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.recent_users.map(u => (
                        <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.full_name || '–'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${packageColor(u.package)}`}>
                              {packageLabel(u.package)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('hu-HU') : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">Nem sikerült betölteni a statisztikákat</div>
          )}
        </>
      )}

      {/* CREATE USER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-navy dark:text-white">Új felhasználó regisztrálása</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent border-none cursor-pointer">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teljes név</label>
                  <input type="text" value={createName} onChange={e => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700" placeholder="Példa János" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)} required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700" placeholder="pelda@email.hu" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jelszó <span className="text-gray-400 font-normal">(opcionális — ha üresen hagyja, meghívóként jön létre)</span></label>
                <input type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700" placeholder="Min. 8 karakter" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Csomag</label>
                  <select value={createPkg} onChange={e => { setCreatePkg(e.target.value); setCreatePrice(PACKAGES.find(p => p.value === e.target.value)?.price || 0) }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700">
                    {PACKAGES.map(p => <option key={p.value} value={p.value}>{p.label} — {p.price === 0 ? 'Ingyenes' : `${p.price.toLocaleString('hu-HU')} Ft/hó`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Havi díj (Ft)</label>
                  <input type="number" value={createPrice} onChange={e => setCreatePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700" />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <button type="button" onClick={() => setCreateAdmin(!createAdmin)}
                  className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer ${createAdmin ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${createAdmin ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Adminisztrátor</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer bg-transparent">
                  Mégse
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer border-none btn-press">
                  {creating ? 'Létrehozás...' : 'Felhasználó létrehozása'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditingUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-navy dark:text-white">Felhasználó szerkesztése</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent border-none cursor-pointer">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teljes név</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-gray-700" placeholder="Példa János" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-gray-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Csomag</label>
                <div className="grid grid-cols-2 gap-2">
                  {PACKAGES.map(p => (
                    <button key={p.value} onClick={() => { setEditPkg(p.value); setEditPrice(p.price) }}
                      className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${editPkg === p.value ? 'border-gold bg-gold/5 ring-2 ring-gold/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 bg-transparent'}`}>
                      <span className="text-sm font-semibold block">{p.label}</span>
                      <span className="text-xs text-gray-500">{p.price === 0 ? 'Ingyenes' : `${p.price.toLocaleString('hu-HU')} Ft/hó`}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Egyedi havi díj (Ft)</label>
                <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-gray-700" />
              </div>

              <div className="flex items-center gap-6 py-2">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditActive(!editActive)}
                    className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer ${editActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editActive ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aktív</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditAdmin(!editAdmin)}
                    className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer ${editAdmin ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editAdmin ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Adminisztrátor</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer bg-transparent">
                Mégse
              </button>
              <button onClick={handleEditSave} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer border-none btn-press">
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeletingUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Felhasználó törlése</h3>
              <p className="text-sm text-gray-500 mt-2">
                Biztosan törölni szeretné <strong>{deletingUser.full_name || deletingUser.email}</strong> felhasználót? Ez a művelet nem vonható vissza.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer bg-transparent">
                Mégse
              </button>
              <button onClick={handleDeleteUser} disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer border-none btn-press">
                {deleting ? 'Törlés...' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
