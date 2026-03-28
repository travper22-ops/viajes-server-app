// ============================================
// SERVICIO DE AMADEUS - HOTELES
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { CacheService } from './cache.js';
import { amadeusRequest } from './amadeus-token-manager.js';

// ============================================
// INTERFACES
// ============================================

export interface SearchHotelParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  roomQuantity?: number;
  ratings?: number[];
  priceRange?: { min: number; max: number };
  currency?: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  chainCode?: string;
  rating: number;
  description?: string;
  amenities?: string[];
  address?: Record<string, unknown>;
  location?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  images?: Array<{ url: string; category: string }>;
  rooms: HotelRoom[];
  offers?: unknown[];
  totalPrice: number;
  currency: string;
  nights: number;
}

export interface HotelRoom {
  id: string;
  roomType: string;
  bedType: string;
  beds: number;
  description?: string;
  guests: { adults: number };
  price: {
    total: number;
    currency: string;
    base: number;
    taxes: number;
  };
  pricePerNight: number;
  policies?: Record<string, unknown>;
  cancellation?: Record<string, unknown>;
}

export interface SearchResult {
  success: boolean;
  data: HotelOffer[];
  meta?: Record<string, unknown>;
  error?: string;
  isMock?: boolean;
  dictionaries?: Record<string, unknown>;
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Buscar hoteles usando Amadeus - SIN CACHÉ temporalmente
 */
export async function searchHotels(params: SearchHotelParams): Promise<SearchResult> {
  // Temporalmente sin caché para evitar errores
  try {
    return await searchHotelsInternal(params);
  } catch (error) {
    console.error('❌ Error en búsqueda de hoteles:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Buscar hoteles usando Amadeus (interno)
 */
async function searchHotelsInternal(params: SearchHotelParams): Promise<SearchResult> {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults,
    roomQuantity = 1,
    ratings = [],
    priceRange,
    currency = 'EUR'
  } = params;

  if (!cityCode || !checkInDate || !checkOutDate) {
    throw new Error('Parámetros requeridos: cityCode, checkInDate, checkOutDate');
  }

  console.log('🔍 Buscando hoteles con Amadeus:', { cityCode, checkInDate, checkOutDate, adults });

  try {
    // ── PASO 1: obtener lista de hotelIds por ciudad ──────────────────────
    const listQs = new URLSearchParams({
      cityCode: cityCode.toUpperCase(),
      radius: '20',
      radiusUnit: 'KM',
      hotelSource: 'ALL',
    });
    if (ratings.length > 0) listQs.set('ratings', ratings.join(','));

    const listResp = await amadeusRequest<any>(
      `/v1/reference-data/locations/hotels/by-city?${listQs}`
    );

    const hotelIds: string[] = (listResp.data || [])
      .slice(0, 20)
      .map((h: any) => h.hotelId)
      .filter(Boolean);

    if (hotelIds.length === 0) {
      console.warn('⚠️ No se encontraron hoteles para la ciudad, usando mock');
      return { success: true, data: getMockHotels(params), isMock: true };
    }

    // ── PASO 2: obtener ofertas para esos hotelIds ────────────────────────
    const offersQs = new URLSearchParams({
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults: String(adults || 1),
      roomQuantity: String(roomQuantity),
      currency,
      bestRateOnly: 'true',
    });
    if (priceRange) {
      offersQs.set('priceRange', `${priceRange.min}-${priceRange.max}`);
    }

    const offersResp = await amadeusRequest<any>(
      `/v3/shopping/hotel-offers?${offersQs}`
    );

    const hotels = transformHotelOffers(offersResp.data || [], { checkInDate, checkOutDate });

    return {
      success: true,
      data: hotels,
      meta: { count: hotels.length },
      isMock: false
    };

  } catch (error) {
    console.error('❌ Error en API de Amadeus (hoteles):', error);
    // Fallback a mock para que el frontend siempre tenga datos
    console.warn('⚠️ Usando datos mock como fallback');
    return {
      success: true,
      data: getMockHotels(params),
      isMock: true
    };
  }
}

/**
 * Obtener detalles de un hotel específico
 */
export async function getHotelDetails(
  hotelId: string, 
  params: Record<string, unknown> = {}
): Promise<SearchResult> {
  const { checkInDate, checkOutDate, adults } = params;

  const amadeus = getAmadeus();

  // Si Amadeus no está configurado, devolver error
  if (!amadeus) {
    return {
      success: false,
      error: 'Amadeus no configurado. Configure las credenciales en .env',
      data: []
    };
  }

  // Verificar si el SDK tiene hotelOffers disponible
  if (!(amadeus as any).shopping || !(amadeus as any).shopping.hotelOffers) {
    console.warn('⚠️ Amadeus SDK no tiene hotelOffers disponible');
    return {
      success: false,
      error: 'API de hoteles de Amadeus no disponible en este entorno de pruebas',
      data: []
    };
  }

  try {
    const response = await (amadeus as any).shopping.hotelOffers.get({
      hotelIds: hotelId,
      checkInDate,
      checkOutDate,
      adults: adults || 1,
      currency: 'EUR',
      language: 'ES'
    });

    return {
      success: true,
      data: response.data ? [response.data[0]] : [],
      dictionaries: response.dictionaries || {}
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error obteniendo detalles del hotel:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      data: []
    };
  }
}

/**
 * Buscar hoteles por geolocalización
 */
export async function searchHotelsByGeolocation(
  params: Record<string, unknown>
): Promise<SearchResult> {
  const { latitude, longitude, radius = 5, checkInDate, checkOutDate, adults } = params;

  if (!latitude || !longitude) {
    return {
      success: false,
      error: 'Se requieren latitude y longitude',
      data: []
    };
  }

  const amadeus = getAmadeus();

  if (!amadeus) {
    return {
      success: true,
      data: getMockHotels(params as unknown as SearchHotelParams),
      meta: { count: 3 }
    };
  }

  try {
    const response = await (amadeus as any).shopping.hotelOffersByGeocode.get({
      latitude,
      longitude,
      radius,
      checkInDate,
      checkOutDate,
      adults: adults || 1,
      currency: 'EUR',
      language: 'ES'
    });

    const hotels = transformHotelOffers(response.data as Array<Record<string, unknown>> || [], {
      checkInDate: checkInDate as string,
      checkOutDate: checkOutDate as string
    });

    return {
      success: true,
      data: hotels,
      meta: { count: hotels.length }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en búsqueda por geolocalización:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      data: []
    };
  }
}

/**
 * Reservar hotel
 */
export async function bookHotel(
  hotelOfferId: string, 
  guestDetails: unknown, 
  paymentInfo: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const response = await (amadeus as any).booking.hotelBookings.post({
      data: {
        offerId: hotelOfferId,
        guests: guestDetails,
        payments: [paymentInfo]
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error reservando hotel:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ============================================
// FUNCIONES DE TRANSFORMACIÓN
// ============================================

/**
 * Transformar ofertas de hotel al formato de la aplicación
 */
function transformHotelOffers(
  offers: Array<Record<string, unknown>>, 
  params: Record<string, string> = {}
): HotelOffer[] {
  const { checkInDate, checkOutDate } = params;
  
  const checkIn = new Date(checkInDate || '');
  const checkOut = new Date(checkOutDate || '');
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  return offers.map((offer: Record<string, unknown>) => {
    const hotel = (offer.hotel as Record<string, unknown>) || {};
    const firstOffer = ((offer.offers as Array<Record<string, unknown>>)?.[0])?.price as Record<string, unknown> || {};
    
    return {
      id: (hotel.hotelId as string) || (offer.hotelId as string) || '',
      name: (hotel.name as string) || 'Hotel sin nombre',
      chainCode: hotel.chainCode as string | undefined,
      rating: (hotel.rating as number) || 4,
      description: hotel.description as string | undefined,
      amenities: hotel.amenities as string[] | undefined,
      address: hotel.address as Record<string, unknown> | undefined,
      location: hotel.geoCode as Record<string, unknown> | undefined,
      contact: hotel.contact as Record<string, unknown> | undefined,
      images: hotel.images as Array<{ url: string; category: string }> | undefined,
      rooms: ((offer.offers as Array<Record<string, unknown>>) || []).map((room: Record<string, unknown>) => {
        const roomPrice = (room.price as Record<string, unknown>) || {};
        return {
          id: room.id as string || '',
          roomType: ((room.room as Record<string, unknown>)?.type as string) || 'STANDARD',
          bedType: (((room.room as Record<string, unknown>)?.typeEstimated as Record<string, unknown>)?.bedType as string) || 'DOUBLE',
          beds: (((room.room as Record<string, unknown>)?.typeEstimated as Record<string, unknown>)?.beds as number) || 1,
          description: room.description as string | undefined,
          guests: room.guests as { adults: number } || { adults: 2 },
          price: {
            total: parseFloat((roomPrice.total as string) || '0'),
            currency: (roomPrice.currency as string) || 'EUR',
            base: parseFloat((roomPrice.base as string) || '0'),
            taxes: parseFloat(((roomPrice.taxes as Array<Record<string, unknown>>)?.[0]?.amount as string) || '0')
          },
          pricePerNight: parseFloat((roomPrice.total as string) || '0') / nights,
          policies: room.policies as Record<string, unknown> | undefined,
          cancellation: (room.policies as Record<string, unknown>)?.cancellation as Record<string, unknown> | undefined
        };
      }),
      offers: (offer.offers as Array<Record<string, unknown>>) || [],
      totalPrice: parseFloat((firstOffer.total as string) || '0'),
      currency: (firstOffer.currency as string) || 'EUR',
      nights
    };
  });
}

// ============================================
// FUNCIONES ADICIONALES
// ============================================

/**
 * Confirmar precio de una oferta de hotel
 */
export async function confirmHotelPrice(offerId: string, guests: number, checkInDate: string, checkOutDate: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    console.warn('⚠️ Amadeus no configurado, simulando confirmación de precio de hotel');
    return {
      success: true,
      data: {
        price: { total: '120.00', currency: 'EUR' },
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    };
  }

  try {
    const response = await (amadeus as any).shopping.hotelOffersByHotel.get({
      hotelId: offerId,
      checkInDate,
      checkOutDate,
      adults: guests,
      roomQuantity: 1
    });

    return {
      success: true,
      data: {
        price: response.data.offers[0].price,
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error confirmando precio de hotel:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Crear booking de hotel (v2 - Hotel Orders)
 * API: POST /booking/hotel-orders
 */
export async function createHotelBooking(
  offerId: string,
  guests: any[],
  checkInDate: string,
  checkOutDate: string,
  paymentInfo?: {
    vendorCode: string;
    cardNumber: string;
    expiryDate: string;
    holderName: string;
    securityCode?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    console.warn('⚠️ Amadeus no configurado, simulando booking de hotel');
    return {
      success: true,
      data: {
        id: `HOTEL-BOOKING-${Date.now()}`,
        type: 'hotel-order',
        bookingStatus: 'CONFIRMED',
        hotel: { name: 'Mock Hotel' },
        guests: guests.length,
        checkInDate,
        checkOutDate
      }
    };
  }

  try {
    // Build guests array with tid for room association
    const guestsWithTid = guests.map((guest, index) => ({
      tid: index + 1,
      ...guest
    }));

    // Build payment info
    const payment = paymentInfo ? {
      method: 'CREDIT_CARD' as const,
      paymentCard: {
        paymentCardInfo: {
          vendorCode: paymentInfo.vendorCode,
          cardNumber: paymentInfo.cardNumber,
          expiryDate: paymentInfo.expiryDate,
          holderName: paymentInfo.holderName,
          ...(paymentInfo.securityCode && { securityCode: paymentInfo.securityCode })
        }
      }
    } : {
      method: 'CREDIT_CARD' as const,
      paymentCard: {
        paymentCardInfo: {
          vendorCode: 'VI',
          cardNumber: '4151289722471370',
          expiryDate: '2026-08',
          holderName: 'BOB SMITH'
        }
      }
    };

    const response = await (amadeus as any).booking.hotelOrders.post({
      data: {
        type: 'hotel-order',
        guests: guestsWithTid,
        roomAssociations: [
          {
            guestReferences: guests.map((_, index) => ({
              guestReference: String(index + 1)
            })),
            hotelOfferId: offerId
          }
        ],
        payment
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error creando booking de hotel:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// DATOS MOCK
// ============================================

/**
 * Datos mock para desarrollo
 */
function getMockHotels(params: SearchHotelParams): HotelOffer[] {
  const { cityCode = 'MAD', checkInDate, checkOutDate } = params;
  
  const cityNames: Record<string, string> = {
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
    'PAR': 'París',
    'LON': 'Londres',
    'ROM': 'Roma',
    'AMS': 'Ámsterdam',
    'BER': 'Berlín',
    'MIA': 'Miami',
    'NYC': 'Nueva York'
  };

  const city = cityNames[cityCode as string] || 'Ciudad';
  
  const nights = checkInDate && checkOutDate 
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) 
    : 1;

  const mockHotels: HotelOffer[] = [
    {
      id: `HTL-${cityCode}-001`,
      name: `Gran Hotel ${city}`,
      chainCode: 'GH',
      rating: 5,
      description: `Hotel de lujo en el centro de ${city}`,
      amenities: ['WIFI', 'POOL', 'SPA', 'GYM', 'RESTAURANT', 'PARKING', 'BAR', 'ROOM_SERVICE'],
      address: {
        lines: [`Calle Principal ${Math.floor(Math.random() * 100)}`],
        cityName: city,
        countryCode: (cityCode as string).substring(0, 2),
        postalCode: '28001'
      },
      location: {
        latitude: 40.4168 + (Math.random() - 0.5) * 0.1,
        longitude: -3.7038 + (Math.random() - 0.5) * 0.1
      },
      images: [
        { url: '/img/about-02.jpg', category: 'EXTERIOR' },
        { url: '/img/about-03.jpg', category: 'ROOM' }
      ],
      rooms: [
        {
          id: 'ROOM-001',
          roomType: 'DELUXE',
          bedType: 'DOUBLE',
          beds: 1,
          guests: { adults: 2 },
          price: { total: 250, currency: 'EUR', base: 200, taxes: 50 },
          pricePerNight: 250,
          policies: { checkInTime: '15:00', checkOutTime: '11:00' },
          cancellation: { freeCancellation: true, deadline: '2025-12-31' }
        },
        {
          id: 'ROOM-002',
          roomType: 'STANDARD',
          bedType: 'TWIN',
          beds: 2,
          guests: { adults: 2 },
          price: { total: 150, currency: 'EUR', base: 120, taxes: 30 },
          pricePerNight: 150,
          policies: { checkInTime: '14:00', checkOutTime: '12:00' },
          cancellation: { freeCancellation: true, deadline: '2025-12-30' }
        }
      ],
      totalPrice: 250,
      currency: 'EUR',
      nights
    },
    {
      id: `HTL-${cityCode}-002`,
      name: `Hotel Boutique ${city}`,
      chainCode: 'HB',
      rating: 4,
      description: `Hotel boutique con encanto en ${city}`,
      amenities: ['WIFI', 'BREAKFAST', 'BAR', 'CONCIERGE'],
      address: {
        lines: [`Calle del Arte ${Math.floor(Math.random() * 50)}`],
        cityName: city,
        countryCode: (cityCode as string).substring(0, 2),
        postalCode: '28002'
      },
      location: {
        latitude: 40.4168 + (Math.random() - 0.5) * 0.1,
        longitude: -3.7038 + (Math.random() - 0.5) * 0.1
      },
      images: [
        { url: '/img/about-04.jpg', category: 'EXTERIOR' }
      ],
      rooms: [
        {
          id: 'ROOM-003',
          roomType: 'STANDARD',
          bedType: 'DOUBLE',
          beds: 1,
          guests: { adults: 2 },
          price: { total: 120, currency: 'EUR', base: 100, taxes: 20 },
          pricePerNight: 120,
          policies: { checkInTime: '14:00', checkOutTime: '12:00' },
          cancellation: { freeCancellation: false }
        }
      ],
      totalPrice: 120,
      currency: 'EUR',
      nights
    },
    {
      id: `HTL-${cityCode}-003`,
      name: `Hostal Centro ${city}`,
      chainCode: 'HC',
      rating: 3,
      description: `Hostal económico en el centro de ${city}`,
      amenities: ['WIFI', 'BREAKFAST'],
      address: {
        lines: ['Calle Mayor 10'],
        cityName: city,
        countryCode: (cityCode as string).substring(0, 2),
        postalCode: '28003'
      },
      location: {
        latitude: 40.4168,
        longitude: -3.7038
      },
      images: [],
      rooms: [
        {
          id: 'ROOM-004',
          roomType: 'STANDARD',
          bedType: 'TWIN',
          beds: 2,
          guests: { adults: 1 },
          price: { total: 50, currency: 'EUR', base: 45, taxes: 5 },
          pricePerNight: 50,
          policies: { checkInTime: '12:00', checkOutTime: '10:00' },
          cancellation: { freeCancellation: false }
        }
      ],
      totalPrice: 50,
      currency: 'EUR',
      nights
    }
  ];

  return mockHotels;
}

export default {
  searchHotels,
  getHotelDetails,
  searchHotelsByGeolocation,
  confirmHotelPrice,
  bookHotel
};
