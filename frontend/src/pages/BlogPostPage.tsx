import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { blogPosts } from '../data/blogPosts'

const t = {
  hu: {
    backToBlog: 'Vissza a blogra',
    notFound: 'A cikk nem található.',
    related: 'További cikkek',
    readTime: 'perc olvasás',
  },
  en: {
    backToBlog: 'Back to blog',
    notFound: 'Article not found.',
    related: 'Related articles',
    readTime: 'min read',
  },
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  const post = blogPosts.find((p) => p.slug === slug)

  const related = useMemo(() => {
    if (!post) return []
    const others = blogPosts.filter((p) => p.slug !== slug)
    const shuffled = [...others].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }, [slug, post])

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <SEO title="404" />
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{s.notFound}</p>
          <Link
            to="/blog"
            className="text-teal hover:text-teal-light transition-colors no-underline text-sm"
          >
            &larr; {s.backToBlog}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO title={post.title} description={post.excerpt} type="article" />

      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 text-white/50 text-sm mb-4">
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.author}</span>
            <span>&middot;</span>
            <span>{post.readTime} {s.readTime}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => (
            <div key={i} className="mb-5">
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                {paragraph.split('**').map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-gray-900 dark:text-white">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <Link
            to="/blog"
            className="text-sm text-teal hover:text-teal-light transition-colors no-underline"
          >
            &larr; {s.backToBlog}
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {s.related}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group p-4 rounded-xl bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors no-underline border border-gray-100 dark:border-slate-800"
                >
                  <p className="text-xs text-gray-400 mb-1">{r.date}</p>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal transition-colors leading-snug">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
