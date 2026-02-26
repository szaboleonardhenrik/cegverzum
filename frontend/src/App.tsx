import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { CookieBanner } from './components/CookieBanner'
import { ChatBubble } from './components/ChatBubble'
import './App.css'

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })))
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage').then(m => ({ default: m.CompanyDetailPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const CompanyCheckPage = lazy(() => import('./pages/CompanyCheckPage').then(m => ({ default: m.CompanyCheckPage })))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })))
const MarketingPage = lazy(() => import('./pages/MarketingPage').then(m => ({ default: m.MarketingPage })))
const ApiLandingPage = lazy(() => import('./pages/ApiLandingPage').then(m => ({ default: m.ApiLandingPage })))
const ApiPage = lazy(() => import('./pages/ApiPage').then(m => ({ default: m.ApiPage })))
const FinancialAnalysisPage = lazy(() => import('./pages/FinancialAnalysisPage').then(m => ({ default: m.FinancialAnalysisPage })))
const RiskAnalysisPage = lazy(() => import('./pages/RiskAnalysisPage').then(m => ({ default: m.RiskAnalysisPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const PackagesPage = lazy(() => import('./pages/PackagesPage').then(m => ({ default: m.PackagesPage })))
const NetworkPage = lazy(() => import('./pages/NetworkPage').then(m => ({ default: m.NetworkPage })))

function PageLoader() {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/' || location.pathname === '/cegellenorzo' || location.pathname === '/api'

  return (
    <div className="app-layout">
      {!isLanding && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cegellenorzo" element={<CompanyCheckPage />} />
            <Route path="/api" element={<ApiLandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
            <Route path="/api-connect" element={<ProtectedRoute><ApiPage /></ProtectedRoute>} />
            <Route path="/market-map" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
            <Route path="/financial-analysis" element={<ProtectedRoute><FinancialAnalysisPage /></ProtectedRoute>} />
            <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysisPage /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      {!isLanding && <Footer />}
      <CookieBanner />
      <ChatBubble />
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
