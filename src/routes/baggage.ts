// ============================================
// RUTAS DE EQUIPAJE
// ============================================

import { Router } from 'express';
import { getFlightBaggage } from '../controllers/baggage.js';

const router = Router();

// ============================================
// RUTAS
// ============================================

// Obtener información de equipaje para un vuelo
router.get('/flights/:flightOfferId', getFlightBaggage);

export default router;