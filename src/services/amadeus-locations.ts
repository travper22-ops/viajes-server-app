// ============================================
// SERVICIO DE AMADEUS - UBICACIONES
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { CacheService } from './cache.js';

// ============================================
// INTERFACES
// ============================================

export interface LocationInfo {
  id: string;
  name: string;
  cityName: string;
  countryCode: string;
  iataCode: string;
  type: 'AIRPORT' | 'CITY' | 'BUS_STATION' | 'TRAIN_STATION';
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    line: string;
    zip: string;
    countryCode: string;
    cityName: string;
    stateCode?: string;
  };
}

export interface LocationSearchParams {
  keyword: string;
  subType?: string[];
  countryCode?: string;
  max?: number;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar ubicaciones (aeropuertos, ciudades, etc.) con caché inteligente
 */
export async function searchLocations(params: LocationSearchParams): Promise<{ success: boolean; data?: LocationInfo[]; error?: string }> {
  const cacheService = new CacheService('locations');

  const result = await cacheService.getOrFetch(
    params,
    async () => {
      const amadeus = getAmadeus();

      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock para ubicaciones');
        return {
          data: getMockLocations(params.keyword),
          totalResults: 5
        };
      }

      const amadeusParams: any = {
        keyword: params.keyword,
        subType: params.subType || ['AIRPORT', 'CITY'],
        'page[limit]': params.max || 10
      };

      if (params.countryCode) {
        amadeusParams.countryCode = params.countryCode;
      }

      const response = await (amadeus as any).referenceData.locations.get(amadeusParams);

      const locations = response.data.map((location: any) => ({
        id: location.id,
        name: location.name,
        cityName: location.address?.cityName || '',
        countryCode: location.address?.countryCode || '',
        iataCode: location.iataCode || '',
        type: location.subType,
        geoCode: location.geoCode,
        address: location.address
      }));

      return {
        data: locations,
        totalResults: locations.length
      };
    }
  );

  console.log(`📍 Búsqueda de ubicaciones completada - ${result.fromCache ? 'desde caché' : 'desde API'}`);

  return {
    success: true,
    data: result.data
  };
}

/**
 * Obtener detalles de una ubicación específica
 */
export async function getLocationDetails(locationId: string): Promise<{ success: boolean; data?: LocationInfo; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    console.warn('⚠️ Amadeus no configurado, devolviendo datos mock para ubicación');
    return {
      success: true,
      data: getMockLocationDetails(locationId)
    };
  }

  try {
    const response = await (amadeus as any).referenceData.location(locationId).get();

    const location = {
      id: response.data.id,
      name: response.data.name,
      cityName: response.data.address?.cityName || '',
      countryCode: response.data.address?.countryCode || '',
      iataCode: response.data.iataCode || '',
      type: response.data.subType,
      geoCode: response.data.geoCode,
      address: response.data.address
    };

    return {
      success: true,
      data: location
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error obteniendo detalles de ubicación:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ============================================
// DATOS MOCK
// ============================================

function getMockLocations(keyword: string): LocationInfo[] {
  const mockData = [
    {
      id: 'MAD',
      name: 'Adolfo Suarez Madrid-Barajas Airport',
      cityName: 'Madrid',
      countryCode: 'ES',
      iataCode: 'MAD',
      type: 'AIRPORT' as const,
      geoCode: { latitude: 40.471926, longitude: -3.56264 }
    },
    {
      id: 'BCN',
      name: 'Barcelona-El Prat Airport',
      cityName: 'Barcelona',
      countryCode: 'ES',
      iataCode: 'BCN',
      type: 'AIRPORT' as const,
      geoCode: { latitude: 41.297445, longitude: 2.0832945 }
    },
    {
      id: 'CDG',
      name: 'Charles de Gaulle Airport',
      cityName: 'Paris',
      countryCode: 'FR',
      iataCode: 'CDG',
      type: 'AIRPORT' as const,
      geoCode: { latitude: 49.009722, longitude: 2.547778 }
    }
  ];

  return mockData.filter(location =>
    location.name.toLowerCase().includes(keyword.toLowerCase()) ||
    location.cityName.toLowerCase().includes(keyword.toLowerCase()) ||
    location.iataCode.toLowerCase().includes(keyword.toLowerCase())
  );
}

function getMockLocationDetails(locationId: string): LocationInfo {
  const locations = getMockLocations('');
  return locations.find(loc => loc.id === locationId) || locations[0];
}