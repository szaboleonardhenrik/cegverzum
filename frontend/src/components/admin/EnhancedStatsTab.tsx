import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../../api/admin'
import type { AdminStats } from '../../types'
import { packageLabel } from '../../config/pricing'

function packageColor(pkg: string): string {
  switch (pkg) {
    case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'pro': return 'bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold'
    case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

const t = {
  hu: {
    totalUsers: 'Összes felhasználó',
    activePartners: 'Aktív partnerek',
    monthlyRevenue: 'Havi bevétel',
    chatMessages: 'Chat üzenetek',
    companiesInDb: 'Cégek az adatbázisban',
    admins: 'Adminok',
    dau: 'Napi aktív felhasználók',
    avgResponseTime: 'Átl. válaszidő',
    usersByPackage: 'Felhasználók csomagok szerint',
    usersChartLabel: 'Felhasználók',
    recentRegistrations: 'Legutóbbi regisztrációk',
    signups30d: 'Regisztrációk (utolsó 30 nap)',
    topSearchedCompanies: 'Legkeresettebb cégútvonalak',
    signupsLabel: 'Regisztrációk',
    thName: 'Név',
    thEmail: 'Email',
    thPackage: 'Csomag',
    thDate: 'Dátum',
    thPath: 'Útvonal',
    thCount: 'Keresések',
    statsLoadFailed: 'Nem sikerült betölteni a statisztikákat',
    loading: 'Betöltés...',
  },
  en: {
    totalUsers: 'Total users',
    activePartners: 'Active partners',
    monthlyRevenue: 'Monthly revenue',
    chatMessages: 'Chat messages',
    companiesInDb: 'Companies in database',
    admins: 'Admins',
    dau: 'Daily active users',
    avgResponseTime: 'Avg response time',
    usersByPackage: 'Users by package',
    usersChartLabel: 'Users',
    recentRegistrations: 'Recent registrations',
    signups30d: 'Signups (last 30 days)',
    topSearchedCompanies: 'Top searched company paths',
    signupsLabel: 'Signups',
    thName: 'Name',
    thEmail: 'Email',
    thPackage: 'Package',
    thDate: 'Date',
    thPath: 'Path',
    thCount: 'Searches',
    statsLoadFailed: 'Failed to load statistics',
    loading: 'Loading...',
  },
}

export function EnhancedStatsTab() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await adminApi.getStats()
        setStats(data)
      } catch {
        setError(s.statsLoadFailed)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center text-gray-400 py-12">{error || s.statsLoadFailed}</div>
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.totalUsers}</p>
          <p className="text-2xl font-bold text-navy dark:text-white mt-1">{stats.total_users}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.activePartners}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active_users}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.monthlyRevenue}</p>
          <p className="text-2xl font-bold text-gold mt-1">{stats.monthly_revenue.toLocaleString('hu-HU')} Ft</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.chatMessages}</p>
          <p className="text-2xl font-bold text-teal mt-1">{stats.total_chat_messages.toLocaleString('hu-HU')}</p>
        </div>
      </div>

      {/* Row 2: Secondary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.companiesInDb}</p>
          <p className="text-2xl font-bold text-navy dark:text-white mt-1">{stats.total_companies.toLocaleString('hu-HU')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.admins}</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.admin_count}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.dau}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.daily_active_users}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{s.avgResponseTime}</p>
          <p className="text-2xl font-bold text-gold mt-1">{stats.avg_response_time_ms.toFixed(1)} ms</p>
        </div>
      </div>

      {/* Row 3: Charts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold text-navy dark:text-white mb-4">{s.usersByPackage}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Free', count: stats.users_by_package.free || 0 },
              { name: 'Basic', count: stats.users_by_package.basic || 0 },
              { name: 'Pro', count: stats.users_by_package.pro || 0 },
              { name: 'Enterprise', count: stats.users_by_package.enterprise || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name={s.usersChartLabel} fill="#D4A017" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Signups over 30 days */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold text-navy dark:text-white mb-4">{s.signups30d}</h3>
          {stats.signups_last_30_days.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.signups_last_30_days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name={s.signupsLabel} stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">{s.statsLoadFailed}</div>
          )}
        </div>
      </div>

      {/* Row 4: Top searched companies */}
      {stats.top_searched_companies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-navy dark:text-white">{s.topSearchedCompanies}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thPath}</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thCount}</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_searched_companies.map((item, i) => (
                  <tr key={item.path} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{item.path}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy dark:text-white">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 5: Recent registrations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-base font-semibold text-navy dark:text-white">{s.recentRegistrations}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thName}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thEmail}</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thPackage}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{s.thDate}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_users.map(u => (
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
    </div>
  )
}
