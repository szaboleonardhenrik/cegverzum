import { api } from './client'
import type { IntegrationStatus, NavTaxpayerResponse } from '../types'

export const integrationsApi = {
  listStatuses: () => api.get<IntegrationStatus[]>('/integrations/status'),

  navStatus: () => api.get<IntegrationStatus>('/integrations/nav/status'),

  navQuery: (adoszam: string, sync = false) =>
    api.post<NavTaxpayerResponse>(`/integrations/nav/query/${encodeURIComponent(adoszam)}?sync=${sync}`, {}),
}
