// @ts-nocheck
// ============================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ============================================

import { z } from 'zod';

// ============================================
// ESQUEMAS COMUNES
// ============================================

/**
 * Esquema para UUID
 */
export const uuidSchema = z.string().uuid('ID inválido');

/**
 * Esquema para email
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .min(1, 'Email es requerido');

/**
 * Esquema para teléfono
 */
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s-]{10,20}$/, 'Teléfono inválido');

/**
 * Esquema para fecha ISO
 */
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválido (formato: YYYY-MM-DD)')
  .or(z.date());

/**
 * Esquema para fecha futura
 */
export const futureDateSchema = dateSchema.refine(
  (date) => new Date(date) > new Date(),
  { message: 'La fecha debe ser futura' }
);

// ============================================
// ESQUEMAS DE AUTENTICACIÓN
// ============================================

/**
 * Esquema para registro de usuario
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es muy larga')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  firstName: z.string()
    .min(1, 'Nombre es requerido')
    .max(50, 'Nombre muy largo'),
  lastName: z.string()
    .min(1, 'Apellido es requerido')
    .max(50, 'Apellido muy largo'),
  phone: phoneSchema.optional(),
});

/**
 * Esquema para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida'),
});

/**
 * Esquema para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});

// ============================================
// ESQUEMAS DE BUSQUEDA DE VUELOS
// ============================================

/**
 * Esquema para búsqueda de vuelos
 */
export const flightSearchSchema = z.object({
  origin: z.string()
    .length(3, 'Código IATA debe tener 3 letras')
    .regex(/^[A-Z]{3}$/, 'Código IATA inválido'),
  destination: z.string()
    .length(3, 'Código IATA debe tener 3 letras')
    .regex(/^[A-Z]{3}$/, 'Código IATA inválido'),
  departureDate: dateSchema,
  returnDate: dateSchema.optional(),
  adults: z.number().int().min(1, 'Mínimo 1 adulto').max(9, 'Máximo 9 adultos'),
  children: z.number().int().min(0).max(9).default(0),
  infants: z.number().int().min(0).max(4).default(0),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  nonStop: z.boolean().default(false),
  currency: z.string().length(3).default('USD'),
});

/**
 * Esquema para búsqueda de hoteles
 */
export const hotelSearchSchema = z.object({
  city: z.string().min(1, 'Ciudad es requerida'),
  checkIn: dateSchema,
  checkOut: dateSchema,
  rooms: z.number().int().min(1, 'Mínimo 1 habitación').max(5, 'Máximo 5 habitaciones'),
  adults: z.number().int().min(1, 'Mínimo 1 adulto').max(10),
  children: z.number().int().min(0).default(0),
  currency: z.string().length(3).default('USD'),
});

/**
 * Esquema para búsqueda de transferencias
 */
export const transferSearchSchema = z.object({
  pickupLocation: z.string().min(1, 'Ubicación de recogida es requerida'),
  dropoffLocation: z.string().min(1, 'Ubicación de destino es requerida'),
  pickupDate: dateSchema,
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida (formato: HH:MM)'),
  passengers: z.number().int().min(1).max(100),
  vehicleType: z.enum(['CAR', 'VAN', 'BUS', 'LUXURY']).default('CAR'),
  currency: z.string().length(3).default('USD'),
});

// ============================================
// ESQUEMAS DE RESERVAS
// ============================================

/**
 * Esquema para pasajero
 */
export const passengerSchema = z.object({
  type: z.enum(['adult', 'child', 'infant']),
  firstName: z.string().min(1, 'Nombre es requerido').max(50),
  lastName: z.string().min(1, 'Apellido es requerido').max(50),
  dateOfBirth: dateSchema,
  gender: z.enum(['M', 'F']),
  nationality: z.string().length(2, 'Código de país de 2 letras'),
  documentType: z.enum(['PASSPORT', 'ID_CARD', 'VISA']),
  documentNumber: z.string().min(1, 'Número de documento es requerido').max(20),
  documentExpiry: dateSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

/**
 * Esquema para contacto de emergencia
 */
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  phone: phoneSchema,
  relationship: z.string().min(1, 'Relación es requerida'),
});

/**
 * Esquema para crear reserva
 */
export const createBookingSchema = z.object({
  type: z.enum(['flight', 'hotel', 'transfer', 'package']),
  flightOfferId: z.string().optional(),
  hotelOfferId: z.string().optional(),
  transferOfferId: z.string().optional(),
  passengers: z.array(passengerSchema).min(1, 'Al menos un pasajero es requerido'),
  contact: z.object({
    email: emailSchema,
    phone: phoneSchema,
    countryCode: z.string().length(2).default('ES'),
  }),
  emergencyContact: emergencyContactSchema.optional(),
  specialRequests: z.string().max(500).optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  }),
});

// ============================================
// ESQUEMAS DE PAGO
// ============================================

/**
 * Esquema para crear Payment Intent
 */
export const createPaymentIntentSchema = z.object({
  bookingId: uuidSchema,
  amount: z.number().positive('Monto debe ser positivo').max(1000000, 'Monto máximo: 1,000,000'),
  currency: z.string().length(3).default('EUR'),
  paymentMethod: z.enum(['card', 'bank_transfer']).default('card'),
  customerEmail: emailSchema.optional(),
  metadata: z.record(z.string()).optional(),
});

/**
 * Esquema para webhook de Stripe
 */
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  created: z.number(),
  data: z.object({
    object: z.object({
      id: z.string(),
      object: z.literal('payment_intent'),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      payment_method: z.string().optional(),
      customer: z.string().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    })
  })
});

// ============================================
// ESQUEMAS DE ADMIN
// ============================================

/**
 * Esquema para actualizar usuario
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
  role: z.enum(['user', 'admin', 'agent']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Esquema para actualizar reserva
 */
export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().max(500).optional(),
  adminComment: z.string().max(500).optional(),
});

/**
 * Esquema para filtros de búsqueda
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Esquema para filtros de reservas
 */
export const bookingFiltersSchema = z.object({
  ...paginationSchema.shape,
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  search: z.string().optional(),
});

// ============================================
// HELPER: Validar y extraer datos tipados
// ============================================

/**
 * Función helper para validar request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

/**
 * Función helper para validar request params
 */
export function validateParams<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[]
} {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

/**
 * Función helper para validar request query
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[]
} {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Common
  uuidSchema,
  emailSchema,
  phoneSchema,
  dateSchema,
  futureDateSchema,
  
  // Auth
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  
  // Search
  flightSearchSchema,
  hotelSearchSchema,
  transferSearchSchema,
  
  // Bookings
  passengerSchema,
  emergencyContactSchema,
  createBookingSchema,
  
  // Payment
  createPaymentIntentSchema,
  stripeWebhookSchema,
  
  // Admin
  updateUserSchema,
  updateBookingSchema,
  paginationSchema,
  bookingFiltersSchema,
  
  // Helpers
  validateBody,
  validateParams,
  validateQuery,
};
