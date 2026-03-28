/**
 * API Utilities - Conexión con el Backend
 * 
 * Esta utilidad maneja todas las llamadas al servidor backend.
 * Maneja autenticación, errores y respuestas automáticamente.
 */

import type { 
  FlightSearchParams, 
  FlightOffer, 
  Traveler, 
  FlightContact,
  HotelSearchParams,
  HotelOffer,
  HotelRoom,
  HotelDetail,
  Booking,
  BookingListResponse,
  Airport,
  User,
  PaymentIntent,
  ApiError
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// ============================================
// Helper: Obtener token del usuario
// ============================================
const getAuthToken = (): string | null => {
  const userStr = localStorage.getItem('user') || '{}';
  try {
    const user = JSON.parse(userStr);
    return user.access_token || user.token || null;
  } catch {
    return null;
  }
};

// ============================================
// Helper: Headers para requests
// ============================================
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============================================
// Helper: Manejar respuesta
// ============================================
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json() as T & ApiError;
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la solicitud');
  }
  
  return data;
};

// ============================================
// API: Aeropuertos
// ============================================
export const airportsApi = {
  // Autocompletado de aeropuertos
  autocomplete: async (query: string): Promise<{ airports: Airport[] }> => {
    const response = await fetch(
      `${API_URL}/api/v1/airports/autocomplete?q=${encodeURIComponent(query)}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  },
  
  // Obtener aeropuerto por código
  getByCode: async (code: string): Promise<Airport> => {
    const response = await fetch(
      `${API_URL}/api/v1/airports/${code}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  }
};

// ============================================
// API: Vuelos
// ============================================
export const flightsApi = {
  // Buscar vuelos
  search: async (params: FlightSearchParams): Promise<{ flights: FlightOffer[] }> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(
      `${API_URL}/api/v1/flights/search?${queryString}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  },
  
  // Confirmar precio
  confirmPrice: async (flightOffers: FlightOffer[]): Promise<{ flights: FlightOffer[] }> => {
    const response = await fetch(
      `${API_URL}/api/v1/flights/price`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ flightOffers })
      }
    );
    return handleResponse(response);
  },
  
  // Crear reserva
  createOrder: async (
    flightOffers: FlightOffer[], 
    travelers: Traveler[], 
    contact: FlightContact
  ): Promise<{ orderId: string; confirmationCode: string }> => {
    const response = await fetch(
      `${API_URL}/api/v1/flights/orders`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ flightOffers, travelers, contact })
      }
    );
    return handleResponse(response);
  }
};

// ============================================
// API: Hoteles
// ============================================
export const hotelsApi = {
  // Buscar hoteles
  search: async (params: HotelSearchParams): Promise<{ hotels: HotelOffer[] }> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(
      `${API_URL}/api/v1/hotels/search?${queryString}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  },
  
  // Obtener detalle
  getById: async (id: string): Promise<HotelDetail> => {
    const response = await fetch(
      `${API_URL}/api/v1/hotels/${id}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  },
  
  // Obtener habitaciones
  getRooms: async (id: string, params: HotelSearchParams): Promise<{ rooms: HotelRoom[] }> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(
      `${API_URL}/api/v1/hotels/${id}/rooms?${queryString}`,
      { headers: getHeaders(false) }
    );
    return handleResponse(response);
  },
  
  // Reservar habitación
  book: async (bookingData: any): Promise<{ booking: Booking; confirmationCode: string }> => {
    const response = await fetch(
      `${API_URL}/api/v1/hotels/book`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData)
      }
    );
    return handleResponse(response);
  }
};

// ============================================
// API: Autenticación
// ============================================
export const authApi = {
  // Registrar usuario
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/register`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData)
      }
    );
    return handleResponse(response);
  },
  
  // Iniciar sesión
  login: async (email: string, password: string): Promise<{ user: User; access_token: string }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password })
      }
    );
    return handleResponse(response);
  },
  
  // Cerrar sesión
  logout: async (): Promise<{ success: boolean }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/logout`,
      {
        method: 'POST',
        headers: getHeaders()
      }
    );
    return handleResponse(response);
  },
  
  // Obtener usuario actual
  me: async (): Promise<{ user: User }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/me`,
      { headers: getHeaders() }
    );
    return handleResponse(response);
  },
  
  // Solicitar recuperación de contraseña
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/forgot-password`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email })
      }
    );
    return handleResponse(response);
  },
  
  // Restablecer contraseña
  resetPassword: async (password: string, accessToken: string): Promise<{ success: boolean }> => {
    const response = await fetch(
      `${API_URL}/api/v1/auth/reset-password`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ password, accessToken })
      }
    );
    return handleResponse(response);
  }
};

// ============================================
// API: Reservas
// ============================================
export const bookingsApi = {
  // Listar reservas
  list: async (params: Record<string, any> = {}): Promise<BookingListResponse> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_URL}/api/v1/bookings?${queryString}`,
      { headers: getHeaders() }
    );
    return handleResponse(response);
  },
  
  // Obtener reserva por ID
  getById: async (id: string): Promise<{ booking: Booking }> => {
    const response = await fetch(
      `${API_URL}/api/v1/bookings/${id}`,
      { headers: getHeaders() }
    );
    return handleResponse(response);
  },
  
  // Actualizar reserva
  update: async (id: string, data: Partial<Booking>): Promise<{ booking: Booking }> => {
    const response = await fetch(
      `${API_URL}/api/v1/bookings/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return handleResponse(response);
  },
  
  // Cancelar reserva
  cancel: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(
      `${API_URL}/api/v1/bookings/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders()
      }
    );
    return handleResponse(response);
  }
};

// ============================================
// API: Pagos
// ============================================
export const paymentApi = {
  // Crear PaymentIntent
  createIntent: async (
    amount: number, 
    bookingId?: string, 
    description?: string, 
    customerEmail?: string
  ): Promise<{ paymentIntent: PaymentIntent }> => {
    const response = await fetch(
      `${API_URL}/api/v1/payment/create-intent`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount,
          bookingId,
          description,
          customerEmail
        })
      }
    );
    return handleResponse(response);
  },
  
  // Confirmar pago
  confirm: async (paymentIntentId: string): Promise<{ success: boolean }> => {
    const response = await fetch(
      `${API_URL}/api/v1/payment/confirm`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ paymentIntentId })
      }
    );
    return handleResponse(response);
  },
  
  // Obtener estado del pago
  getStatus: async (paymentIntentId: string): Promise<{ paymentIntent: PaymentIntent }> => {
    const response = await fetch(
      `${API_URL}/api/v1/payment/${paymentIntentId}`,
      { headers: getHeaders() }
    );
    return handleResponse(response);
  },
  
  // Reembolso
  refund: async (
    paymentId: string, 
    amount?: number, 
    reason?: string
  ): Promise<{ success: boolean }> => {
    const response = await fetch(
      `${API_URL}/api/v1/payment/refund`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ paymentId, amount, reason })
      }
    );
    return handleResponse(response);
  }
};

// ============================================
// Export default
// ============================================
export default {
  airports: airportsApi,
  flights: flightsApi,
  hotels: hotelsApi,
  auth: authApi,
  bookings: bookingsApi,
  payment: paymentApi
};
