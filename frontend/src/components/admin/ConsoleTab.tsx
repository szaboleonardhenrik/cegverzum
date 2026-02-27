import { useState, useEffect, useRef, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../../api/admin'
import type { RequestLog, LogAggregateStats } from '../../types'

const t = {
  hu: {
    title: 'Konzol',
    totalRequests: 'Összes kérés',
    requestsLastHour: 'Kérés / óra',
    errorRate: 'Hibaarány',
    avgResponseTime: 'Átl. válaszidő',
    liveLog: 'Élő napló',
    autoRefresh: 'Auto-frissítés',
    method: 'Metódus',
    path: 'Útvonal',
    status: 'Státusz',
    time: 'Idő (ms)',
    user: 'Felhasználó',
    ip: 'IP',
    date: 'Dátum',
    requestsOverTime: 'Kérések idővel',
    errorsOverTime: 'Hibák idővel',
    topEndpoints: 'Top végpontok',
    noData: 'Nincs adat',
    loading: 'Betöltés...',
    filterMethod: 'Metódus szűrő',
    filterPath: 'Útvonal szűrő...',
    all: 'Mind',
    showMore: 'Több betöltése',
  },
  en: {
    title: 'Console',
    totalRequests: 'Total requests',
    requestsLastHour: 'Requests / hour',
    errorRate: 'Error rate',
    avgResponseTime: 'Avg response time',
    liveLog: 'Live log',
    autoRefresh: 'Auto-refresh',
    method: 'Method',
    path: 'Path',
    status: 'Status',
    time: 'Time (ms)',
    user: 'User',
    ip: 'IP',
    date: 'Date',
    requestsOverTime: 'Requests over time',
    errorsOverTime: 'Errors over time',
    topEndpoints: 'Top endpoints',
    noData: 'No data',
    loading: 'Loading...',
    filterMethod: 'Method filter',
    filterPath: 'Filter by path...',
    all: 'All',
    showMore: 'Load more',
  },
}

function statusColor(code: number): string {
  if (code < 300) return 'text-green-600'
  if (code < 400) return 'text-yellow-600'
  if (code < 500) return 'text-orange-600'
  return 'text-red-600'
}

function methodColor(method: string): string {
  switch (method) {
    case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'POST': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PATCH': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

export function ConsoleTab() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const [logs, setLogs] = useState<RequestLog[]>([])
  const [stats, setStats] = useState<LogAggregateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterMethod, setFilterMethod] = useState('')
  const [filterPath, setFilterPath] = useState('')
  const [limit, setLimit] = useState(50)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { limit }
      if (filterMethod) params.method = filterMethod
      if (filterPath) params.path = filterPath

      const [logsData, statsData] = await Promise.all([
        adminApi.getLogs(params),
        adminApi.getLogStats(),
      ])
      setLogs(logsData)
      setStats(statsData)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterMethod, filterPath, limit])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadData, 10000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, loadData])

  return (
    <div className="space-y-6">
      {/* Health cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.totalRequests}</p>
            <p className="text-2xl font-bold text-navy dark:text-white mt-1">{stats.total_requests.toLocaleString('hu-HU')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.requestsLastHour}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.requests_last_hour.toLocaleString('hu-HU')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.errorRate}</p>
            <p className={`text-2xl font-bold mt-1 ${stats.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>{stats.error_rate}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.avgResponseTime}</p>
            <p className="text-2xl font-bold text-gold mt-1">{stats.avg_response_time_ms.toFixed(1)} ms</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && stats.hourly_breakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests over time (area chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-semibold text-navy dark:text-white mb-3">{s.requestsOverTime}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.hourly_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(11, 16)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip labelFormatter={(v: string) => v} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Errors over time (line chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-semibold text-navy dark:text-white mb-3">{s.errorsOverTime}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.hourly_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(11, 16)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip labelFormatter={(v: string) => v} />
                <Line type="monotone" dataKey="error_count" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top endpoints bar chart */}
      {stats && stats.top_endpoints.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-navy dark:text-white mb-3">{s.topEndpoints}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.top_endpoints} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="path" width={200} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#D4A017" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Live log table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-navy dark:text-white">{s.liveLog}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">{s.all}</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={filterPath}
              onChange={e => setFilterPath(e.target.value)}
              placeholder={s.filterPath}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs w-40 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative w-8 h-4 rounded-full transition-colors border-none cursor-pointer ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoRefresh ? 'translate-x-4' : ''}`} />
              </button>
              {s.autoRefresh}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-gray-400">{s.loading}</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400">{s.noData}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.method}</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.path}</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.status}</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.time}</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.user}</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.ip}</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 dark:text-gray-300">{s.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="text-center px-3 py-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${methodColor(log.method)}`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300 truncate max-w-[300px]" title={log.path}>
                        {log.path}
                      </td>
                      <td className={`text-center px-3 py-2 font-bold ${statusColor(log.status_code)}`}>
                        {log.status_code}
                      </td>
                      <td className="text-right px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                        {log.response_time_ms.toFixed(1)}
                      </td>
                      <td className="text-center px-3 py-2 text-gray-500">
                        {log.user_id ?? '—'}
                      </td>
                      <td className="text-center px-3 py-2 text-gray-500 font-mono">
                        {log.ip ?? '—'}
                      </td>
                      <td className="text-right px-3 py-2 text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length >= limit && (
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-600 text-center">
                <button
                  onClick={() => setLimit(prev => prev + 50)}
                  className="text-xs text-gold hover:text-gold-dark font-medium bg-transparent border-none cursor-pointer"
                >
                  {s.showMore}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
