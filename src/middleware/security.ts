// ============================================
// MIDDLEWARE DE PROTECCIÓN ADICIONAL
// Protección contra ataques comunes
// ============================================

import { Request, Response, NextFunction } from 'express';

// Almacenamiento en memoria para tracking de IPs (para desarrollo)
// En producción usar Redis
const ipTracker = new Map<string, {
  failedAttempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}>();

const FAILED_ATTEMPTS_LIMIT = 5;  // Máximo intentos fallidos
const LOCKOUT_DURATION = 15 * 60 * 1000;  // 15 minutos de bloqueo
const WINDOW_DURATION = 15 * 60 * 1000;  // Ventana de 15 minutos

/**
 * Middleware de protección contra brute force
 * Limita intentos de login fallidos
 */
export function bruteForceProtection(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Obtener o inicializar tracking de IP
  let ipData = ipTracker.get(ip);
  
  if (!ipData) {
    ipData = {
      failedAttempts: 0,
      firstAttempt: now
    };
    ipTracker.set(ip, ipData);
  }
  
  // Verificar si está bloqueado
  if (ipData.lockedUntil && now < ipData.lockedUntil) {
    const remainingMinutes = Math.ceil((ipData.lockedUntil - now) / 60000);
    res.status(429).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingMinutes} minutos.`
      }
    });
    return;
  }
  
  // Limpiar datos si pasó la ventana de tiempo
  if (now - ipData.firstAttempt > WINDOW_DURATION) {
    ipData.failedAttempts = 0;
    ipData.firstAttempt = now;
    ipData.lockedUntil = undefined;
  }
  
  // Adjuntar función para registrar intento fallido
  (req as any).recordFailedAttempt = () => {
    ipData!.failedAttempts++;
    if (ipData!.failedAttempts >= FAILED_ATTEMPTS_LIMIT) {
      ipData!.lockedUntil = now + LOCKOUT_DURATION;
    }
  };
  
  // Adjuntar función para registrar éxito
  (req as any).recordSuccessfulAttempt = () => {
    ipData!.failedAttempts = 0;
    ipData!.firstAttempt = now;
    ipData!.lockedUntil = undefined;
  };
  
  next();
}

/**
 * Limpia el tracker de IPs (útil para testing)
 */
export function clearIPTracker(): void {
  ipTracker.clear();
}

/**
 * Middleware para verificar tamaño de request
 * Previene ataques de denial of service
 */
export function requestSizeLimit(req: Request, res: Response, next: NextFunction): void {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 100 * 1024; // 100KB
  
  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'El tamaño del request excede el límite permitido'
      }
    });
    return;
  }
  
  next();
}

/**
 * Middleware para validar Content-Type
 * Previene ataques de tipo de contenido no autorizado
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const allowedContentTypes = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'];
  
  // Para métodos que envían body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type']?.split(';')[0].trim();
    
    if (!contentType || !allowedContentTypes.includes(contentType)) {
      res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Tipo de contenido no soportado'
        }
      });
      return;
    }
  }
  
  next();
}

/**
 * Middleware para sanitizar headers suspects
 */
export function sanitizeHeaders(req: Request, res: Response, next: NextFunction): void {
  // Limpiar headers suspects
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
  
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      // Validar que sean IPs válidos
      const value = req.headers[header] as string;
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(value)) {
        delete req.headers[header];
      }
    }
  }
  
  next();
}

/**
 * Configuración de seguridad para producción
 */
export const productionSecurityHeaders = {
  // Ocultar información del servidor
  hidePoweredBy: true,
  // Prevenir clickjacking
  frameguard: { action: 'deny' },
  // Prevenir XSS
  xssFilter: { mode: 'block' },
  // Prevenir MIME sniffing
  noSniff: true,
  // Forzar HTTPS
  hsts: {
    maxAge: 31536000,  // 1 año
    includeSubDomains: true,
    preload: true
  },
  // Prevenir caching de datos sensibles
  nocache: false,
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

export default {
  bruteForceProtection,
  clearIPTracker,
  requestSizeLimit,
  validateContentType,
  sanitizeHeaders,
  productionSecurityHeaders
};
