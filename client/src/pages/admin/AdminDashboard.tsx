import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface Booking {
  id: string;
  confirmation_code: string;
  booking_type: string;
  status: string;
  total_price: number;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface DashboardData {
  stats?: DashboardStats;
  recentBookings?: Booking[];
  bookingsByStatus?: Record<string, number>;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} bg-opacity-10`}>
          <i className={`fa ${icon} text-2xl`} style={{ color: color.replace('text-', '') }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('sb-access-token');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Error cargando dashboard');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-center">
          <i className="fa fa-circle-o-notch fa-spin text-4xl text-primary" />
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <i className="fa fa-exclamation-circle mr-2" />
          {error}
        </div>
        <div className="mt-4 text-center text-gray-500">
          <p>El panel de administración requiere:</p>
          <ul className="mt-2 text-sm">
            <li>• Estar autenticado como administrador</li>
            <li>• Tener credenciales de Supabase configuradas</li>
          </ul>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-white/70">Gestiona usuarios, reservas y contenido</p>
            </div>
            <Link to="/" className="text-white/80 hover:text-white">
              <i className="fa fa-home mr-2" />Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Usuarios" 
            value={stats?.stats?.totalUsers || 0} 
            icon="fa-users" 
            color="text-blue-600" 
          />
          <StatCard 
            title="Total Reservas" 
            value={stats?.stats?.totalBookings || 0} 
            icon="fa-ticket" 
            color="text-green-600" 
          />
          <StatCard 
            title="Ingresos Totales" 
            value={formatCurrency(stats?.stats?.totalRevenue)} 
            icon="fa-euro" 
            color="text-yellow-600" 
          />
          <StatCard 
            title="Ingresos del Mes" 
            value={formatCurrency(stats?.stats?.monthlyRevenue)} 
            icon="fa-chart-line" 
            color="text-purple-600" 
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/usuarios" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i className="fa fa-users text-xl text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestionar Usuarios</h3>
                <p className="text-sm text-gray-500">Ver, editar y eliminar usuarios</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/reservas" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <i className="fa fa-ticket text-xl text-green-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestionar Reservas</h3>
                <p className="text-sm text-gray-500">Ver y modificar reservas</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/hoteles" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <i className="fa fa-building text-xl text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestionar Hoteles</h3>
                <p className="text-sm text-gray-500">Administrar hoteles y habitaciones</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CMS Section */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Contenido (CMS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/admin/destinos" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                <i className="fa fa-map-marker text-xl text-yellow-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestionar Destinos</h3>
                <p className="text-sm text-gray-500">Administrar destinos turísticos</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/blog" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <i className="fa fa-newspaper-o text-xl text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestionar Blog</h3>
                <p className="text-sm text-gray-500">Crear y editar artículos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Reservas Recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{booking.confirmation_code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.profiles?.first_name} {booking.profiles?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{booking.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize">{booking.booking_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(booking.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <i className="fa fa-inbox text-3xl mb-2 block" />
                      No hay reservas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.bookingsByStatus || {}).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 capitalize">{status}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
