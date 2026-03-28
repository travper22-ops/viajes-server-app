// @ts-nocheck
// ============================================
// SERVICIOS ADICIONALES DE AMADEUS
// Basado en: https://github.com/amadeus4dev/amadeus-node
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { CacheService } from './cache.js';

// ============================================
// INTERFACES
// ============================================

// Flight Destinations
export interface FlightDestination {
  id: string;
  type: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: {
    total: string;
    currency: string;
  };
}

export interface FlightDateSearch {
  origin: string;
  destination: string;
  departureDate: string;
}

// Airport & Locations
export interface AirportLocation {
  code: string;
  name: string;
  type: 'AIRPORT' | 'CITY' | 'BUS_STATION' | 'TRAIN_STATION';
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Points of Interest
export interface PointOfInterest {
  id: string;
  name: string;
  type: string;
  subType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance: {
    value: number;
    unit: string;
  };
}

// Tours & Activities
// Basado en: Tours and Activities API Swagger
export interface TourActivity {
  id: string;
  type?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  rating?: string;
  price?: {
    amount: string;
    currencyCode: string;
  };
  pictures?: string[];
  bookingLink?: string;
  minimumDuration?: string;
}

// Bounding box para búsqueda por área
export interface BoundingBox {
  north: number;
  west: number;
  south: number;
  east: number;
}

// Flight Status
export interface FlightStatus {
  flightNumber: string;
  departure: {
    airport: string;
    scheduledTime: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    scheduledTime: string;
    actualTime?: string;
    terminal?: string;
    gate?: string;
  };
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED' | 'DELAYED';
}

// Hotel Offer Details
export interface HotelOfferDetail {
  id: string;
  hotel: {
    id: string;
    name: string;
    chainCode?: string;
    rating?: number;
    description?: string;
    amenities?: string[];
    contact?: {
      phone?: string;
      email?: string;
    };
    address?: {
      lines?: string[];
      cityName?: string;
      countryCode?: string;
      postalCode?: string;
    };
  };
  offers: Array<{
    id: string;
    room: {
      type: string;
      typeEstimated?: {
        beds?: number;
        bedType?: string;
        category?: string;
      };
      description?: {
        text?: string;
      };
    };
    guests?: {
      adults: number;
    };
    price: {
      total: string;
      currency: string;
      base?: string;
      taxes?: Array<{
        amount: string;
        code?: string;
      }>;
    };
    policies?: {
      cancellation?: {
        deadline?: string;
        amount?: string;
        description?: string;
      };
      checkInTime?: string;
      checkOutTime?: string;
    };
    validity?: {
      start?: string;
      end?: string;
    };
  }>;
}

// Airport Routes - Basado en Airport Routes API

export interface AirportDestination {
  type?: string;
  subtype?: string;
  name: string;
  iataCode?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    cityName?: string;
    countryName?: string;
    countryCode?: string;
    stateCode?: string;
    regionCode?: string;
  };
  timeZone?: {
    offset?: string;
    referenceLocalDateTime?: string;
  };
  metrics?: {
    relevance?: number;
  };
}

/**
 * Obtener destinos directos desde un aeropuerto
 * API: GET /airport/direct-destinations
 */
export async function getAirportRoutes(params: {
  departureAirportCode: string;
  maxResults?: number;
  arrivalCountryCode?: string;
}): Promise<{ success: boolean; data?: AirportDestination[]; error?: string }> {
  const cacheService = new CacheService('airport-routes');
  
  const result = await cacheService.getOrFetch(
    { type: 'airport-routes', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).airport.directDestinations.get({
          departureAirportCode: params.departureAirportCode,
          ...(params.maxResults && { max: String(params.maxResults) }),
          ...(params.arrivalCountryCode && { arrivalCountryCode: params.arrivalCountryCode })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error obteniendo rutas de aeropuerto:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

// Flight Check-in Links - Basado en Flight Check-in Links API

export interface CheckinLink {
  type?: string;
  id?: string;
  href?: string;
  channel?: 'Mobile' | 'Web' | 'All';
}

/**
 * Obtener URLs de check-in de una aerolinea
 * API: GET /v2/reference-data/urls/checkin-links
 */
export async function getCheckinLinks(params: {
  airlineCode: string;
  language?: string;
}): Promise<{ success: boolean; data?: CheckinLink[]; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).referenceData.urls.checkinLinks.get(params);
    
    return {
      success: true,
      data: response.data || []
    };
  } catch (error: any) {
    console.error('Error obteniendo check-in links:', error.message);
    return { success: false, error: error.message };
  }
}

// Airline Code Lookup - Basado en Airline Code Lookup API

export interface AirlineInfo {
  type?: string;
  iataCode?: string;
  icaoCode?: string;
  businessName?: string;
  commonName?: string;
}

/**
 * Buscar información de aerolineas por código
 * API: GET /reference-data/airlines
 */
export async function getAirlines(airlineCodes: string): Promise<{ success: boolean; data?: AirlineInfo[]; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).referenceData.airlines.get({
      airlineCodes
    });
    
    return {
      success: true,
      data: response.data || []
    };
  } catch (error: any) {
    console.error('Error buscando aerolineas:', error.message);
    return { success: false, error: error.message };
  }
}

// Airline Routes - Basado en Airline Routes API Swagger

export interface AirlineDestination {
  type?: string;
  subtype?: string;
  name: string;
  iataCode?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    countryName?: string;
    countryCode?: string;
    stateCode?: string;
    regionCode?: string;
  };
  timeZone?: {
    offset?: string;
    referenceLocalDateTime?: string;
  };
  metrics?: {
    relevance?: number;
  };
}

/**
 * Obtener destinos de una aerolinea específica
 * API: GET /airline/destinations
 */
export async function getAirlineDestinations(params: {
  airlineCode: string;
  maxResults?: number;
  arrivalCountryCode?: string;
}): Promise<{ success: boolean; data?: AirlineDestination[]; error?: string }> {
  const cacheService = new CacheService('airline-routes');
  
  const result = await cacheService.getOrFetch(
    { type: 'airline-destinations', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).airline.destinations.get({
          airlineCode: params.airlineCode,
          ...(params.maxResults && { max: String(params.maxResults) }),
          ...(params.arrivalCountryCode && { arrivalCountryCode: params.arrivalCountryCode })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error obteniendo destinos de aerolinea:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

// Flight Offers Price - Basado en Flight Offers Price API Swagger

export interface FlightOfferPricingRequest {
  type: string;
  flightOffers: any[];
  travelers?: any[];
  payments?: any[];
}

export interface FlightPricingOptions {
  include?: ('credit-card-fees' | 'bags' | 'other-services' | 'detailed-fare-rules')[];
  forceClass?: boolean;
}

/**
 * Confirmar precio de vuelo (Flight Offers Price)
 * API: POST /shopping/flight-offers/pricing
 */
export async function priceFlightOffer(
  pricingRequest: FlightOfferPricingRequest,
  options?: FlightPricingOptions
): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const params: any = {
      ...pricingRequest,
      include: options?.include
    };
    
    const response = await (amadeus as any).shopping.flightOffers.pricing.post(params);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error priceando flight offer:', error.message);
    return { success: false, error: error.message };
  }
}

// City Search - Basado en City Search API Swagger
export interface CityLocation {
  type?: string;
  subType?: string;
  name: string;
  iataCode?: string;
  address?: {
    postalCode?: string;
    countryCode?: string;
    stateCode?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  relationships?: Array<{
    id: string;
    type: string;
    href?: string;
  }>;
}

export interface CitySearchResult {
  cities: CityLocation[];
  airports?: Record<string, CityLocation>;
}

/**
 * Buscar ciudades por keyword
 * API: GET /reference-data/locations/cities
 */
export async function searchCities(params: {
  keyword: string;
  countryCode?: string;
  maxResults?: number;
  includeAirports?: boolean;
}): Promise<{ success: boolean; data?: CitySearchResult; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'cities', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { cities: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.cities.get({
          keyword: params.keyword,
          ...(params.countryCode && { countryCode: params.countryCode }),
          ...(params.maxResults && { max: String(params.maxResults) }),
          ...(params.includeAirports && { include: 'AIRPORTS' })
        });
        
        const cities: CityLocation[] = (response.data || []).map((loc: any) => ({
          type: loc.type,
          subType: loc.subType,
          name: loc.name,
          iataCode: loc.iataCode,
          address: loc.address,
          geoCode: loc.geoCode,
          relationships: loc.relationships
        }));
        
        const airports = response.included?.airports;
        
        return {
          cities,
          airports,
          totalResults: cities.length
        };
      } catch (error: any) {
        console.error('Error buscando ciudades:', error.message);
        return { cities: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result
  };
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar destinos populares desde un origen
 * API: GET /shopping/flight-destinations
 */
export async function searchFlightDestinations(params: {
  origin: string;
  maxPrice?: number;
  maxResults?: number;
}): Promise<{ success: boolean; data?: FlightDestination[]; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'destinations', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).shopping.flightDestinations.get({
          origin: params.origin,
          ...(params.maxPrice && { maxPrice: String(params.maxPrice) }),
          ...(params.maxResults && { max: String(params.maxResults) })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando destinos:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Buscar fechas más económicas para un destino
 * API: GET /shopping/flight-dates
 */
export async function searchFlightDates(params: {
  origin: string;
  destination: string;
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'dates', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).shopping.flightDates.get({
          origin: params.origin,
          destination: params.destination
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando fechas:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Buscar aeropuertos y ciudades (autocomplete)
 * API: GET /reference-data/locations
 */
export async function searchAirportsAndCities(params: {
  keyword: string;
  type?: 'AIRPORT' | 'CITY' | 'ANY';
  countryCode?: string;
}): Promise<{ success: boolean; data?: AirportLocation[]; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'airports', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.get({
          keyword: params.keyword,
          subType: params.type || 'AIRPORT,CITY',
          ...(params.countryCode && { countryCode: params.countryCode })
        });
        
        const locations: AirportLocation[] = (response.data || []).map((loc: any) => ({
          code: loc.iataCode || loc.id,
          name: loc.name,
          type: loc.subType || 'AIRPORT',
          city: loc.address?.cityName || '',
          country: loc.address?.countryName || '',
          coordinates: loc.geoCode ? {
            latitude: loc.geoCode.latitude,
            longitude: loc.geoCode.longitude
          } : undefined
        }));
        
        return {
          data: locations,
          totalResults: locations.length
        };
      } catch (error: any) {
        console.error('Error buscando ubicaciones:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Buscar puntos de interés cerca de una ubicación
 * API: GET /reference-data/locations/points-of-interest
 */
export async function searchPointsOfInterest(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
}): Promise<{ success: boolean; data?: PointOfInterest[]; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'poi', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.pointsOfInterest.get({
          latitude: String(params.latitude),
          longitude: String(params.longitude),
          ...(params.radius && { radius: String(params.radius) }),
          ...(params.category && { category: params.category })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando POI:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Buscar tours y actividades
 * API: GET /shopping/activities
 */
export async function searchActivities(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  language?: string;
}): Promise<{ success: boolean; data?: TourActivity[]; error?: string }> {
  const cacheService = new CacheService('locations');
  
  const result = await cacheService.getOrFetch(
    { type: 'activities', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).shopping.activities.get({
          latitude: String(params.latitude),
          longitude: String(params.longitude),
          ...(params.radius && { radius: String(params.radius) }),
          language: params.language || 'es-ES'
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando actividades:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Obtener detalles de una actividad
 * API: GET /shopping/activities/{activityId}
 */
export async function getActivityDetails(activityId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).shopping.activity(activityId).get();
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error obteniendo actividad:', error.message);
    return { success: false, error: error.message };
  }
}

// Hotel Name Autocomplete - Basado en Hotel Name Autocomplete API Swagger
export interface HotelAutocompleteResult {
  id: number;
  name: string;
  iataCode: string;
  hotelIds: string[];
  subType: 'HOTEL_GDS' | 'HOTEL_LEISURE';
  address?: {
    cityName?: string;
    stateCode?: string;
    countryCode?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  relevance?: number;
}

// Hotel Name Autocomplete - Basado en Hotel Name Autocomplete API Swagger
export interface HotelAutocompleteResult {
  id: number;
  name: string;
  iataCode: string;
  hotelIds: string[];
  subType: 'HOTEL_GDS' | 'HOTEL_LEISURE';
  address?: {
    cityName?: string;
    stateCode?: string;
    countryCode?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  relevance?: number;
}

/**
 * Autocompletado de nombres de hoteles por keyword
 * API: GET /reference-data/locations/hotel
 */
export async function searchHotelNameAutocomplete(params: {
  keyword: string;
  subType: ('HOTEL_LEISURE' | 'HOTEL_GDS')[];
  countryCode?: string;
  language?: string;
  max?: number;
}): Promise<{ success: boolean; data?: HotelAutocompleteResult[]; error?: string }> {
  const cacheService = new CacheService('hotel-autocomplete');
  
  const result = await cacheService.getOrFetch(
    { type: 'hotel-autocomplete', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.hotel.get({
          keyword: params.keyword,
          subType: params.subType,
          ...(params.countryCode && { countryCode: params.countryCode }),
          ...(params.language && { lang: params.language }),
          ...(params.max && { max: params.max })
        });
        
        return {
          data: response.data || [],
          totalResults: response.data?.length || 0
        };
      } catch (error: any) {
        console.error('Error en autocompletado de hoteles:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

// Hotel Ratings - Basado en Hotel Ratings API Swagger
export interface HotelSentiment {
  hotelId: string;
  type?: string;
  overallRating: number;
  numberOfRatings: number;
  numberOfReviews: number;
  sentiments?: {
    sleepQuality?: number;
    service?: number;
    facilities?: number;
    roomComforts?: number;
    valueForMoney?: number;
    catering?: number;
    swimmingPool?: number;
    location?: number;
    internet?: number;
    pointsOfInterest?: number;
    staff?: number;
  };
}

// Hotel List by IDs - Basado en Hotel List API Swagger
export interface HotelListItem {
  chainCode?: string;
  iataCode?: string;
  dupeId?: number;
  name: string;
  hotelId: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    countryCode?: string;
  };
  distance?: {
    value?: number;
    unit?: string;
  };
}

/**
 * Buscar hoteles por IDs específicos
 * API: GET /reference-data/locations/hotels/by-hotels
 */
export async function searchHotelsByIds(params: {
  hotelIds: string[];
}): Promise<{ success: boolean; data?: HotelListItem[]; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).referenceData.locations.hotels.byHotels.get({
      hotelIds: params.hotelIds.join(',')
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error buscando hoteles por IDs:', error.message);
    return { success: false, error: error.message };
  }
}

// Hotel Search v3 - Basado en Hotel Search API Swagger (v3)
export interface HotelOffersSearchParams {
  hotelIds: string[];
  adults?: number;
  checkInDate?: string;
  checkOutDate?: string;
  countryOfResidence?: string;
  roomQuantity?: number;
  priceRange?: string;
  currency?: string;
  paymentPolicy?: 'GUARANTEE' | 'DEPOSIT' | 'NONE';
  boardType?: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';
  includeClosed?: boolean;
  bestRateOnly?: boolean;
  language?: string;
}

/**
 * Buscar ofertas de hoteles por IDs específicos (v3)
 * API: GET /shopping/hotel-offers
 */
export async function searchHotelOffersByIds(params: HotelOffersSearchParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).shopping.hotelOffers.get({
      hotelIds: params.hotelIds.join(','),
      ...(params.adults && { adults: params.adults }),
      ...(params.checkInDate && { checkInDate: params.checkInDate }),
      ...(params.checkOutDate && { checkOutDate: params.checkOutDate }),
      ...(params.countryOfResidence && { countryOfResidence: params.countryOfResidence }),
      ...(params.roomQuantity && { roomQuantity: params.roomQuantity }),
      ...(params.priceRange && { priceRange: params.priceRange }),
      ...(params.currency && { currency: params.currency }),
      ...(params.paymentPolicy && { paymentPolicy: params.paymentPolicy }),
      ...(params.boardType && { boardType: params.boardType }),
      ...(params.includeClosed !== undefined && { includeClosed: params.includeClosed }),
      ...(params.bestRateOnly !== undefined && { bestRateOnly: params.bestRateOnly }),
      ...(params.language && { lang: params.language })
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error buscando ofertas de hoteles:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener ratings/sentimientos de hoteles
 * API: GET /e-reputation/hotel-sentiments
 */
export async function getHotelRatings(params: {
  hotelIds: string[];
}): Promise<{ success: boolean; data?: HotelSentiment[]; warnings?: any[]; error?: string }> {
  const cacheService = new CacheService('hotel-ratings');
  
  const result = await cacheService.getOrFetch(
    { type: 'hotel-ratings', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).eReputation.hotelSentiments.get({
          hotelIds: params.hotelIds.join(',')
        });
        
        return {
          data: response.data || [],
          warnings: response.warnings || [],
          totalResults: response.data?.length || 0
        };
      } catch (error: any) {
        console.error('Error en ratings de hoteles:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data,
    warnings: result.warnings
  };
}

/**
 * Buscar hoteles en una ciudad (alternativa a hotelOffersSearch)
 * API: GET /reference-data/locations/hotels/by-city
 */
export async function searchHotelsByCity(params: {
  cityCode: string;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
  hotelSource?: 'ALL' | 'DIRECT' | 'AGGREGATOR';
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const cacheService = new CacheService('hotels');
  
  const result = await cacheService.getOrFetch(
    { type: 'hotels-by-city', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.hotels.byCity.get({
          cityCode: params.cityCode,
          ...(params.radius && { radius: String(params.radius) }),
          ...(params.radiusUnit && { radiusUnit: params.radiusUnit }),
          ...(params.hotelSource && { hotelSource: params.hotelSource })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando hoteles:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Buscar hoteles por geolocalización
 * API: GET /reference-data/locations/hotels/by-geocode
 */
export async function searchHotelsByGeocode(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const cacheService = new CacheService('hotels');
  
  const result = await cacheService.getOrFetch(
    { type: 'hotels-by-geocode', ...params },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        return { data: [], totalResults: 0 };
      }
      
      try {
        const response = await (amadeus as any).referenceData.locations.hotels.byGeocode.get({
          latitude: String(params.latitude),
          longitude: String(params.longitude),
          ...(params.radius && { radius: String(params.radius) }),
          ...(params.radiusUnit && { radiusUnit: params.radiusUnit })
        });
        
        return {
          data: response.data || [],
          totalResults: response.meta?.count || 0
        };
      } catch (error: any) {
        console.error('Error buscando hoteles:', error.message);
        return { data: [], totalResults: 0 };
      }
    }
  );
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Obtener detalles de hotel
 * API: GET /shopping/hotel-offers/{offerId}
 */
export async function getHotelOfferDetails(offerId: string): Promise<{ success: boolean; data?: HotelOfferDetail; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).shopping.hotelOfferSearch(offerId).get();
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error obteniendo oferta de hotel:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener estado de un vuelo
 * API: GET /schedule/flights
 */
export async function getFlightStatus(params: {
  carrierCode: string;
  flightNumber: string;
  scheduledDepartureDate: string;
}): Promise<{ success: boolean; data?: FlightStatus[]; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).schedule.flights.get({
      carrierCode: params.carrierCode,
      flightNumber: params.flightNumber,
      scheduledDepartureDate: params.scheduledDepartureDate
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error obteniendo estado de vuelo:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Predicción de propósito de viaje (Business/Leisure)
 * API: GET /travel/predictions/trip-purpose
 */
export async function predictTripPurpose(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).travel.predictions.tripPurpose.get(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error prediciendo propósito:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// TRAVEL RECOMMENDATIONS API
// ============================================

export interface RecommendedLocation {
  type: string;
  subtype: string;
  name: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  relevance: number;
}

/**
 * Obtener destinos recomendados basados en ciudad de origen
 * API: GET /reference-data/recommended-locations
 */
export async function getRecommendedDestinations(params: {
  cityCodes: string;
  travelerCountryCode?: string;
  destinationCountryCodes?: string;
}): Promise<{ success: boolean; data?: RecommendedLocation[]; error?: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }
  
  try {
    const response = await (amadeus as any).referenceData.recommendedLocations.get(params);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error obteniendo destinos recomendados:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// EXPORTS
// ============================================

// ============================================
// AIRPORT NEAREST RELEVANT - API 04
// GET /v1/reference-data/locations/airports
// ============================================

export async function getNearestAirports(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  pageLimit?: number;
  pageOffset?: number;
  sort?: 'relevance' | 'distance' | 'analytics.flights.score' | 'analytics.travelers.score';
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const queryParams: Record<string, string> = {
      latitude: String(params.latitude),
      longitude: String(params.longitude),
    };
    if (params.radius !== undefined) queryParams.radius = String(params.radius);
    if (params.pageLimit !== undefined) queryParams['page[limit]'] = String(params.pageLimit);
    if (params.pageOffset !== undefined) queryParams['page[offset]'] = String(params.pageOffset);
    if (params.sort) queryParams.sort = params.sort;

    const response = await (amadeus as any).referenceData.locations.airports.get(queryParams);

    return { success: true, data: response.data || [] };
  } catch (error: any) {
    console.error('Error obteniendo aeropuertos cercanos:', error.message);
    return { success: false, error: error.message };
  }
}

export default {
  searchFlightDestinations,
  searchFlightDates,
  searchAirportsAndCities,
  searchPointsOfInterest,
  searchActivities,
  getActivityDetails,
  searchHotelsByCity,
  searchHotelsByGeocode,
  searchHotelNameAutocomplete,
  searchHotelsByIds,
  getHotelRatings,
  getHotelOfferDetails,
  getFlightStatus,
  predictTripPurpose,
  getRecommendedDestinations,
  searchHotelOffersByIds,
  getNearestAirports
};
