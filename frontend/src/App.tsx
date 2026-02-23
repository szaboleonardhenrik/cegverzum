import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SearchPage } from './pages/SearchPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { AdminPage } from './pages/AdminPage'
import { ProfilePage } from './pages/ProfilePage'
import { CompanyCheckPage } from './pages/CompanyCheckPage'
import { WatchlistPage } from './pages/WatchlistPage'
import { MarketingPage } from './pages/MarketingPage'
import { ApiLandingPage } from './pages/ApiLandingPage'
import { ApiPage } from './pages/ApiPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { CookieBanner } from './components/CookieBanner'
import './App.css'

function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/' || location.pathname === '/cegellenorzo' || location.pathname === '/api'

  return (
    <div className="app-layout">
      {!isLanding && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cegellenorzo" element={<CompanyCheckPage />} />
          <Route path="/api" element={<ApiLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/company/:id" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
          <Route path="/api-connect" element={<ProtectedRoute><ApiPage /></ProtectedRoute>} />
          <Route path="/market-map" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
          <Route path="/financial-analysis" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
          <Route path="/risk-analysis" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isLanding && <Footer />}
      <CookieBanner />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
