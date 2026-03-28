// ============================================
// RUTAS DE AEROPUERTOS
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { 
  searchAirport, 
  getAirportByCode, 
  getMajorCities 
} from '../controllers/airports.js';

const router = Router();

// ============================================
// RUTAS
// ============================================

// Buscar aeropuertos (autocompletado)
router.get('/autocomplete', searchAirport);

// Buscar aeropuertos
router.get('/search', searchAirport);

// Obtener ciudades principales
router.get('/cities', getMajorCities);

// Obtener airport por código IATA
router.get('/:code', getAirportByCode);

export default router;
