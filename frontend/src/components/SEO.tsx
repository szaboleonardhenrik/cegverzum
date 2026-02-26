interface SEOProps {
  title?: string
  description?: string
  url?: string
  type?: string
}

const defaults = {
  title: 'Cégverzum — A legátfogóbb magyar céginformációs platform',
  description:
    'Naprakész céginformációk, pénzügyi elemzések, kockázati jelentések és marketing adatbázis több mint 500 000 magyar cégről. NAV, Cégbíróság és KSH adatforrásokból.',
}

export function SEO({ title, description, url, type = 'website' }: SEOProps) {
  const t = title ? `${title} | Cégverzum` : defaults.title
  const d = description || defaults.description
  const u = url || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={u} />
      <meta property="og:site_name" content="Cégverzum" />
    </>
  )
}
