// ============================================
// RUTAS DE ADMINISTRACIÓN
// Endpoints para gestión del sistema y caché
// ============================================

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getCacheStats,
  getCacheEntries,
  clearCache,
  getCacheMetrics,
  getContentList,
  updateContent
} from '../controllers/adminController.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { exportToCSV, exportToExcelHTML, EXPORT_COLUMNS } from '../utils/export.js';

const router = Router();

// Todas las rutas de admin requieren autenticación + rol admin
router.use(requireAuth);
router.use(requireAdmin);

// ============================================
// RUTAS DEL CACHÉ
// ============================================

/**
 * GET /api/v1/admin/cache/stats
 * Obtener estadísticas generales del caché
 */
router.get('/cache/stats', getCacheStats);

/**
 * GET /api/v1/admin/cache/entries
 * Obtener entradas del caché para inspección
 * Query params: type (opcional), limit (opcional, default 50)
 */
router.get('/cache/entries', getCacheEntries);

/**
 * POST /api/v1/admin/cache/clear
 * Limpiar caché por tipo o completamente
 * Query params: type (opcional - flights, hotels, locations, etc.)
 */
router.post('/cache/clear', clearCache);

/**
 * GET /api/v1/admin/cache/metrics
 * Obtener métricas de rendimiento del caché
 */
router.get('/cache/metrics', getCacheMetrics);

// ============================================
// RUTAS DE CONTENIDO
// ============================================

/**
 * GET /api/v1/admin/content
 * Obtener lista de contenido estático
 * Query params: type (opcional)
 */
router.get('/content', getContentList);

/**
 * PUT /api/v1/admin/content/:id
 * Actualizar contenido
 */
router.put('/content/:id', updateContent);

// ============================================
// DASHBOARD LEGACY (para compatibilidad)
// ============================================

// Estadísticas generales (legacy)
router.get('/stats', async (req, res) => {
  try {
    const supabase = (await import('../config/supabase.js')).getSupabaseAdmin();

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Obtener conteos de tablas
    const [usersCount, bookingsCount, paymentsCount] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true })
    ]);

    res.json({
      success: true,
      data: {
        users: usersCount.count || 0,
        bookings: bookingsCount.count || 0,
        payments: paymentsCount.count || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: { code: 'STATS_ERROR', message: 'Error obteniendo estadísticas' }
    });
  }
});

// ============================================
// RUTAS DE RESERVAS
// ============================================

/**
 * GET /api/v1/admin/bookings
 * Obtener lista de reservas con filtros
 */
router.get('/bookings', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { status, search, limit = 50, offset = 0 } = req.query;

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`booking_reference.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({
      success: false,
      error: { code: 'BOOKINGS_ERROR', message: 'Error obteniendo reservas' }
    });
  }
});

/**
 * PATCH /api/v1/admin/bookings/:id
 * Actualizar estado de una reserva
 */
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, admin_comment } = req.body;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (admin_comment !== undefined) updateData.admin_comment = admin_comment;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: 'Error actualizando reserva' }
    });
  }
});

// ============================================
// RUTAS DE USUARIOS
// ============================================

/**
 * GET /api/v1/admin/users
 * Obtener lista de usuarios
 */
router.get('/users', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { role, is_active, limit = 50, offset = 0 } = req.query;

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (role) {
      query = query.eq('role', role);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: { code: 'USERS_ERROR', message: 'Error obteniendo usuarios' }
    });
  }
});

/**
 * PATCH /api/v1/admin/users/:id
 * Actualizar usuario (activar/desactivar, cambiar rol)
 */
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role, first_name, last_name, phone } = req.body;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const updateData: Record<string, unknown> = {};

    if (is_active !== undefined) updateData.is_active = is_active;
    if (role) updateData.role = role;
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: 'Error actualizando usuario' }
    });
  }
});

// ============================================
// ESTADÍSTICAS MEJORADAS
// ============================================

/**
 * GET /api/v1/admin/stats
 * Obtener estadísticas completas del dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Obtener conteos y estadísticas
    const [
      usersResult,
      bookingsResult,
      paymentsResult,
      pendingBookings,
      confirmedBookings,
      cancelledBookings
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('payment_status', 'completed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled')
    ]);

    // Calcular ingresos totales
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        totalBookings: bookingsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
        pendingBookings: pendingBookings.count || 0,
        confirmedBookings: confirmedBookings.count || 0,
        cancelledBookings: cancelledBookings.count || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: { code: 'STATS_ERROR', message: 'Error obteniendo estadísticas' }
    });
  }
});

// ============================================
// RUTAS DE EXPORTACIÓN
// ============================================

/**
 * GET /api/v1/admin/export/bookings
 * Exportar reservas a CSV o Excel
 */
router.get('/export/bookings', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { format = 'csv' } = req.query;

    if (!supabase) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'Base de datos no configurada' } });
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const bookings = (data || []).map(b => ({
      ...b,
      created_at: new Date(b.created_at).toLocaleString('es-ES'),
      updated_at: new Date(b.updated_at).toLocaleString('es-ES')
    }));

    if (format === 'excel') {
      exportToExcelHTML(res, bookings, 'reservas', 'Reservas', EXPORT_COLUMNS.bookings);
    } else {
      exportToCSV(res, bookings, 'reservas', EXPORT_COLUMNS.bookings);
    }
  } catch (error) {
    console.error('Error exportando reservas:', error);
    res.status(500).json({ success: false, error: { code: 'EXPORT_ERROR', message: 'Error exportando reservas' } });
  }
});

/**
 * GET /api/v1/admin/export/users
 * Exportar usuarios a CSV o Excel
 */
router.get('/export/users', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { format = 'csv' } = req.query;

    if (!supabase) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'Base de datos no configurada' } });
      return;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = (data || []).map(u => ({
      ...u,
      is_active: u.is_active ? 'Sí' : 'No',
      created_at: new Date(u.created_at).toLocaleString('es-ES')
    }));

    if (format === 'excel') {
      exportToExcelHTML(res, users, 'usuarios', 'Usuarios', EXPORT_COLUMNS.users);
    } else {
      exportToCSV(res, users, 'usuarios', EXPORT_COLUMNS.users);
    }
  } catch (error) {
    console.error('Error exportando usuarios:', error);
    res.status(500).json({ success: false, error: { code: 'EXPORT_ERROR', message: 'Error exportando usuarios' } });
  }
});

/**
 * GET /api/v1/admin/export/payments
 * Exportar pagos a CSV o Excel
 */
router.get('/export/payments', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { format = 'csv' } = req.query;

    if (!supabase) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'Base de datos no configurada' } });
      return;
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const payments = (data || []).map(p => ({
      ...p,
      created_at: new Date(p.created_at).toLocaleString('es-ES')
    }));

    if (format === 'excel') {
      exportToExcelHTML(res, payments, 'pagos', 'Pagos', EXPORT_COLUMNS.payments);
    } else {
      exportToCSV(res, payments, 'pagos', EXPORT_COLUMNS.payments);
    }
  } catch (error) {
    console.error('Error exportando pagos:', error);
    res.status(500).json({ success: false, error: { code: 'EXPORT_ERROR', message: 'Error exportando pagos' } });
  }
});

export default router;
