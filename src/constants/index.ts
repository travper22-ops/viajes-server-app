// ============================================
// CONSTANTES DEL PROYECTO
// ============================================

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================

export const APP_CONFIG = {
  name: 'Travel Agency',
  version: '1.0.0',
  description: 'Plataforma de viajes - Vuelos, Hoteles, Reservas',
  author: 'Travel Agency Team',
  defaultLanguage: 'es',
  defaultCurrency: 'EUR',
  supportedLanguages: ['es', 'en', 'fr', 'de', 'it', 'pt'],
  supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF']
} as const;

// ============================================
// CÓDIGOS DE PAÍS
// ============================================

export const COUNTRIES = {
  SPAIN: 'ES',
  PORTUGAL: 'PT',
  FRANCE: 'FR',
  GERMANY: 'DE',
  ITALY: 'IT',
  UNITED_KINGDOM: 'GB',
  UNITED_STATES: 'US',
  CANADA: 'CA',
  JAPAN: 'JP',
  CHINA: 'CN',
  BRAZIL: 'BR',
  MEXICO: 'MX',
  ARGENTINA: 'AR',
  COLOMBIA: 'CO',
  CHILE: 'CL'
} as const;

// ============================================
// MONEDAS
// ============================================

export const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  USD: { symbol: '$', name: 'Dólar estadounidense', code: 'USD' },
  GBP: { symbol: '£', name: 'Libra esterlina', code: 'GBP' },
  CHF: { symbol: 'CHF', name: 'Franco suizo', code: 'CHF' },
  JPY: { symbol: '¥', name: 'Yen japonés', code: 'JPY' },
  CNY: { symbol: '¥', name: 'Yuan chino', code: 'CNY' }
} as const;

// ============================================
// CLASES DE VUELO
// ============================================

export const CABIN_CLASSES = {
  ECONOMY: { code: 'ECONOMY', name: 'Económica', abbr: 'Y' },
  PREMIUM_ECONOMY: { code: 'PREMIUM_ECONOMY', name: 'Económica Premium', abbr: 'W' },
  BUSINESS: { code: 'BUSINESS', name: 'Business', abbr: 'J' },
  FIRST: { code: 'FIRST', name: 'Primera Clase', abbr: 'F' }
} as const;

// ============================================
// ESTADOS DE RESERVA
// ============================================

export const BOOKING_STATUS = {
  PENDING: { code: 'pending', label: 'Pendiente', color: 'yellow' },
  CONFIRMED: { code: 'confirmed', label: 'Confirmada', color: 'green' },
  CANCELLED: { code: 'cancelled', label: 'Cancelada', color: 'red' },
  COMPLETED: { code: 'completed', label: 'Completada', color: 'blue' },
  REFUNDED: { code: 'refunded', label: 'Reembolsada', color: 'gray' },
  FAILED: { code: 'failed', label: 'Fallida', color: 'red' }
} as const;

// ============================================
// ESTADOS DE PAGO
// ============================================

export const PAYMENT_STATUS = {
  PENDING: { code: 'pending', label: 'Pendiente' },
  PROCESSING: { code: 'processing', label: 'Procesando' },
  SUCCEEDED: { code: 'succeeded', label: 'Completado' },
  FAILED: { code: 'failed', label: 'Fallido' },
  REFUNDED: { code: 'refunded', label: 'Reembolsado' },
  CANCELLED: { code: 'cancelled', label: 'Cancelado' }
} as const;

// ============================================
// MÉTODOS DE PAGO
// ============================================

export const PAYMENT_METHODS = {
  CARD: { code: 'card', name: 'Tarjeta de crédito/débito', provider: 'stripe' },
  PAYPAL: { code: 'paypal', name: 'PayPal', provider: 'paypal' },
  BANK_TRANSFER: { code: 'bank_transfer', name: 'Transferencia bancaria', provider: 'bank' },
  CASH: { code: 'cash', name: 'Efectivo', provider: 'cash' }
} as const;

// ============================================
// ROLES DE USUARIO
// ============================================

export const USER_ROLES = {
  ADMIN: { code: 'admin', name: 'Administrador', permissions: ['*'] },
  AGENT: { code: 'agent', name: 'Agente', permissions: ['read', 'write', 'bookings'] },
  USER: { code: 'user', name: 'Usuario', permissions: ['read', 'bookings'] },
  GUEST: { code: 'guest', name: 'Invitado', permissions: ['read'] }
} as const;

// ============================================
// LÍMITES DEL SISTEMA
// ============================================

export const LIMITS = {
  // Búsqueda
  MAX_PASSENGERS: 9,
  MAX_FLIGHT_RESULTS: 50,
  MAX_HOTEL_RESULTS: 50,
  MAX_ROOMS: 5,
  
  // Archivos
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Rate limiting
  RATE_LIMIT_GENERAL: 100,
  RATE_LIMIT_AUTH: 10,
  RATE_LIMIT_SEARCH: 30,
  RATE_LIMIT_PAYMENT: 10,
  
  // Sesión
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  TOKEN_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 días
} as const;

// ============================================
// MENSAJES DEL SISTEMA
// ============================================

export const MESSAGES = {
  // Éxito
  SUCCESS: {
    LOGIN: 'Sesión iniciada correctamente',
    REGISTER: 'Usuario registrado correctamente',
    BOOKING_CREATED: 'Reserva creada correctamente',
    BOOKING_CANCELLED: 'Reserva cancelada correctamente',
    PAYMENT_SUCCESS: 'Pago procesado correctamente',
    PROFILE_UPDATED: 'Perfil actualizado correctamente'
  },
  
  // Errores
  ERROR: {
    GENERIC: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION: 'Error de validación',
    PAYMENT_FAILED: 'Error al procesar el pago',
    NETWORK: 'Error de conexión. Por favor, verifica tu conexión a internet'
  },
  
  // Validación
  VALIDATION: {
    REQUIRED: 'Este campo es requerido',
    INVALID_EMAIL: 'Email inválido',
    INVALID_PHONE: 'Teléfono inválido',
    MIN_LENGTH: (min: number) => `Mínimo ${min} caracteres`,
    MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
    INVALID_DATE: 'Fecha inválida'
  }
} as const;

// ============================================
// URLs
// ============================================

export const URLS = {
  FRONTEND: process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN: process.env.ADMIN_URL || 'http://localhost:3001',
  API: process.env.API_URL || 'http://localhost:5000'
} as const;

export default {
  APP_CONFIG,
  COUNTRIES,
  CURRENCIES,
  CABIN_CLASSES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  LIMITS,
  MESSAGES,
  URLS
};
