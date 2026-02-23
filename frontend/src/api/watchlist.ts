import { api } from './client'
import type { WatchlistItemWithCompany, WatchlistItem, WatchlistStatus } from '../types'

export const watchlistApi = {
  list: () => api.get<WatchlistItemWithCompany[]>('/watchlist'),
  count: () => api.get<{ count: number; limit: number | null }>('/watchlist/count'),
  ids: () => api.get<{ ids: number[] }>('/watchlist/ids'),
  check: (companyId: number) => api.get<WatchlistStatus>(`/watchlist/check/${companyId}`),
  add: (companyId: number, note?: string) =>
    api.post<WatchlistItem>('/watchlist', { company_id: companyId, note }),
  update: (itemId: number, note: string | null) =>
    api.patch<WatchlistItem>(`/watchlist/${itemId}`, { note }),
  remove: (companyId: number) => api.delete<void>(`/watchlist/${companyId}`),
}
