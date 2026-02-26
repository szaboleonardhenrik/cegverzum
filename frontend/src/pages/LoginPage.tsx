import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const t = {
  hu: {
    brandName: 'Cégverzum',
    brandDescription:
      'Magyarország legátfogóbb céginformációs rendszere. Valós idejű adatok, elemzések és üzleti intelligencia egy helyen.',
    statCompanies: 'Cég',
    statData: 'Adatok',
    statAvailable: 'Elérhető',
    title: 'Belépés',
    subtitle: 'Jelentkezzen be fiókjába a folytatáshoz.',
    emailLabel: 'Email',
    emailPlaceholder: 'pelda@email.hu',
    passwordLabel: 'Jelszó',
    submitLoading: 'Bejelentkezés...',
    submitDefault: 'Belépés',
    noAccount: 'Még nincs fiókja?',
    register: 'Regisztráció',
    genericError: 'Hiba történt',
  },
  en: {
    brandName: 'Cégverzum',
    brandDescription:
      'Hungary\'s most comprehensive company information system. Real-time data, analytics and business intelligence in one place.',
    statCompanies: 'Companies',
    statData: 'Data',
    statAvailable: 'Available',
    title: 'Sign In',
    subtitle: 'Sign in to your account to continue.',
    emailLabel: 'Email',
    emailPlaceholder: 'example@email.com',
    passwordLabel: 'Password',
    submitLoading: 'Signing in...',
    submitDefault: 'Sign In',
    noAccount: 'Don\'t have an account?',
    register: 'Register',
    genericError: 'An error occurred',
  },
}

export function LoginPage() {
  const lang = (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  const s = t[lang]

  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : s.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side — branded gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy via-navy-light to-teal relative overflow-hidden items-center justify-center animate-fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-light rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{s.brandName}</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            {s.brandDescription}
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-white/50 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white/80">500K+</p>
              <p>{s.statCompanies}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white/80">NAV</p>
              <p>{s.statData}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white/80">24/7</p>
              <p>{s.statAvailable}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-bold text-navy dark:text-white">{s.brandName}</h2>
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">{s.title}</h1>
          <p className="text-sm text-gray-500 mb-6">{s.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                placeholder={s.emailPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{s.passwordLabel}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors border-none cursor-pointer btn-press"
            >
              {loading ? s.submitLoading : s.submitDefault}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {s.noAccount}{' '}
            <Link to="/register" className="text-teal hover:text-teal-dark font-medium">
              {s.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
