import { Link } from 'react-router-dom';
import { Header, MobileNav, Footer } from '../components/layout';

export default function NotFoundPage() {
  return (
    <div id="body">
      <MobileNav /><Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', background: '#f5f8fb', textAlign: 'center' }}>
        <div>
          <i className="fa fa-exclamation-triangle" style={{ fontSize: 80, color: '#ee1d25', display: 'block', marginBottom: 20, opacity: 0.7 }} />
          <h1 style={{ fontSize: 80, fontWeight: 900, color: '#003580', fontFamily: 'Poppins,sans-serif', lineHeight: 1, marginBottom: 8 }}>404</h1>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#343a40', marginBottom: 12 }}>¡Página no encontrada!</h2>
          <p style={{ fontSize: 14, color: '#888', maxWidth: 400, margin: '0 auto 24px' }}>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
          <Link 
            to="/" 
            style={{ display: 'inline-block', background: '#003580', color: '#fff', padding: '10px 28px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'background .2s' }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.background = '#ee1d25'} 
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.background = '#003580'}
          >
            <i className="fa fa-home" style={{ marginRight: 6 }} />Volver al inicio
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
