import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/search" replace />
  return <>{children}</>
}
