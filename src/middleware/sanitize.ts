// @ts-nocheck
// ============================================
// MIDDLEWARE DE SANITIZACIÓN - Protección XSS
// ============================================

import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Sanitiza un objeto completo recursivamente
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return xss(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware para sanitizar el body de las requests
 * Protege contra ataques XSS
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body) as Record<string, unknown>;
  }
  next();
}

/**
 * Middleware para sanitizar query params
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as Record<string, unknown>;
  }
  next();
}

/**
 * Middleware completo - sanitiza body y query
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  sanitizeBody(req, res, () => sanitizeQuery(req, res, next));
}

/**
 * Función helper para sanitizar strings manualmente
 */
export function sanitize(str: string): string {
  return xss(str);
}

/**
 * Función para sanitizar HTML unsafe
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export default {
  sanitizeBody,
  sanitizeQuery,
  sanitizeInput,
  sanitize,
  stripHtml
};
