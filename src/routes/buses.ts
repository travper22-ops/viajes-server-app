// ============================================
// RUTAS DE AUTOBUSES
// ============================================

import { Router, Request, Response } from 'express';
import { searchBuses } from '../services/kiwi-bus.js';

const router = Router();

// ============================================
// INTERFACES
// ============================================

interface BusSearchQuery {
  departure: string;
  arrival: string;
  date: string;
  adults?: number;
  currency?: string;
}

// ============================================
// RUTAS
// ============================================

// Buscar autobuses
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { departure, arrival, date, adults, currency } = req.query;

    if (!departure || !arrival || !date) {
      res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_PARAMS', 
          message: 'Parámetros requeridos: departure, arrival, date' 
        }
      });
      return;
    }

    const searchParams: BusSearchQuery = {
      departure: (departure as string).toUpperCase().slice(0, 3),
      arrival:   (arrival as string).toUpperCase().slice(0, 3),
      date: date as string,
      adults: parseInt(adults as string) || 1,
      currency: (currency as string) || 'EUR'
    };

    console.log('🚌 Buscando autobuses:', searchParams);

    const result = await searchBuses(searchParams);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: result.error || 'Error al buscar autobuses' }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      meta: {
        count: result.data.length,
        filters: searchParams
      }
    });
  } catch (error) {
    console.error('Error en búsqueda de autobuses:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

// Obtener detalle de autobús por ID
router.get('/:busId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { busId } = req.params;

    if (!busId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Se requiere el ID del autobús' }
      });
      return;
    }

    // En una implementación real, buscaríamos los detalles del autobús
    // Por ahora devolvemos un mensaje
    res.json({
      success: true,
      data: {
        id: busId,
        message: 'Detalles del autobús'
      }
    });
  } catch (error) {
    console.error('Error obteniendo detalle de autobús:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

export default router;
