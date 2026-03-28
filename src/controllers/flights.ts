// ============================================
// CONTROLADOR DE VUELOS
// ============================================

import { Request, Response } from 'express';
import { searchFlights, confirmFlightPrice as confirmFlightPriceService, createFlightOrder as createFlightOrderService } from '../services/amadeus.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { getFlightUpsell, FlightOffer, Payment } from '../services/amadeus-upsell.js';

// ============================================
// INTERFACES
// ============================================

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: string;
  nonStop?: boolean;
  maxPrice?: number;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar vuelos
 */
export async function searchFlightOffers(req: Request, res: Response): Promise<void> {
  try {
    // Soportar tanto los parámetros del cliente (from, to, departure) como los del servidor (origin, destination, departureDate)
    const origin = (req.query.origin as string) || (req.query.from as string);
    const destination = (req.query.destination as string) || (req.query.to as string);
    const departureDate = (req.query.departureDate as string) || (req.query.departure as string);
    const returnDate = (req.query.returnDate as string) || (req.query.return as string);
    
    const passengers = req.query.passengers || req.query.adults || '1';
    const cabinClass = req.query.cabinClass || req.query.travelClass;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;
    const nonStop = req.query.nonStop === 'true';

    if (!origin || !destination || !departureDate) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Parámetros requeridos: origin, destination, departureDate o from, to, departure'
        }
      });
      return;
    }

    const result = await searchFlights({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults: parseInt(passengers as string, 10),
      travelClass: cabinClass as string,
      max: 20,
      maxPrice,
      nonStop
    });

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: result.error || 'Error al buscar vuelos' }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      meta: {
        count: result.data.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error searching flights:', errorMessage);
    res.status(500).json({
      success: false,
      error: {
        code: 'FLIGHT_SEARCH_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener detalles de un vuelo
 */
export async function getFlightDetails(req: Request, res: Response): Promise<void> {
  try {
    const { flightId } = req.params;

    if (!flightId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere el ID del vuelo'
        }
      });
      return;
    }

    // En una implementación real, aquí llamarías a la API de Amadeus
    res.json({
      success: true,
      data: {
        id: flightId,
        message: 'Detalles del vuelo'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'FLIGHT_DETAILS_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Confirmar precio de vuelo
 */
export async function confirmFlightPrice(req: Request, res: Response): Promise<void> {
  try {
    const { flightOfferId } = req.body;

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

    const result = await confirmFlightPriceService(flightOfferId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FLIGHT_PRICE_ERROR',
          message: result.error || 'Error confirmando precio'
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
        code: 'FLIGHT_PRICE_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Crear orden de vuelo (reserva)
 */
export async function createFlightOrder(req: Request, res: Response): Promise<void> {
  try {
    const { flightOfferId, passengers, contact, userId, bookingData } = req.body;

    if (!flightOfferId || !passengers) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requieren flightOfferId y passengers'
        }
      });
      return;
    }

    const result = await createFlightOrderService(flightOfferId, passengers);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FLIGHT_ORDER_ERROR',
          message: result.error || 'Error creando orden'
        }
      });
      return;
    }

    // Extraer PNR y Order ID de la respuesta de Amadeus
    const amadeusOrderId = result.data?.id;
    const associatedRecords = result.data?.associatedRecords || [];
    const pnrCode = associatedRecords[0]?.reference || null;

    // Guardar en la base de datos
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        // Intentar guardar en booking_flights (nueva tabla)
        const { error: insertError } = await supabase
          .from('booking_flights')
          .insert({
            amadeus_offer_id: flightOfferId,
            amadeus_order_id: amadeusOrderId,
            pnr_code: pnrCode,
            flight_data: bookingData || result.data,
            status: 'CONFIRMED',
            confirmed_at: new Date().toISOString()
          });

        if (insertError) {
          console.warn('⚠️ No se pudo guardar en booking_flights:', insertError.message);
        }
      } catch (dbError) {
        console.warn('⚠️ Error guardando datos del vuelo:', dbError);
      }
    }

    res.json({
      success: true,
      data: {
        ...result.data,
        pnrCode,
        amadeusOrderId
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'FLIGHT_ORDER_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener ofertas de upsell para una oferta de vuelo
 * API: POST /shopping/flight-offers/upselling
 */
export async function getFlightUpsellOffers(req: Request, res: Response): Promise<void> {
  try {
    const { flightOffers, payments } = req.body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere un array de flightOffers'
        }
      });
      return;
    }

    const result = await getFlightUpsell(
      flightOffers as FlightOffer[],
      payments as Payment[]
    );

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPSELL_ERROR',
          message: result.error || 'Error obteniendo ofertas de upsell'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      dictionaries: result.dictionaries
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error getting flight upsell:', errorMessage);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPSELL_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  searchFlightOffers,
  getFlightDetails,
  confirmFlightPrice,
  createFlightOrder,
  getFlightUpsellOffers
};
