// ============================================
// SERVICIO DE AMADEUS - AIRPORT NEAREST RELEVANT API
// ============================================
// Basado en: https://test.api.amadeus.com/v1/reference-data/locations/airports
// Version: 1.1.2

import { getAmadeus } from '../config/amadeus.js';
import { seatMapsCache } from './cache.js';

// ============================================
// INTERFACES DEL SWAGGER - AIRPORT NEAREST
// ============================================

// GeoCode - Coordenadas geográficas
export interface GeoCode {
  latitude: number;
  longitude: number;
}

// Address - Dirección del aeropuerto
export interface Address {
  cityName?: string;
  cityCode?: string;
  countryName?: string;
  countryCode?: string;
  stateCode?: string;
  regionCode?: string;
}

// Distance - Distancia desde el punto de búsqueda
export interface Distance {
  value?: number;
  unit?: 'KM' | 'MI';
}

// Flights - Información de vuelos
export interface Flights {
  score?: number;
}

// Travelers - Información de viajeros
export interface Travelers {
  score?: number;
}

// Analytics - Análisis del aeropuerto
export interface Analytics {
  flights?: Flights;
  travelers?: Travelers;
}

// Location - Información del aeropuerto
export interface Location {
  type?: string;
  subType?: 'AIRPORT' | 'CITY' | 'POINT_OF_INTEREST' | 'DISTRICT';
  name?: string;
  detailedName?: string;
  timeZoneOffset?: string;
  iataCode?: string;
  geoCode?: GeoCode;
  address?: Address;
  distance?: Distance;
  analytics?: Analytics;
  relevance?: number;
}

// Collection_Meta - Metadatos de la colección
export interface Collection_Meta {
  count?: number;
  links?: {
    self?: string;
    next?: string;
    previous?: string;
    last?: string;
    first?: string;
    up?: string;
  };
}

// Issue - Información de error
export interface Issue {
  status?: number;
  code?: number;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
    example?: string;
  };
}

// Error response
export interface ErrorResponse {
  errors?: Issue[];
}

// ============================================
// INTERFACES DE PETICIÓN/RESPUESTA
// ============================================

export interface AirportNearestRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  pageLimit?: number;
  pageOffset?: number;
  sort?: 'relevance' | 'distance' | 'analytics.flights.score' | 'analytics.travelers.score';
}

export interface AirportNearestResponse {
  success: boolean;
  data?: Location[];
  meta?: Collection_Meta;
  error?: string;
}

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

/**
 * Obtener los aeropuertos más relevantes cerca de una ubicación
 * Endpoint: GET /reference-data/locations/airports
 */
export async function getNearestAirports(
  latitude: number,
  longitude: number,
  options?: {
    radius?: number;
    pageLimit?: number;
    pageOffset?: number;
    sort?: 'relevance' | 'distance' | 'analytics.flights.score' | 'analytics.travelers.score';
  }
): Promise<AirportNearestResponse> {
  const cacheKey = { 
    type: 'airports_nearest', 
    latitude, 
    longitude, 
    ...options 
  };
  
  const result = await seatMapsCache.getOrFetch(
    cacheKey,
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock');
        return {
          data: getMockAirports(latitude, longitude),
          totalResults: 10
        };
      }

      try {
        const params: Record<string, string> = {
          latitude: latitude.toString(),
          longitude: longitude.toString()
        };
        
        if (options?.radius) {
          params.radius = options.radius.toString();
        }
        if (options?.pageLimit) {
          params['page[limit]'] = options.pageLimit.toString();
        }
        if (options?.pageOffset) {
          params['page[offset]'] = options.pageOffset.toString();
        }
        if (options?.sort) {
          params.sort = options.sort;
        }

        const response = await (amadeus as any).referenceData.locations.airports.get(params);
        
        console.log(`✈️ Nearest Airports - Obtenidos desde API para: ${latitude},${longitude}`);
        return {
          data: response.data,
          totalResults: Array.isArray(response.data) ? response.data.length : 1
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`❌ Error obteniendo aeropuertos cercanos: ${errorMessage}`);
        
        return {
          data: getMockAirports(latitude, longitude),
          totalResults: 10
        };
      }
    }
  );

  const meta: Collection_Meta = { count: result.totalResults || (result.data as Location[])?.length || 0 };
  return { success: true, data: result.data as Location[], meta };
}

// ============================================
// DATOS MOCK
// ============================================

function getMockAirports(lat: number, lng: number): Location[] {
  // Aeropuertos cercanos a Londres (ejemplo)
  const airports: Location[] = [
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'HEATHROW',
      detailedName: 'LONDON/GB:HEATHROW',
      timeZoneOffset: '+01:00',
      iataCode: 'LHR',
      geoCode: { latitude: 51.47294, longitude: -0.45061 },
      address: {
        cityName: 'LONDON',
        cityCode: 'LON',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 11, unit: 'KM' },
      analytics: { flights: { score: 39 }, travelers: { score: 45 } },
      relevance: 350.54587
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'GATWICK',
      detailedName: 'LONDON/GB:GATWICK',
      timeZoneOffset: '+01:00',
      iataCode: 'LGW',
      geoCode: { latitude: 51.15609, longitude: -0.17818 },
      address: {
        cityName: 'LONDON',
        cityCode: 'LON',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 49, unit: 'KM' },
      analytics: { flights: { score: 27 }, travelers: { score: 27 } },
      relevance: 53.62667
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'LUTON',
      detailedName: 'LONDON/GB:LUTON',
      timeZoneOffset: '+01:00',
      iataCode: 'LTN',
      geoCode: { latitude: 51.87472, longitude: -0.36833 },
      address: {
        cityName: 'LONDON',
        cityCode: 'LON',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 33, unit: 'KM' },
      analytics: { flights: { score: 11 }, travelers: { score: 10 } },
      relevance: 33.10184
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'STANSTED',
      detailedName: 'LONDON/GB:STANSTED',
      timeZoneOffset: '+01:00',
      iataCode: 'STN',
      geoCode: { latitude: 51.885, longitude: 0.235 },
      address: {
        cityName: 'LONDON',
        cityCode: 'LON',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 58, unit: 'KM' },
      analytics: { flights: { score: 16 }, travelers: { score: 15 } },
      relevance: 27.50241
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'CITY AIRPORT',
      detailedName: 'LONDON/GB:CITY AIRPORT',
      timeZoneOffset: '+01:00',
      iataCode: 'LCY',
      geoCode: { latitude: 51.50528, longitude: 0.05528 },
      address: {
        cityName: 'LONDON',
        cityCode: 'LON',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 35, unit: 'KM' },
      analytics: { flights: { score: 8 }, travelers: { score: 4 } },
      relevance: 21.78754
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'BIRMINGHAM',
      detailedName: 'BIRMINGHAM/GB:BIRMINGHAM',
      timeZoneOffset: '+01:00',
      iataCode: 'BHX',
      geoCode: { latitude: 52.45386, longitude: -1.74803 },
      address: {
        cityName: 'BIRMINGHAM',
        cityCode: 'BHX',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 132, unit: 'KM' },
      analytics: { flights: { score: 10 }, travelers: { score: 8 } },
      relevance: 7.73356
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'MANCHESTER AIRPORT',
      detailedName: 'MANCHESTER/GB:MANCHESTER AIRPO',
      timeZoneOffset: '+01:00',
      iataCode: 'MAN',
      geoCode: { latitude: 53.35374, longitude: -2.27495 },
      address: {
        cityName: 'MANCHESTER',
        cityCode: 'MAN',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 233, unit: 'KM' },
      analytics: { flights: { score: 18 }, travelers: { score: 17 } },
      relevance: 7.71084
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'SOUTHAMPTON',
      detailedName: 'SOUTHAMPTON/GB',
      timeZoneOffset: '+01:00',
      iataCode: 'SOU',
      geoCode: { latitude: 50.95026, longitude: -1.3568 },
      address: {
        cityName: 'SOUTHAMPTON',
        cityCode: 'SOU',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 94, unit: 'KM' },
      analytics: { flights: { score: 4 }, travelers: { score: 2 } },
      relevance: 4.4788
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'BRISTOL',
      detailedName: 'BRISTOL/GB:BRISTOL',
      timeZoneOffset: '+01:00',
      iataCode: 'BRS',
      geoCode: { latitude: 51.38267, longitude: -2.71909 },
      address: {
        cityName: 'BRISTOL',
        cityCode: 'BRS',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 159, unit: 'KM' },
      analytics: { flights: { score: 7 }, travelers: { score: 5 } },
      relevance: 4.08617
    },
    {
      type: 'location',
      subType: 'AIRPORT',
      name: 'EAST MIDLANDS',
      detailedName: 'NOTTINGHAM/GB:EAST MIDLANDS',
      timeZoneOffset: '+01:00',
      iataCode: 'EMA',
      geoCode: { latitude: 52.83111, longitude: -1.32806 },
      address: {
        cityName: 'NOTTINGHAM',
        cityCode: 'NQT',
        countryName: 'UNITED KINGDOM',
        countryCode: 'GB',
        regionCode: 'EUROP'
      },
      distance: { value: 152, unit: 'KM' },
      analytics: { flights: { score: 4 }, travelers: { score: 3 } },
      relevance: 2.66099
    }
  ];

  return airports;
}

export default {
  getNearestAirports
};
