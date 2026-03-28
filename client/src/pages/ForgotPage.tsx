import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Header, MobileNav, Footer } from '../components/layout';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div id="body">
      <MobileNav />
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#f5f8fb' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 4px 16px rgba(0, 0, 0, .06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <i className="fa fa-lock" style={{ fontSize: 48, color: '#003580', display: 'block', marginBottom: 8 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#343a40' }}>Recuperar Contraseña</h2>
            <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
          </div>
          {sent ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: 16, textAlign: 'center', color: '#166534' }}>
              <i className="fa fa-check-circle" style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
              <p style={{ fontWeight: 600 }}>¡Email enviado!</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Revisa tu bandeja de entrada y sigue las instrucciones.</p>
              <Link to="/login" style={{ display: 'inline-block', marginTop: 12, color: '#003580', fontWeight: 600 }}>Volver al inicio de sesión</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input2" style={{ marginBottom: 16 }}>
                <span>Correo electrónico</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
              </div>
              <button type="submit" className="search-btn">
                <i className="fa fa-paper-plane" style={{ marginRight: 6 }} />Enviar enlace de recuperación
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
                <Link to="/login" style={{ color: '#003580' }}><i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Volver al inicio de sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
