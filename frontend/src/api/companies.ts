import { api } from './client'
import type { Company, CompanyListItem, SearchParams, FinancialReport, Officer, NetworkData } from '../types'

function buildQuery(params: SearchParams): URLSearchParams {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.statusz) query.set('statusz', params.statusz)
  if (params.cegforma) query.set('cegforma', params.cegforma)
  if (params.teaor_kod) query.set('teaor_kod', params.teaor_kod)
  if (params.fotevekenyseg) query.set('fotevekenyseg', params.fotevekenyseg)
  if (params.szekhely) query.set('szekhely', params.szekhely)
  if (params.alapitas_tol) query.set('alapitas_tol', params.alapitas_tol)
  if (params.alapitas_ig) query.set('alapitas_ig', params.alapitas_ig)
  if (params.letszam_kategoria) query.set('letszam_kategoria', params.letszam_kategoria)
  if (params.felszamolas != null) query.set('felszamolas', String(params.felszamolas))
  if (params.csodeljras != null) query.set('csodeljras', String(params.csodeljras))
  if (params.vegelszamolas != null) query.set('vegelszamolas', String(params.vegelszamolas))
  if (params.kenyszertorles != null) query.set('kenyszertorles', String(params.kenyszertorles))
  if (params.afa_alany != null) query.set('afa_alany', String(params.afa_alany))
  if (params.order_by) query.set('order_by', params.order_by)
  query.set('skip', String(params.skip || 0))
  query.set('limit', String(params.limit || 20))
  return query
}

export const companiesApi = {
  search: (params: SearchParams) => api.get<CompanyListItem[]>(`/companies/?${buildQuery(params)}`),
  count: (params: SearchParams) => api.get<{ count: number }>(`/companies/count?${buildQuery(params)}`),
  getById: (id: number) => api.get<Company>(`/companies/${id}`),
  getFinancials: (id: number) => api.get<FinancialReport[]>(`/companies/${id}/financials`),
  getOfficers: (id: number) => api.get<Officer[]>(`/companies/${id}/officers`),
  getNetwork: (id: number) => api.get<NetworkData>(`/companies/${id}/network`),
  exportCsv: async (params: SearchParams): Promise<void> => {
    const query = buildQuery(params)
    query.delete('skip')
    query.delete('limit')
    const token = localStorage.getItem('cegverzum_token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const resp = await fetch(`/api/companies/export/csv?${query}`, { headers })
    if (!resp.ok) throw new Error('Export failed')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cegverzum_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  },
  exportMarketingCsv: async (ids: number[]): Promise<void> => {
    const token = localStorage.getItem('cegverzum_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const resp = await fetch('/api/companies/export/marketing', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids }),
    })
    if (!resp.ok) throw new Error('Export failed')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cegverzum_marketing.csv'
    a.click()
    URL.revokeObjectURL(url)
  },
}
