// ============================================
// MODELO DE HOTEL - TRAVEL AGENCY
// ============================================

import { IHotel, IHotelSearchParams, HOTEL_SOURCES } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

export const HOTEL_amenities = {
  // Habitación
  WIFI: { code: 'WIFI', name: 'WiFi', category: 'room' },
  AIR_CONDITIONING: { code: 'AIR_CONDITIONING', name: 'Aire Acondicionado', category: 'room' },
  TV: { code: 'TV', name: 'Televisión', category: 'room' },
  MINIBAR: { code: 'MINIBAR', name: 'Minibar', category: 'room' },
  SAFE: { code: 'SAFE', name: 'Caja Fuerte', category: 'room' },
  ROOM_SERVICE: { code: 'ROOM_SERVICE', name: 'Servicio de Habitación', category: 'room' },
  BALCONY: { code: 'BALCONY', name: 'Balcón', category: 'room' },
  
  // Baño
  PRIVATE_BATHROOM: { code: 'PRIVATE_BATHROOM', name: 'Baño Privado', category: 'bathroom' },
  HAIR_DRYER: { code: 'HAIR_DRYER', name: 'Secador de Pelo', category: 'bathroom' },
  TUB: { code: 'TUB', name: 'Bañera', category: 'bathroom' },
  SHOWER: { code: 'SHOWER', name: 'Ducha', category: 'bathroom' },
  
  // Servicios del hotel
  POOL: { code: 'POOL', name: 'Piscina', category: 'facility' },
  GYM: { code: 'GYM', name: 'Gimnasio', category: 'facility' },
  SPA: { code: 'SPA', name: 'Spa', category: 'facility' },
  RESTAURANT: { code: 'RESTAURANT', name: 'Restaurante', category: 'facility' },
  BAR: { code: 'BAR', name: 'Bar', category: 'facility' },
  PARKING: { code: 'PARKING', name: 'Estacionamiento', category: 'facility' },
  BEACH_ACCESS: { code: 'BEACH_ACCESS', name: 'Acceso a Playa', category: 'facility' },
  AIRPORT_SHUTTLE: { code: 'AIRPORT_SHUTTLE', name: 'Traslado al Aeropuerto', category: 'service' },
  CONCIERGE: { code: 'CONCIERGE', name: 'Conserjería', category: 'service' },
  LAUNDRY: { code: 'LAUNDRY', name: 'Lavandería', category: 'service' },
  BUSINESS_CENTER: { code: 'BUSINESS_CENTER', name: 'Centro de Negocios', category: 'service' },
  MEETING_ROOM: { code: 'MEETING_ROOM', name: 'Sala de Reuniones', category: 'service' },
  
  // Mascotas
  PET_FRIENDLY: { code: 'PET_FRIENDLY', name: 'Mascotas Permitidas', category: 'policy' },
  
  // Accesibilidad
  ACCESSIBLE: { code: 'ACCESSIBLE', name: 'Accesible para Minusválidos', category: 'accessibility' }
} as const;

// ============================================
// FUNCIONES DE TRANSFORMACIÓN (AMADEUS)
// ============================================

/**
 * Transforma un hotel de la API de Amadeus al formato de nuestra API
 */
export function transformHotelFromAmadeus(amadeusHotel: Record<string, unknown>, searchParams: IHotelSearchParams): IHotel {
  const hotel = amadeusHotel as Record<string, unknown>;
  
  // Extraer dirección
  const address = hotel.address as Record<string, unknown> || {};
  const geo = hotel.geo as Record<string, unknown> || {};
  
  // Extraer rating
  const rating = hotel.rating as number || 0;
  
  // Extraer amenities
  const amadeusAmenities = hotel.amenities as string[] || [];
  const amenities = amadeusAmenities.map((code: string) => {
    const amenityKey = Object.keys(HOTEL_amenities).find(
      key => HOTEL_amenities[key as keyof typeof HOTEL_amenities].code === code
    );
    return amenityKey 
      ? HOTEL_amenities[amenityKey as keyof typeof HOTEL_amenities]
      : { code, name: code, description: '' };
  });
  
  // Extraer imágenes
  const images = hotel.images as Array<Record<string, unknown>> || [];
  const hotelImages = images.map((img: Record<string, unknown>) => ({
    url: img.url as string || '',
    category: img.category as string || '',
    description: img.description as string || ''
  }));
  
  // Extraer habitaciones
  const rooms = hotel.rooms as Array<Record<string, unknown>> || [];
  const hotelRooms = rooms.map((room: Record<string, unknown>, index: number) => {
    const price = room.price as Record<string, unknown> || {};
    return {
      id: `${hotel.hotelId}-room-${index}`,
      name: room.name as string || 'Habitación Estándar',
      description: room.description as string || '',
      guests: room.guests as number || 2,
      beds: room.beds as string || '1 cama queen',
      price: {
        currency: price.currency as string || 'USD',
        total: price.total as string || '0',
        base: price.base as string || '0',
        taxes: price.taxes as string || '0'
      },
      amenities: room.amenities as string[] || [],
      cancellationPolicy: room.cancellationPolicy as string || '',
      refundable: room.refundable as boolean || false
    };
  });
  
  return {
    id: hotel.hotelId as string || `hotel-${Date.now()}`,
    name: hotel.name as string || 'Hotel Sin Nombre',
    description: hotel.description as string || '',
    source: HOTEL_SOURCES.AMADEUS,
    chainCode: hotel.chainCode as string,
    hotelId: hotel.hotelId as string,
    address: {
      street: address.streetAddress as string,
      city: address.cityName as string || searchParams.city,
      state: address.stateCode as string,
      country: address.countryCode as string || 'XX',
      postalCode: address.postalCode as string,
      latitude: geo.latitude as number,
      longitude: geo.longitude as number
    },
    rating,
    amenities,
    images: hotelImages,
    rooms: hotelRooms,
    distance: hotel.distance as { value: number; unit: string } | undefined,
    latitude: geo.latitude as number,
    longitude: geo.longitude as number,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Filtra hoteles según criterios de búsqueda
 */
export function filterHotels(hotels: IHotel[], params: IHotelSearchParams): IHotel[] {
  let filtered = [...hotels];
  
  // Filtrar por precio mínimo
  if (params.minPrice) {
    filtered = filtered.filter(hotel => {
      const minRoomPrice = Math.min(...hotel.rooms.map(r => parseFloat(r.price.total)));
      return minRoomPrice >= params.minPrice!;
    });
  }
  
  // Filtrar por precio máximo
  if (params.maxPrice) {
    filtered = filtered.filter(hotel => {
      const minRoomPrice = Math.min(...hotel.rooms.map(r => parseFloat(r.price.total)));
      return minRoomPrice <= params.maxPrice!;
    });
  }
  
  // Filtrar por rating mínimo
  if (params.minRating) {
    filtered = filtered.filter(hotel => (hotel.rating || 0) >= params.minRating!);
  }
  
  // Filtrar por amenities
  if (params.amenities && params.amenities.length > 0) {
    filtered = filtered.filter(hotel => {
      const hotelAmenityCodes = hotel.amenities.map(a => a.code);
      return params.amenities!.every(a => hotelAmenityCodes.includes(a));
    });
  }
  
  return filtered;
}

/**
 * Ordena hoteles según criterio
 */
export function sortHotels(hotels: IHotel[], sortBy: string = 'price'): IHotel[] {
  const sorted = [...hotels];
  
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => {
        const priceA = Math.min(...a.rooms.map(r => parseFloat(r.price.total)));
        const priceB = Math.min(...b.rooms.map(r => parseFloat(r.price.total)));
        return priceA - priceB;
      });
    
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'distance':
      return sorted.sort((a, b) => (a.distance?.value || 999) - (b.distance?.value || 999));
    
    default:
      return sorted;
  }
}

export default {
  HOTEL_amenities,
  transformHotelFromAmadeus,
  filterHotels,
  sortHotels
};
