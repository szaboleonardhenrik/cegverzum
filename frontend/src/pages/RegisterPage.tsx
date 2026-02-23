import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score: 1, label: 'Gyenge', color: 'bg-red-500' }
  if (score <= 2) return { score: 2, label: 'Közepes', color: 'bg-yellow-500' }
  if (score <= 3) return { score: 3, label: 'Jó', color: 'bg-blue-500' }
  return { score: 4, label: 'Erős', color: 'bg-green-500' }
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => password ? getPasswordStrength(password) : null, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek')
      return
    }
    if (password.length < 8) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/search')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
    } finally {
      setLoading(false)
    }
  }

  const EyeButton = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
      tabIndex={-1}
    >
      {show ? (
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
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side — branded gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-dark via-navy to-navy-dark relative overflow-hidden items-center justify-center animate-fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-20 w-80 h-80 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-light rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Csatlakozzon!</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Regisztráljon partnereink közé és férjen hozzá Magyarország legteljesebb céginformációs adatbázisához.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-white/50 text-xs">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-6 h-6 text-gold mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p>Biztonságos</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-6 h-6 text-gold mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p>Gyors</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-6 h-6 text-gold mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Analitika</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <h2 className="text-2xl font-bold text-navy dark:text-white">Cégverzum</h2>
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">Regisztráció</h1>
          <p className="text-sm text-gray-500 mb-6">
            Az email címet az adminisztrátornak előbb meg kell adnia a rendszerben.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teljes név</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                placeholder="Példa János"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                placeholder="pelda@email.hu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jelszó</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                />
                <EyeButton show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {/* Password strength indicator */}
              {password && strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-600'}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strength.score <= 1 ? 'text-red-500' : strength.score <= 2 ? 'text-yellow-600' : strength.score <= 3 ? 'text-blue-500' : 'text-green-500'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jelszó megerősítése</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800"
                />
                <EyeButton show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">A jelszavak nem egyeznek</p>
              )}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors border-none cursor-pointer btn-press"
            >
              {loading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Már van fiókja?{' '}
            <Link to="/login" className="text-teal hover:text-teal-dark font-medium">
              Belépés
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
