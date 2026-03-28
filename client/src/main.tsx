/**
 * main.tsx — Entry point de la aplicación React
 * 
 * Este archivo es CRÍTICO para que la aplicación funcione.
 * El index.html hace referencia a este archivo.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import './index.css'

// Pre-cargar Stripe.js al arrancar la app para que el modal no tarde
if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
  const s = document.createElement('script')
  s.src = 'https://js.stripe.com/v3/'
  s.async = true
  document.head.appendChild(s)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
