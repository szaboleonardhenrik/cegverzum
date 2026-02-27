export interface CompanyListItem {
  id: number
  nev: string
  adoszam: string | null
  cegjegyzekszam: string | null
  szekhely: string | null
  teaor_kod: string | null
  statusz: string
  cegforma: string | null
  alapitas_datuma: string | null
  fotevekenyseg: string | null
  letszam_kategoria: string | null
  felszamolas: boolean | null
  csodeljras: boolean | null
  vegelszamolas: boolean | null
  kenyszertorles: boolean | null
}

export interface Company extends CompanyListItem {
  rovidnev: string | null
  teaor_megnevezes: string | null
  alapitas_datuma: string | null
  fotevekenyseg: string | null
  letszam_kategoria: string | null
  jegyzett_toke: string | null
  jegyzett_toke_penznem: string | null
  email: string | null
  telefon: string | null
  weboldal: string | null
  afa_alany: boolean | null
  nav_torlesve: boolean | null
  nav_kockazat: string | null
  felszamolas: boolean | null
  csodeljras: boolean | null
  vegelszamolas: boolean | null
  kenyszertorles: boolean | null
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  full_name: string | null
  is_admin: boolean
  is_active: boolean
  has_registered: boolean
  package: string
  monthly_price: number
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface SearchParams {
  q?: string
  statusz?: string
  cegforma?: string
  teaor_kod?: string
  fotevekenyseg?: string
  szekhely?: string
  alapitas_tol?: string
  alapitas_ig?: string
  letszam_kategoria?: string
  felszamolas?: boolean
  csodeljras?: boolean
  vegelszamolas?: boolean
  kenyszertorles?: boolean
  afa_alany?: boolean
  order_by?: string
  skip?: number
  limit?: number
}

export interface FinancialReport {
  id: number
  company_id: number
  ev: number
  netto_arbevetel: number | null
  uzemi_eredmeny: number | null
  adozas_elotti_eredmeny: number | null
  adozott_eredmeny: number | null
  eszkozok_osszesen: number | null
  befektetett_eszkozok: number | null
  forgoeszkozok: number | null
  penzeszkozok: number | null
  aktiv_idobeli_elhatarolasok: number | null
  sajat_toke: number | null
  celtaralekok: number | null
  kotelezettsegek: number | null
  adofizetesi_kotelezettseg: number | null
  rovid_lejaratu_kotelezettsegek: number | null
  hosszu_lejaratu_kotelezettsegek: number | null
  passziv_idobeli_elhatarolasok: number | null
  eladosodottsag_foka: number | null
  eladosodottsag_merteke: number | null
  arbevetel_aranyos_eredmeny: number | null
  likviditasi_gyorsrata: number | null
  ebitda: number | null
  roe: number | null
}

export interface Officer {
  id: number
  company_id: number
  nev: string
  anyja_neve: string | null
  titulus: string | null
}

export interface Module {
  id: number
  slug: string
  display_name: string
  description: string | null
  is_active: boolean
}

export interface UserModule {
  id: number
  user_id: number
  module_id: number
  module_slug: string
  module_name: string
  is_active: boolean
}

export interface Notification {
  id: number
  title: string
  message: string
  category: string
  is_read: boolean
  created_at: string
}

export interface IntegrationStatus {
  name: string
  slug: string
  status: string
  message: string
  configured: boolean
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  company_id: number | null
  created_at: string
}

export interface DashboardStats {
  total_companies: number
  watchlist_count: number
  watchlist_limit: number | null
  unread_notifications: number
  package: string
  recent_watchlist: {
    id: number
    company_id: number
    note: string | null
    created_at: string
    company: {
      id: number
      nev: string
      statusz: string
      szekhely: string | null
    }
  }[]
}

export interface AdminStats {
  total_users: number
  active_users: number
  admin_count: number
  users_by_package: Record<string, number>
  total_companies: number
  total_chat_messages: number
  monthly_revenue: number
  recent_users: User[]
  daily_active_users: number
  signups_last_30_days: { date: string; count: number }[]
  avg_response_time_ms: number
  top_searched_companies: { path: string; count: number }[]
}

export interface RequestLog {
  id: number
  method: string
  path: string
  status_code: number
  response_time_ms: number
  user_id: number | null
  ip: string | null
  user_agent: string | null
  created_at: string
}

export interface HourlyBucket {
  hour: string
  count: number
  error_count: number
  avg_response_time_ms: number
}

export interface TopEndpoint {
  path: string
  count: number
  avg_response_time_ms: number
}

export interface LogAggregateStats {
  total_requests: number
  requests_last_hour: number
  error_rate: number
  avg_response_time_ms: number
  top_endpoints: TopEndpoint[]
  hourly_breakdown: HourlyBucket[]
}

export interface NetworkNode {
  id: number
  nev: string
  statusz: string
  is_center: boolean
}

export interface NetworkLink {
  source: number
  target: number
  officers: string[]
}

export interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

export interface NavTaxNumberDetail {
  taxpayerId: string | null
  vatCode: string | null
  countyCode: string | null
}

export interface NavAddress {
  countryCode: string | null
  postalCode: string | null
  city: string | null
  streetName: string | null
  publicPlaceCategory: string | null
  number: string | null
}

export interface NavTaxpayerValidity {
  taxpayerValidityStartDate: string | null
  taxpayerValidityEndDate: string | null
  lastUpdateTimestamp: string | null
}

export interface WatchlistItem {
  id: number
  user_id: number
  company_id: number
  note: string | null
  created_at: string
}

export interface WatchlistItemWithCompany {
  id: number
  company_id: number
  note: string | null
  created_at: string
  company: CompanyListItem
}

export interface WatchlistStatus {
  is_watched: boolean
  watchlist_item_id: number | null
}

// Financial Analysis
export interface YearlyMetric {
  ev: number
  netto_arbevetel: number | null
  uzemi_eredmeny: number | null
  adozott_eredmeny: number | null
  sajat_toke: number | null
  kotelezettsegek: number | null
  eszkozok_osszesen: number | null
  forgoeszkozok: number | null
  rovid_lejaratu_kotelezettsegek: number | null
  eladosodottsag_foka: number | null
  arbevetel_aranyos_eredmeny: number | null
  likviditasi_gyorsrata: number | null
  roe: number | null
  ebitda: number | null
  novekedesi_rata: number | null
}

export interface FinancialAnalysis {
  company_id: number
  company_name: string
  teaor_kod: string | null
  yearly_metrics: YearlyMetric[]
  avg_profit_margin: number | null
  avg_roe: number | null
  avg_debt_ratio: number | null
  avg_liquidity: number | null
  revenue_cagr: number | null
}

export interface CompanyCompareItem {
  company_id: number
  company_name: string
  yearly_metrics: YearlyMetric[]
  avg_profit_margin: number | null
  avg_roe: number | null
  avg_debt_ratio: number | null
  avg_liquidity: number | null
}

export interface CompareResponse {
  companies: CompanyCompareItem[]
}

export interface BenchmarkMetric {
  metric: string
  company_value: number | null
  industry_avg: number | null
  position: string | null
}

export interface BenchmarkResponse {
  company_id: number
  company_name: string
  teaor_kod: string | null
  teaor_megnevezes: string | null
  industry_company_count: number
  metrics: BenchmarkMetric[]
}

// Risk Analysis
export interface RiskFactor {
  category: string
  description: string
  points_deducted: number
}

export interface RiskAnalysis {
  company_id: number
  company_name: string
  statusz: string
  risk_score: number
  risk_level: string
  risk_color: string
  partner_rating: string
  factors: RiskFactor[]
  negative_events: string[]
  alapitas_datuma: string | null
  teaor_kod: string | null
  nav_torlesve: boolean | null
  nav_kockazat: string | null
  eladosodottsag_foka: number | null
  sajat_toke: number | null
  likviditasi_gyorsrata: number | null
  adozott_eredmeny: number | null
}

export interface WatchlistRiskItem {
  company_id: number
  company_name: string
  statusz: string
  risk_score: number
  risk_level: string
  risk_color: string
  partner_rating: string
}

export interface WatchlistOverview {
  items: WatchlistRiskItem[]
  summary: Record<string, number>
}

export interface NavTaxpayerResponse {
  success: boolean
  funcCode: string | null
  errorCode: string | null
  message: string | null
  taxpayerName: string | null
  taxpayerShortName: string | null
  taxNumberDetail: NavTaxNumberDetail | null
  taxpayerAddress: NavAddress | null
  taxpayerAddressFormatted: string | null
  incorporation: string | null
  vatGroupMembership: string | null
  taxpayerValidity: NavTaxpayerValidity | null
}
