import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/* ───────── SVG helper ───────── */
function Ico({ d, className = 'w-6 h-6' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

/* ───────── page content per route ───────── */
interface ModuleContent {
  icon: string
  color: string
  colorBg: string
  colorLight: string
  titleHu: string
  titleEn: string
  subtitleHu: string
  subtitleEn: string
  descHu: string
  descEn: string
  featuresHu: { title: string; desc: string }[]
  featuresEn: { title: string; desc: string }[]
}

const modules: Record<string, ModuleContent> = {
  '/market-map': {
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    color: 'text-accent',
    colorBg: 'bg-accent/10',
    colorLight: 'bg-accent/5 border-accent/20',
    titleHu: 'Piacterkep',
    titleEn: 'Market Map',
    subtitleHu: 'Piaci trendek es adatok vizualizalva',
    subtitleEn: 'Market trends and data visualized',
    descHu: 'A Piacterkep modul szemelyre szabott piaci adatokat es trendeket biztosit az On iparagarol es celcsoportjarol. Interaktiv terkepek, iparagi osszehasonlitasok, regionalis bontasu statisztikak es vizualis dashboardok segitsegevel atfogo kepet kaphat a magyar piacrol.',
    descEn: 'The Market Map module provides personalized market data and trends for your industry and target audience. With interactive maps, industry comparisons, regional statistics and visual dashboards, you get a comprehensive view of the Hungarian market.',
    featuresHu: [
      { title: 'Iparagi trendek', desc: 'Reszletes iparagi statisztikak TEAOR kodok alapjan, novekdesi trendek es piaci reszesedes adatok.' },
      { title: 'Regionalis hoteerkep', desc: 'Vizualis terkep a cegek foldrazi eloszlasarol, surusodesrol es regionalis kulonbsegekrol.' },
      { title: 'Versenytars-elemezes', desc: 'Osszevetesi lehetoseg az On cegenek piaci poziciojarol a hasonlo cegekhez kepest.' },
      { title: 'Szemelyre szabott riportok', desc: 'Az On erdeklodesi korere szabott piaci jelensek, PDF es CSV export lehetoseggel.' },
      { title: 'Alapitasi es megszunesi trendek', desc: 'Havi bontasu adatok uj cegalapitasokrol es megszunesekrol iparag es regio szerint.' },
      { title: 'Interaktiv diagramok', desc: 'Szureto, nagyithato diagramok es grafikonok, amelyek segitik az adatok megereteset.' },
    ],
    featuresEn: [
      { title: 'Industry trends', desc: 'Detailed industry statistics by NACE codes, growth trends and market share data.' },
      { title: 'Regional heatmap', desc: 'Visual map of company geographical distribution, density and regional differences.' },
      { title: 'Competitor analysis', desc: 'Compare your company\'s market position against similar companies.' },
      { title: 'Personalized reports', desc: 'Market insights tailored to your interests, with PDF and CSV export.' },
      { title: 'Founding & dissolution trends', desc: 'Monthly data on new company formations and closures by industry and region.' },
      { title: 'Interactive charts', desc: 'Filterable, zoomable charts and graphs to help understand the data.' },
    ],
  },
  '/financial-analysis': {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'text-gold',
    colorBg: 'bg-gold/10',
    colorLight: 'bg-gold/5 border-gold/20',
    titleHu: 'Penzugyi elemzes',
    titleEn: 'Financial Analysis',
    subtitleHu: 'Merleg, eredmenykimutatas, penzugyi mutatok',
    subtitleEn: 'Balance sheet, income statement, financial metrics',
    descHu: 'A Penzugyi elemzes modul teljes koru penzugyi kepet ad barmely magyar cegrol. Merleg, eredmenykimutatas, cash flow elemzes, penzugyi mutatok es trendek — mindezt interaktiv diagramokkal es atlathatoan megjelenitve. Tobb mint 50 automatikusan szamolt penzugyi mutato segiti a donnteshoozatalt.',
    descEn: 'The Financial Analysis module gives you a complete financial picture of any Hungarian company. Balance sheet, income statement, cash flow analysis, financial metrics and trends — all with interactive charts and clear visualizations. Over 50 automatically calculated financial metrics support your decision-making.',
    featuresHu: [
      { title: 'Merleg es eredmenykimutatas', desc: 'Reszletes penzugyi beszamolok evenkenti bontasban, osszehasonlithato formatumban.' },
      { title: 'Tobb mint 50 penzugyi mutato', desc: 'Automatikusan szamolt ratiok: likviditasi, jovedelmezosegi, hatekonyasgi es tokestruktura mutatok.' },
      { title: 'Trendgrafikonok', desc: 'Interaktiv diagramok a ceg penzugyi teljesitmenyenek alakulasarol az evek soran.' },
      { title: 'Iparagi benchmark', desc: 'A ceg penzugyi mutatoinak osszehasonlitasa az iparagi atlaggal es a versenytarsakkal.' },
      { title: 'Peenszforgalmi elemzes', desc: 'Cash flow kimutatasa es elemzese, operativ, befektetesi es finanszzirozasi bontasban.' },
      { title: 'PDF export', desc: 'Reszletes penzugyi jelentes generalasa es letoltese PDF formatumban.' },
    ],
    featuresEn: [
      { title: 'Balance sheet & income statement', desc: 'Detailed financial reports by year in comparable format.' },
      { title: 'Over 50 financial metrics', desc: 'Automatically calculated ratios: liquidity, profitability, efficiency and capital structure.' },
      { title: 'Trend charts', desc: 'Interactive charts showing the company\'s financial performance over the years.' },
      { title: 'Industry benchmark', desc: 'Compare the company\'s financial metrics against the industry average and competitors.' },
      { title: 'Cash flow analysis', desc: 'Cash flow statement and analysis, broken down by operating, investing and financing activities.' },
      { title: 'PDF export', desc: 'Generate and download detailed financial reports in PDF format.' },
    ],
  },
  '/risk-analysis': {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
    color: 'text-red-500',
    colorBg: 'bg-red-500/10',
    colorLight: 'bg-red-500/5 border-red-500/20',
    titleHu: 'Kockazatelemzes',
    titleEn: 'Risk Analysis',
    subtitleHu: 'Kockazati index, negativ esemenyek figyelese',
    subtitleEn: 'Risk index, negative event monitoring',
    descHu: 'A Kockazatelemzes modul segit felterkepezni partnerei es beszallitoi kockazatait. Egysegessitett kockazati index, negativ esemenyek (felszamolas, csodeljras, kenyszertorles) monitorozasa, NAV adoellenorzesi adatok es valoss ideju figyelmeztetsek — hogy idoben megelozze a potenciails problemakat.',
    descEn: 'The Risk Analysis module helps you map the risks of your partners and suppliers. Unified risk index, negative event monitoring (liquidation, bankruptcy, forced deletion), NAV tax audit data and real-time alerts — so you can prevent potential problems in time.',
    featuresHu: [
      { title: 'Kockazati index', desc: 'Egysegessitett pontszam 1-100 kozott, amely osszefoglalja a ceg kockazati profiljat.' },
      { title: 'Negativ esemenyek', desc: 'Felszamolas, csodeljras, vegelsszamolas, kenyszertorles statuszok es torteneti adatok.' },
      { title: 'NAV adatok', desc: 'Adotartozas, adoellenorzesi adatok, NAV feketelistsa es megbizhatosagi jelzesek.' },
      { title: 'Valtos ideju ertesitesek', desc: 'Automatikus figyelmeztetes, ha egy figyelt ceg kockazati besorolasa valtozik.' },
      { title: 'Partnerminositess', desc: 'Komplex partnerminositesi rendszer a ceeg penzugyi, jogi es operativ adatai alapjan.' },
      { title: 'Kockazati riport', desc: 'Reszletes kockazati jelentes generalasa es letoltese PDF formatumban.' },
    ],
    featuresEn: [
      { title: 'Risk index', desc: 'Unified score from 1-100 summarizing the company\'s risk profile.' },
      { title: 'Negative events', desc: 'Liquidation, bankruptcy, dissolution, forced deletion statuses and historical data.' },
      { title: 'NAV data', desc: 'Tax debt, tax audit data, NAV blacklist and reliability signals.' },
      { title: 'Real-time alerts', desc: 'Automatic notification when a monitored company\'s risk classification changes.' },
      { title: 'Partner qualification', desc: 'Complex partner qualification system based on financial, legal and operational data.' },
      { title: 'Risk report', desc: 'Generate and download detailed risk reports in PDF format.' },
    ],
  },
}

/* ───────── component ───────── */
export function ComingSoonPage() {
  const location = useLocation()
  const [lang] = useState<'hu' | 'en'>(() =>
    (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )

  const hu = lang === 'hu'
  const mod = modules[location.pathname]

  if (!mod) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">404</p>
      </div>
    )
  }

  const title = hu ? mod.titleHu : mod.titleEn
  const subtitle = hu ? mod.subtitleHu : mod.subtitleEn
  const desc = hu ? mod.descHu : mod.descEn
  const features = hu ? mod.featuresHu : mod.featuresEn

  const featureIcons = [
    'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm5-3v16m-5-8h14',
    'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gold/8 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal/10 blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl ${mod.colorBg} flex items-center justify-center`}>
              <Ico d={mod.icon} className={`w-6 h-6 ${mod.color}`} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
              <p className="text-white/60 text-sm">{subtitle}</p>
            </div>
          </div>

          {/* Coming soon badge */}
          <div className="mt-6 inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
            </span>
            <span className="text-sm font-semibold text-gold">
              {hu ? 'Fejlesztes alatt — Hamarosan erkezik' : 'Under development — Coming soon'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Description */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {hu ? 'A modul leirasa' : 'Module description'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
        </div>

        {/* Features grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {hu ? 'Tervezett funkciok' : 'Planned features'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`bg-white dark:bg-slate-800 rounded-xl border ${mod.colorLight} p-5 hover:shadow-md transition-shadow`}
              >
                <div className={`w-9 h-9 rounded-lg ${mod.colorBg} flex items-center justify-center ${mod.color} mb-3`}>
                  <Ico d={featureIcons[i % featureIcons.length]} className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notify / CTA section */}
        <div className="bg-gradient-to-br from-navy/5 to-teal/5 dark:from-navy/20 dark:to-teal/10 rounded-xl border border-navy/10 dark:border-navy/30 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {hu ? 'Hamarosan elerheto!' : 'Coming soon!'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
            {hu
              ? 'Ez a funkcia jelenleg fejlesztes alatt all. Ha ertesulni szeretne a megjeleneserol, kerjuk vegye fel velunk a kapcsolatot vagy kovesse profiloldalunkat.'
              : 'This feature is currently under development. To be notified of its release, please contact us or follow our profile page.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/profile?tab=kapcsolat"
              className="bg-gold hover:bg-gold-light text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors no-underline"
            >
              {hu ? 'Ertesitsenek' : 'Notify me'}
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline border border-gray-300 dark:border-slate-600 px-6 py-2.5 rounded-lg transition-colors"
            >
              {hu ? 'Vissza a kereseshhez' : 'Back to search'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
