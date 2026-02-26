/**
 * Centralized pricing configuration.
 * Update prices here — all pages (Landing, Packages, Admin) read from this file.
 */

export interface PackageDef {
  key: string
  name: string
  /** Monthly price in HUF. 0 = free, -1 = custom/contact us */
  price: number
  watchlistLimit: number | null   // null = unlimited
  features: {
    search: boolean
    companyData: boolean
    csvExport: boolean
    marketingExport: boolean
    network: boolean
    api: boolean
  }
}

export const PACKAGES: PackageDef[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    watchlistLimit: 3,
    features: { search: true, companyData: true, csvExport: false, marketingExport: false, network: false, api: false },
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 9900,
    watchlistLimit: 10,
    features: { search: true, companyData: true, csvExport: true, marketingExport: false, network: false, api: false },
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 29900,
    watchlistLimit: 50,
    features: { search: true, companyData: true, csvExport: true, marketingExport: true, network: true, api: false },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: -1,
    watchlistLimit: null,
    features: { search: true, companyData: true, csvExport: true, marketingExport: true, network: true, api: true },
  },
]

/** Format price for display */
export function formatPrice(price: number, lang: 'hu' | 'en' = 'hu'): string {
  if (price === 0) return lang === 'hu' ? 'Ingyenes' : 'Free'
  if (price < 0) return lang === 'hu' ? 'Egyedi' : 'Custom'
  return lang === 'hu'
    ? price.toLocaleString('hu-HU') + ' Ft/hó'
    : price.toLocaleString('en-US') + ' HUF / mo'
}

/** Format price number only (no period suffix) */
export function formatPriceNumber(price: number, lang: 'hu' | 'en' = 'hu'): string {
  if (price === 0) return lang === 'hu' ? 'Ingyenes' : 'Free'
  if (price < 0) return lang === 'hu' ? 'Egyedi' : 'Custom'
  return lang === 'hu'
    ? price.toLocaleString('hu-HU').replace(/\u00a0/g, ' ')
    : price.toLocaleString('en-US')
}

/** Period suffix */
export function pricePeriod(price: number, lang: 'hu' | 'en' = 'hu'): string {
  if (price === 0) return lang === 'hu' ? 'Örökké ingyenes' : 'Free forever'
  if (price < 0) return lang === 'hu' ? 'árajánlat' : 'pricing'
  return lang === 'hu' ? 'Ft / hó' : 'HUF / mo'
}

export function packageLabel(pkg: string): string {
  return PACKAGES.find(p => p.key === pkg)?.name ?? pkg
}

export function getPackage(key: string): PackageDef | undefined {
  return PACKAGES.find(p => p.key === key)
}
