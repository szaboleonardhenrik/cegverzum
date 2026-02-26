import { api } from './client'
import type { RiskAnalysis, WatchlistOverview } from '../types'

export const riskAnalysisApi = {
  getRisk: (companyId: number) =>
    api.get<RiskAnalysis>(`/risk/${companyId}`),

  watchlistOverview: () =>
    api.get<WatchlistOverview>('/risk/watchlist-overview'),
}
