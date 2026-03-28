// ============================================
// SERVICIO DE AMADEUS - VUELOS
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { CacheService } from './cache.js';
import { getValidToken, amadeusRequest } from './amadeus-token-manager.js';

// ============================================
// INTERFACES
// ============================================

export interface SearchFlightParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  max?: number;
}

export interface FlightSearchResult {
  success: boolean;
  data: unknown[];
  dictionaries?: Record<string, unknown>;
  error?: string;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar vuelos usando Amadeus con caché inteligente
 */
export async function searchFlights(params: SearchFlightParams): Promise<FlightSearchResult> {
  const cacheService = new CacheService('flights');

  const result = await cacheService.getOrFetch(
    params,
    async () => {
      const {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults,
        children,
        infants,
        travelClass,
        max = 20
      } = params;

      const amadeus = getAmadeus();

      // Si Amadeus no está configurado, devolver datos mock
      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock');
        const mockFlights = getMockFlights(params);
        // Transformar los datos mock al formato esperado por el cliente
        const transformedMockFlights = mockFlights.map((flight: Record<string, unknown>) => 
          transformFlightOffer(flight)
        );
        return {
          data: transformedMockFlights,
          totalResults: transformedMockFlights.length
        };
      }

      const amadeusParams = new URLSearchParams({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults: String(parseInt(String(adults)) || 1),
        children: String(parseInt(String(children)) || 0),
        infants: String(parseInt(String(infants)) || 0),
        travelClass: travelClass || 'ECONOMY',
        max: String(max)
      });

      // Añadir returnDate si existe (ida y vuelta)
      if (params.returnDate) {
        amadeusParams.set('returnDate', params.returnDate);
      }

      console.log('🔍 Buscando vuelos con Amadeus (Token Manager):', params);

      // Usar el Token Manager para llamadas directas a la API
      const response = await amadeusRequest<any>(
        `/v2/shopping/flight-offers?${amadeusParams.toString()}`
      );
      
      // Transformar los datos de Amadeus al formato esperado por el cliente
      const flightsData = response.data || [];
      const transformedFlights = (flightsData as Array<Record<string, unknown>>).map((flight: Record<string, unknown>) => 
        transformFlightOffer(flight, response.dictionaries)
      );
      
      return {
        data: transformedFlights,
        totalResults: transformedFlights.length
      };
    }
  );

  console.log(`✈️ Búsqueda de vuelos completada - ${result.fromCache ? 'desde caché' : 'desde API'}`);

  return {
    success: true,
    data: result.data,
    dictionaries: {} // Los diccionarios no se cachean por simplicidad
  };
}

/**
 * Obtener detalles de un vuelo específico
 */
export async function getFlightDetails(flightId: string): Promise<{ success: boolean; error?: string }> {
  // Amadeus no tiene un endpoint directo para esto
  return {
    success: false,
    error: 'Funcionalidad no implementada'
  };
}

/**
 * Confirmar precio de una oferta de vuelo con caché
 */
export async function confirmFlightPrice(flightOfferId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const cacheService = new CacheService('pricing');

  const result = await cacheService.getOrFetch(
    { flightOfferId },
    async () => {
      const amadeus = getAmadeus();

      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, simulando confirmación de precio');
        return {
          data: {
            price: { total: '150.00', currency: 'EUR' },
            validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          }
        };
      }

      const response = await (amadeus as any).shopping.flightOffers.pricing.post({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [{ id: flightOfferId }]
        }
      });

      return {
        data: {
          price: response.data.flightOffers[0].price,
          validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      };
    }
  );

  console.log(`💰 Confirmación de precio completada - ${result.fromCache ? 'desde caché' : 'desde API'}`);

  return {
    success: true,
    data: result.data
  };
}

/**
 * Crear orden de vuelo
 */
export async function createFlightOrder(flightOfferId: string, passengers: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    console.warn('⚠️ Amadeus no configurado, simulando creación de orden');
    return {
      success: true,
      data: {
        id: `ORDER-${Date.now()}`,
        status: 'CONFIRMED',
        associatedRecords: [{ reference: `PNR${Math.random().toString(36).substring(2, 6).toUpperCase()}` }]
      }
    };
  }

  try {
    const response = await (amadeus as any).booking.flightOrders.post({
      data: {
        type: 'flight-order',
        flightOffers: [{ id: flightOfferId }],
        travelers: passengers
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error creando orden de vuelo:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Obtener una orden de vuelo existente
 * API: GET /booking/flight-orders/{flight-orderId}
 */
export async function getFlightOrder(orderId: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const response = await (amadeus as any).booking.flightOrders(orderId).get();
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error obteniendo orden de vuelo:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Cancelar una orden de vuelo
 * API: DELETE /booking/flight-orders/{flight-orderId}
 */
export async function cancelFlightOrder(orderId: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const response = await (amadeus as any).booking.flightOrders(orderId).delete();
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error cancelando orden de vuelo:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Transformar oferta de vuelo al formato del frontend
 */
export function transformFlightOffer(
  flight: Record<string, unknown>, 
  dictionaries: Record<string, unknown> = {}
): Record<string, unknown> {
  const itineraries = ((flight.itineraries as Array<Record<string, unknown>>) || []).map((it: Record<string, unknown>) => {
    const segments = ((it.segments as Array<Record<string, unknown>>) || []).map((seg: Record<string, unknown>, idx: number) => {
      const departure = seg.departure as Record<string, unknown> || {};
      const arrival = seg.arrival as Record<string, unknown> || {};
      
      const segment: Record<string, unknown> = {
        // Nuevos nombres (para el frontend)
        from: departure.iataCode || '',
        to: arrival.iataCode || '',
        fromTime: departure.at || '',
        toTime: arrival.at || '',
        fromTerminal: departure.terminal || '',
        toTerminal: arrival.terminal || '',
        carrier: seg.carrierCode || '',
        carrierCode: seg.carrierCode || '', // Compatibilidad con cliente
        carrierName: (dictionaries?.carriers as Record<string, unknown>)?.[seg.carrierCode as string] || seg.carrierCode,
        flightNumber: `${seg.carrierCode}${seg.number}`,
        aircraft: seg.aircraft ? ((dictionaries?.aircraft as Record<string, unknown>)?.[(seg.aircraft as Record<string, unknown>)?.code as string] || (seg.aircraft as Record<string, unknown>)?.code) : '',
        aircraftCode: seg.aircraft ? ((seg.aircraft as Record<string, unknown>)?.code || '') : '',
        duration: seg.duration || '',
        numberOfStops: seg.numberOfStops || 0,
        // Campos originales de Amadeus (mantener compatibilidad)
        departure,
        arrival,
        number: seg.number,
      };
      
      // Calcular escala si hay más segmentos
      const allSegments = it.segments as Array<Record<string, unknown>>;
      if (idx < allSegments.length - 1) {
        const nextSeg = allSegments[idx + 1];
        const depTime = new Date(arrival.at as string);
        const nextDepTime = new Date((nextSeg.departure as Record<string, unknown>)?.at as string);
        const layoverDuration = Math.round((nextDepTime.getTime() - depTime.getTime()) / 60000);
        segment.layover = {
          airport: arrival.iataCode,
          duration: layoverDuration,
          durationFormatted: `${Math.floor(layoverDuration/60)}h ${layoverDuration%60}m`
        };
      }
      
      return segment;
    });
    
    return {
      ...it,
      segments,
      totalDuration: it.duration || '',
      numberOfStops: segments.length - 1
    };
  });

  // Equipaje
  let baggage = null;
  const travelerPricings = flight.travelerPricings as Array<Record<string, unknown>>;
  if (travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags) {
    const bags = (travelerPricings[0].fareDetailsBySegment[0] as Record<string, unknown>).includedCheckedBags as Record<string, unknown>;
    baggage = {
      count: bags.quantity || 0,
      weight: bags.weight || null,
      weightUnit: bags.weightUnit || null
    };
  }

  // Amenidades
  const amenities: Array<Record<string, unknown>> = [];
  if (travelerPricings?.[0]?.fareDetailsBySegment) {
    (travelerPricings[0].fareDetailsBySegment as Array<Record<string, unknown>>).forEach((fare: Record<string, unknown>) => {
      if (fare.amenities) {
        (fare.amenities as Array<Record<string, unknown>>).forEach((amenity: Record<string, unknown>) => {
          if (!amenities.find((a: Record<string, unknown>) => a.code === amenity.code)) {
            amenities.push({
              code: amenity.code,
              description: amenity.description,
              isChargeable: amenity.isChargeable
            });
          }
        });
      }
    });
  }

  const price = flight.price as Record<string, unknown> || {};

  return {
    ...flight,
    itineraries,
    baggage,
    amenities,
    id: flight.id || `flight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    price: {
      total: price.total || '0',
      currency: price.currency || 'EUR',
      grandTotal: price.grandTotal || price.total || '0'
    },
    seats: flight.numberOfBookableSeats || null
  };
}

// ============================================
// DATOS MOCK
// ============================================

function getMockFlights(params: SearchFlightParams): unknown[] {
  const { originLocationCode = 'MAD', destinationLocationCode = 'BCN' } = params;
  const isRound = !!params.returnDate;
  const retDate = params.returnDate || params.departureDate;

  // Itinerario de vuelta (solo si es ida y vuelta)
  const returnItinerary = isRound ? [
    {
      duration: 'PT1H30M',
      segments: [
        {
          departure: {
            iataCode: destinationLocationCode,
            terminal: '1',
            at: `${retDate}T18:00:00`
          },
          arrival: {
            iataCode: originLocationCode,
            terminal: '1',
            at: `${retDate}T19:30:00`
          },
          carrierCode: 'IB',
          number: '8002',
          aircraft: { code: '320' },
          operating: { carrierCode: 'IB' },
          duration: 'PT1H30M',
          numberOfStops: 0
        }
      ]
    }
  ] : [];

  const returnItinerary2 = isRound ? [
    {
      duration: 'PT2H00M',
      segments: [
        {
          departure: {
            iataCode: destinationLocationCode,
            terminal: '1',
            at: `${retDate}T20:00:00`
          },
          arrival: {
            iataCode: originLocationCode,
            terminal: '2',
            at: `${retDate}T22:00:00`
          },
          carrierCode: 'BA',
          number: '457',
          aircraft: { code: '737' },
          operating: { carrierCode: 'BA' },
          duration: 'PT2H00M',
          numberOfStops: 0
        }
      ]
    }
  ] : [];

  return [
    {
      id: `FLT-${originLocationCode}-${destinationLocationCode}-001`,
      source: 'amadeus',
      type: 'flight-offer',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !isRound,
      lastTicketingDate: '2025-12-31',
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: 'PT1H30M',
          segments: [
            {
              departure: {
                iataCode: originLocationCode,
                terminal: '1',
                at: `${params.departureDate}T08:00:00`
              },
              arrival: {
                iataCode: destinationLocationCode,
                terminal: '1',
                at: `${params.departureDate}T09:30:00`
              },
              carrierCode: 'IB',
              number: '8001',
              aircraft: { code: '320' },
              operating: { carrierCode: 'IB' },
              duration: 'PT1H30M',
              numberOfStops: 0
            }
          ]
        },
        ...returnItinerary
      ],
      price: {
        currency: 'EUR',
        total: isRound ? '179.98' : '89.99',
        base: isRound ? '150.00' : '75.00',
        fees: [{ amount: '0.00', type: 'SUPPLIER' }],
        grandTotal: isRound ? '179.98' : '89.99'
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true
      },
      validatingAirlineCodes: ['IB'],
      travelerPricings: [
        {
          travelerId: '1',
          fareOption: 'STANDARD',
          travelerType: 'ADULT',
          price: {
            currency: 'EUR',
            total: isRound ? '179.98' : '89.99',
            base: isRound ? '150.00' : '75.00'
          },
          fareDetailsBySegment: [
            {
              segmentId: '1',
              cabin: 'ECONOMY',
              fareBasis: 'EOBAU',
              class: 'E',
              includedCheckedBags: { weight: 23, weightUnit: 'KG' }
            }
          ]
        }
      ]
    },
    {
      id: `FLT-${originLocationCode}-${destinationLocationCode}-002`,
      source: 'amadeus',
      type: 'flight-offer',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !isRound,
      lastTicketingDate: '2025-12-31',
      numberOfBookableSeats: 5,
      itineraries: [
        {
          duration: 'PT2H00M',
          segments: [
            {
              departure: {
                iataCode: originLocationCode,
                terminal: '2',
                at: `${params.departureDate}T14:00:00`
              },
              arrival: {
                iataCode: destinationLocationCode,
                terminal: '1',
                at: `${params.departureDate}T16:00:00`
              },
              carrierCode: 'BA',
              number: '456',
              aircraft: { code: '737' },
              operating: { carrierCode: 'BA' },
              duration: 'PT2H00M',
              numberOfStops: 0
            }
          ]
        },
        ...returnItinerary2
      ],
      price: {
        currency: 'EUR',
        total: isRound ? '259.98' : '129.99',
        base: isRound ? '220.00' : '110.00',
        fees: [{ amount: '0.00', type: 'SUPPLIER' }],
        grandTotal: isRound ? '259.98' : '129.99'
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true
      },
      validatingAirlineCodes: ['BA'],
      travelerPricings: [
        {
          travelerId: '1',
          fareOption: 'STANDARD',
          travelerType: 'ADULT',
          price: {
            currency: 'EUR',
            total: isRound ? '259.98' : '129.99',
            base: isRound ? '220.00' : '110.00'
          },
          fareDetailsBySegment: [
            {
              segmentId: '1',
              cabin: 'ECONOMY',
              fareBasis: 'QNR',
              class: 'Q',
              includedCheckedBags: { weight: 23, weightUnit: 'KG' }
            }
          ]
        }
      ]
    }
  ];
}

export default {
  searchFlights,
  getFlightDetails,
  transformFlightOffer
};
