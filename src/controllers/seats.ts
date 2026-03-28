// ============================================
// CONTROLADOR DE ASIENTOS - SEATMAP DISPLAY
// ============================================

import { Request, Response } from 'express';
import { 
  getSeatMap, 
  getSeatMapByOrderId, 
  getSeatMapByFlightOffer,
  FlightOffer 
} from '../services/amadeus-seats.js';

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener mapa de asientos para un vuelo (legacy - por flightOfferId)
 */
export async function getFlightSeats(req: Request, res: Response): Promise<void> {
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

    const result = await getSeatMap(flightOfferId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SEATS_ERROR',
          message: result.error || 'Error obteniendo mapa de asientos'
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
        code: 'SEATS_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener mapa de asientos por order ID
 * Endpoint: GET /shopping/seatmaps?flightOrderId=xxx
 */
export async function getSeatMapByOrder(req: Request, res: Response): Promise<void> {
  try {
    const { flightOrderId } = req.query;

    if (!flightOrderId || typeof flightOrderId !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere el parámetro flightOrderId'
        }
      });
      return;
    }

    // Verificar si se requiere seatNumberServiceBookingStatus (solo Enterprise)
    const seatNumberServiceBookingStatusRequired = req.query.seatNumberServiceBookingStatusRequired === 'true';

    const result = await getSeatMapByOrderId(flightOrderId, {
      seatNumberServiceBookingStatusRequired
    });

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'SEATS_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener mapa de asientos por flight offer
 * Endpoint: POST /shopping/seatmaps
 */
export async function getSeatMapFromFlightOffer(req: Request, res: Response): Promise<void> {
  try {
    const { data, included } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATA',
          message: 'Se requiere un array de flight offers en el cuerpo de la petición'
        }
      });
      return;
    }

    // Validar que cada flight offer tenga los campos requeridos
    for (const offer of data) {
      if (!offer.type || !offer.id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FLIGHT_OFFER',
            message: 'Cada flight offer debe tener type e id'
          }
        });
        return;
      }
    }

    // Extraer travelers si se proporcionan
    const travelers = included?.travelers;

    const result = await getSeatMapByFlightOffer(data as FlightOffer[], travelers);

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'SEATS_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  getFlightSeats,
  getSeatMapByOrder,
  getSeatMapFromFlightOffer
};
