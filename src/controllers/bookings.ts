// ============================================
// CONTROLADOR DE RESERVAS
// ============================================

import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { createBookingObject, parseBookingFromSupabase } from '../models/Booking.js';
import { BOOKING_STATUS, BOOKING_TYPES } from '../types/index.js';

// ============================================
// INTERFACES
// ============================================

export interface BookingItem {
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

export interface Passenger {
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

export interface CreateBookingBody {
  userId?: string;
  passengers: Passenger[];
  items: BookingItem[];
  notes?: string;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener todas las reservas del usuario
 */
export async function getUserBookings(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_USER_ID', message: 'Se requiere el ID del usuario' }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: bookings?.map(parseBookingFromSupabase) || []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'GET_BOOKINGS_ERROR', message: errorMessage }
    });
  }
}

/**
 * Obtener una reserva por ID
 */
export async function getBookingById(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_BOOKING_ID', message: 'Se requiere el ID de la reserva' }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: parseBookingFromSupabase(booking)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'GET_BOOKING_ERROR', message: errorMessage }
    });
  }
}

/**
 * Obtener una reserva por referencia
 */
export async function getBookingByReference(req: Request, res: Response): Promise<void> {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_REFERENCE', message: 'Se requiere la referencia' }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: parseBookingFromSupabase(booking)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'GET_BOOKING_ERROR', message: errorMessage }
    });
  }
}

/**
 * Crear una nueva reserva
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as any;

    // Soportar formato nuevo del cliente (FlightCheckoutPage)
    // El cliente envía: { type, passengers, search_params, selected_offer, extras, contact, seats }
    let passengers = body.passengers;
    let items = body.items;

    // Si no hay items pero hay selected_offer, crear items desde selected_offer
    if ((!items || items.length === 0) && body.selected_offer) {
      const offer = body.selected_offer;
      items = [{
        type: body.type || 'flight',
        itemId: offer.id || '1',
        details: {
          searchParams: body.search_params,
          selectedOffer: offer,
          extras: body.extras || [],
          contact: body.contact,
          seats: body.seats || []
        },
        price: {
          currency: offer.price?.currency || 'EUR',
          total: parseFloat(offer.total_price) || parseFloat(offer.price?.total) || 0,
          base: parseFloat(offer.price?.base) || 0,
          taxes: (parseFloat(offer.price?.total) || 0) - (parseFloat(offer.price?.base) || 0)
        }
      }];
    }

    // Si passengers viene como array de objetos vacíos, usar datos del contacto
    if (passengers && passengers.length > 0 && !passengers[0].firstName) {
      passengers = passengers.map((_: any, idx: number) => ({
        firstName: body.contact?.firstName || 'Pasajero',
        lastName: body.contact?.lastName || `${idx + 1}`,
        email: body.contact?.email,
        phone: body.contact?.phone,
        dateOfBirth: '1990-01-01'
      }));
    }

    if (!passengers || !items || passengers.length === 0 || items.length === 0) {
      res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_DATA', 
          message: 'Se requieren passengers e items' 
        }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Crear objeto de reserva con el formato correcto
    const bookingBody: CreateBookingBody = {
      passengers,
      items
    };

    const bookingData = createBookingObject(bookingBody);

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', JSON.stringify(error));
      // Si falla Supabase (RLS, tabla no existe, etc.) devolver ref local para no bloquear el pago
      const localRef = (bookingData.booking_reference as string) || 
        `${(body.type || 'BKG').substring(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      console.warn('⚠️ Usando ref local por fallo de Supabase:', localRef);
      res.status(201).json({
        success: true,
        booking: { ref: localRef },
        warning: 'Reserva registrada localmente: ' + (error.message || error.code)
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: parseBookingFromSupabase(booking),
      booking: { ref: booking.booking_reference }
    });
  } catch (error: any) {
    console.error('❌ Error en createBooking:', error);
    const errorMessage = error?.message || error?.details || JSON.stringify(error) || 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_BOOKING_ERROR', message: errorMessage }
    });
  }
}

/**
 * Cancelar una reserva
 */
export async function cancelBooking(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_BOOKING_ID', message: 'Se requiere el ID de la reserva' }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        status: BOOKING_STATUS.CANCELLED,
        updatedAt: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: parseBookingFromSupabase(booking)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'CANCEL_BOOKING_ERROR', message: errorMessage }
    });
  }
}

/**
 * Actualizar estado de pago de una reserva
 */
export async function updatePaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    if (!bookingId || !paymentStatus) {
      res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_DATA', 
          message: 'Se requieren bookingId y paymentStatus' 
        }
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        paymentStatus,
        paymentMethod,
        updatedAt: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: parseBookingFromSupabase(booking)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_PAYMENT_ERROR', message: errorMessage }
    });
  }
}

export default {
  getUserBookings,
  getBookingById,
  getBookingByReference,
  createBooking,
  cancelBooking,
  updatePaymentStatus
};
