import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* ───────── tiny SVG helper ───────── */
function Ico({ d, className = 'w-6 h-6' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

/* ───────── i18n ───────── */
const t = {
  hu: {
    nav: ['Funkciók', 'Árazás', 'Dokumentáció', 'Kapcsolat'],
    login: 'Bejelentkezés',
    back: 'Vissza a főoldalra',
    heroTitle1: 'Cégverzum',
    heroTitle2: 'API',
    heroSub: 'Integrálja a magyar céginformációs adatokat közvetlenül saját rendszerébe. RESTful API valós idejű hozzáféréssel több mint 500 000 cég adataihoz.',
    heroCta1: 'API hozzáférés igénylése',
    heroCta2: 'Dokumentáció',
    heroStats: [
      { value: '500 000+', label: 'cég elérhető' },
      { value: 'REST', label: 'JSON API' },
      { value: '<200ms', label: 'válaszidő' },
      { value: '99.9%', label: 'rendelkezésre állás' },
    ],

    whatTitle: 'Mit kínál a Cégverzum API?',
    whatSub: 'Teljes körű programozói hozzáférés a magyar cégadatokhoz — egyetlen integrációval.',
    whatItems: [
      { title: 'Céginformációk lekérdezése', desc: 'Keresés cégnév, adószám vagy cégjegyzékszám alapján. Részletes adatok: székhely, cégforma, státusz, TEÁOR kód, alapítás dátuma.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { title: 'Pénzügyi adatok', desc: 'Mérleg, eredménykimutatás, pénzügyi mutatók évenkénti bontásban. Több mint 50 mutató automatikus számítással.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { title: 'Tisztségviselők és tulajdonosok', desc: 'Aktuális és korábbi tisztségviselők, tulajdonosi struktúra, képviseleti jogok lekérdezése.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { title: 'Kockázati adatok', desc: 'Felszámolás, csődeljárás, végelszámolás, kényszertörlés státuszok. NAV adóellenőrzési adatok.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
      { title: 'Tömeges lekérdezés', desc: 'Batch endpoint-ok nagy mennyiségű adat lekérdezéséhez. Szűrés, rendezés és lapozás támogatás.', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm5-3v16m-5-8h14' },
      { title: 'Webhook értesítések', desc: 'Valós idejű értesítés cégadatok változásáról. Konfigurálja, mely cégeket és eseményeket kívánja figyelni.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],

    howTitle: 'Hogyan működik?',
    howSub: 'Három egyszerű lépésben integrálhatja a Cégverzum adatait saját rendszerébe.',
    howSteps: [
      { step: '1', title: 'Igényeljen API kulcsot', desc: 'Töltse ki az igénylőlapot — munkatársunk 24 órán belül felveszi Önnel a kapcsolatot és aktiválja az API hozzáférést.' },
      { step: '2', title: 'Integrálja rendszerébe', desc: 'Használja a REST API-t bármely programozási nyelvből. JSON formátumú válaszok, részletes dokumentáció és kódpéldák segítik a munkát.' },
      { step: '3', title: 'Kész! Használja az adatokat', desc: 'CRM, ERP, BI eszköz vagy saját alkalmazás — frissítse adatbázisát automatikusan, valós időben.' },
    ],

    codeTitle: 'Egyszerű integráció',
    codeSub: 'Néhány sor kóddal elérhető bármely cég teljes adatlapja.',

    pricingTitle: 'API árazás',
    pricingSub: 'Válassza ki az Önnek megfelelő API csomagot. Minden csomag tartalmaz dokumentációt és technikai támogatást.',
    pricingPlans: [
      {
        name: 'Starter',
        price: '49 900',
        period: 'Ft / hó',
        features: ['1 000 lekérdezés / hó', 'Céginformációk', 'Alapvető pénzügyi adatok', 'JSON válaszok', 'Email támogatás'],
        cta: 'Igénylés',
        highlighted: false,
      },
      {
        name: 'Business',
        price: '149 900',
        period: 'Ft / hó',
        features: ['10 000 lekérdezés / hó', 'Teljes pénzügyi adatok', 'Tisztségviselők és tulajdonosok', 'Kockázati adatok', 'Webhook értesítések', 'Prioritásos támogatás'],
        cta: 'Igénylés',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Egyedi',
        period: 'árajánlat',
        features: ['Korlátlan lekérdezés', 'Dedikált szerver', 'Egyedi endpoint-ok', 'SLA garancia', 'Személyes account manager', 'On-premise opció'],
        cta: 'Ajánlatot kérek',
        highlighted: false,
      },
    ],

    faqTitle: 'Gyakori kérdések',
    faqs: [
      { q: 'Milyen formátumban kapom az adatokat?', a: 'Az API JSON formátumban válaszol minden kérésre. A válaszok struktúrált, könnyen feldolgozható formátumúak, részletes dokumentációval.' },
      { q: 'Mennyi idő az integráció?', a: 'A legtöbb integráció 1-2 nap alatt elkészül. REST API-ról van szó, így bármely modern programozási nyelvből elérhető. Kódpéldákat biztosítunk Python, JavaScript és PHP nyelven.' },
      { q: 'Van rate limiting?', a: 'Igen, a csomagtól függően. Starter: 10 req/sec, Business: 50 req/sec, Enterprise: egyedi. A limitek bőven elegendőek a legtöbb felhasználási esetre.' },
      { q: 'Milyen gyakran frissülnek az adatok?', a: 'Az adatbázis naponta frissül a NAV, Cégbíróság és KSH forrásokból. A webhook értesítések valós időben jelzik a változásokat.' },
    ],

    contactTitle: 'API hozzáférés igénylése',
    contactSub: 'Töltse ki az alábbi űrlapot és munkatársunk 24 órán belül felveszi Önnel a kapcsolatot.',
    contactName: 'Teljes név',
    contactCompany: 'Cégnév',
    contactEmail: 'E-mail cím',
    contactPhone: 'Telefonszám',
    contactMessage: 'Üzenet (opcionális)',
    contactMessagePlaceholder: 'Írja le, milyen integrációt tervez...',
    contactButton: 'Igénylés elküldése',
    contactSuccess: 'Köszönjük az igénylést! Munkatársunk 24 órán belül felveszi Önnel a kapcsolatot.',
    contactPoints: [
      'Személyre szabott konzultáció',
      'Teszt API kulcs biztosítása',
      'Integrációs segítség',
      '24 órán belül válaszolunk',
    ],

    footerDesc: 'A Cégverzum API programozói hozzáférést biztosít a magyar céginformációs adatbázishoz. RESTful, JSON, valós idejű.',
    copyright: 'Minden jog fenntartva.',
  },
  en: {
    nav: ['Features', 'Pricing', 'Documentation', 'Contact'],
    login: 'Log in',
    back: 'Back to homepage',
    heroTitle1: 'Cégverzum',
    heroTitle2: 'API',
    heroSub: 'Integrate Hungarian company data directly into your system. RESTful API with real-time access to data on over 500,000 companies.',
    heroCta1: 'Request API access',
    heroCta2: 'Documentation',
    heroStats: [
      { value: '500,000+', label: 'companies available' },
      { value: 'REST', label: 'JSON API' },
      { value: '<200ms', label: 'response time' },
      { value: '99.9%', label: 'uptime' },
    ],

    whatTitle: 'What does the Cégverzum API offer?',
    whatSub: 'Full programmatic access to Hungarian company data — with a single integration.',
    whatItems: [
      { title: 'Company information', desc: 'Search by name, tax ID or registration number. Detailed data: address, legal form, status, NACE code, foundation date.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { title: 'Financial data', desc: 'Balance sheet, income statement, financial indicators by year. Over 50 automatically calculated metrics.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { title: 'Officers & owners', desc: 'Current and former officers, ownership structure, representation rights.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { title: 'Risk data', desc: 'Liquidation, bankruptcy, dissolution, forced deletion statuses. NAV tax audit data.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
      { title: 'Bulk queries', desc: 'Batch endpoints for querying large volumes of data. Filtering, sorting, and pagination support.', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm5-3v16m-5-8h14' },
      { title: 'Webhook notifications', desc: 'Real-time notifications on company data changes. Configure which companies and events to monitor.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],

    howTitle: 'How does it work?',
    howSub: 'Integrate Cégverzum data into your system in three simple steps.',
    howSteps: [
      { step: '1', title: 'Request an API key', desc: 'Fill out the request form — our team will contact you within 24 hours and activate your API access.' },
      { step: '2', title: 'Integrate into your system', desc: 'Use the REST API from any programming language. JSON responses, detailed documentation and code examples to help you.' },
      { step: '3', title: 'Done! Use the data', desc: 'CRM, ERP, BI tool or custom app — update your database automatically, in real time.' },
    ],

    codeTitle: 'Simple integration',
    codeSub: 'Access any company\'s full data sheet with just a few lines of code.',

    pricingTitle: 'API Pricing',
    pricingSub: 'Choose the API plan that fits you. Every plan includes documentation and technical support.',
    pricingPlans: [
      {
        name: 'Starter',
        price: '49,900',
        period: 'HUF / mo',
        features: ['1,000 queries / month', 'Company information', 'Basic financial data', 'JSON responses', 'Email support'],
        cta: 'Request',
        highlighted: false,
      },
      {
        name: 'Business',
        price: '149,900',
        period: 'HUF / mo',
        features: ['10,000 queries / month', 'Full financial data', 'Officers & owners', 'Risk data', 'Webhook notifications', 'Priority support'],
        cta: 'Request',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'pricing',
        features: ['Unlimited queries', 'Dedicated server', 'Custom endpoints', 'SLA guarantee', 'Personal account manager', 'On-premise option'],
        cta: 'Request quote',
        highlighted: false,
      },
    ],

    faqTitle: 'FAQ',
    faqs: [
      { q: 'What format do I get the data in?', a: 'The API responds in JSON format for every request. Responses are structured, easy to parse, with detailed documentation.' },
      { q: 'How long does integration take?', a: 'Most integrations are completed in 1-2 days. It\'s a REST API, accessible from any modern programming language. We provide code examples in Python, JavaScript and PHP.' },
      { q: 'Is there rate limiting?', a: 'Yes, depending on the plan. Starter: 10 req/sec, Business: 50 req/sec, Enterprise: custom. The limits are more than enough for most use cases.' },
      { q: 'How often is data updated?', a: 'The database is updated daily from NAV, Court of Registration and KSH sources. Webhook notifications signal changes in real time.' },
    ],

    contactTitle: 'Request API access',
    contactSub: 'Fill out the form below and our team will contact you within 24 hours.',
    contactName: 'Full name',
    contactCompany: 'Company name',
    contactEmail: 'Email address',
    contactPhone: 'Phone number',
    contactMessage: 'Message (optional)',
    contactMessagePlaceholder: 'Describe your integration plans...',
    contactButton: 'Submit request',
    contactSuccess: 'Thank you for your request! Our team will contact you within 24 hours.',
    contactPoints: [
      'Personalized consultation',
      'Test API key provided',
      'Integration assistance',
      'Response within 24 hours',
    ],

    footerDesc: 'The Cégverzum API provides programmatic access to the Hungarian company information database. RESTful, JSON, real-time.',
    copyright: 'All rights reserved.',
  },
}

const navAnchors = ['#funkciok', '#arazas', '#dokumentacio', '#kapcsolat']

/* ───────── component ───────── */
export function ApiLandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [lang, setLang] = useState<'hu' | 'en'>(() =>
    (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )

  // Contact form
  const [formName, setFormName] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const s = t[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleLang = () => {
    const next = lang === 'hu' ? 'en' : 'hu'
    setLang(next)
    localStorage.setItem('cegverzum_lang', next)
  }

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('cegverzum_dark', next ? '1' : '0')
  }

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formName.trim() || !formEmail.trim()) {
      setFormError(lang === 'hu' ? 'Kerjuk, toltse ki a kotelezo mezoket.' : 'Please fill in the required fields.')
      return
    }
    setFormLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setFormSuccess(true)
    setFormLoading(false)
  }

  const codeExample = `// Cégverzum API - Cég lekérdezése adószám alapján
const response = await fetch(
  'https://api.cegverzum.hu/v1/companies?q=12345678',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
// => { id: 1, nev: "Példa Kft.", adoszam: "12345678-2-42", ... }`

  const pythonExample = `import requests

response = requests.get(
    "https://api.cegverzum.hu/v1/companies/42",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

company = response.json()
print(company["nev"])       # "Példa Kft."
print(company["adoszam"])   # "12345678-2-42"`

  const [codeTab, setCodeTab] = useState<'js' | 'py'>('js')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-200 transition-colors">
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-white/10'
            : 'bg-white dark:bg-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold tracking-tight no-underline text-gray-900 dark:text-white">
              <span className="text-gold">Ceg</span>verzum
            </Link>
            <span className="hidden sm:inline text-xs font-mono bg-navy/10 dark:bg-navy/30 text-navy dark:text-teal-light px-2 py-0.5 rounded">API</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {s.nav.map((label, i) => (
              <button
                key={navAnchors[i]}
                onClick={() => scrollTo(navAnchors[i])}
                className="text-sm font-medium transition-colors bg-transparent border-none cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-lg transition-colors border-none cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10">
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button onClick={toggleLang} className="text-xs font-bold uppercase p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10">
              {lang === 'hu' ? 'EN' : 'HU'}
            </button>
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white no-underline">
              {s.back}
            </Link>
            <Link to="/login" className="text-sm font-medium text-white bg-gold hover:bg-gold-light rounded-lg px-4 py-2 transition-colors no-underline shadow-sm shadow-gold/20">
              {s.login}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={toggleDark} className="p-2 rounded-lg border-none cursor-pointer text-gray-500 dark:text-gray-400 bg-transparent">
              {dark ? <Ico d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" className="w-5 h-5" /> : <Ico d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" className="w-5 h-5" />}
            </button>
            <button onClick={toggleLang} className="text-xs font-bold uppercase p-2 border-none cursor-pointer bg-transparent text-gray-500 dark:text-gray-400">{lang === 'hu' ? 'EN' : 'HU'}</button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-gray-700 dark:text-white">
              {mobileOpen ? <Ico d="M6 18L18 6M6 6l12 12" /> : <Ico d="M4 6h16M4 12h16M4 18h16" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 space-y-2 bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10">
            {s.nav.map((label, i) => (
              <button key={navAnchors[i]} onClick={() => scrollTo(navAnchors[i])} className="block w-full text-left text-sm py-2 bg-transparent border-none cursor-pointer text-gray-600 dark:text-gray-300">{label}</button>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/" className="flex-1 text-center text-sm font-medium rounded-lg px-4 py-2 no-underline text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">{s.back}</Link>
              <Link to="/login" className="flex-1 text-center text-sm font-medium text-white bg-gold rounded-lg px-4 py-2 no-underline">{s.login}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-teal-dark pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-teal/15 blur-[100px]" />
          {/* Code-like background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 text-white font-mono text-xs leading-6 hidden lg:block">
              {'{'} "company": {'{'}<br />
              &nbsp;&nbsp;"nev": "Pelda Kft.",<br />
              &nbsp;&nbsp;"adoszam": "12345678",<br />
              &nbsp;&nbsp;"statusz": "Aktiv"<br />
              {'}'} {'}'}
            </div>
            <div className="absolute bottom-20 right-10 text-white font-mono text-xs leading-6 hidden lg:block">
              GET /v1/companies/42<br />
              Authorization: Bearer ***<br />
              Content-Type: application/json<br />
              200 OK
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-light animate-pulse" />
            <span className="text-sm text-white/80 font-medium">RESTful JSON API</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight">
            {s.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">{s.heroTitle2}</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">{s.heroSub}</p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('#kapcsolat')}
              className="w-full sm:w-auto bg-gold hover:bg-gold-light text-white font-semibold rounded-xl px-8 py-3.5 text-base transition-colors shadow-lg shadow-gold/30 border-none cursor-pointer"
            >
              {s.heroCta1}
            </button>
            <button
              onClick={() => scrollTo('#dokumentacio')}
              className="w-full sm:w-auto border border-white/30 text-white font-semibold rounded-xl px-8 py-3.5 text-base hover:bg-white/10 transition-colors bg-transparent cursor-pointer"
            >
              {s.heroCta2}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {s.heroStats.map(st => (
              <div key={st.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-5 text-center border border-white/10">
                <div className="text-2xl sm:text-3xl font-bold text-gold">{st.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-white/60">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IT OFFERS */}
      <section id="funkciok" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.whatTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.whatSub}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {s.whatItems.map((item, i) => {
              const colors = [
                'border-l-teal', 'border-l-gold', 'border-l-accent',
                'border-l-red-500', 'border-l-navy', 'border-l-orange-500',
              ]
              const iconColors = ['text-teal', 'text-gold', 'text-accent', 'text-red-500', 'text-navy', 'text-orange-500']
              return (
                <div
                  key={item.title}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 border-l-4 ${colors[i]} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center ${iconColors[i]} mb-4`}>
                    <Ico d={item.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.howTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.howSub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {s.howSteps.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gold/30" />
                )}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/25">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE EXAMPLE */}
      <section id="dokumentacio" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.codeTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.codeSub}</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 dark:border-slate-600">
              {/* Code window header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-slate-700 border-b border-gray-700 dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCodeTab('js')}
                    className={`px-3 py-1 rounded text-xs font-medium border-none cursor-pointer transition-colors ${
                      codeTab === 'js'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setCodeTab('py')}
                    className={`px-3 py-1 rounded text-xs font-medium border-none cursor-pointer transition-colors ${
                      codeTab === 'py'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>
              <pre className="p-6 text-sm text-gray-300 overflow-x-auto leading-relaxed">
                <code>{codeTab === 'js' ? codeExample : pythonExample}</code>
              </pre>
            </div>

            {/* Response example */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs font-mono rounded">200 OK</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">application/json</span>
              </div>
              <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
{`{
  "id": 42,
  "nev": "Pelda Kft.",
  "adoszam": "12345678-2-42",
  "cegjegyzekszam": "01-09-123456",
  "szekhely": "1051 Budapest, Nador u. 1.",
  "statusz": "Aktiv",
  "teaor_kod": "6201",
  "fotevekenyseg": "Szamitogépes programozas",
  "alapitas_datuma": "2015-03-15"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="arazas" className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.pricingTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.pricingSub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {s.pricingPlans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 sm:p-8 border transition-all ${
                  plan.highlighted
                    ? 'bg-white dark:bg-slate-800 border-gold shadow-xl shadow-gold/10 ring-2 ring-gold/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-teal uppercase tracking-wider mb-4">
                    {lang === 'hu' ? 'Ajanlott' : 'Recommended'}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo('#kapcsolat')}
                  className={`w-full mt-8 font-semibold rounded-xl px-6 py-3 transition-colors border-none cursor-pointer text-base ${
                    plan.highlighted
                      ? 'bg-gold hover:bg-gold-light text-white shadow-lg shadow-gold/25'
                      : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.faqTitle}</h2>
          </div>

          <div className="space-y-3">
            {s.faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / REQUEST FORM */}
      <section id="kapcsolat" className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.contactTitle}</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{s.contactSub}</p>
              <div className="mt-8 space-y-3">
                {s.contactPoints.map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal/15 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div className="mt-10 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Ico d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4 shrink-0" />
                  api@cegverzum.hu
                </div>
                <div className="flex items-center gap-2">
                  <Ico d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-4 h-4 shrink-0" />
                  +36 1 234 5678
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700">
              {formSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.contactSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.contactName} *</label>
                      <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.contactCompany}</label>
                      <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.contactEmail} *</label>
                      <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.contactPhone}</label>
                      <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.contactMessage}</label>
                    <textarea
                      value={formMessage} onChange={e => setFormMessage(e.target.value)}
                      rows={3}
                      placeholder={s.contactMessagePlaceholder}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>
                  {formError && <p className="text-red-600 text-sm">{formError}</p>}
                  <button
                    type="submit" disabled={formLoading}
                    className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors border-none cursor-pointer text-base"
                  >
                    {formLoading ? '...' : s.contactButton}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-navy via-navy-light to-teal-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {lang === 'hu' ? 'Kesz az integrációra?' : 'Ready to integrate?'}
          </h2>
          <p className="mt-4 text-lg text-white/70">
            {lang === 'hu'
              ? 'Igényeljen API hozzáférést és kezdje el az integrációt még ma.'
              : 'Request API access and start integrating today.'}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('#kapcsolat')}
              className="w-full sm:w-auto bg-gold hover:bg-gold-light text-white font-semibold rounded-xl px-10 py-4 text-base transition-colors shadow-lg shadow-gold/30 border-none cursor-pointer"
            >
              {s.heroCta1}
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto text-center border border-white/30 text-white font-semibold rounded-xl px-10 py-4 text-base hover:bg-white/10 transition-colors no-underline"
            >
              {s.back}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-14 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xl font-bold text-white mb-2">
                <span className="text-gold">Ceg</span>verzum <span className="text-sm font-normal text-gray-500">API</span>
              </div>
              <p className="text-sm max-w-md">{s.footerDesc}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors no-underline">
                {lang === 'hu' ? 'Fooldal' : 'Homepage'}
              </Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors no-underline">
                {s.login}
              </Link>
              <span className="text-gray-600">api@cegverzum.hu</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Cegverzum. {s.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
