// ============================================
// RUTAS DE UBICACIONES
// ============================================

import { Router } from 'express';
import { searchLocationOffers, getLocationById } from '../controllers/locations.js';

const router = Router();

// ============================================
// RUTAS
// ============================================

// Buscar ubicaciones
router.get('/search', searchLocationOffers);

// Obtener detalles de una ubicación
router.get('/:locationId', getLocationById);

export default router;