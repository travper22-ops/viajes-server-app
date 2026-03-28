// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

import { Request, Response, NextFunction } from 'express';

// ============================================
// INTERFAZ DE ERROR
// ============================================

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

// ============================================
// HELPER: CREATE ERROR
// ============================================

/**
 * Crea un error personalizado
 */
export function createError(message: string, statusCode: number, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code || `ERR_${statusCode}`;
  return error;
}

/**
 * Crea error 400 (Bad Request)
 */
export function badRequest(message: string = 'Solicitud inválida'): AppError {
  return createError(message, 400, 'BAD_REQUEST');
}

/**
 * Crea error 401 (Unauthorized)
 */
export function unauthorized(message: string = 'No autorizado'): AppError {
  return createError(message, 401, 'UNAUTHORIZED');
}

/**
 * Crea error 403 (Forbidden)
 */
export function forbidden(message: string = 'Acceso denegado'): AppError {
  return createError(message, 403, 'FORBIDDEN');
}

/**
 * Crea error 404 (Not Found)
 */
export function notFound(message: string = 'Recurso no encontrado'): AppError {
  return createError(message, 404, 'NOT_FOUND');
}

/**
 * Crea error 500 (Internal Server Error)
 */
export function internalError(message: string = 'Error interno del servidor'): AppError {
  return createError(message, 500, 'INTERNAL_ERROR');
}

// ============================================
// MIDDLEWARE: REQUEST LOGGER
// ============================================

/**
 * Registra información de cada request
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Log cuando termine la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Solo loguear en desarrollo o errores
    if (process.env.NODE_ENV === 'development' || res.statusCode >= 400) {
      console.log('[REQUEST]', JSON.stringify(log));
    }
  });
  
  next();
}

// ============================================
// MIDDLEWARE: NOT FOUND HANDLER
// ============================================

/**
 * Maneja rutas no encontradas (404)
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.method} ${req.url} no encontrada`
    }
  });
}

// ============================================
// MIDDLEWARE: ERROR HANDLER
// ============================================

/**
 * Maneja errores globales
 */
export function errorHandler(
  err: AppError, 
  req: Request, 
  res: Response, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Logging del error
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });
  
  // Determinar código de estado
  const statusCode = err.statusCode || 500;
  
  // Determinar mensaje (no exponer detalles en producción)
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Error interno del servidor'
    : err.message;
  
  // Responder
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details })
    }
  });
}

// ============================================
// MIDDLEWARE: ASYNC HANDLER
// ============================================

/**
 * Envuelve funciones async para capturar errores
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================
// MIDDLEWARE: VALIDATE REQUEST
// ============================================

/**
 * Valida que el body tenga los campos requeridos
 */
export function validateRequest(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: `Campos requeridos: ${missing.join(', ')}`
        }
      });
      return;
    }
    
    next();
  };
}

export default {
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalError,
  requestLogger,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  validateRequest
};
