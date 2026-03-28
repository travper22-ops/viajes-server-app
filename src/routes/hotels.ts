// ============================================
// RUTAS DE HOTELES
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { 
  searchHotelOffers, 
  getHotelById, 
  confirmHotelPrice, 
  createHotelBooking 
} from '../controllers/hotels.js';

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

function validateHotelSearch(req: Request, res: Response, next: NextFunction): void {
  const { city, checkIn, checkOut } = req.query;

  if (!city || !checkIn || !checkOut) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Parámetros requeridos: city, checkIn, checkOut'
      }
    });
    return;
  }

  if (!validateDate(checkIn as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CHECKIN',
        message: 'Fecha de entrada inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  if (!validateDate(checkOut as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CHECKOUT',
        message: 'Fecha de salida inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  // Validar que checkOut > checkIn
  const checkInDate = new Date(checkIn as string);
  const checkOutDate = new Date(checkOut as string);
  
  if (checkOutDate <= checkInDate) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATES',
        message: 'La fecha de salida debe ser posterior a la fecha de entrada'
      }
    });
    return;
  }

  next();
}

function validateBooking(req: Request, res: Response, next: NextFunction): void {
  const { offerId, guests, contact } = req.body;

  if (!offerId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_OFFER_ID',
        message: 'Se requiere offerId'
      }
    });
    return;
  }

  if (!guests) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_GUESTS',
        message: 'Se requiere número de huéspedes'
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

// Buscar hoteles
router.get('/search', validateHotelSearch, searchHotelOffers);

// Obtener hotel por ID
router.get('/:hotelId', getHotelById);

// Confirmar precio
router.post('/confirm-price', confirmHotelPrice);

// Crear reserva
router.post('/book', validateBooking, createHotelBooking);

export default router;
