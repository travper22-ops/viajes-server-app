// ============================================
// RUTAS DE VUELOS
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { 
  searchFlightOffers, 
  getFlightDetails, 
  confirmFlightPrice, 
  createFlightOrder,
  getFlightUpsellOffers 
} from '../controllers/flights.js';
import { getFlightOrder, cancelFlightOrder } from '../services/amadeus.js';

const router = Router();

// ============================================
// VALIDACIÓN
// ============================================

const IATA_REGEX = /^[A-Z]{3}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateIATACode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return IATA_REGEX.test(code.toUpperCase());
}

function validateDate(date: string): boolean {
  if (!date || typeof date !== 'string') return false;
  if (!DATE_REGEX.test(date)) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function validateFlightSearch(req: Request, res: Response, next: NextFunction): void {
  // Soportar tanto los parámetros del cliente (from, to, departure) como los del servidor (origin, destination, departureDate)
  const origin = (req.query.origin as string) || (req.query.from as string);
  const destination = (req.query.destination as string) || (req.query.to as string);
  const departureDate = (req.query.departureDate as string) || (req.query.departure as string);

  if (!origin || !destination || !departureDate) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Parámetros requeridos: origin/destination/departureDate o from/to/departure'
      }
    });
    return;
  }

  if (!validateIATACode(origin)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ORIGIN',
        message: 'Código IATA de origen inválido'
      }
    });
    return;
  }

  if (!validateIATACode(destination)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DESTINATION',
        message: 'Código IATA de destino inválido'
      }
    });
    return;
  }

  if (!validateDate(departureDate)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Fecha de partida inválida (formato: YYYY-MM-DD)'
      }
    });
    return;
  }

  // Validar fecha de retorno si existe
  const returnDate = (req.query.returnDate as string) || (req.query.return as string);
  if (returnDate && !validateDate(returnDate)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_RETURN_DATE',
        message: 'Fecha de retorno inválida'
      }
    });
    return;
  }

  next();
}

// ============================================
// RUTAS
// ============================================

// Buscar vuelos
router.get('/search', validateFlightSearch, searchFlightOffers);

// Obtener detalles de un vuelo
router.get('/:flightId', getFlightDetails);

// Confirmar precio
router.post('/confirm-price', confirmFlightPrice);

// Crear orden de vuelo (reserva)
router.post('/order', createFlightOrder);

// Obtener ofertas de upsell (Branded Fares)
router.post('/upsell', getFlightUpsellOffers);

// ============================================
// FLIGHT ORDER MANAGEMENT - API 014
// GET  /api/v1/flights/orders/:orderId  → recuperar orden
// DELETE /api/v1/flights/orders/:orderId → cancelar orden
// ============================================

router.get('/orders/:orderId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const result = await getFlightOrder(orderId);

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: result.error || 'Orden no encontrada' }
      });
      return;
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, error: { code: 'ORDER_ERROR', message: msg } });
  }
});

router.delete('/orders/:orderId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const result = await cancelFlightOrder(orderId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'CANCEL_FAILED', message: result.error || 'Error al cancelar orden' }
      });
      return;
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, error: { code: 'CANCEL_ERROR', message: msg } });
  }
});

export default router;
