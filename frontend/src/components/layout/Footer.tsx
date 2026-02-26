import { useState } from 'react'
import { Link } from 'react-router-dom'

const t = {
  hu: {
    brand: 'A legátfogóbb magyar céginformációs platform. Naprakész adatok, pénzügyi elemzések és kockázati jelentések.',
    linksTitle: 'Linkek',
    links: [
      { label: 'Szolgáltatások', to: '/' },
      { label: 'Csomagok', to: '/packages' },
      { label: 'ÁSZF', to: '/aszf' },
      { label: 'Adatvédelem', to: '/adatvedelem' },
      { label: 'Kapcsolat', to: '/kapcsolat' },
      { label: 'Blog', to: '/blog' },
    ],
    contactTitle: 'Kapcsolat',
    copyright: 'Minden jog fenntartva.',
  },
  en: {
    brand: 'The most comprehensive Hungarian business information platform. Up-to-date data, financial analysis and risk reports.',
    linksTitle: 'Links',
    links: [
      { label: 'Services', to: '/' },
      { label: 'Packages', to: '/packages' },
      { label: 'Terms of Service', to: '/aszf' },
      { label: 'Privacy Policy', to: '/adatvedelem' },
      { label: 'Contact', to: '/kapcsolat' },
      { label: 'Blog', to: '/blog' },
    ],
    contactTitle: 'Contact',
    copyright: 'All rights reserved.',
  },
}

export function Footer() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-14 mt-auto border-t border-gray-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold text-white mb-3">
              <span className="text-gold">Cég</span>verzum
            </div>
            <p className="text-sm leading-relaxed">{s.brand}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {s.linksTitle}
            </h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {s.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="text-sm hover:text-white transition-colors no-underline text-gray-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {s.contactTitle}
            </h4>
            <ul className="space-y-2 list-none p-0 m-0 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@cegverzum.hu" className="hover:text-white transition-colors no-underline text-gray-400">
                  info@cegverzum.hu
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+36705678948" className="hover:text-white transition-colors no-underline text-gray-400">
                  +3670 5678948
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 dark:border-slate-800 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Cégverzum. {s.copyright}
        </div>
      </div>
    </footer>
  )
}
