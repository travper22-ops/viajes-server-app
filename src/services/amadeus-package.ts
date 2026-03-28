// @ts-nocheck
// ============================================
// SERVICIO DE PAQUETES TURÍSTICOS (Vuelo + Hotel)
// ============================================

import { searchFlights } from './amadeus.js';
import { searchHotels } from './amadeus-hotel.js';

// ============================================
// INTERFACES
// ============================================

export interface SearchPackageParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children?: number;
  infants?: number;
  checkIn: string;
  checkOut: string;
  rooms?: number;
}

export interface PackageSearchResult {
  success: boolean;
  data: PackageOffer[];
  meta?: {
    flightsCount: number;
    hotelsCount: number;
    packageType: string;
  };
  isMock?: boolean;
  error?: string;
}

export interface PackageOffer {
  id: string;
  type: 'package';
  flight: FlightData;
  hotel: HotelData;
  totalPrice: {
    amount: number;
    currency: string;
  };
  savings?: {
    amount: number;
    percentage: number;
  };
}

interface FlightData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  outboundFlights: any[];
  returnFlights: any[];
  price: {
    total: string;
    currency: string;
  };
}

interface HotelData {
  hotelId: string;
  name: string;
  city: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rooms: RoomData[];
  price: {
    total: string;
    currency: string;
  };
}

interface RoomData {
  id: string;
  name: string;
  description: string;
  guests: number;
  bedType: string;
  pricePerNight: number;
  amenities: string[];
}

// ============================================
// MAPA DE CIUDADES A CÓDIGOS IATA
// ============================================

const CITY_CODE_MAP: Record<string, string> = {
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'paris': 'PAR',
  'london': 'LON',
  'rome': 'ROM',
  'amsterdam': 'AMS',
  'berlin': 'BER',
  'miami': 'MIA',
  'new york': 'NYC',
  'new york city': 'NYC',
  'tokio': 'TYO',
  'tokyo': 'TYO',
  'lima': 'LIM',
  'bogota': 'BOG',
  'bogotá': 'BOG',
  'santiago': 'SCL',
  'quito': 'UIO',
  'caracas': 'CCS',
  'mexico': 'MEX',
  'mexico city': 'MEX',
  'buenos aires': 'EZE',
  'rio': 'GIG',
  'rio de janeiro': 'GIG',
  'lisboa': 'LIS',
  'munich': 'MUC',
  'frankfurt': 'FRA',
  'viena': 'VIE',
  'praga': 'PRG',
  'dubai': 'DXB',
  'toronto': 'YYZ',
  'vancouver': 'YVR',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'orlando': 'MCO',
  'havana': 'HAV',
  'la habana': 'HAV',
};

// ============================================
// FUNCIONES
// ============================================

/**
 * Convert city name to IATA code
 */
function getCityCode(city: string): string {
  const normalizedCity = city.toLowerCase().trim();
  return CITY_CODE_MAP[normalizedCity] || city.toUpperCase();
}

/**
 * Calculate nights between dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Buscar paquetes turísticos (vuelo + hotel)
 */
export async function searchPackages(params: SearchPackageParams): Promise<PackageSearchResult> {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      checkIn,
      checkOut,
      rooms = 1
    } = params;

    console.log('🔍 Buscando paquetes:', {
      origin,
      destination,
      departureDate,
      returnDate,
      checkIn,
      checkOut,
      adults
    });

    // Convertir códigos de ciudad
    const originCode = getCityCode(origin);
    const destCode = getCityCode(destination);

    // Buscar vuelos de ida y vuelta en paralelo
    const [outboundResult, returnResult] = await Promise.all([
      // Vuelo de ida
      searchFlights({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate,
        adults,
        children,
        infants,
        max: 5
      }),
      // Vuelo de vuelta
      searchFlights({
        originLocationCode: destCode,
        destinationLocationCode: originCode,
        departureDate: returnDate,
        adults,
        children,
        infants,
        max: 5
      })
    ]);

    // Buscar hoteles (si falla, continuamos con solo vuelos)
    let hotelResult = { data: [], meta: {}, isMock: false };
    
    try {
      hotelResult = await searchHotels({
        cityCode: destCode,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        roomQuantity: rooms
      });
    } catch (hotelError) {
      console.warn('⚠️ Error buscando hoteles, continuando con solo vuelos:', hotelError);
    }

    const nights = calculateNights(checkIn, checkOut);
    const packages: PackageOffer[] = [];

    // Si tenemos vuelos de ida, vuelos de vuelta y hoteles
    if (outboundResult.data && returnResult.data && hotelResult.data) {
      const outboundFlights = Array.isArray(outboundResult.data) ? outboundResult.data.slice(0, 3) : [];
      const returnFlights = Array.isArray(returnResult.data) ? returnResult.data.slice(0, 3) : [];
      const hotels = Array.isArray(hotelResult.data) ? hotelResult.data.slice(0, 6) : [];

      // Combinar cada vuelo de ida con cada vuelo de vuelta y hotel
      for (const outbound of outboundFlights) {
        for (const retFlight of returnFlights) {
          for (const hotel of hotels) {
            // Calcular precio total del paquete
            const flightPrice = parseFloat(outbound.price?.grandTotal || outbound.price?.total || '0');
            const returnPrice = parseFloat(retFlight.price?.grandTotal || retFlight.price?.total || '0');
            const hotelPrice = parseFloat(hotel.offers?.[0]?.price?.total || hotel.offers?.[0]?.price?.base || '0');

            const totalFlightPrice = flightPrice + returnPrice;
            const totalPackagePrice = totalFlightPrice + (hotelPrice * nights);

            // Calcular ahorro (suponemos 10% de descuento por paquete)
            const separatePrice = totalFlightPrice + (hotelPrice * nights * 1.1);
            const savings = separatePrice - totalPackagePrice;
            const savingsPercent = Math.round((savings / separatePrice) * 100);

            packages.push({
              id: `pkg-${outbound.id}-${hotel.hotelId}-${Date.now()}`,
              type: 'package',
              flight: {
                origin: originCode,
                destination: destCode,
                departureDate,
                returnDate,
                outboundFlights: [outbound],
                returnFlights: [retFlight],
                price: {
                  total: (totalFlightPrice).toFixed(2),
                  currency: outbound.price?.currency || 'EUR'
                }
              },
              hotel: {
                hotelId: hotel.hotelId || 'unknown',
                name: hotel.name || 'Hotel Desconocido',
                city: destination,
                rating: hotel.rating || 3,
                location: {
                  lat: hotel.latitude || 0,
                  lng: hotel.longitude || 0,
                  address: hotel.address || ''
                },
                rooms: hotel.offers?.map((room: any, idx: number) => ({
                  id: room.roomId || `room-${idx}`,
                  name: room.room || 'Habitación Estándar',
                  description: room.description || '',
                  guests: room.guests || adults,
                  bedType: room.bed || 'Double',
                  pricePerNight: parseFloat(room.price?.total || room.price?.base || '0') / nights,
                  amenities: room.amenities || []
                })) || [],
                price: {
                  total: (hotelPrice * nights).toFixed(2),
                  currency: hotel.offers?.[0]?.price?.currency || 'EUR'
                }
              },
              totalPrice: {
                amount: totalPackagePrice,
                currency: outbound.price?.currency || 'EUR'
              },
              savings: savings > 0 ? {
                amount: savings,
                percentage: savingsPercent
              } : undefined
            });
          }
        }
      }
    }

    // Ordenar por precio total
    packages.sort((a, b) => a.totalPrice.amount - b.totalPrice.amount);

    // Limitar a 20 paquetes
    const finalPackages = packages.slice(0, 20);

    return {
      success: true,
      data: finalPackages,
      meta: {
        flightsCount: Array.isArray(outboundResult.data) ? outboundResult.data.length : 0,
        hotelsCount: Array.isArray(hotelResult.data) ? hotelResult.data.length : 0,
        packageType: 'flight_hotel'
      },
      isMock: outboundResult.isMock || hotelResult.isMock
    };

  } catch (error) {
    console.error('❌ Error buscando paquetes:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Crear reserva de paquete
 */
export async function createPackageBooking(packageData: {
  packageId: string;
  passengers: any[];
  contact: {
    email: string;
    phone: string;
  };
  payment: any;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // En una implementación real, aquí se:
    // 1. Confirma el precio del vuelo
    // 2. Confirma la disponibilidad del hotel
    // 3. Crea la reserva en Amadeus
    // 4. Procesa el pago
    
    console.log('📦 Creando reserva de paquete:', packageData.packageId);

    // Simular reserva exitosa
    return {
      success: true,
      data: {
        bookingId: `PKG-${Date.now()}`,
        status: 'CONFIRMED',
        packageId: packageData.packageId,
        confirmationCode: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando reserva'
    };
  }
}

export default {
  searchPackages,
  createPackageBooking
};
