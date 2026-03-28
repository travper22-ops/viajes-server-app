import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MobileNav, Footer } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import Turnstile from '../components/ui/Turnstile';
import SEO from '../components/seo/SEO';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [err, setErr] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!captcha) {
      setErr('Por favor completa el captcha');
      return;
    }
    const res = await login({ email, password });
    if (res.success) navigate('/');
    else setErr(res.error || 'Error al iniciar sesión');
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';
      window.location.href = `${apiUrl}/auth/google`;
    } catch (error) {
      console.error('Error iniciando login con Google:', error);
      setErr('Error al iniciar sesión con Google');
      setSocialLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';
      window.location.href = `${apiUrl}/auth/facebook`;
    } catch (error) {
      console.error('Error iniciando login con Facebook:', error);
      setErr('Error al iniciar sesión con Facebook');
      setSocialLoading(false);
    }
  };

  return (
    <div id="body">
      <SEO title="Iniciar Sesión" noIndex={true} />
      <MobileNav />
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 12px', background: '#f5f8fb' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 'clamp(16px, 4vw, 32px)', width: '100%', maxWidth: 400, boxShadow: '0 4px 16px rgba(0, 0, 0, .06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <i className="fa fa-user-circle" style={{ fontSize: 'clamp(32px, 8vw, 48px)', color: '#003580', display: 'block', marginBottom: 8 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#343a40' }}>Iniciar Sesión</h2>
          </div>
          {err && <div style={{ background: '#fff5f5', border: '1px solid #fecdd3', borderRadius: 4, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />{err}
          </div>}
          <form onSubmit={handleSubmit}>
            <div className="input2" style={{ marginBottom: 12 }}>
              <span>Correo electrónico</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div className="input2" style={{ marginBottom: 12, position: 'relative' }}>
              <span>Contraseña</span>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 10, bottom: 9, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14 }}>
                <i className={`fa fa-eye${showPass ? '-slash' : ''}`} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#003580' }} /> Recordarme
              </label>
              <Link to="/forgot" style={{ color: '#003580', fontSize: 13 }}>¿Olvidaste tu contraseña?</Link>
            </div>
            <Turnstile onVerify={setCaptcha} onError={() => setCaptcha('')} />
            <button type="submit" className="search-btn" disabled={loading || socialLoading} style={{ marginTop: 12, opacity: loading || socialLoading ? 0.6 : 1 }}>
              {loading ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Entrando...</> : <><i className="fa fa-sign-in" style={{ marginRight: 6 }} />Iniciar Sesión</>}
            </button>
          </form>
          <div style={{ borderTop: '1px solid #e5e5e5', margin: '20px 0', textAlign: 'center', paddingTop: 16, fontSize: 13 }}>
            ¿No tienes cuenta? <Link to="/signup" style={{ color: '#003580', fontWeight: 700 }}>Crear cuenta gratis</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
            <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>o continúa con</span>
            <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading}
              style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 4, padding: '7px 10px', background: '#fff', cursor: socialLoading ? 'not-allowed' : 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: socialLoading ? 0.6 : 1, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { if (!socialLoading) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              <img src="/img/google-logo.svg" alt="Google" style={{ width: 16, height: 16, flexShrink: 0, display: 'block' }} />
              Google
            </button>
            <button 
              type="button"
              onClick={handleFacebookLogin}
              disabled={socialLoading}
              style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 4, padding: '7px 10px', background: '#fff', cursor: socialLoading ? 'not-allowed' : 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: socialLoading ? 0.6 : 1, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { if (!socialLoading) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              <img src="/img/facebook-logo.svg" alt="Facebook" style={{ width: 16, height: 16, flexShrink: 0, display: 'block' }} />
              Facebook
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
