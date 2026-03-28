// ============================================
// MODELO DE VUELO - TRAVEL AGENCY
// ============================================

import { IFlight, IFlightSegment, CABIN_CLASS, FLIGHT_SOURCES, FLIGHT_STATUS } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

export const CABIN_CLASS_ENUM = {
  ECONOMY: 'ECONOMY',
  PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
  BUSINESS: 'BUSINESS',
  FIRST: 'FIRST'
} as const;

export const FLIGHT_SOURCES_ENUM = {
  AMADEUS: 'amadeus',
  KIWI: 'kiwi',
  DIRECT: 'direct'
} as const;

// ============================================
// FUNCIONES DE TRANSFORMACIÓN (AMADEUS)
// ============================================

/**
 * Transforma un segmento de vuelo de Amadeus
 */
export function formatFlightSegment(segment: Record<string, unknown>): IFlightSegment {
  const departure = segment.departure as Record<string, unknown> || {};
  const arrival = segment.arrival as Record<string, unknown> || {};
  const carrier = segment.carrierCode as Record<string, unknown> || {};
  
  return {
    departure: {
      iataCode: departure.iataCode as string || '',
      terminal: departure.terminal as string,
      at: departure.at as string || ''
    },
    arrival: {
      iataCode: arrival.iataCode as string || '',
      terminal: arrival.terminal as string,
      at: arrival.at as string || ''
    },
    carrierCode: typeof carrier === 'string' ? carrier : (carrier.iataCode as string || ''),
    number: segment.number as string || '',
    aircraft: {
      code: (segment.aircraft as Record<string, unknown>)?.code as string || ''
    },
    duration: segment.duration as string || '',
    numberOfStops: segment.numberOfStops as number || 0
  };
}

/**
 * Transforma un vuelo de la API de Amadeus al formato de nuestra API
 */
export function transformFlightFromAmadeus(
  amadeusFlight: Record<string, unknown>, 
  searchParams: Record<string, unknown>
): IFlight {
  const flight = amadeusFlight as Record<string, unknown>;
  
  // Extraer itinerarios
  const itineraries = flight.itineraries as Array<Record<string, unknown>> || [];
  const outbound = itineraries[0] as Record<string, unknown> || {};
  const returnFlight = itineraries[1] as Record<string, unknown>;
  
  const segments = outbound.segments as Array<Record<string, unknown>> || [];
  const firstSegment = segments[0] as Record<string, unknown> || {};
  const lastSegment = segments[segments.length - 1] as Record<string, unknown> || {};
  
  // Extraer pricing
  const pricingOptions = (flight.pricingOptions as Record<string, unknown>) || {};
  const fareType = (pricingOptions.fareType as string[]) || [];
  
  const price = flight.price as Record<string, unknown> || {};
  
  return {
    id: `flight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: FLIGHT_SOURCES.AMADEUS,
    airline: (firstSegment.carrierCode as Record<string, unknown>)?.iataCode as string || '',
    flightNumber: `${(firstSegment.carrierCode as Record<string, unknown>)?.iataCode || ''}${firstSegment.number || ''}`,
    origin: (firstSegment.departure as Record<string, unknown>)?.iataCode as string || '',
    destination: (lastSegment.arrival as Record<string, unknown>)?.iataCode as string || '',
    departureTime: (firstSegment.departure as Record<string, unknown>)?.at as string || '',
    arrivalTime: (lastSegment.arrival as Record<string, unknown>)?.at as string || '',
    duration: outbound.duration as string || '',
    cabinClass: fareType.includes('FIRST') 
      ? CABIN_CLASS.FIRST 
      : fareType.includes('BUSINESS') 
        ? CABIN_CLASS.BUSINESS 
        : fareType.includes('PREMIUM_ECONOMY') 
          ? CABIN_CLASS.PREMIUM_ECONOMY 
          : CABIN_CLASS.ECONOMY,
    price: {
      currency: price.currency as string || 'USD',
      total: price.total as string || '0',
      base: (price.base as string) || '0',
      fees: (price.fees as string) || '0',
      taxes: (price.taxes as string) || '0'
    },
    seatsAvailable: flight.availableSeats as number || 9,
    status: FLIGHT_STATUS.AVAILABLE,
    segments: segments.map(s => formatFlightSegment(s)),
    returnFlight: returnFlight ? transformFlightFromAmadeus(
      { ...flight, itineraries: [returnFlight] },
      searchParams
    ) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Convierte duración ISO 8601 a minutos
 */
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  
  return hours * 60 + minutes;
}

/**
 * Formatea duración para mostrar
 */
export function formatDuration(duration: string): string {
  const minutes = parseDurationToMinutes(duration);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Filtra vuelos según criterios de búsqueda
 */
export function filterFlights(
  flights: IFlight[], 
  params: Record<string, unknown>
): IFlight[] {
  let filtered = [...flights];
  
  // Filtrar por precio máximo
  if (params.maxPrice) {
    filtered = filtered.filter(flight => 
      parseFloat(flight.price.total) <= (params.maxPrice as number)
    );
  }
  
  // Filtrar por escalas
  if (params.nonStop === true) {
    filtered = filtered.filter(flight => 
      flight.segments.length === 1
    );
  }
  
  // Filtrar por clase de cabina
  if (params.cabinClass) {
    filtered = filtered.filter(flight => 
      flight.cabinClass === params.cabinClass
    );
  }
  
  return filtered;
}

/**
 * Ordena vuelos según criterio
 */
export function sortFlights(flights: IFlight[], sortBy: string = 'price'): IFlight[] {
  const sorted = [...flights];
  
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => 
        parseFloat(a.price.total) - parseFloat(b.price.total)
      );
    
    case 'duration':
      return sorted.sort((a, b) => 
        parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration)
      );
    
    case 'departure':
      return sorted.sort((a, b) => 
        new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );
    
    default:
      return sorted;
  }
}

export default {
  CABIN_CLASS_ENUM,
  FLIGHT_SOURCES_ENUM,
  formatFlightSegment,
  transformFlightFromAmadeus,
  parseDurationToMinutes,
  formatDuration,
  filterFlights,
  sortFlights
};
