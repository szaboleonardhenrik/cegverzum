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
