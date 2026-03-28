// ============================================
// EXPORTADORES DE MODELOS - TRAVEL AGENCY
// ============================================

// Modelos en TypeScript
export * from './User.js';
export * from './Flight.js';
export * from './Hotel.js';
export * from './Booking.js';
export * from './Payment.js';
export * from './Airport.js';

// Re-exportar tipos
export type { 
  IUser, 
  IUserCreate, 
  IUserUpdate, 
  IAuthResponse,
  USER_ROLES, 
  USER_STATUS 
} from '../types/index.js';

export type { 
  IFlight, 
  IFlightSegment, 
  IFlightPrice, 
  IFlightSearchParams, 
  IFlightSearchResponse,
  CABIN_CLASS, 
  FLIGHT_SOURCES,
  FLIGHT_STATUS
} from '../types/index.js';

export type { 
  IHotel, 
  IHotelAddress, 
  IHotelAmenity, 
  IHotelImage, 
  IHotelRoom,
  IHotelSearchParams, 
  IHotelSearchResponse,
  HOTEL_SOURCES
} from '../types/index.js';

export type { 
  IBooking, 
  IBookingItem, 
  IBookingCreate, 
  IBookingUpdate,
  IPassenger,
  BOOKING_TYPES, 
  BOOKING_STATUS
} from '../types/index.js';

export type { 
  IPayment, 
  IPaymentCreate, 
  IPaymentIntent,
  PAYMENT_METHODS, 
  PAYMENT_STATUS
} from '../types/index.js';

export type { 
  IAirport, 
  IAirportSearchParams 
} from '../types/index.js';
