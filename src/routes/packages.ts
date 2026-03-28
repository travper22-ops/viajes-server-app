// ============================================
// RUTAS DE PAQUETES TURÍSTICOS
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { searchPackages, createPackageBooking } from '../services/amadeus-package.js';

const router = Router();

// ============================================
// VALIDACIÓN
// ============================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(date: string): boolean {
  if (!date || typeof date !== 'string') return false;
  if (!DATE_REGEX.test(date)) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function validatePackageSearch(req: Request, res: Response, next: NextFunction): void {
  const { origin, destination, departureDate, returnDate, checkIn, checkOut } = req.query;

  if (!origin || !destination) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Parámetros requeridos: origin, destination'
      }
    });
    return;
  }

  if (!departureDate || !returnDate) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Fechas de vuelo requeridas: departureDate, returnDate'
      }
    });
    return;
  }

  if (!checkIn || !checkOut) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Fechas de hotel requeridas: checkIn, checkOut'
      }
    });
    return;
  }

  if (!validateDate(departureDate as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Fecha de salida inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  if (!validateDate(returnDate as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Fecha de regreso inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  if (!validateDate(checkIn as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Fecha de entrada al hotel inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  if (!validateDate(checkOut as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Fecha de salida del hotel inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  next();
}

function validateBooking(req: Request, res: Response, next: NextFunction): void {
  const { packageId, passengers, contact } = req.body;

  if (!packageId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PACKAGE_ID',
        message: 'Se requiere el ID del paquete'
      }
    });
    return;
  }

  if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PASSENGERS',
        message: 'Se requiere información de pasajeros'
      }
    });
    return;
  }

  if (!contact || !contact.email) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CONTACT',
        message: 'Se requiere información de contacto con email'
      }
    });
    return;
  }

  next();
}

// ============================================
// RUTAS
// ============================================

// Buscar paquetes turísticos
router.get('/search', validatePackageSearch, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      checkIn,
      checkOut,
      rooms = 1
    } = req.query;

    console.log('🎯 [PACKAGES] Búsqueda recibida:', {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      checkIn,
      checkOut
    });

    const result = await searchPackages({
      origin: origin as string,
      destination: destination as string,
      departureDate: departureDate as string,
      returnDate: returnDate as string,
      adults: parseInt(adults as string) || 1,
      children: parseInt(children as string) || 0,
      infants: parseInt(infants as string) || 0,
      checkIn: checkIn as string,
      checkOut: checkOut as string,
      rooms: parseInt(rooms as string) || 1
    });

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PACKAGE_SEARCH_ERROR',
          message: result.error || 'Error al buscar paquetes'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      isMock: result.isMock
    });
  } catch (error) {
    console.error('❌ [PACKAGES] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    });
  }
});

// Obtener paquete por ID
router.get('/:packageId', async (req: Request, res: Response): Promise<void> => {
  const { packageId } = req.params;

  try {
    const { getSupabaseAdmin } = await import('../config/supabase.js');
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data } = await supabase.from('packages').select('*').eq('id', packageId).single();
      if (data) { res.json({ success: true, data }); return; }
    }
  } catch { /* fallback */ }

  res.json({
    success: true,
    data: { id: packageId, message: 'Paquete no encontrado' }
  });
});

// Reservar paquete
router.post('/book', validateBooking, async (req: Request, res: Response): Promise<void> => {
  try {
    const { packageId, passengers, contact, payment } = req.body;

    const result = await createPackageBooking({
      packageId,
      passengers,
      contact,
      payment
    });

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'BOOKING_ERROR',
          message: result.error || 'Error al reservar paquete'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('❌ [PACKAGES] Error en reserva:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    });
  }
});

export default router;
