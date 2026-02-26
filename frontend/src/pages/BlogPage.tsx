import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { blogPosts, blogCategories } from '../data/blogPosts'

const t = {
  hu: {
    title: 'Tudástár',
    subtitle: 'Szakmai cikkek, útmutatók és elemzések a céginformáció világából.',
    all: 'Összes',
    readMore: 'Tovább olvasok',
    readTime: 'perc olvasás',
    back: 'Vissza a főoldalra',
  },
  en: {
    title: 'Blog',
    subtitle: 'Expert articles, guides and analyses from the world of business information.',
    all: 'All',
    readMore: 'Read more',
    readTime: 'min read',
    back: 'Back to home',
  },
}

const categoryColors: Record<string, string> = {
  Pénzügy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Kockázat: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Marketing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Jogi: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Technológia: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Üzlet: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const gradients = [
  'from-navy to-teal-dark',
  'from-teal-dark to-navy-light',
  'from-navy-light to-navy',
  'from-navy via-teal-dark to-navy-light',
  'from-teal-dark via-navy to-navy-light',
]

export function BlogPage() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO
        title={lang === 'hu' ? 'Tudástár' : 'Blog'}
        description={s.subtitle}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{s.title}</h1>
          <p className="mt-3 text-white/60 text-base">{s.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border-none cursor-pointer ${
              activeCategory === null
                ? 'bg-teal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            {s.all}
          </button>
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border-none cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-slate-800 transition-all no-underline"
            >
              {/* Gradient placeholder */}
              <div
                className={`h-36 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}
              >
                <span className="text-4xl font-bold text-white/20 select-none">
                  {post.title.charAt(0)}
                </span>
              </div>

              <div className="p-5">
                {/* Category + date */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {post.readTime} {s.readTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-teal transition-colors leading-snug mb-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Date */}
                <p className="mt-3 text-xs text-gray-400">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <Link
            to="/"
            className="text-sm text-teal hover:text-teal-light transition-colors no-underline"
          >
            &larr; {s.back}
          </Link>
        </div>
      </div>
    </div>
  )
}
