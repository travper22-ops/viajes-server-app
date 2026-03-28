// ============================================
// CONTROLADOR DE AEROPUERTOS
// ============================================

import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { 
  searchAirports,
  findAirportByCode, 
  findAirportsByCity,
  AIRPORTS_LIST 
} from '../models/Airport.js';

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar aeropuertos por query
 */
export async function searchAirport(req: Request, res: Response): Promise<void | Response> {
  try {
    const { q, city, country, type } = req.query as Record<string, string>;
    const supabase = getSupabaseAdmin();

    // Si Supabase está disponible, usamos la función SQL search_airports
    if (supabase && q) {
      const { data, error } = await supabase.rpc('search_airports', { p_query: q });
      if (error) {
        console.error('Error ejecutando search_airports RPC:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'SUPABASE_RPC_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }

      return res.json({
        success: true,
        data: (data as any[]) || [],
        meta: { count: (data as any[] | null)?.length || 0 }
      });
    }

    // Fallback local (cache en memoria)
    return searchAirportLocal({ q, city, country, type }, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRPORT_SEARCH_ERROR',
        message: errorMessage
      }
    });
  }
}

function searchAirportLocal(
  params: { q?: string; city?: string; country?: string; type?: string },
  res: Response
) {
  const { q, city, country, type } = params;

  let airports;

  if (q) {
    airports = searchAirports(q);
  } else if (city) {
    airports = findAirportsByCity(city);
  } else if (country) {
    airports = AIRPORTS_LIST.filter(
      a => a.country.toLowerCase().includes(country.toLowerCase())
    );
  } else {
    airports = AIRPORTS_LIST;
  }

  // Filtrar por tipo si se especifica
  if (type) {
    airports = airports.filter(a => a.type === type);
  }

  return res.json({
    success: true,
    data: airports,
    meta: {
      count: airports.length
    }
  });
}

/**
 * Obtener aeropuerto por código
 */
export async function getAirportByCode(req: Request, res: Response): Promise<void | Response> {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CODE',
          message: 'Se requiere el código del aeropuerto'
        }
      });
      return;
    }

    const airport = findAirportByCode(code.toUpperCase());

    if (!airport) {
      res.status(404).json({
        success: false,
        error: {
          code: 'AIRPORT_NOT_FOUND',
          message: `Aeropuerto ${code} no encontrado`
        }
      });
      return;
    }

    res.json({
      success: true,
      data: airport
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRPORT_GET_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener ciudades principales
 */
export async function getMajorCities(req: Request, res: Response): Promise<void | Response> {
  try {
    const cities = AIRPORTS_LIST.map(airport => ({
      code: airport.code,
      name: airport.city,
      country: airport.country
    }));

    // Eliminar duplicados
    const uniqueCities = cities.filter(
      (city, index, self) => 
        index === self.findIndex(c => c.code === city.code)
    );

    res.json({
      success: true,
      data: uniqueCities,
      meta: {
        count: uniqueCities.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'CITIES_GET_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  searchAirport,
  getAirportByCode,
  getMajorCities
};
