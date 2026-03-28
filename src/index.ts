/**
 * Travel Agency Server - Punto de entrada principal
 * 
 *Este servidor conecta:
 *- Frontend (React) - Puerto 3000
 *- Admin Panel - Puerto 3001
 *- APIs: Amadeus, Stripe, Supabase, Email
 */

import './config/env.js';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Rutas
import flightsRouter from './routes/flights.js';
import hotelsRouter from './routes/hotels.js';
import airportsRouter from './routes/airports.js';
import authRouter from './routes/auth.js';
import bookingsRouter from './routes/bookings.js';
import adminRouter from './routes/admin.js';
import paymentRouter from './routes/payment.js';
import webhookRouter from './routes/webhook.js';
import transfersRouter from './routes/transfers.js';
import usersRouter from './routes/users.js';
import destinationsRouter from './routes/destinations.js';
import blogRouter from './routes/blog.js';
import baggageRouter from './routes/baggage.js';
import seatsRouter from './routes/seats.js';
import locationsRouter from './routes/locations.js';
import packagesRouter from './routes/packages.js';
import busesRouter from './routes/buses.js';
import extendedRouter from './routes/extended.js';
import contactRouter from './routes/contact.js';
import amadeusRouter from './routes/amadeusRoutes.js';
import jobsRouter from './routes/jobs.js';
import flashDealsRouter from './routes/flashDeals.js';

// Middleware
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter, searchLimiter, paymentLimiter, adminLimiter } from './middleware/rateLimiter.js';
import { securityHeaders } from './middleware/auth.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { bruteForceProtection, requestSizeLimit, validateContentType, sanitizeHeaders } from './middleware/security.js';
import { initEmailService } from './services/email.js';
import { initTokenManager, getTokenMetrics } from './services/amadeus-token-manager.js';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || process.env.API_PORT || '5002', 10);

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// Seguridad - Helmet con configuración mejorada
app.use(securityHeaders);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.amadeus.com', 'https://api.stripe.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Logging
app.use(requestLogger);
app.use(morgan('dev'));

// CORS - permitir frontend y admin
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL   || 'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://aeroviajes.vercel.app',
      'https://client-weld-ten-81.vercel.app',
      'https://client-4fjv87yj7-travper22-ops-projects.vercel.app',
    ];
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// Rate limiting general
app.use('/api/', generalLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/flights/search', searchLimiter);
app.use('/api/v1/payment', paymentLimiter);
app.use('/api/v1/admin', adminLimiter); // Rate limit para admin

// Parsear JSON
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitización contra XSS
app.use(sanitizeInput);

// Seguridad adicional
app.use(requestSizeLimit);
app.use(validateContentType);
app.use(sanitizeHeaders);

// Rate limiting específico para auth
app.use('/api/v1/auth/login', bruteForceProtection);

// ============================================
// RUTAS DE LA API
// ============================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Token metrics endpoint (for monitoring)
app.get('/api/v1/admin/token-metrics', (req: Request, res: Response) => {
  res.json(getTokenMetrics());
});

// Rutas públicas
app.use('/api/v1/airports', airportsRouter);
app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/hotels', hotelsRouter);
app.use('/api/v1/transfers', transfersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/baggage', baggageRouter);
app.use('/api/v1/seats', seatsRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/packages', packagesRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/buses', busesRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1', extendedRouter); // Extended Amadeus APIs

// Rutas que requieren autenticación
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/users', usersRouter);

// Webhooks (sin autenticación)
app.use('/api/v1/webhook', webhookRouter);

// Rutas de admin
app.use('/api/v1/admin', adminRouter);

// Amadeus APIs
app.use('/api/v1/amadeus', amadeusRouter);
app.use('/api/v1/flash-deals', flashDealsRouter);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

// Inicializar servicios
initEmailService();
initTokenManager(); // Token Manager de Amadeus

app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║                                                         ║
║       Travel Agency Server                              ║
║                                                         ║
║   Servidor corriendo en: http://localhost:${PORT}       ║
║                                                         ║
║   Endpoints disponibles:                                ║
║   ├── GET  /api/health              (Health check)      ║
║   ├── GET  /api/v1/airports/*      (Aeropuertos)        ║
║   ├── GET  /api/v1/flights/*       (Vuelos - Amadeus)   ║
║   ├── GET  /api/v1/hotels/*        (Hoteles)            ║
║   ├── POST /api/v1/auth/*           (Autenticación)     ║
║   ├── GET  /api/v1/bookings/*      (Reservas)           ║
║   ├── POST /api/v1/payment/*       (Pagos - Stripe)     ║
║   └── GET  /api/v1/admin/*         (Admin Panel)        ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
  `);
});

export default app;
