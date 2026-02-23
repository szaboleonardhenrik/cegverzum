import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cegverzum_token')
    if (token) {
      authApi.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('cegverzum_token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password)
    localStorage.setItem('cegverzum_token', access_token)
    const me = await authApi.getMe()
    setUser(me)
  }

  const register = async (email: string, password: string) => {
    const { access_token } = await authApi.register(email, password)
    localStorage.setItem('cegverzum_token', access_token)
    const me = await authApi.getMe()
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('cegverzum_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
