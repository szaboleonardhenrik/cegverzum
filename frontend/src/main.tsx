import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Restore dark mode from localStorage
if (localStorage.getItem('cegverzum_dark') === '1') {
  document.documentElement.classList.add('dark')
}

// Google Analytics 4 (optional — set VITE_GA4_MEASUREMENT_ID in .env)
const ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID
if (ga4Id) {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`
  document.head.appendChild(script)
  script.onload = () => {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(...args: any[]) { (window as any).dataLayer.push(args) }
    gtag('js', new Date())
    gtag('config', ga4Id)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
