// ============================================
// MODELO DE PAGO - TRAVEL AGENCY
// ============================================

import { IPayment, IPaymentCreate, PAYMENT_METHODS, PAYMENT_STATUS } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

export const PAYMENT_METHODS_ENUM = {
  CARD: 'card',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
} as const;

export const PAYMENT_STATUS_ENUM = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
} as const;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Convierte dinero a centavos (para Stripe)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convierte centavos a dinero
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Crea un objeto de pago para Supabase
 */
export function createPaymentObject(data: IPaymentCreate): Record<string, unknown> {
  return {
    bookingId: data.bookingId,
    userId: data.userId,
    amount: toCents(data.amount),
    currency: data.currency.toUpperCase(),
    method: data.method,
    status: PAYMENT_STATUS.PENDING,
    description: data.description || null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Actualiza el estado de un pago
 */
export function updatePaymentStatus(
  payment: Record<string, unknown>,
  newStatus: PAYMENT_STATUS,
  stripePaymentIntentId?: string
): Record<string, unknown> {
  return {
    status: newStatus,
    stripePaymentIntentId: stripePaymentIntentId || payment.stripePaymentIntentId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Parsea un pago de Supabase al formato de la API
 */
export function parsePaymentFromSupabase(payment: Record<string, unknown>): IPayment {
  return {
    id: payment.id as string,
    bookingId: payment.bookingId as string,
    userId: payment.userId as string,
    amount: fromCents(payment.amount as number),
    currency: payment.currency as string,
    method: payment.method as PAYMENT_METHODS,
    status: payment.status as PAYMENT_STATUS,
    stripePaymentIntentId: payment.stripePaymentIntentId as string | undefined,
    stripeCustomerId: payment.stripeCustomerId as string | undefined,
    description: payment.description as string | undefined,
    metadata: payment.metadata ? JSON.parse(payment.metadata as string) : undefined,
    createdAt: payment.createdAt as string,
    updatedAt: payment.updatedAt as string
  };
}

/**
 * Valida que el monto sea válido
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'El monto debe ser mayor a 0' };
  }
  
  if (amount > 1000000) {
    return { valid: false, error: 'El monto máximo es de 10,000 USD' };
  }
  
  // Validar que tenga máximo 2 decimales
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'El monto no puede tener más de 2 decimales' };
  }
  
  return { valid: true };
}

/**
 * Genera descripción de pago
 */
export function generatePaymentDescription(
  bookingReference: string, 
  type: string
): string {
  const typeLabels: Record<string, string> = {
    flight: 'Reserva de vuelo',
    hotel: 'Reserva de hotel',
    package: 'Paquete de viaje',
    transfer: 'Traslado',
    car: 'Alquiler de auto'
  };
  
  return `${typeLabels[type] || 'Reserva'} - ${bookingReference}`;
}

export default {
  PAYMENT_METHODS_ENUM,
  PAYMENT_STATUS_ENUM,
  toCents,
  fromCents,
  createPaymentObject,
  updatePaymentStatus,
  parsePaymentFromSupabase,
  validateAmount,
  generatePaymentDescription
};
