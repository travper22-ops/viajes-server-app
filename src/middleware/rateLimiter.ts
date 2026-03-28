// ============================================
// MIDDLEWARE DE RATE LIMITING
// ============================================

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import env from '../config/env.js';

// ============================================
// INTERFAZ CUSTOM
// ============================================

interface RateLimitStore {
  [key: string]: {
    totalHits: number;
    resetTime: number;
  };
}

// Almacenamiento en memoria (para desarrollo)
const memoryStore: RateLimitStore = {};

// ============================================
// HELPERS
// ============================================

/**
 * Genera key para el rate limit
 */
function generateKey(req: Request): string {
  // Usar IP + ruta como key
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const path = req.path;
  return `${ip}:${path}`;
}

/**
 * Manejador cuando se excede el límite
 */
function rateLimitHandler(req: Request, res: Response): void {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.'
    }
  });
}

/**
 * Generador de key personalizado
 */
function keyGenerator(req: Request): string {
  return req.ip || 'unknown';
}

// ============================================
// RATE LIMITERS
// ============================================

/**
 * Rate limiter general - 100 solicitudes por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Demasiadas solicitudes'
    }
  }
});

/**
 * Rate limiter para autenticación - 10 solicitudes por 15 minutos
 */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Demasiados intentos de autenticación. Por favor, espera.'
    }
  },
  // Skip successful requests para auth
  skipSuccessfulRequests: false
});

/**
 * Rate limiter para búsquedas - 30 solicitudes por 15 minutos
 */
export const searchLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator,
  message: {
    success: false,
    error: {
      code: 'SEARCH_RATE_LIMIT',
      message: 'Demasiadas búsquedas. Por favor, espera.'
    }
  }
});

/**
 * Rate limiter para pagos - 10 solicitudes por 15 minutos
 */
export const paymentLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator,
  message: {
    success: false,
    error: {
      code: 'PAYMENT_RATE_LIMIT',
      message: 'Demasiadas solicitudes de pago. Por favor, espera.'
    }
  }
});

/**
 * Rate limiter para admin - 100 solicitudes por 15 minutos
 */
export const adminLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator,
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT',
      message: 'Demasiadas solicitudes de admin. Por favor, espera.'
    }
  }
});

// ============================================
// CUSTOM RATE LIMITER (DESARROLLO)
// ============================================

/**
 * Crea un rate limiter personalizado
 */
export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs || env.RATE_LIMIT_WINDOW,
    max: options.max || 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator,
    message: {
      success: false,
      error: {
        code: 'CUSTOM_RATE_LIMIT',
        message: options.message || 'Demasiadas solicitudes'
      }
    },
    skipSuccessfulRequests: options.skipSuccessfulRequests || false
  });
}

// ============================================
// MEMORY STORE (PARA DEBUG)
// ============================================

/**
 * Obtiene el estado actual del store
 */
export function getRateLimitStatus(key: string): { totalHits: number; resetTime: number } | null {
  return memoryStore[key] || null;
}

/**
 * Limpia el store (útil para testing)
 */
export function clearRateLimitStore(): void {
  // Limpiar entradas expiradas
  const now = Date.now();
  Object.keys(memoryStore).forEach(key => {
    if (memoryStore[key].resetTime < now) {
      delete memoryStore[key];
    }
  });
}

export default {
  generalLimiter,
  authLimiter,
  searchLimiter,
  paymentLimiter,
  adminLimiter,
  createRateLimiter,
  getRateLimitStatus,
  clearRateLimitStore
};
