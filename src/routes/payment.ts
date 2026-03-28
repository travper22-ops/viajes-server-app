// ============================================
// RUTAS DE PAGOS
// ============================================

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import env from '../config/env.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { convertToSettlement, getRatesForCurrencies, SETTLEMENT_CURRENCY } from '../services/currency.js';

const router = Router();

// ============================================
// STRIPE
// ============================================

let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!stripe && env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// ============================================
// CREAR PAGO
// ============================================

router.post('/create-payment-intent', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'eur', bookingId, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'Monto inválido' }
      });
      return;
    }

    const stripeInstance = getStripe();

    if (!stripeInstance) {
      res.status(500).json({
        success: false,
        error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe no está configurado' }
      });
      return;
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingId || '',
        userId: req.user?.id || ''
      },
      description: description || 'Pago Travel Agency'
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PAYMENT_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// CONFIRMAR PAGO
// ============================================

router.post('/confirm', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_ID', message: 'Se requiere paymentIntentId' }
      });
      return;
    }

    const stripeInstance = getStripe();

    if (!stripeInstance) {
      res.status(500).json({
        success: false,
        error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe no está configurado' }
      });
      return;
    }

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'CONFIRM_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// REEMBOLSO
// ============================================

router.post('/refund', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_ID', message: 'Se requiere paymentIntentId' }
      });
      return;
    }

    const stripeInstance = getStripe();

    if (!stripeInstance) {
      res.status(500).json({
        success: false,
        error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe no está configurado' }
      });
      return;
    }

    const refund = await stripeInstance.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) }),
      reason: reason as Stripe.RefundCreateParams.Reason
    });

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'REFUND_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// WEBHOOK DE STRIPE
// ============================================

router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const stripeInstance = getStripe();

    if (!stripeInstance) {
      res.status(500).json({ error: 'Stripe no configurado' });
      return;
    }

    // En desarrollo, solo confirmar recepción
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Webhook de Stripe recibido:', req.body.type);
      res.json({ received: true });
      return;
    }

    // En producción, verificar签名
    const event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Manejar eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Pago exitoso:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Pago fallido:', event.data.object);
        break;
      default:
        console.log('📧 Evento de Stripe:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en webhook:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================
// PAYPAL - Crear orden
// ============================================

router.post('/paypal/create-order', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'EUR', bookingId, description } = req.body;

    // En modo demo, simulamos la respuesta de PayPal
    const mockOrderId = 'PAYPAL_DEMO_' + Date.now();

    res.json({
      success: true,
      orderId: mockOrderId,   // top-level for frontend compatibility
      data: {
        orderId: mockOrderId,
        status: 'CREATED',
        amount,
        currency,
        bookingId,
        description: description || 'Pago Travel Agency'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PAYPAL_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// PAYPAL - Capturar pago
// ============================================

router.post('/paypal/capture', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, bookingId } = req.body;

    // Simular captura exitosa
    res.json({
      success: true,    // frontend checks res.success directly
      orderId,
      data: {
        orderId,
        status: 'COMPLETED',
        bookingId,
        capturedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PAYPAL_CAPTURE_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// TRANSFERENCIA BANCARIA
// ============================================

router.post('/bank-transfer/create', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'EUR', bookingId, customerEmail } = req.body;

    // Generar datos de transferencia bancaria
    const transferRef = 'TRF_' + Date.now().toString(36).toUpperCase();
    const bankDetails = {
      bankName: 'Banco de España',
      accountNumber: 'ES12 3456 7890 1234 5678 90',
      IBAN: 'ES12 3456 7890 1234 5678 90',
      BIC: 'BSCHESMMXXX',
      reference: transferRef,
      amount,
      currency,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    };

    res.json({
      success: true,
      bankDetails: {       // top-level for frontend compatibility
        ...bankDetails,
        orderId: transferRef,
        expiryHours: 168,  // 7 days
      },
      data: {
        transferRef,
        ...bankDetails,
        bookingId,
        customerEmail,
        status: 'PENDING',
        expiryHours: 168,
        instructions: 'Por favor, realiza la transferencia dentro de los próximos 7 días usando la referencia indicada.'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'BANK_TRANSFER_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// TASAS DE CAMBIO — para mostrar en el frontend
// GET /api/v1/payment/rates?from=USD&amount=500
// ============================================

router.get('/rates', async (req: Request, res: Response): Promise<void> => {
  try {
    const from = (req.query.from as string || 'EUR').toUpperCase();
    const amount = parseFloat(req.query.amount as string || '1');

    const conversion = await convertToSettlement(amount, from);

    // También devolver tasas comunes para mostrar en UI
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'ARS', 'BRL', 'MXN', 'CLP', 'PEN', 'COP'];
    const rates = await getRatesForCurrencies(from, commonCurrencies);

    res.json({
      success: true,
      data: {
        from,
        amount,
        settlementCurrency: SETTLEMENT_CURRENCY,
        settlementAmount: conversion.amountSettlement,
        exchangeRate: conversion.rate,
        rates,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, error: { code: 'RATES_ERROR', message: errorMessage } });
  }
});

// ============================================
// OBTENER MÉTODOS DE PAGO DISPONIBLES
// ============================================

router.get('/methods', async (req: Request, res: Response): Promise<void> => {
  try {
    const stripeConfigured = !!env.STRIPE_SECRET_KEY;

    res.json({
      success: true,
      data: {
        methods: [
          {
            id: 'card',
            name: 'Tarjeta de Crédito/Débito',
            icon: 'credit-card',
            enabled: stripeConfigured,
            description: stripeConfigured ? 'Paga con Visa, Mastercard, etc.' : 'No configurado'
          },
          {
            id: 'paypal',
            name: 'PayPal',
            icon: 'paypal',
            enabled: true,
            description: 'Paga con tu cuenta PayPal'
          },
          {
            id: 'bank_transfer',
            name: 'Transferencia Bancaria',
            icon: 'university',
            enabled: true,
            description: 'Recibes los datos para transferir'
          }
        ]
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'METHODS_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// Alias: create-intent (compatibilidad con cliente)
// Acepta cualquier moneda y convierte a SETTLEMENT_CURRENCY antes de cobrar
// ============================================

// Auth optional — works for both logged-in and guest users
router.post('/create-intent', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'EUR', bookingId, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'El monto debe ser mayor a 0' }
      });
      return;
    }

    // Convertir a moneda de liquidación
    const conversion = await convertToSettlement(parseFloat(String(amount)), currency);

    const stripeInstance = getStripe();

    if (!stripeInstance) {
      // Modo demo
      res.json({
        success: true,
        data: {
          clientSecret: 'demo_client_secret_' + Date.now(),
          paymentIntentId: 'demo_pi_' + Date.now(),
          originalAmount: conversion.originalAmount,
          originalCurrency: conversion.originalCurrency,
          settlementAmount: conversion.amountSettlement,
          settlementCurrency: conversion.settlementCurrency,
          exchangeRate: conversion.rate,
          isDemo: true
        }
      });
      return;
    }

    const amountInCents = Math.round(conversion.amountSettlement * 100);
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: conversion.settlementCurrency.toLowerCase(),
      metadata: {
        bookingId: bookingId || 'N/A',
        userId: req.user?.id || 'N/A',
        originalAmount: String(conversion.originalAmount),
        originalCurrency: conversion.originalCurrency,
        exchangeRate: String(conversion.rate),
      },
      description: description || 'Pago Travel Agency',
      automatic_payment_methods: { enabled: true }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        originalAmount: conversion.originalAmount,
        originalCurrency: conversion.originalCurrency,
        settlementAmount: conversion.amountSettlement,
        settlementCurrency: conversion.settlementCurrency,
        exchangeRate: conversion.rate,
      }
    });
  } catch (error) {
    console.error('Error in create-intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PAYMENT_INTENT_ERROR', message: errorMessage }
    });
  }
});

export default router;

// ============================================
// INICIO ENDPOINTS SIN AUTH (PRUEBAS)
// ============================================

// ── Endpoint con Stripe REAL sin autenticación ──
router.post('/create-intent-test', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'eur', bookingId, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'El monto debe ser mayor a 0' }
      });
      return;
    }

    const stripeInstance = getStripe();

    if (!stripeInstance) {
      res.status(500).json({
        success: false,
        error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe no está configurado' }
      });
      return;
    }

    // Crear PaymentIntent con Stripe real
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingId || 'test-booking',
        userId: 'test-user'
      },
      description: description || 'Pago Travel Agency - Test',
      automatic_payment_methods: { enabled: true }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'STRIPE_ERROR', message: errorMessage }
    });
  }
});

/*
// ── Endpoint de prueba SIN Stripe (MODO DEMO) ──
router.post('/test-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'eur', bookingId, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'El monto debe ser mayor a 0' }
      });
      return;
    }

    // Simular creación de PaymentIntent (en modo demo)
    const mockPaymentIntentId = 'pi_test_' + Date.now();
    const mockClientSecret = 'pi_test_' + Date.now() + '_secret_' + Math.random().toString(36).substring(7);

    res.json({
      success: true,
      data: {
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method',
        testMode: true,
        message: 'Pago de prueba creado exitosamente'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'TEST_PAYMENT_ERROR', message: errorMessage }
    });
  }
});
*/

// ============================================
// FIN ENDPOINTS SIN AUTH (PRUEBAS)
// ============================================
