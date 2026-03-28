import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  // No logueado → redirige al login de admin
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  // Logueado pero no es admin → acceso denegado
  if (user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f8fb', padding: 24 }}>
        <i className="fa fa-lock" style={{ fontSize: 56, color: '#ee1d25', marginBottom: 16 }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#003580', marginBottom: 8 }}>Acceso Denegado</h1>
        <p style={{ color: '#888', marginBottom: 24, textAlign: 'center' }}>
          No tienes permisos para acceder al panel de administración.
        </p>
        <a href="/" style={{ background: '#003580', color: '#fff', padding: '10px 24px', borderRadius: 4, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          Volver al inicio
        </a>
      </div>
    )
  }

  return <>{children}</>
}
