import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MobileNav, Footer } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import Turnstile from '../components/ui/Turnstile';
import SEO from '../components/seo/SEO';

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function SignupPage() {
  const { signup: register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({ name: '', email: '', phone: '', password: '' });
  const [captcha, setCaptcha] = useState('');
  const [err, setErr] = useState('');
  const upd = (k: keyof SignupForm) => (e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!captcha) {
      setErr('Por favor completa el captcha');
      return;
    }
    const res = await register(form);
    if (res.success) navigate('/');
    else setErr(res.error || 'Error al crear cuenta');
  };

  const formFields = [
    { k: 'name', label: 'Nombre completo', type: 'text', ph: 'Tu nombre' },
    { k: 'email', label: 'Correo electrónico', type: 'email', ph: 'tu@email.com' },
    { k: 'phone', label: 'Teléfono', type: 'tel', ph: '+34 600 000 000' },
    { k: 'password', label: 'Contraseña', type: 'password', ph: 'Mínimo 8 caracteres' },
  ] as const;

  return (
    <div id="body">
      <SEO title="Crear Cuenta" noIndex={true} />
      <MobileNav />
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#f5f8fb' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 4px 16px rgba(0, 0, 0, .06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <i className="fa fa-user-plus" style={{ fontSize: 48, color: '#003580', display: 'block', marginBottom: 8 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#343a40' }}>Crear Cuenta</h2>
          </div>
          {err && <div style={{ background: '#fff5f5', border: '1px solid #fecdd3', borderRadius: 4, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />{err}
          </div>}
          <form onSubmit={handleSubmit}>
            {formFields.map(f => (
              <div key={f.k} className="input2" style={{ marginBottom: 12 }}>
                <span>{f.label}</span>
                <input type={f.type} value={form[f.k]} onChange={upd(f.k)} placeholder={f.ph} required />
              </div>
            ))}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#666', marginBottom: 16, cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" required style={{ marginTop: 2, accentColor: '#003580' }} />
              Acepto los <Link to="/coming-soon" style={{ color: '#003580' }}>Términos y Condiciones</Link> y la{' '}
              <Link to="/coming-soon" style={{ color: '#003580' }}>Política de Privacidad</Link>
            </label>
            <Turnstile onVerify={setCaptcha} onError={() => setCaptcha('')} />
            <button type="submit" className="search-btn" disabled={loading} style={{ marginTop: 12, opacity: loading ? 0.6 : 1 }}>
              {loading ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Creando cuenta...</> : <><i className="fa fa-user-plus" style={{ marginRight: 6 }} />Crear Cuenta</>}
            </button>
          </form>
          <div style={{ borderTop: '1px solid #e5e5e5', margin: '20px 0', textAlign: 'center', paddingTop: 16, fontSize: 13 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#003580', fontWeight: 700 }}>Iniciar sesión</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
