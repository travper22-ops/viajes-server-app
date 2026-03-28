// ============================================
// CONTROLADOR DE HOTELES
// ============================================

import { Request, Response } from 'express';
import { searchHotels, getHotelDetails, confirmHotelPrice as confirmHotelPriceService, createHotelBooking as createHotelBookingService } from '../services/amadeus-hotel.js';
import { getSupabaseAdmin } from '../config/supabase.js';

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera datos mock de hotel basado en el ID
 */
function generateMockHotelById(hotelId: string) {
  // Map de hoteles mock basados en el ID
  const mockHotelsData: Record<string, any> = {
    'HTL-MAD-001': {
      id: 'HTL-MAD-001',
      name: 'Gran Hotel Madrid',
      chainCode: 'GH',
      rating: 5,
      description: 'Hotel de lujo en el centro de Madrid con vistas spectaculares',
      amenities: ['WIFI', 'POOL', 'SPA', 'GYM', 'RESTAURANT', 'PARKING', 'BAR', 'ROOM_SERVICE'],
      address: { lines: ['Calle Principal 66'], cityName: 'Madrid', countryCode: 'ES', postalCode: '28001' },
      location: { latitude: 40.403831035193356, longitude: -3.694107683660747 },
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
          pricePerNight: 250
        },
        {
          id: 'ROOM-002',
          roomType: 'STANDARD',
          bedType: 'TWIN',
          beds: 2,
          guests: { adults: 2 },
          price: { total: 150, currency: 'EUR', base: 120, taxes: 30 },
          pricePerNight: 150
        }
      ]
    },
    'HTL-MAD-002': {
      id: 'HTL-MAD-002',
      name: 'Hotel Boutique Madrid',
      chainCode: 'HB',
      rating: 4,
      description: 'Hotel boutique con encanto en Madrid',
      amenities: ['WIFI', 'BREAKFAST', 'BAR', 'CONCIERGE'],
      address: { lines: ['Calle del Arte 32'], cityName: 'Madrid', countryCode: 'ES', postalCode: '28002' },
      location: { latitude: 40.40912838527903, longitude: -3.7196417865673936 },
      images: [{ url: '/img/about-04.jpg', category: 'EXTERIOR' }],
      rooms: [
        {
          id: 'ROOM-003',
          roomType: 'STANDARD',
          bedType: 'DOUBLE',
          beds: 1,
          guests: { adults: 2 },
          price: { total: 120, currency: 'EUR', base: 100, taxes: 20 },
          pricePerNight: 120
        }
      ]
    },
    'HTL-MAD-003': {
      id: 'HTL-MAD-003',
      name: 'Hostal Centro Madrid',
      chainCode: 'HC',
      rating: 3,
      description: 'Hostal económico en el centro de Madrid',
      amenities: ['WIFI', 'BREAKFAST'],
      address: { lines: ['Calle Mayor 10'], cityName: 'Madrid', countryCode: 'ES', postalCode: '28003' },
      location: { latitude: 40.4168, longitude: -3.7038 },
      images: [],
      rooms: [
        {
          id: 'ROOM-004',
          roomType: 'STANDARD',
          bedType: 'TWIN',
          beds: 2,
          guests: { adults: 1 },
          price: { total: 50, currency: 'EUR', base: 45, taxes: 5 },
          pricePerNight: 50
        }
      ]
    }
  };

  // Buscar el hotel por ID o generar uno genérico
  if (mockHotelsData[hotelId]) {
    return mockHotelsData[hotelId];
  }

  // Si el ID no existe, generar un hotel genérico
  return {
    id: hotelId,
    name: 'Hotel ' + hotelId,
    rating: 4,
    description: 'Hotel de calidad en Madrid',
    amenities: ['WIFI', 'BREAKFAST', 'PARKING'],
    address: { lines: ['Centro'], cityName: 'Madrid', countryCode: 'ES', postalCode: '28001' },
    location: { latitude: 40.4168, longitude: -3.7038 },
    images: [{ url: '/img/about-01.jpg', category: 'EXTERIOR' }],
    rooms: [
      {
        id: 'room-default',
        roomType: 'STANDARD',
        bedType: 'DOUBLE',
        beds: 1,
        guests: { adults: 2 },
        price: { total: 100, currency: 'EUR', base: 80, taxes: 20 },
        pricePerNight: 100
      }
    ]
  };
}

// ============================================
// INTERFACES
// ============================================

export interface HotelSearchQuery {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Buscar hoteles
 */
export async function searchHotelOffers(req: Request, res: Response): Promise<void> {
  try {
    const {
      city,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      minPrice,
      maxPrice,
      minRating,
      amenities
    } = req.query as Record<string, string>;

    if (!city || !checkIn || !checkOut) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Parámetros requeridos: city, checkIn, checkOut'
        }
      });
      return;
    }

    // Convertir código de ciudad a código IATA
    const cityCodeMap: Record<string, string> = {
      'madrid': 'MAD',
      'barcelona': 'BCN',
      'paris': 'PAR',
      'london': 'LON',
      'rome': 'ROM',
      'amsterdam': 'AMS',
      'berlin': 'BER',
      'miami': 'MIA',
      'new york': 'NYC',
      'tokyo': 'TYO'
    };

    const cityCode = cityCodeMap[city.toLowerCase()] || city.toUpperCase();

    const result = await searchHotels({
      cityCode,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: parseInt(guests as string, 10),
      roomQuantity: parseInt(rooms as string, 10),
      priceRange: minPrice || maxPrice ? {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : 10000
      } : undefined,
      ratings: minRating ? [parseFloat(minRating)] : undefined
    });

    res.json({
      success: true,
      data: result.data || [],
      meta: result.meta,
      isMock: result.isMock
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error searching hotels:', errorMessage);
    res.status(500).json({
      success: false,
      error: {
        code: 'HOTEL_SEARCH_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Obtener detalles de un hotel
 */
export async function getHotelById(req: Request, res: Response): Promise<void> {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, guests } = req.query as Record<string, string>;

    if (!hotelId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requiere el ID del hotel'
        }
      });
      return;
    }

    // Intentar obtener detalles del hotel desde Amadeus
    const result = await getHotelDetails(hotelId, {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: guests ? parseInt(guests, 10) : 2
    });

    // Si Amadeus no tiene los detalles, buscar en la lista de resultados guardados
    // y devolver datos mock basados en el ID
    if (!result.success) {
      // Devolver un hotel mock basado en el ID
      const mockHotels = generateMockHotelById(hotelId);
      if (mockHotels) {
        res.json({
          success: true,
          data: mockHotels
        });
        return;
      }
      
      res.status(404).json({
        success: false,
        error: {
          code: 'HOTEL_NOT_FOUND',
          message: result.error || 'Hotel no encontrado'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.data?.[0] || null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'HOTEL_DETAILS_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Confirmar precio de hotel
 */
export async function confirmHotelPrice(req: Request, res: Response): Promise<void> {
  try {
    const { offerId, guests, checkInDate, checkOutDate } = req.body;

    if (!offerId || !guests || !checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requieren offerId, guests, checkInDate, checkOutDate'
        }
      });
      return;
    }

    const result = await confirmHotelPriceService(offerId, guests, checkInDate, checkOutDate);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HOTEL_PRICE_ERROR',
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
        code: 'HOTEL_PRICE_ERROR',
        message: errorMessage
      }
    });
  }
}

/**
 * Reservar hotel
 */
export async function createHotelBooking(req: Request, res: Response): Promise<void> {
  try {
    const { offerId, guests, contact, payment, checkInDate, checkOutDate, userId, hotelName, hotelId, totalPrice, currency } = req.body;

    if (!offerId || !guests || !contact || !checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Se requieren offerId, guests, contact, checkInDate, checkOutDate'
        }
      });
      return;
    }

    const result = await createHotelBookingService(offerId, guests, checkInDate, checkOutDate);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HOTEL_BOOKING_ERROR',
          message: result.error || 'Error creando reserva'
        }
      });
      return;
    }

    // Extraer datos de confirmación de Amadeus
    const confirmationNumber = result.data?.associatedRecords?.[0]?.reference || result.data?.confirmationNumber;
    const amadeusBookingId = result.data?.id;

    // Guardar en la base de datos
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error: insertError } = await supabase
          .from('hotel_reservations')
          .insert({
            amadeus_offer_id: offerId,
            amadeus_booking_id: amadeusBookingId,
            confirmation_number: confirmationNumber,
            hotel_name: hotelName || 'Hotel',
            amadeus_hotel_id: hotelId,
            check_in: checkInDate,
            check_out: checkOutDate,
            nights: Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
            total_price: totalPrice || result.data?.price?.total,
            currency: currency || 'EUR',
            guest_data: guests,
            status: 'CONFIRMED',
            confirmed_at: new Date().toISOString()
          });

        if (insertError) {
          console.warn('⚠️ No se pudo guardar en hotel_reservations:', insertError.message);
        }
      } catch (dbError) {
        console.warn('⚠️ Error guardando datos del hotel:', dbError);
      }
    }

    res.json({
      success: true,
      data: {
        ...result.data,
        confirmationNumber,
        amadeusBookingId
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: {
        code: 'HOTEL_BOOKING_ERROR',
        message: errorMessage
      }
    });
  }
}

export default {
  searchHotelOffers,
  getHotelById,
  confirmHotelPrice,
  createHotelBooking
};
