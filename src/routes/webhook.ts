// ============================================
// RUTAS DE WEBHOOKS
// ============================================

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// WEBHOOK DE STRIPE
// ============================================

router.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;
    const eventType = event.type || event.data?.object?.object;
    
    console.log('📧 Webhook de Stripe recibido:', eventType);

    // En desarrollo, procesamos igual pero sin verificación de firma
    const paymentIntent = event.data?.object || event;
    const paymentIntentId = paymentIntent.id;
    
    console.log('💳 PaymentIntent:', paymentIntentId, 'Status:', paymentIntent.status);

    // Determinar el estado del pago
    let newStatus: string;
    let metadata = paymentIntent.metadata || {};
    
    switch (eventType) {
      case 'payment_intent.succeeded':
        newStatus = 'succeeded';
        console.log('✅ Pago exitoso:', paymentIntentId);
        break;
        
      case 'payment_intent.payment_failed':
        newStatus = 'failed';
        console.log('❌ Pago fallido:', paymentIntentId);
        break;
        
      case 'charge.refunded':
        newStatus = 'refunded';
        console.log('💰 Reembolso procesado:', paymentIntentId);
        break;
        
      case 'charge.dispute.created':
        newStatus = 'disputed';
        console.log('⚠️ Disputa creada:', paymentIntentId);
        break;
        
      default:
        console.log('📧 Evento de Stripe no manejado:', eventType);
        res.json({ received: true, handled: false });
        return;
    }

    // Actualizar en Supabase si tenemos la configuración
    try {
      const { getSupabaseAdmin } = await import('../config/supabase.js');
      const supabaseAdmin = getSupabaseAdmin();
      
      if (supabaseAdmin) {
        // Buscar el pago por stripe_payment_intent_id
        const { data: payments, error: findError } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .limit(1);

        if (findError) {
          console.error('❌ Error buscando pago:', findError);
        } else if (payments && payments.length > 0) {
          const payment = payments[0];
          
          // Actualizar estado del pago
          await supabaseAdmin
            .from('payments')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          console.log('✅ Estado de pago actualizado:', payment.id, '->', newStatus);

          // Si el pago fue exitoso, actualizar la reserva asociada
          if (newStatus === 'succeeded' && payment.booking_id) {
            await supabaseAdmin
              .from('bookings')
              .update({ 
                status: 'confirmed',
                payment_status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.booking_id);
            
            console.log('✅ Reserva confirmada:', payment.booking_id);
          }
          
          // Si fue reembolsado
          if (newStatus === 'refunded' && payment.booking_id) {
            await supabaseAdmin
              .from('bookings')
              .update({ 
                status: 'cancelled',
                payment_status: 'refunded',
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.booking_id);
            
            console.log('✅ Reserva cancelada por reembolso:', payment.booking_id);
          }
        } else {
          console.log('ℹ️ No se encontró pago con ID:', paymentIntentId);
        }
      }
    } catch (dbError) {
      console.error('❌ Error actualizando base de datos:', dbError);
      // No fallamos el webhook por error de DB
    }

    res.json({ received: true, handled: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en webhook de Stripe:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================
// WEBHOOK DE AMADEUS
// ============================================

router.post('/amadeus', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;

    console.log('📧 Webhook de Amadeus recibido:', event.type);

    // Manejar eventos de Amadeus
    switch (event.type) {
      case 'flight-order.created':
        console.log('✈️ Orden de vuelo creada:', event.data);
        break;
        
      case 'flight-order.cancelled':
        console.log('❌ Orden de vuelo cancelada:', event.data);
        break;
        
      case 'hotel-booking.created':
        console.log('🏨 Reserva de hotel creada:', event.data);
        break;
        
      default:
        console.log('📧 Evento de Amadeus no manejado:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en webhook de Amadeus:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================
// WEBHOOK DE SUPABASE
// ============================================

router.post('/supabase', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;

    console.log('📧 Webhook de Supabase recibido:', event.type);

    // Manejar eventos de base de datos
    switch (event.type) {
      case 'INSERT':
        console.log('➕ Nuevo registro:', event.record);
        break;
        
      case 'UPDATE':
        console.log('✏️ Registro actualizado:', event.record);
        break;
        
      case 'DELETE':
        console.log('🗑️ Registro eliminado:', event.old_record);
        break;
        
      default:
        console.log('📧 Evento de Supabase no manejado:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en webhook de Supabase:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================
// WEBHOOK GENÉRICO
// ============================================

router.post('/generic', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, event, data } = req.body;

    if (!provider || !event) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_DATA', message: 'Se requieren provider y event' }
      });
      return;
    }

    console.log(`📧 Webhook genérico - Provider: ${provider}, Event: ${event}`);

    // Log de los datos
    console.log('📊 Datos:', data);

    res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en webhook genérico:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

export default router;
