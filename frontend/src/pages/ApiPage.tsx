import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ───────── i18n ───────── */
const t = {
  hu: {
    title: 'API összeköttetés',
    subtitle: 'Integrálja a Cégverzum céginformációs adatait közvetlenül saját rendszerébe.',
    overviewTitle: 'Áttekintés',
    overviewDesc: 'A Cégverzum API RESTful interfészt biztosít a magyar céginformációs adatbázishoz. JSON formátumú válaszok, Bearer token autentikáció, részletes dokumentáció.',
    overviewPoints: [
      'Több mint 500 000 cég adata',
      'Napi adatfrissítés (NAV, Cégbíróság, KSH)',
      'JSON válaszok, REST végpontok',
      'Bearer token autentikáció',
      'Rate limiting a csomag alapján',
      'Webhook értesítések',
    ],

    endpointsTitle: 'Elérhető végpontok',
    endpoints: [
      { method: 'GET', path: '/v1/companies', desc: 'Cégek keresése és listázása szűrési feltételek alapján' },
      { method: 'GET', path: '/v1/companies/{id}', desc: 'Egy adott cég részletes adatlapja' },
      { method: 'GET', path: '/v1/companies/{id}/financials', desc: 'Pénzügyi adatok: mérleg, eredménykimutatás, mutatók' },
      { method: 'GET', path: '/v1/companies/{id}/officers', desc: 'Tisztségviselők és tulajdonosok listája' },
      { method: 'GET', path: '/v1/companies/count', desc: 'Találatok száma a megadott szűrők alapján' },
      { method: 'POST', path: '/v1/companies/export/csv', desc: 'CSV export a szűrt találatok alapján' },
      { method: 'POST', path: '/v1/webhooks', desc: 'Webhook regisztráció cégváltozás értesítésekhez' },
    ],

    authTitle: 'Autentikáció',
    authDesc: 'Minden API kérés Bearer token autentikációt igényel. A tokent az Authorization header-ben kell küldeni.',

    pricingTitle: 'API csomagok',
    pricingSub: 'Válasszon az igényeinek megfelelő csomagot.',
    plans: [
      {
        name: 'Starter',
        price: '49 900',
        period: 'Ft / hó',
        limits: '1 000 lekérdezés/hó | 10 req/sec',
        features: ['Céginformációk', 'Alapvető pénzügyi adatok', 'JSON válaszok', 'Email támogatás'],
        highlighted: false,
      },
      {
        name: 'Business',
        price: '149 900',
        period: 'Ft / hó',
        limits: '10 000 lekérdezés/hó | 50 req/sec',
        features: ['Teljes pénzügyi adatok', 'Tisztségviselők', 'Kockázati adatok', 'Webhook értesítések', 'Prioritásos támogatás'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Egyedi',
        period: 'árajánlat',
        limits: 'Korlátlan | egyedi',
        features: ['Dedikált szerver', 'Egyedi endpoint-ok', 'SLA garancia', 'Account manager', 'On-premise opció'],
        highlighted: false,
      },
    ],

    requestTitle: 'API hozzáférés igénylése',
    requestSub: 'Töltse ki az alábbi űrlapot és munkatársunk 24 órán belül felveszi Önnel a kapcsolatot.',
    requestName: 'Teljes név',
    requestCompany: 'Cégnév',
    requestEmail: 'E-mail cím',
    requestPhone: 'Telefonszám',
    requestUseCase: 'Tervezett felhasználási mód',
    requestUseCasePlaceholder: 'Pl. CRM integráció, beszállítói ellenőrzés, piackutatás...',
    requestPlan: 'Érdeklő csomag',
    requestPlanOptions: ['Starter', 'Business', 'Enterprise', 'Még nem tudom'],
    requestButton: 'Igénylés elküldése',
    requestSuccess: 'Köszönjük az igénylést! Munkatársunk 24 órán belül felveszi Önnel a kapcsolatot.',
    requestInfo: 'Kérdései vannak? Írjon nekünk: api@cegverzum.hu',

    docsLinkText: 'Részletes API dokumentáció (külső oldal)',
    publicPageText: 'Nyilvános API oldal megtekintése',
  },
  en: {
    title: 'API Integration',
    subtitle: 'Integrate Cegverzum company data directly into your own system.',
    overviewTitle: 'Overview',
    overviewDesc: 'The Cegverzum API provides a RESTful interface to the Hungarian company information database. JSON responses, Bearer token authentication, detailed documentation.',
    overviewPoints: [
      'Data on over 500,000 companies',
      'Daily data updates (NAV, Court of Registration, KSH)',
      'JSON responses, REST endpoints',
      'Bearer token authentication',
      'Rate limiting based on plan',
      'Webhook notifications',
    ],

    endpointsTitle: 'Available endpoints',
    endpoints: [
      { method: 'GET', path: '/v1/companies', desc: 'Search and list companies with filter criteria' },
      { method: 'GET', path: '/v1/companies/{id}', desc: 'Detailed data sheet for a specific company' },
      { method: 'GET', path: '/v1/companies/{id}/financials', desc: 'Financial data: balance sheet, income statement, metrics' },
      { method: 'GET', path: '/v1/companies/{id}/officers', desc: 'List of officers and owners' },
      { method: 'GET', path: '/v1/companies/count', desc: 'Result count based on given filters' },
      { method: 'POST', path: '/v1/companies/export/csv', desc: 'CSV export based on filtered results' },
      { method: 'POST', path: '/v1/webhooks', desc: 'Webhook registration for company change notifications' },
    ],

    authTitle: 'Authentication',
    authDesc: 'Every API request requires Bearer token authentication. Send the token in the Authorization header.',

    pricingTitle: 'API Plans',
    pricingSub: 'Choose the plan that fits your needs.',
    plans: [
      {
        name: 'Starter',
        price: '49,900',
        period: 'HUF / mo',
        limits: '1,000 queries/mo | 10 req/sec',
        features: ['Company information', 'Basic financial data', 'JSON responses', 'Email support'],
        highlighted: false,
      },
      {
        name: 'Business',
        price: '149,900',
        period: 'HUF / mo',
        limits: '10,000 queries/mo | 50 req/sec',
        features: ['Full financial data', 'Officers & owners', 'Risk data', 'Webhook notifications', 'Priority support'],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'pricing',
        limits: 'Unlimited | custom',
        features: ['Dedicated server', 'Custom endpoints', 'SLA guarantee', 'Account manager', 'On-premise option'],
        highlighted: false,
      },
    ],

    requestTitle: 'Request API access',
    requestSub: 'Fill out the form below and our team will contact you within 24 hours.',
    requestName: 'Full name',
    requestCompany: 'Company name',
    requestEmail: 'Email address',
    requestPhone: 'Phone number',
    requestUseCase: 'Planned use case',
    requestUseCasePlaceholder: 'E.g. CRM integration, supplier verification, market research...',
    requestPlan: 'Interested plan',
    requestPlanOptions: ['Starter', 'Business', 'Enterprise', 'Not sure yet'],
    requestButton: 'Submit request',
    requestSuccess: 'Thank you for your request! Our team will contact you within 24 hours.',
    requestInfo: 'Have questions? Email us: api@cegverzum.hu',

    docsLinkText: 'Detailed API documentation (external page)',
    publicPageText: 'View public API page',
  },
}

export function ApiPage() {
  const [lang] = useState<'hu' | 'en'>(() => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu')

  // Request form state
  const [formName, setFormName] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formUseCase, setFormUseCase] = useState('')
  const [formPlan, setFormPlan] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Code tabs
  const [codeTab, setCodeTab] = useState<'js' | 'py' | 'curl'>('curl')

  const s = t[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setFormSuccess(true)
    setFormLoading(false)
  }

  const codeExamples = {
    curl: `curl -X GET "https://api.cegverzum.hu/v1/companies?q=pelda" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    js: `const response = await fetch(
  'https://api.cegverzum.hu/v1/companies?q=pelda',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();`,
    py: `import requests

response = requests.get(
    "https://api.cegverzum.hu/v1/companies",
    params={"q": "pelda"},
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
data = response.json()`,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{s.title}</h1>
                <span className="text-xs font-mono bg-white/15 text-white/80 px-2 py-0.5 rounded">v1</span>
              </div>
              <p className="text-white/70 max-w-lg">{s.subtitle}</p>
            </div>
            <Link
              to="/api"
              className="text-sm text-white/70 hover:text-white border border-white/20 rounded-lg px-4 py-2 no-underline transition-colors"
            >
              {s.publicPageText} &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.overviewTitle}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{s.overviewDesc}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {s.overviewPoints.map(point => (
                  <div key={point} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Authentication */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.authTitle}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{s.authDesc}</p>
              <div className="bg-gray-900 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                <span className="text-teal-light">Authorization:</span> Bearer <span className="text-gold">YOUR_API_KEY</span>
              </div>
            </section>

            {/* Endpoints */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{s.endpointsTitle}</h2>
              <div className="space-y-3">
                {s.endpoints.map(ep => (
                  <div key={ep.path} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
                    <span className={`shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-gold/10 text-gold'
                    }`}>
                      {ep.method}
                    </span>
                    <div className="min-w-0">
                      <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{ep.path}</code>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ep.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Code examples */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {lang === 'hu' ? 'Kód példák' : 'Code examples'}
                </h2>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700">
                <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 px-4">
                  {(['curl', 'js', 'py'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCodeTab(tab)}
                      className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors bg-transparent border-none border-b-transparent cursor-pointer ${
                        codeTab === tab
                          ? 'border-b-gold text-gold'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      style={{ borderBottomStyle: 'solid', borderBottomWidth: 2, borderBottomColor: codeTab === tab ? '#D4A017' : 'transparent' }}
                    >
                      {tab === 'curl' ? 'cURL' : tab === 'js' ? 'JavaScript' : 'Python'}
                    </button>
                  ))}
                </div>
                <pre className="p-6 text-sm text-gray-300 bg-gray-900 dark:bg-slate-900 overflow-x-auto leading-relaxed">
                  <code>{codeExamples[codeTab]}</code>
                </pre>
              </div>
            </section>

            {/* Pricing */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.pricingTitle}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{s.pricingSub}</p>

              <div className="grid sm:grid-cols-3 gap-4">
                {s.plans.map(plan => (
                  <div
                    key={plan.name}
                    className={`rounded-xl p-5 border ${
                      plan.highlighted
                        ? 'border-gold bg-gold/5 dark:bg-gold/10 ring-1 ring-gold/30'
                        : 'border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="text-[10px] font-bold text-teal uppercase tracking-wider mb-2">
                        {lang === 'hu' ? 'Ajánlott' : 'Recommended'}
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-slate-700 rounded px-2 py-1">
                      {plan.limits}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <svg className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick info card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{s.requestTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{s.requestSub}</p>

              {formSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.requestSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestName} *</label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestCompany}</label>
                    <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestEmail} *</label>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestPhone}</label>
                    <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestPlan}</label>
                    <select
                      value={formPlan} onChange={e => setFormPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">--</option>
                      {s.requestPlanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{s.requestUseCase}</label>
                    <textarea
                      value={formUseCase} onChange={e => setFormUseCase(e.target.value)}
                      rows={3}
                      placeholder={s.requestUseCasePlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={formLoading}
                    className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors border-none cursor-pointer text-sm"
                  >
                    {formLoading ? '...' : s.requestButton}
                  </button>
                </form>
              )}

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">{s.requestInfo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
