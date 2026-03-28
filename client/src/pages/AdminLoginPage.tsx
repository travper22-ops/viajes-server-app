import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/seo/SEO'

export default function AdminLoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const res = await login({ email, password })
    if (!res.success) {
      setErr(res.error || 'Credenciales incorrectas')
      return
    }
    // Verificar que sea admin
    const user = res.user
    if (user?.role !== 'admin') {
      setErr('No tienes permisos de administrador')
      return
    }
    navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628', padding: 16 }}>
      <SEO title="Admin Login" noIndex={true} />

      <div style={{ background: '#fff', borderRadius: 10, padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

        {/* Logo / cabecera */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: '#003580', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <i className="fa fa-shield" style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#003580', margin: 0 }}>Panel de Administración</h1>
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Acceso restringido — solo administradores</p>
        </div>

        {err && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecdd3', borderRadius: 6, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa fa-exclamation-circle" />
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 5, fontWeight: 600 }}>
              Email de administrador
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tuagencia.com"
              required
              autoComplete="username"
              style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 6, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#003580'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: 20, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 5, fontWeight: 600 }}>
              Contraseña
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 6, padding: '10px 40px 10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#003580'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14 }}
            >
              <i className={`fa fa-eye${showPass ? '-slash' : ''}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#aaa' : '#003580', color: '#fff', border: 'none', borderRadius: 6, padding: '12px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {loading
              ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Verificando...</>
              : <><i className="fa fa-sign-in" style={{ marginRight: 6 }} />Entrar al Panel</>
            }
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <a href="/" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  )
}
