import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const t = {
  hu: {
    title: 'Az oldal nem található',
    subtitle: 'A keresett oldal nem létezik vagy áthelyezésre került.',
    back: 'Vissza a főoldalra',
  },
  en: {
    title: 'Page not found',
    subtitle: 'The page you are looking for does not exist or has been moved.',
    back: 'Back to home',
  },
}

export function NotFoundPage() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO title="404" description={s.title} />

      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-8xl sm:text-9xl font-extrabold text-white/20 select-none">404</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">{s.title}</h1>
          <p className="mt-3 text-white/60 text-base max-w-md mx-auto">{s.subtitle}</p>
        </div>
      </div>

      {/* Action */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Link
          to="/"
          className="inline-block bg-teal hover:bg-teal-light text-white font-semibold rounded-xl px-8 py-3 transition-colors no-underline"
        >
          &larr; {s.back}
        </Link>
      </div>
    </div>
  )
}
