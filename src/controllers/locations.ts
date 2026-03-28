// ============================================
// CONTROLADOR DE UBICACIONES
// ============================================

import { Request, Response } from 'express';
import { searchLocations, getLocationDetails } from '../services/amadeus-locations.js';

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar ubicaciones (aeropuertos, ciudades)
 */
export async function searchLocationOffers(req: Request, res: Response): Promise<void> {
  try {
    const { keyword, subType, countryCode, max } = req.query;

    if (!keyword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere keyword para búsqueda'
        }
      });
      return;
    }

    const searchParams = {
      keyword: keyword as string,
      ...(subType && { subType: (subType as string).split(',') }),
      ...(countryCode && { countryCode: countryCode as string }),
      ...(max && { max: parseInt(max as string, 10) })
    };

    const result = await searchLocations(searchParams);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOCATION_SEARCH_ERROR',
          message: result.error || 'Error buscando ubicaciones'
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
        code: 'LOCATION_SEARCH_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener detalles de una ubicación
 */
export async function getLocationById(req: Request, res: Response): Promise<void> {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere locationId'
        }
      });
      return;
    }

    const result = await getLocationDetails(locationId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOCATION_DETAILS_ERROR',
          message: result.error || 'Error obteniendo detalles de ubicación'
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
        code: 'LOCATION_DETAILS_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  searchLocationOffers,
  getLocationById
};