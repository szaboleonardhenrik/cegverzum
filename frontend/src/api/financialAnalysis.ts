import { api } from './client'
import type { FinancialAnalysis, CompareResponse, BenchmarkResponse } from '../types'

export const financialAnalysisApi = {
  getAnalysis: (companyId: number) =>
    api.get<FinancialAnalysis>(`/financial-analysis/${companyId}`),

  compare: (ids: number[]) =>
    api.get<CompareResponse>(`/financial-analysis/compare?ids=${ids.join(',')}`),

  benchmark: (companyId: number) =>
    api.get<BenchmarkResponse>(`/financial-analysis/benchmark?company_id=${companyId}`),
}
