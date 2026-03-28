// Travel Agency - Deploy v2 - Connected to Render Backend
import { lazy, Suspense, Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import AdminGuard from './components/auth/AdminGuard';

// Carga inmediata — páginas críticas (above the fold)
import HomePage    from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Carga diferida — el resto de páginas
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const SignupPage         = lazy(() => import('./pages/SignupPage'));
const ForgotPage         = lazy(() => import('./pages/ForgotPage'));
const ComingSoonPage     = lazy(() => import('./pages/ComingSoonPage'));
const MaintenancePage    = lazy(() => import('./pages/MaintenancePage'));
const FlightPage         = lazy(() => import('./pages/FlightPage'));
const FlightCheckoutPage = lazy(() => import('./pages/FlightCheckoutPage'));
const HotelPage          = lazy(() => import('./pages/HotelPage'));
const HotelDetailPage    = lazy(() => import('./pages/HotelDetailPage'));
const HotelCheckoutPage  = lazy(() => import('./pages/HotelCheckoutPage'));
const HolidaysPage       = lazy(() => import('./pages/HolidaysPage'));
const HolidayDetailPage  = lazy(() => import('./pages/HolidayDetailPage'));
const AboutPage          = lazy(() => import('./pages/AboutPage'));
const BlogPage           = lazy(() => import('./pages/BlogPage'));
const BlogDetailsPage    = lazy(() => import('./pages/BlogDetailsPage'));
const BusPage            = lazy(() => import('./pages/BusPage'));
const BusCheckoutPage    = lazy(() => import('./pages/BusCheckoutPage'));
const CabPage            = lazy(() => import('./pages/CabPage'));
const CabCheckoutPage    = lazy(() => import('./pages/CabCheckoutPage'));
const CareersPage        = lazy(() => import('./pages/CareersPage'));
const CareersSinglePage  = lazy(() => import('./pages/CareersSinglePage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const CalendarDemoPage   = lazy(() => import('./pages/CalendarDemoPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const MyBookingsPage     = lazy(() => import('./pages/MyBookingsPage'));
const DestinationsPage   = lazy(() => import('./pages/DestinationsPage'));
const AdminPage          = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage     = lazy(() => import('./pages/AdminLoginPage'));

// Spinner mínimo mientras carga la página
function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}

// Error boundary global — captura errores de render en cualquier página
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <i className="fa fa-exclamation-triangle" style={{ fontSize: 48, color: '#ee1d25', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#003580', marginBottom: 8 }}>Algo salió mal</h2>
          <p style={{ color: '#888', marginBottom: 20 }}>Ocurrió un error inesperado. Por favor recarga la página.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            style={{ background: '#003580', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App(): ReactNode {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/mantenimiento" element={<MaintenancePage />} />

        {/* Vuelos */}
        <Route path="/vuelos" element={<FlightPage />} />
        <Route path="/vuelos/checkout" element={<FlightCheckoutPage />} />

        {/* Hoteles */}
        <Route path="/hoteles" element={<HotelPage />} />
        <Route path="/hoteles/:id" element={<HotelDetailPage />} />
        <Route path="/hoteles/:id/checkout" element={<HotelCheckoutPage />} />

        {/* Paquetes */}
        <Route path="/vacaciones" element={<HolidaysPage />} />
        <Route path="/vacaciones/:id" element={<HolidayDetailPage />} />

        {/* Institucional */}
        <Route path="/sobre-nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* Blog */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailsPage />} />

        {/* Destinos */}
        <Route path="/destinos" element={<DestinationsPage />} />

        {/* Autobús */}
        <Route path="/autobuses" element={<BusPage />} />
        <Route path="/autobuses/checkout" element={<BusCheckoutPage />} />

        {/* Traslados */}
        <Route path="/traslados" element={<CabPage />} />
        <Route path="/traslados/checkout" element={<CabCheckoutPage />} />

        {/* Empleo */}
        <Route path="/empleo" element={<CareersPage />} />
        <Route path="/empleo/:id" element={<CareersSinglePage />} />

        {/* Demo */}
        <Route path="/calendario-demo" element={<CalendarDemoPage />} />

        {/* Usuario autenticado */}
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/mis-reservas" element={<MyBookingsPage />} />

        {/* Admin — ruta protegida, solo role=admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        } />
        <Route path="/admin/*" element={
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </AppErrorBoundary>
  );
}
