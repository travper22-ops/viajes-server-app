// ============================================
// RUTAS DE RESERVAS
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserBookings,
  getBookingById,
  getBookingByReference,
  createBooking,
  cancelBooking,
  updatePaymentStatus
} from '../controllers/bookings.js';
import { getFlightOrder, cancelFlightOrder } from '../services/amadeus.js';

const router = Router();

// ============================================
// VALIDACIÓN
// ============================================

function validateBookingCreate(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as any;
  const { passengers, items, selected_offer, contact } = body;

  // Validar que al menos haya algún tipo de datos de reserva
  if ((!items || items.length === 0) && !selected_offer) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_ITEMS',
        message: 'Se requiere al menos una oferta seleccionada o items'
      }
    });
    return;
  }

  // Validar contacto (email requerido para comunicación)
  if (!contact || !contact.email) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CONTACT',
        message: 'Se requiere email de contacto'
      }
    });
    return;
  }

  // Nota: No validamos firstName/lastName aquí porque el controller
  // puede completarlos automáticamente desde el contact
  // Si items viene con estructura completa, validaremos ahí

  next();
}

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Obtener reserva por referencia (pública - para tracking)
router.get('/reference/:reference', getBookingByReference);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Obtener reservas del usuario
router.get('/user/:userId', requireAuth, getUserBookings);

// Obtener reserva por ID
router.get('/:bookingId', requireAuth, getBookingById);

// Crear reserva
router.post('/', validateBookingCreate, createBooking);

// Cancelar reserva
router.put('/:bookingId/cancel', requireAuth, cancelBooking);

// Actualizar estado de pago
router.put('/:bookingId/payment', requireAuth, updatePaymentStatus);

// ============================================
// RUTAS DE AMADEUS FLIGHT ORDERS
// ============================================

// GET /api/bookings/amadeus/:orderId - Obtener orden de vuelo de Amadeus
router.get('/amadeus/:orderId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_ORDER_ID', message: 'Se requiere el ID de la orden' }
      });
      return;
    }

    const result = await getFlightOrder(orderId);
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error obteniendo orden de vuelo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// DELETE /api/bookings/amadeus/:orderId - Cancelar orden de vuelo de Amadeus
router.delete('/amadeus/:orderId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_ORDER_ID', message: 'Se requiere el ID de la orden' }
      });
      return;
    }

    const result = await cancelFlightOrder(orderId);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: 'CANCEL_ERROR', message: result.error }
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error cancelando orden de vuelo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

export default router;
