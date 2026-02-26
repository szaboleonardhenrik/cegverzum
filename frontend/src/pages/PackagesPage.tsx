import { useAuth } from '../context/AuthContext'

const PACKAGES = [
  {
    key: 'free',
    name: 'Free',
    price: 'Ingyenes',
    priceNote: 'Örökké ingyenes',
    watchlist: '3 cég',
    features: {
      search: true,
      companyData: true,
      csvExport: false,
      marketingExport: false,
      network: false,
      api: false,
    },
  },
  {
    key: 'basic',
    name: 'Basic',
    price: '4 990 Ft/hó',
    priceNote: 'Havi számlázás',
    watchlist: '10 cég',
    features: {
      search: true,
      companyData: true,
      csvExport: true,
      marketingExport: false,
      network: false,
      api: false,
    },
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '14 990 Ft/hó',
    priceNote: 'Havi számlázás',
    watchlist: '50 cég',
    popular: true,
    features: {
      search: true,
      companyData: true,
      csvExport: true,
      marketingExport: true,
      network: true,
      api: false,
    },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Egyedi',
    priceNote: 'Kapcsolatfelvétel szükséges',
    watchlist: 'Korlátlan',
    features: {
      search: true,
      companyData: true,
      csvExport: true,
      marketingExport: true,
      network: true,
      api: true,
    },
  },
]

const FEATURE_LABELS: Record<string, string> = {
  search: 'Keresés',
  companyData: 'Cégadatok',
  csvExport: 'CSV export',
  marketingExport: 'Marketing export',
  network: 'Kapcsolati háló',
  api: 'API hozzáférés',
}

export function PackagesPage() {
  const { user } = useAuth()
  const currentPkg = user?.package || 'free'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy dark:text-white">Csomagok</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Válaszd ki a számodra legjobb csomagot. Minden csomaggal hozzáférsz a magyar cégadatokhoz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKAGES.map(pkg => {
          const isCurrent = currentPkg === pkg.key
          const isHigher = !isCurrent && PACKAGES.findIndex(p => p.key === currentPkg) < PACKAGES.findIndex(p => p.key === pkg.key)

          return (
            <div
              key={pkg.key}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
                isCurrent
                  ? 'border-gold shadow-gold/10 ring-2 ring-gold/20'
                  : pkg.popular
                    ? 'border-teal/50'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {isCurrent && (
                <div className="bg-gold text-white text-xs font-bold text-center py-1.5 uppercase tracking-wider">
                  Jelenlegi csomag
                </div>
              )}
              {!isCurrent && pkg.popular && (
                <div className="bg-teal text-white text-xs font-bold text-center py-1.5 uppercase tracking-wider">
                  Legnépszerűbb
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-navy dark:text-white">{pkg.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
                </div>
                <p className="text-xs text-gray-500">{pkg.priceNote}</p>

                <div className="mt-5 mb-6">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Figyelőlista: {pkg.watchlist}</span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(pkg.features).map(([key, enabled]) => (
                      <div key={key} className="flex items-center gap-2">
                        {enabled ? (
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-sm ${enabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                          {FEATURE_LABELS[key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-gold bg-gold/5 rounded-lg border border-gold/20">
                    Aktív csomag
                  </div>
                ) : isHigher ? (
                  <a
                    href="mailto:info@cegverzum.hu?subject=Cégverzum csomag érdeklődés"
                    className="block w-full py-2.5 text-center text-sm font-medium text-white bg-gold hover:bg-gold-light rounded-lg transition-colors no-underline border-none cursor-pointer"
                  >
                    Érdeklődöm
                  </a>
                ) : (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Alacsonyabb csomag
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        <p>Kérdésed van a csomagokkal kapcsolatban?</p>
        <a href="mailto:info@cegverzum.hu" className="text-teal hover:text-teal-dark font-medium">
          info@cegverzum.hu
        </a>
      </div>
    </div>
  )
}
