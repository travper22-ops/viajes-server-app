// ============================================
// CONTROLADOR DE EQUIPAJE
// ============================================

import { Request, Response } from 'express';
import { getBaggageAllowance } from '../services/amadeus-baggage.js';

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener información de equipaje para un vuelo
 */
export async function getFlightBaggage(req: Request, res: Response): Promise<void> {
  try {
    const { flightOfferId } = req.params;

    if (!flightOfferId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere flightOfferId'
        }
      });
      return;
    }

    const result = await getBaggageAllowance(flightOfferId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'BAGGAGE_ERROR',
          message: result.error || 'Error obteniendo información de equipaje'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'BAGGAGE_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  getFlightBaggage
};