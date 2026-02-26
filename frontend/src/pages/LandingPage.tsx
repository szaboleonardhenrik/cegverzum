import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PACKAGES, formatPriceNumber, pricePeriod } from '../config/pricing'
import { SEO } from '../components/SEO'

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
    nav: ['Szolgáltatások', 'Árak', 'Vélemények', 'Kapcsolat'],
    navCegellenorzo: 'Cégellenőrző',
    navApi: 'API',
    login: 'Bejelentkezés',
    register: 'Regisztráció',
    heroTitle1: 'A legátfogóbb magyar',
    heroTitle2: 'céginformációs',
    heroTitle3: 'platform',
    heroSub: 'Több mint 500 000 cég adata, pénzügyi elemzések, kockázati jelentések és valós idejű figyelés — egyetlen felületen, naprakészen.',
    heroCta1: 'Ingyenes próba',
    heroCta2: 'Tudjon meg többet',
    heroStats: [
      { value: '500 000+', label: 'cég az adatbázisban' },
      { value: '7', label: 'modul' },
      { value: 'Napi', label: 'frissítés' },
      { value: 'NAV', label: 'integráció' },
    ],
    featuresTitle: 'Szolgáltatásaink',
    featuresSub: 'Mindent egy helyen: a magyar cégvilág adatai, elemzései és figyelési eszközei.',
    features: [
      { title: 'Céginformáció', desc: 'Részletes cégadatok, adószám, cégjegyzékszám, tulajdonosi struktúra és tisztségviselők egy helyen.' },
      { title: 'Pénzügyi elemzés', desc: 'Mérleg, eredménykimutatás, pénzügyi mutatók és interaktív grafikonok azonnali hozzáféréssel.' },
      { title: 'Kockázatelemzés', desc: 'Kockázati index, negatív események figyelése, felszámolás és csődeljárás monitorozás.' },
      { title: 'Marketing adatbázis', desc: 'Célzott céglisták készítése szűrhető adatbázisból, exportálás CSV-be marketingcélokra.' },
      { title: 'Cégfigyelés', desc: 'Valós idejű értesítések cégadatok változásairól, új bejegyzések és törlések figyelése.' },
      { title: 'API összeköttetés', desc: 'RESTful API cégadatok lekérdezéséhez — integrálja saját CRM, ERP vagy egyéb rendszerébe.' },
    ],
    stats: [
      { value: '500 000+', label: 'cég' },
      { value: '50+', label: 'pénzügyi mutató' },
      { value: 'Napi', label: 'frissítés' },
      { value: '99.9%', label: 'rendelkezésre állás' },
    ],
    aboutTitle: 'Miért a Cégverzum?',
    aboutP1: 'A Cégverzum egyesíti a NAV, a Cégbíróság és a KSH adatait egyetlen, könnyen kezelhető platformba. Naponta frissülő adataink segítségével mindig pontos képet kap partnerei pénzügyi helyzetéről, kockázatairól és piaci pozíciójáról.',
    aboutP2: 'Legyen szó beszállítói ellenőrzésről, értékesítési célcsoportok összeállításáról vagy compliance feladatokról — a Cégverzum eszköztára minden üzleti igényt kielégít.',
    diffs: [
      'NAV + Cégbíróság + KSH integráció',
      'Valós idejű adatfrissítés',
      'Több mint 50 pénzügyi mutató',
      'Exportálás CSV és PDF formátumban',
      'Testreszabható értesítések',
      'RESTful API hozzáférés',
    ],
    pricingTitle: 'Árazás',
    pricingSub: 'Válassza ki az Önnek megfelelő csomagot — fizessen online, azonnal hozzáférést kap.',
    pricingPlans: [
      {
        name: PACKAGES[1].name,
        price: formatPriceNumber(PACKAGES[1].price, 'hu'),
        period: pricePeriod(PACKAGES[1].price, 'hu'),
        features: ['Céginformációk', 'Alapvető pénzügyi adatok', '100 keresés / hó', 'CSV export'],
        cta: 'Megvásárlom',
        highlighted: false,
      },
      {
        name: PACKAGES[2].name,
        price: formatPriceNumber(PACKAGES[2].price, 'hu'),
        period: pricePeriod(PACKAGES[2].price, 'hu'),
        features: ['Minden Basic funkció', 'Teljes pénzügyi elemzés', 'Kockázatelemzés', 'Korlátlan keresés', 'Cégfigyelés (10 cég)', 'API hozzáférés'],
        cta: 'Megvásárlom',
        highlighted: true,
      },
      {
        name: PACKAGES[3].name,
        price: formatPriceNumber(PACKAGES[3].price, 'hu'),
        period: pricePeriod(PACKAGES[3].price, 'hu'),
        features: ['Minden Pro funkció', 'Korlátlan cégfigyelés', 'Dedikált API', 'Egyedi integráció', 'Személyes account manager', 'SLA garancia'],
        cta: 'Ajánlatot kérek',
        highlighted: false,
      },
    ],
    pricingOnline: 'Biztonságos online fizetés bankkártyával',
    testimonialsTitle: 'Ügyfeleink mondták',
    testimonialsSub: 'Több száz vállalkozás bízik a Cégverzumban.',
    testimonials: [
      { quote: 'A Cégverzum teljesen átalakította a beszállítói ellenőrzési folyamatunkat, és 40%-kal csökkent az adminisztratív terhünk.', name: 'Kuli Dorina', title: 'Értékesítési vezető', company: 'TDHR Group' },
      { quote: 'A kockázatelemzési és cégfigyelési eszközök bevezetése teljesen átalakította a compliance munkánkat.', name: 'Galgóczi Anna', title: 'Compliance vezető', company: 'Tudatos Diák Iskolaszövetkezet' },
      { quote: 'Pénzügyi riportjaink elkészítési ideje 80%-kal csökkent a Cégverzum bevezetése után.', name: 'Varga Gábor', title: 'Pénzügyi vezető', company: 'T-Cloud Solutions Kft.' },
      { quote: 'A marketing adatbázis funkció segítségével 3x hatékonyabban találjuk meg a célcsoportjainkat.', name: 'Horváth László', title: 'Marketing igazgató', company: 'DataBridge Kft.' },
      { quote: 'Az API összeköttetés révén a CRM rendszerünk automatikusan frissül a legfrissebb cégadatokkal.', name: 'Molnár Eszter', title: 'IT vezető', company: 'LogiTech Hungary Zrt.' },
    ],
    ctaTitle: 'Kezdje el most',
    ctaSub: 'Próbálja ki a Cégverzumot — kérjen demót vagy regisztráljon ingyenesen.',
    ctaDemo: 'Demót kérek',
    ctaFreeReg: 'Ingyenes regisztráció',
    quoteTitle: 'Ajánlatkérés',
    quoteSub: 'Adja meg adatait és 24 órán belül felvesszük Önnel a kapcsolatot.',
    quoteSuccess: 'Köszönjük az ajánlatkérést! 24 órán belül felvesszük Önnel a kapcsolatot.',
    quoteName: 'Teljes név',
    quoteCompany: 'Cégnév',
    quoteEmail: 'E-mail cím',
    quoteButton: 'Ajánlatot kérek',
    quotePoints: [
      'Személyre szabott ajánlat',
      'Ingyenes bemutató',
      '24 órán belül visszajelzünk',
    ],
    footerDesc: 'A legátfogóbb magyar céginformációs platform. Naprakész adatok, pénzügyi elemzések és kockázati jelentések több mint 500 000 cégről.',
    footerLinksTitle: 'Linkek',
    footerLinks: [
      { label: 'Szolgáltatások', href: '#szolgaltatasok' },
      { label: 'Árak', href: '#arak' },
      { label: 'Kapcsolat', href: '/kapcsolat' },
      { label: 'ÁSZF', href: '/aszf' },
      { label: 'Adatvédelem', href: '/adatvedelem' },
      { label: 'Blog', href: '/blog' },
    ],
    footerContactTitle: 'Kapcsolat',
    copyright: 'Minden jog fenntartva.',
  },
  en: {
    nav: ['Services', 'Pricing', 'Testimonials', 'Contact'],
    navCegellenorzo: 'Company Check',
    navApi: 'API',
    login: 'Log in',
    register: 'Register',
    heroTitle1: 'The most comprehensive Hungarian',
    heroTitle2: 'business information',
    heroTitle3: 'platform',
    heroSub: 'Data on over 500,000 companies, financial analysis, risk reports and real-time monitoring — all on a single, up-to-date platform.',
    heroCta1: 'Free trial',
    heroCta2: 'Learn more',
    heroStats: [
      { value: '500,000+', label: 'companies in database' },
      { value: '7', label: 'modules' },
      { value: 'Daily', label: 'updates' },
      { value: 'NAV', label: 'integration' },
    ],
    featuresTitle: 'Our Services',
    featuresSub: 'Everything in one place: Hungarian business data, analytics and monitoring tools.',
    features: [
      { title: 'Company Information', desc: 'Detailed company data, tax ID, registration number, ownership structure and officers in one place.' },
      { title: 'Financial Analysis', desc: 'Balance sheet, income statement, financial indicators and interactive charts with instant access.' },
      { title: 'Risk Assessment', desc: 'Risk index, negative event monitoring, liquidation and bankruptcy tracking.' },
      { title: 'Marketing Database', desc: 'Build targeted company lists from a filterable database, export to CSV for marketing purposes.' },
      { title: 'Company Monitoring', desc: 'Real-time notifications on company data changes, new entries and deletions.' },
      { title: 'API Integration', desc: 'RESTful API for company data queries — integrate into your own CRM, ERP or other systems.' },
    ],
    stats: [
      { value: '500,000+', label: 'companies' },
      { value: '50+', label: 'financial indicators' },
      { value: 'Daily', label: 'updates' },
      { value: '99.9%', label: 'uptime' },
    ],
    aboutTitle: 'Why Cégverzum?',
    aboutP1: 'Cégverzum combines data from NAV, the Court of Registration and KSH into a single, easy-to-use platform. With daily data updates you always get an accurate picture of your partners\' financial situation, risks and market position.',
    aboutP2: 'Whether it\'s supplier verification, building sales target groups or compliance tasks — Cégverzum\'s toolkit meets every business need.',
    diffs: [
      'NAV + Court of Registration + KSH integration',
      'Real-time data updates',
      'Over 50 financial indicators',
      'Export to CSV and PDF',
      'Customizable notifications',
      'RESTful API access',
    ],
    pricingTitle: 'Pricing',
    pricingSub: 'Choose the plan that fits you — pay online, get instant access.',
    pricingPlans: [
      {
        name: PACKAGES[1].name,
        price: formatPriceNumber(PACKAGES[1].price, 'en'),
        period: pricePeriod(PACKAGES[1].price, 'en'),
        features: ['Company information', 'Basic financial data', '100 searches / month', 'CSV export'],
        cta: 'Buy now',
        highlighted: false,
      },
      {
        name: PACKAGES[2].name,
        price: formatPriceNumber(PACKAGES[2].price, 'en'),
        period: pricePeriod(PACKAGES[2].price, 'en'),
        features: ['All Basic features', 'Full financial analysis', 'Risk assessment', 'Unlimited searches', 'Company monitoring (10)', 'API access'],
        cta: 'Buy now',
        highlighted: true,
      },
      {
        name: PACKAGES[3].name,
        price: formatPriceNumber(PACKAGES[3].price, 'en'),
        period: pricePeriod(PACKAGES[3].price, 'en'),
        features: ['All Pro features', 'Unlimited monitoring', 'Dedicated API', 'Custom integration', 'Personal account manager', 'SLA guarantee'],
        cta: 'Request quote',
        highlighted: false,
      },
    ],
    pricingOnline: 'Secure online payment by credit card',
    testimonialsTitle: 'What our clients say',
    testimonialsSub: 'Hundreds of businesses trust Cégverzum.',
    testimonials: [
      { quote: 'Cégverzum completely transformed our supplier verification process and reduced our administrative burden by 40%.', name: 'Dorina Kuli', title: 'Head of Sales', company: 'TDHR Group' },
      { quote: 'The introduction of risk analysis and company monitoring tools completely transformed our compliance work.', name: 'Anna Galgóczi', title: 'Head of Compliance', company: 'Tudatos Diák Iskolaszövetkezet' },
      { quote: 'Our financial report preparation time decreased by 80% after introducing Cégverzum.', name: 'Gábor Varga', title: 'CFO', company: 'T-Cloud Solutions Kft.' },
      { quote: 'The marketing database feature helped us find our target audience 3x more efficiently.', name: 'László Horváth', title: 'Marketing Director', company: 'DataBridge Kft.' },
      { quote: 'Through the API integration, our CRM system automatically updates with the latest company data.', name: 'Eszter Molnár', title: 'IT Lead', company: 'LogiTech Hungary Zrt.' },
    ],
    ctaTitle: 'Get started now',
    ctaSub: 'Try Cégverzum — request a demo or register for free.',
    ctaDemo: 'Request demo',
    ctaFreeReg: 'Free registration',
    quoteTitle: 'Request a quote',
    quoteSub: 'Enter your details and we\'ll contact you within 24 hours.',
    quoteSuccess: 'Thank you for your request! We\'ll contact you within 24 hours.',
    quoteName: 'Full name',
    quoteCompany: 'Company name',
    quoteEmail: 'Email address',
    quoteButton: 'Request quote',
    quotePoints: [
      'Personalized offer',
      'Free demonstration',
      'Response within 24 hours',
    ],
    footerDesc: 'The most comprehensive Hungarian business information platform. Up-to-date data, financial analysis and risk reports on over 500,000 companies.',
    footerLinksTitle: 'Links',
    footerLinks: [
      { label: 'Services', href: '#szolgaltatasok' },
      { label: 'Pricing', href: '#arak' },
      { label: 'Contact', href: '/kapcsolat' },
      { label: 'Terms of Service', href: '/aszf' },
      { label: 'Privacy Policy', href: '/adatvedelem' },
      { label: 'Blog', href: '/blog' },
    ],
    footerContactTitle: 'Contact',
    copyright: 'All rights reserved.',
  },
}

/* ───────── shared data ───────── */
const navAnchors = ['#szolgaltatasok', '#arak', '#velemenyek', '#kapcsolat']

const featureIcons = [
  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
]

const featureColors = [
  'from-teal/10 to-teal/5 border-teal/20',
  'from-gold/10 to-gold/5 border-gold/20',
  'from-red-500/10 to-red-500/5 border-red-500/20',
  'from-accent/10 to-accent/5 border-accent/20',
  'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  'from-navy/10 to-navy/5 border-navy/20',
]

const featureIconColors = ['text-teal', 'text-gold', 'text-red-500', 'text-accent', 'text-orange-500', 'text-navy']

const avatarColors = [
  'bg-teal text-white',
  'bg-accent text-white',
  'bg-gold text-white',
  'bg-orange-500 text-white',
  'bg-navy text-white',
]

/* ───────── component ───────── */
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [lang, setLang] = useState<'hu' | 'en'>(() =>
    (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )

  // Quote form state
  const [quoteName, setQuoteName] = useState('')
  const [quoteCompany, setQuoteCompany] = useState('')
  const [quoteEmail, setQuoteEmail] = useState('')
  const [quoteError, setQuoteError] = useState('')
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)

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

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuoteError('')
    if (!quoteName.trim() || !quoteEmail.trim()) {
      setQuoteError(lang === 'hu' ? 'Kérjük, töltse ki a kötelező mezőket.' : 'Please fill in the required fields.')
      return
    }
    setQuoteLoading(true)
    // Simulate sending — in production this would call a real API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setQuoteSuccess(true)
    setQuoteLoading(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-200 transition-colors">
      <SEO description="Naprakész céginformációk, pénzügyi elemzések, kockázati jelentések és marketing adatbázis több mint 500 000 magyar cégről." />
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-white/10'
            : 'bg-white dark:bg-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="text-xl font-bold tracking-tight no-underline text-gray-900 dark:text-white"
          >
            <span className="text-gold">Cég</span>verzum
          </a>

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
            <Link
              to="/cegellenorzo"
              className="text-sm font-medium text-teal hover:text-teal-light no-underline"
            >
              {s.navCegellenorzo}
            </Link>
            <Link
              to="/api"
              className="text-sm font-medium text-navy dark:text-gold hover:text-navy-light dark:hover:text-gold-light no-underline"
            >
              {s.navApi}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg transition-colors border-none cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={toggleLang}
              className="text-xs font-bold uppercase p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
            >
              {lang === 'hu' ? 'EN' : 'HU'}
            </button>
            <Link
              to="/login"
              className="text-sm font-medium rounded-lg px-4 py-2 transition-colors no-underline text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
            >
              {s.login}
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-gold hover:bg-gold-light rounded-lg px-4 py-2 transition-colors no-underline shadow-sm shadow-gold/20"
            >
              {s.register}
            </Link>
          </div>

          {/* hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={toggleDark} className="p-2 rounded-lg transition-colors border-none cursor-pointer text-gray-500 dark:text-gray-400">
              {dark ? <Ico d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" className="w-5 h-5" /> : <Ico d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" className="w-5 h-5" />}
            </button>
            <button onClick={toggleLang} className="text-xs font-bold uppercase p-2 border-none cursor-pointer bg-transparent text-gray-500 dark:text-gray-400">
              {lang === 'hu' ? 'EN' : 'HU'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-gray-700 dark:text-white"
            >
              {mobileOpen ? <Ico d="M6 18L18 6M6 6l12 12" className="w-6 h-6" /> : <Ico d="M4 6h16M4 12h16M4 18h16" className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 space-y-2 bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10">
            {s.nav.map((label, i) => (
              <button
                key={navAnchors[i]}
                onClick={() => scrollTo(navAnchors[i])}
                className="block w-full text-left text-sm py-2 bg-transparent border-none cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {label}
              </button>
            ))}
            <Link to="/cegellenorzo" className="block text-sm py-2 text-teal hover:text-teal-light no-underline font-medium" onClick={() => setMobileOpen(false)}>
              {s.navCegellenorzo}
            </Link>
            <Link to="/api" className="block text-sm py-2 text-navy dark:text-gold hover:text-navy-light dark:hover:text-gold-light no-underline font-medium" onClick={() => setMobileOpen(false)}>
              {s.navApi}
            </Link>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm font-medium rounded-lg px-4 py-2 no-underline text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                {s.login}
              </Link>
              <Link to="/register" className="flex-1 text-center text-sm font-medium text-white bg-gold rounded-lg px-4 py-2 no-underline">
                {s.register}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO — white background with gold accents */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gold/12 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-teal/5 blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {s.heroTitle1}<br />
            <span className="bg-gradient-to-r from-gold via-gold-light to-teal bg-clip-text text-transparent">{s.heroTitle2}</span> {s.heroTitle3}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{s.heroSub}</p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/cegellenorzo"
              className="w-full sm:w-auto text-center bg-gold hover:bg-gold-light text-white font-semibold rounded-xl px-8 py-3.5 text-base transition-colors no-underline shadow-lg shadow-gold/30"
            >
              {s.heroCta1}
            </Link>
            <button
              onClick={() => scrollTo('#szolgaltatasok')}
              className="w-full sm:w-auto text-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl px-8 py-3.5 text-base hover:bg-gray-50 dark:hover:bg-white/10 transition-colors bg-transparent cursor-pointer"
            >
              {s.heroCta2}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {s.heroStats.map(st => (
              <div key={st.label} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-5 text-center border border-gold/20 dark:border-gold/15 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-gold dark:text-gold">{st.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="szolgaltatasok" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.featuresTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.featuresSub}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {s.features.map((f, i) => {
              const isApi = i === 5
              const card = (
                <div
                  className={`bg-gradient-to-br ${featureColors[i]} rounded-2xl p-6 border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center ${featureIconColors[i]} mb-4`}>
                    <Ico d={featureIcons[i]} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  {isApi && (
                    <span className="inline-block mt-3 text-sm font-medium text-navy dark:text-teal-light">
                      {lang === 'hu' ? 'Tovabb →' : 'Learn more →'}
                    </span>
                  )}
                </div>
              )
              return isApi ? (
                <Link key={f.title} to="/api" className="no-underline">
                  {card}
                </Link>
              ) : (
                <div key={f.title}>{card}</div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-gradient-to-r from-navy to-teal-dark py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {s.stats.map(st => (
            <div key={st.label}>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">{st.value}</div>
              <div className="mt-2 text-sm text-white/60">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT / WHY */}
      <section id="rolunk" className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">{s.aboutTitle}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{s.aboutP1}</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{s.aboutP2}</p>
            </div>
            <div className="space-y-4">
              {s.diffs.map(d => (
                <div key={d} className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-teal/15 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-base text-gray-700 dark:text-gray-300">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="arak" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.pricingTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.pricingSub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {s.pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 sm:p-8 border transition-all ${
                  plan.highlighted
                    ? 'bg-white dark:bg-slate-800 border-navy shadow-xl shadow-navy/10 ring-2 ring-navy/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-teal uppercase tracking-wider mb-4">
                    {lang === 'hu' ? 'Legnépszerűbb' : 'Most popular'}
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
                  onClick={() => plan.highlighted || plan.name === 'Basic' ? scrollTo('#cegellenorzo') : scrollTo('#ajanlatkeres')}
                  className={`w-full mt-8 font-semibold rounded-xl px-6 py-3 transition-colors border-none cursor-pointer text-base ${
                    plan.highlighted
                      ? 'bg-navy hover:bg-navy-light text-white shadow-lg shadow-navy/25'
                      : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Online payment badge */}
          <div className="mt-12 flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {s.pricingOnline}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — auto-scroll marquee */}
      <section id="velemenyek" className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.testimonialsTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{s.testimonialsSub}</p>
          </div>
        </div>

        {/* Marquee container */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee" style={{ width: 'max-content' }}>
            {[...s.testimonials, ...s.testimonials].map((tm, idx) => (
              <div
                key={idx}
                className="w-[340px] sm:w-[400px] shrink-0 mx-3"
              >
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    &ldquo;{tm.quote}&rdquo;
                  </blockquote>
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                      {tm.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{tm.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tm.title}, {tm.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE REQUEST (Ajánlatkérés) */}
      <section id="ajanlatkeres" className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{s.quoteTitle}</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{s.quoteSub}</p>
              <div className="mt-8 space-y-3">
                {s.quotePoints.map(item => (
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
            </div>

            {/* Right: form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700">
              {quoteSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.quoteSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.quoteName} *</label>
                    <input
                      type="text" value={quoteName} onChange={e => setQuoteName(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                      placeholder={lang === 'hu' ? 'Példa János' : 'John Doe'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.quoteCompany}</label>
                    <input
                      type="text" value={quoteCompany} onChange={e => setQuoteCompany(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                      placeholder={lang === 'hu' ? 'Cégnév Kft.' : 'Company Ltd.'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.quoteEmail} *</label>
                    <input
                      type="email" value={quoteEmail} onChange={e => setQuoteEmail(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="pelda@email.hu"
                    />
                  </div>
                  {quoteError && <p className="text-red-600 text-sm">{quoteError}</p>}
                  <button
                    type="submit" disabled={quoteLoading}
                    className="w-full bg-teal hover:bg-teal-light disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors border-none cursor-pointer text-base"
                  >
                    {quoteLoading ? '...' : s.quoteButton}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* API HIGHLIGHT BANNER */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-navy via-navy-light to-teal-dark rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/10 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-teal/15 blur-[60px]" />
            </div>
            <div className="relative grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
                  <Ico d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" className="w-4 h-4 text-gold" />
                  <span className="text-xs text-white/80 font-medium">API</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {lang === 'hu' ? 'API osszekottetes' : 'API Integration'}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  {lang === 'hu'
                    ? 'Csatlakoztassa sajat CRM, ERP vagy egyeb rendszeret a Cegverzum adatbazishoz. RESTful API, JSON valaszok, reszletes dokumentacio.'
                    : 'Connect your own CRM, ERP or other system to the Cegverzum database. RESTful API, JSON responses, detailed documentation.'}
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-extrabold text-white">{lang === 'hu' ? '49 900' : '49,900'}</span>
                  <span className="text-sm text-white/50">{lang === 'hu' ? 'Ft / ho-tol' : 'HUF / mo from'}</span>
                </div>
                <Link
                  to="/api"
                  className="inline-block bg-gold hover:bg-gold-light text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors no-underline shadow-lg shadow-gold/30"
                >
                  {lang === 'hu' ? 'Reszletek es arazas →' : 'Details & pricing →'}
                </Link>
              </div>
              <div className="hidden sm:block">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-white/10 font-mono text-xs text-gray-300 leading-6">
                  <div className="text-white/40 mb-2">// {lang === 'hu' ? 'Pelda lekerdezes' : 'Example query'}</div>
                  <div><span className="text-teal-light">GET</span> /v1/companies?q=pelda</div>
                  <div className="text-white/40 mt-3">// {lang === 'hu' ? 'Valasz' : 'Response'}</div>
                  <div>{'{'}</div>
                  <div>&nbsp;&nbsp;"nev": "Pelda Kft.",</div>
                  <div>&nbsp;&nbsp;"adoszam": "12345678-2-42",</div>
                  <div>&nbsp;&nbsp;"statusz": "<span className="text-teal-light">Aktiv</span>"</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA — two buttons */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-navy via-navy-light to-teal-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{s.ctaTitle}</h2>
          <p className="mt-4 text-lg text-white/70">{s.ctaSub}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('#ajanlatkeres')}
              className="w-full sm:w-auto bg-white text-navy font-semibold rounded-xl px-10 py-4 text-base hover:bg-gray-100 transition-colors no-underline shadow-lg border-none cursor-pointer"
            >
              {s.ctaDemo}
            </button>
            <Link
              to="/register"
              className="w-full sm:w-auto text-center bg-teal hover:bg-teal-light text-white font-semibold rounded-xl px-10 py-4 text-base transition-colors no-underline shadow-lg shadow-teal/25"
            >
              {s.ctaFreeReg}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="kapcsolat" className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-14 border-t border-gray-800 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div>
              <div className="text-xl font-bold text-white mb-3">
                <span className="text-gold">Cég</span>verzum
              </div>
              <p className="text-sm leading-relaxed">{s.footerDesc}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{s.footerLinksTitle}</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                {s.footerLinks.map(l => (
                  <li key={l.label}>
                    {l.href.startsWith('#') ? (
                      <a href={l.href} onClick={e => { e.preventDefault(); scrollTo(l.href) }} className="text-sm hover:text-white transition-colors no-underline text-gray-400">{l.label}</a>
                    ) : (
                      <Link to={l.href} className="text-sm hover:text-white transition-colors no-underline text-gray-400">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{s.footerContactTitle}</h4>
              <ul className="space-y-2 list-none p-0 m-0 text-sm">
                <li className="flex items-center gap-2">
                  <Ico d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4 shrink-0" />
                  info@cegverzum.hu
                </li>
                <li className="flex items-center gap-2">
                  <Ico d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-4 h-4 shrink-0" />
                  +3670 5678948
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-gray-800 dark:border-slate-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Cégverzum. {s.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
