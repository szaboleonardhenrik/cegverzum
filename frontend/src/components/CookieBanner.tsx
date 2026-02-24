import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cegverzum_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [lang] = useState<'hu' | 'en'>(() =>
    (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'all')
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem(STORAGE_KEY, 'necessary')
    setVisible(false)
  }

  if (!visible) return null

  const hu = lang === 'hu'

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Cookie icon */}
            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-.34-.017-.676-.05-1.008A3.5 3.5 0 0118.5 8.5a3.5 3.5 0 01-1.992-3.508A10.03 10.03 0 0012 2zm-2 8a1 1 0 110-2 1 1 0 010 2zm3 6a1 1 0 110-2 1 1 0 010 2zm-5-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {hu ? 'Cookie (süti) tájékoztató' : 'Cookie Notice'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {hu
                  ? 'Weboldalunk sütiket (cookie-kat) használ a legjobb felhasználói élmény biztosítása érdekében. A szükséges sütik az oldal működéséhez elengedhetetlenek. A statisztikai és marketing sütik segítenek az oldal fejlesztésében és a személyre szabott tartalmak megjelenítésében. Az "Elfogadom" gombra kattintva hozzájárul az összes süti használatához.'
                  : 'Our website uses cookies to ensure the best user experience. Necessary cookies are essential for the site to function. Statistical and marketing cookies help improve the site and display personalized content. By clicking "Accept all" you consent to the use of all cookies.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={accept}
                  className="bg-gold hover:bg-gold-light text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors border-none cursor-pointer"
                >
                  {hu ? 'Elfogadom' : 'Accept all'}
                </button>
                <button
                  onClick={acceptNecessary}
                  className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors border-none cursor-pointer"
                >
                  {hu ? 'Csak a szükségesek' : 'Necessary only'}
                </button>
                <a
                  href="/adatvedelem"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
                >
                  {hu ? 'Adatvédelmi tájékoztató' : 'Privacy policy'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
