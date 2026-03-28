// ============================================
// TIPOS BASE DEL PROYECTO - TRAVEL AGENCY
// ============================================

// ============================================
// USER TYPES
// ============================================

export enum USER_ROLES {
  ADMIN = 'admin',
  AGENT = 'agent',
  USER = 'user',
  GUEST = 'guest'
}

export enum USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone?: string;
  role: USER_ROLES;
  status: USER_STATUS;
  avatar?: string;
  documentId?: string;
  documentType?: string;
  birthDate?: string;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserCreate {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone?: string;
  role?: USER_ROLES;
  documentId?: string;
  documentType?: string;
  birthDate?: string;
  nationality?: string;
}

export interface IUserUpdate {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  documentId?: string;
  documentType?: string;
  birthDate?: string;
  nationality?: string;
  status?: USER_STATUS;
  role?: USER_ROLES;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken?: string;
}

// ============================================
// FLIGHT TYPES
// ============================================

export enum CABIN_CLASS {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export enum FLIGHT_SOURCES {
  AMADEUS = 'amadeus',
  KIWI = 'kiwi',
  DIRECT = 'direct'
}

export enum FLIGHT_STATUS {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  SOLD_OUT = 'sold_out',
  CANCELLED = 'cancelled'
}

export interface IFlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
}

export interface IFlightPrice {
  currency: string;
  total: string;
  base: string;
  fees: string;
  taxes: string;
}

export interface IFlight {
  id: string;
  source: FLIGHT_SOURCES;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: CABIN_CLASS;
  price: IFlightPrice;
  seatsAvailable?: number;
  status: FLIGHT_STATUS;
  segments: IFlightSegment[];
  returnFlight?: IFlight;
  createdAt: string;
  updatedAt: string;
}

export interface IFlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: CABIN_CLASS;
  nonStop?: boolean;
  maxPrice?: number;
}

export interface IFlightSearchResponse {
  flights: IFlight[];
  totalResults: number;
  page: number;
  pageSize: number;
}

// ============================================
// HOTEL TYPES
// ============================================

export enum HOTEL_SOURCES {
  AMADEUS = 'amadeus',
  EXPEDIA = 'expedia',
  DIRECT = 'direct'
}

export interface IHotelAddress {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IHotelAmenity {
  code: string;
  name: string;
  description?: string;
}

export interface IHotelImage {
  url: string;
  category?: string;
  description?: string;
}

export interface IHotelRoom {
  id: string;
  name: string;
  description?: string;
  guests: number;
  beds: string;
  price: {
    currency: string;
    total: string;
    base: string;
    taxes: string;
  };
  amenities: string[];
  cancellationPolicy?: string;
  refundable?: boolean;
}

export interface IHotel {
  id: string;
  name: string;
  description?: string;
  source: HOTEL_SOURCES;
  chainCode?: string;
  hotelId?: string;
  address: IHotelAddress;
  rating?: number;
  amenities: IHotelAmenity[];
  images: IHotelImage[];
  rooms: IHotelRoom[];
  distance?: {
    value: number;
    unit: string;
  };
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IHotelSearchParams {
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

export interface IHotelSearchResponse {
  hotels: IHotel[];
  totalResults: number;
  page: number;
  pageSize: number;
}

// ============================================
// BOOKING TYPES
// ============================================

export enum BOOKING_TYPES {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  PACKAGE = 'package',
  TRANSFER = 'transfer',
  CAR = 'car',
  ACTIVITY = 'activity'
}

export enum BOOKING_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface IPassenger {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  nationality?: string;
}

export interface IBookingItem {
  type: BOOKING_TYPES;
  itemId: string;
  details: Record<string, unknown>;
  price: {
    currency: string;
    total: number;
    base: number;
    taxes: number;
  };
}

export interface IBooking {
  id: string;
  reference: string;
  userId?: string;
  passengers: IPassenger[];
  items: IBookingItem[];
  totalPrice: {
    currency: string;
    total: number;
    base: number;
    taxes: number;
  };
  status: BOOKING_STATUS;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBookingCreate {
  userId?: string;
  passengers: IPassenger[];
  items: IBookingItem[];
  notes?: string;
}

export interface IBookingUpdate {
  status?: BOOKING_STATUS;
  notes?: string;
  passengers?: IPassenger[];
}

// ============================================
// PAYMENT TYPES
// ============================================

export enum PAYMENT_METHODS {
  CARD = 'card',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash'
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface IPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PAYMENT_METHODS;
  status: PAYMENT_STATUS;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentCreate {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PAYMENT_METHODS;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface IPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// ============================================
// AIRPORT TYPES
// ============================================

export interface IAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  type?: 'international' | 'domestic' | 'regional';
}

export interface IAirportSearchParams {
  query?: string;
  city?: string;
  country?: string;
  type?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// TRANSFER TYPES
// ============================================

export enum TRANSFER_TYPES {
  AIRPORT_PICKUP = 'airport_pickup',
  AIRPORT_DROPOFF = 'airport_dropoff',
  POINT_TO_POINT = 'point_to_point',
  HOURLY = 'hourly'
}

export enum TRANSFER_VEHICLE_TYPES {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  LIMOUSINE = 'limousine',
  BUS = 'bus'
}

export interface ITransfer {
  id: string;
  type: TRANSFER_TYPES;
  vehicleType: TRANSFER_VEHICLE_TYPES;
  pickupLocation: {
    type: 'airport' | 'address';
    code?: string;
    address?: string;
  };
  dropoffLocation: {
    type: 'airport' | 'address';
    code?: string;
    address?: string;
  };
  pickupDateTime: string;
  passengers: number;
  luggage: number;
  price: {
    currency: string;
    total: number;
    base: number;
    taxes: number;
  };
  status: 'available' | 'unavailable' | 'booked';
  provider?: string;
}

// ============================================
// BLOG TYPES
// ============================================

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DESTINATION TYPES
// ============================================

export interface IDestination {
  id: string;
  name: string;
  country: string;
  description?: string;
  image?: string;
  rating?: number;
  popularFlights?: number;
  hotelsCount?: number;
  attractions?: string[];
}
