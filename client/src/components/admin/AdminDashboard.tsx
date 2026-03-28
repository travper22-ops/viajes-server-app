// ============================================
// PANEL DE ADMINISTRACIÓN - DASHBOARD PRINCIPAL
// Gestión de reservas, usuarios, contenido y estadísticas
// ============================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { Button } from '../ui';
import { Badge } from '../ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { 
  AlertCircle, Database, TrendingUp, Clock, RefreshCw, 
  Users, BookOpen, DollarSign, Activity, Search, 
  CheckCircle, XCircle, Eye, Edit, Trash2, Filter
} from 'lucide-react';

// ============================================
// INTERFACES
// ============================================

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  cacheSize: string;
  lastCleanup: string;
}

interface CacheEntry {
  id: string;
  cache_key: string;
  cache_type: string;
  created_at: string;
  expires_at: string;
  access_count: number;
  is_valid: boolean;
}

interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  booking_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  currency: string;
  customer_name?: string;
  customer_email?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Stats {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminDashboard() {
  // States
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filtros
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper: fetch autenticado con token JWT
  const adminFetch = async (url: string, opts: RequestInit = {}) => {
    const token = localStorage.getItem('ta_token') || '';
    return fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
  };

  // Cargar datos
  useEffect(() => {
    loadCacheStats();
    loadCacheEntries();
    loadBookings();
    loadUsers();
    loadStats();
  }, []);

  // Cargar estadísticas del caché
  const loadCacheStats = async () => {
    try {
      const response = await adminFetch('/api/v1/admin/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas del caché:', error);
    }
  };

  // Cargar entradas del caché
  const loadCacheEntries = async () => {
    try {
      const response = await adminFetch('/api/v1/admin/cache/entries');
      if (response.ok) {
        const data = await response.json();
        setCacheEntries(data);
      }
    } catch (error) {
      console.error('Error cargando entradas del caché:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar reservas
  const loadBookings = async () => {
    try {
      const response = await adminFetch('/api/v1/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const response = await adminFetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await adminFetch('/api/v1/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Limpiar caché
  const clearCache = async (cacheType?: string) => {
    try {
      const url = cacheType
        ? `/api/v1/admin/cache/clear?type=${cacheType}`
        : '/api/v1/admin/cache/clear';
      const response = await adminFetch(url, { method: 'POST' });
      if (response.ok) {
        await loadCacheStats();
        await loadCacheEntries();
        alert('Caché limpiado exitosamente');
      }
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  };

  // Actualizar estado de reserva
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await adminFetch(`/api/v1/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await loadBookings();
        await loadStats();
      }
    } catch (error) {
      console.error('Error actualizando reserva:', error);
    }
  };

  // Alternar estado de usuario
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await adminFetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (response.ok) await loadUsers();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  // Formatear moneda
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Filtrar reservas
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = bookingFilter === 'all' || booking.status === bookingFilter;
    const matchesSearch = searchTerm === '' || 
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Estado de reserva badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'destructive' | 'success'> = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'destructive',
      completed: 'default',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestión completa de la agencia de viajes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="cache">Caché</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        {/* ==================== PESTAÑA DE RESUMEN ==================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Reservas Totales</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-100" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalBookings || bookings.length}</div>
                <p className="text-xs text-blue-100">reservas en el sistema</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-100" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-green-100">revenue total</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Usuarios</CardTitle>
                <Users className="h-4 w-4 text-purple-100" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || users.length}</div>
                <p className="text-xs text-purple-100">usuarios registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-orange-100" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.pendingBookings || 0}</div>
                <p className="text-xs text-orange-100">reservas por confirmar</p>
              </CardContent>
            </Card>
          </div>

          {/* Estado de reservas */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pendingBookings || bookings.filter(b => b.status === 'pending').length}</div>
                  <div className="text-sm text-yellow-700">Pendientes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats?.confirmedBookings || bookings.filter(b => b.status === 'confirmed').length}</div>
                  <div className="text-sm text-green-700">Confirmadas</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats?.cancelledBookings || bookings.filter(b => b.status === 'cancelled').length}</div>
                  <div className="text-sm text-red-700">Canceladas</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'completed').length}</div>
                  <div className="text-sm text-blue-700">Completadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Últimas reservas */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Referencia</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Monto</th>
                      <th className="text-left p-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{booking.booking_reference}</td>
                        <td className="p-2 capitalize">{booking.booking_type}</td>
                        <td className="p-2">{getStatusBadge(booking.status)}</td>
                        <td className="p-2">{formatCurrency(booking.total_amount, booking.currency)}</td>
                        <td className="p-2">{formatDate(booking.created_at)}</td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500">
                          No hay reservas todavía
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => { setActiveTab('bookings'); loadBookings(); }} variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ver Todas las Reservas
                </Button>
                <Button onClick={() => { setActiveTab('users'); loadUsers(); }} variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
                <Button onClick={() => clearCache()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpiar Caché
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PESTAÑA DE RESERVAS ==================== */}
        <TabsContent value="bookings" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por referencia o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="completed">Completadas</option>
                </select>
                <Button onClick={() => loadBookings()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de reservas */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Referencia</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-left p-3">Cliente</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Monto</th>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{booking.booking_reference}</td>
                        <td className="p-3 capitalize">
                          <Badge variant="outline">{booking.booking_type}</Badge>
                        </td>
                        <td className="p-3">{booking.customer_name || booking.customer_email || 'N/A'}</td>
                        <td className="p-3">{getStatusBadge(booking.status)}</td>
                        <td className="p-3 font-medium">{formatCurrency(booking.total_amount, booking.currency)}</td>
                        <td className="p-3 text-gray-500">{formatDate(booking.created_at)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-gray-500">
                          No se encontraron reservas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PESTAÑA DE USUARIOS ==================== */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Rol</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Registro</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.first_name} {user.last_name}</td>
                        <td className="p-3">
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.is_active ? 'success' : 'destructive'}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-500">{formatDate(user.created_at)}</td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            className={user.is_active ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-500">
                          No hay usuarios todavía
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PESTAÑA DE CACHÉ ==================== */}
        <TabsContent value="cache" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Caché</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{cacheStats?.totalEntries || 0}</div>
                  <div className="text-sm text-blue-700">Entradas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{cacheStats?.hitRate || 0}%</div>
                  <div className="text-sm text-green-700">Hit Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{cacheStats?.cacheSize || '0 MB'}</div>
                  <div className="text-sm text-purple-700">Tamaño</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{cacheStats?.totalHits || 0}</div>
                  <div className="text-sm text-orange-700">Hits Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones de Caché</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => clearCache()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpiar Todo
                </Button>
                <Button onClick={() => clearCache('flights')} variant="outline">
                  Limpiar Vuelos
                </Button>
                <Button onClick={() => clearCache('hotels')} variant="outline">
                  Limpiar Hoteles
                </Button>
                <Button onClick={() => clearCache('locations')} variant="outline">
                  Limpiar Ubicaciones
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entradas del Caché</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Clave</th>
                      <th className="text-left p-2">Accesos</th>
                      <th className="text-left p-2">Creado</th>
                      <th className="text-left p-2">Expira</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cacheEntries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="p-2">
                          <Badge variant="outline">{entry.cache_type}</Badge>
                        </td>
                        <td className="p-2 font-mono text-xs">{entry.cache_key.substring(0, 20)}...</td>
                        <td className="p-2">{entry.access_count}</td>
                        <td className="p-2">{formatDate(entry.created_at)}</td>
                        <td className="p-2">{formatDate(entry.expires_at)}</td>
                        <td className="p-2">
                          <Badge variant={entry.is_valid ? 'default' : 'destructive'}>
                            {entry.is_valid ? 'Válido' : 'Expirado'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PESTAÑA DE AJUSTES ==================== */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración Avanzada</h3>
                <p className="text-gray-500">
                  La configuración del sistema estará disponible en futuras actualizaciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
