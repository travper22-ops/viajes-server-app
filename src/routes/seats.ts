// ============================================
// RUTAS DE ASIENTOS - SEATMAP DISPLAY API
// ============================================

import { Router } from 'express';
import { 
  getFlightSeats, 
  getSeatMapByOrder, 
  getSeatMapFromFlightOffer 
} from '../controllers/seats.js';

const router = Router();

// ============================================
// RUTAS
// ============================================

// GET /api/v1/seats/flights/:flightOfferId - Obtener mapa de asientos por flightOfferId (legacy)
router.get('/flights/:flightOfferId', getFlightSeats);

// GET /api/v1/seats/shopping/seatmaps?flightOrderId=xxx - Obtener mapa de asientos por order ID
// Endpoint: GET /shopping/seatmaps?flightOrderId=xxx (Amadeus)
router.get('/shopping/seatmaps', getSeatMapByOrder);

// POST /api/v1/seats/shopping/seatmaps - Obtener mapa de asientos por flight offer
// Endpoint: POST /shopping/seatmaps (Amadeus)
router.post('/shopping/seatmaps', getSeatMapFromFlightOffer);

// Alias routes para compatibilidad
router.get('/order/:orderId', getSeatMapByOrder);

export default router;
