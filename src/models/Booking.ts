// ============================================
// MODELO DE RESERVA - TRAVEL AGENCY
// ============================================

import { IBooking, IBookingCreate, BOOKING_TYPES, BOOKING_STATUS } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

export const BOOKING_TYPES_ENUM = {
  FLIGHT: 'flight',
  HOTEL: 'hotel',
  PACKAGE: 'package',
  TRANSFER: 'transfer',
  CAR: 'car',
  ACTIVITY: 'activity'
} as const;

export const BOOKING_STATUS_ENUM = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  FAILED: 'failed'
} as const;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Genera una referencia de reserva única
 */
export function createBookingReference(type: string): string {
  const prefix = type.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Crea un objeto de reserva para Supabase
 */
export function createBookingObject(data: IBookingCreate): Record<string, unknown> {
  const totalBase = data.items.reduce((sum, item) => sum + item.price.base, 0);
  const totalTaxes = data.items.reduce((sum, item) => sum + item.price.taxes, 0);
  const total = totalBase + totalTaxes;
  
  const firstItem = data.items[0];
  const itemType = firstItem?.type || BOOKING_TYPES.FLIGHT;
  const currency = firstItem?.price.currency || 'EUR';
  
  return {
    booking_reference: createBookingReference(itemType),
    user_id: data.userId || null,
    booking_type: itemType,
    total_amount: total,
    currency: currency,
    status: BOOKING_STATUS.PENDING,
    payment_status: 'pending',
    customer_email: data.passengers?.[0]?.email || null,
    customer_name: `${data.passengers?.[0]?.firstName} ${data.passengers?.[0]?.lastName}` || null,
    customer_phone: data.passengers?.[0]?.phone || null,
    notes: JSON.stringify({
      passengers: data.passengers,
      items: data.items,
      userNotes: data.notes
    }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Actualiza el estado de una reserva
 */
export function updateBookingStatus(
  currentStatus: string, 
  newStatus: string
): { valid: boolean; reason?: string } {
  // Transiciones válidas
  const validTransitions: Record<string, string[]> = {
    [BOOKING_STATUS.PENDING]: [
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.FAILED
    ],
    [BOOKING_STATUS.CONFIRMED]: [
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.COMPLETED
    ],
    [BOOKING_STATUS.COMPLETED]: [
      BOOKING_STATUS.REFUNDED
    ],
    [BOOKING_STATUS.CANCELLED]: [],
    [BOOKING_STATUS.REFUNDED]: [],
    [BOOKING_STATUS.FAILED]: []
  };
  
  const allowed = validTransitions[currentStatus] || [];
  
  if (allowed.includes(newStatus)) {
    return { valid: true };
  }
  
  return { 
    valid: false, 
    reason: `No se puede cambiar de ${currentStatus} a ${newStatus}` 
  };
}

/**
 * Parsea una reserva de Supabase al formato de la API
 * La tabla bookings guarda passengers/items dentro de la columna `notes` como JSON
 */
export function parseBookingFromSupabase(booking: Record<string, unknown>): IBooking {
  let notes: Record<string, unknown> = {};
  try {
    notes = booking.notes ? JSON.parse(booking.notes as string) : {};
  } catch { /* notes no es JSON válido */ }

  return {
    id: booking.id as string,
    reference: (booking.booking_reference || booking.reference) as string,
    userId: (booking.user_id || booking.userId) as string | undefined,
    passengers: notes.passengers as any[] || [],
    items: notes.items as any[] || [],
    totalPrice: {
      total: booking.total_amount as number,
      base: booking.total_amount as number,
      taxes: 0,
      currency: booking.currency as string || 'EUR'
    },
    status: booking.status as BOOKING_STATUS,
    paymentStatus: (booking.payment_status || booking.paymentStatus) as 'pending' | 'paid' | 'failed' | 'refunded',
    paymentMethod: (booking.payment_method || booking.paymentMethod) as string | undefined,
    notes: (notes.userNotes || booking.notes) as string | undefined,
    createdAt: (booking.created_at || booking.createdAt) as string,
    updatedAt: (booking.updated_at || booking.updatedAt) as string
  };
}

/**
 * Calcula el precio total de una reserva
 */
export function calculateTotalPrice(items: Array<{ price: { base: number; taxes: number } }>): {
  base: number;
  taxes: number;
  total: number;
  currency: string;
} {
  const base = items.reduce((sum, item) => sum + item.price.base, 0);
  const taxes = items.reduce((sum, item) => sum + item.price.taxes, 0);
  
  return {
    base,
    taxes,
    total: base + taxes,
    currency: 'USD'
  };
}

/**
 * Valida los datos de un pasajero
 */
export function validatePassenger(passenger: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!passenger.firstName || (passenger.firstName as string).trim() === '') {
    errors.push('El nombre es requerido');
  }
  
  if (!passenger.lastName || (passenger.lastName as string).trim() === '') {
    errors.push('El apellido es requerido');
  }
  
  if (!passenger.dateOfBirth) {
    errors.push('La fecha de nacimiento es requerida');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  BOOKING_TYPES_ENUM,
  BOOKING_STATUS_ENUM,
  createBookingReference,
  createBookingObject,
  updateBookingStatus,
  parseBookingFromSupabase,
  calculateTotalPrice,
  validatePassenger
};
