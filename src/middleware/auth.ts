// ============================================
// MIDDLEWARE DE AUTENTICACIÓN Y SEGURIDAD
// ============================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// ============================================
// INTERFACES
// ============================================

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ============================================
// HELPER: VERIFICAR TOKEN
// ============================================

/**
 * Extrae el token del header Authorization
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

/**
 * Verifica un token JWT
 */
export function verifyToken(token: string): { valid: boolean; decoded?: any; error?: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    return { valid: true, decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expirado' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Token inválido' };
    }
    return { valid: false, error: 'Error al verificar token' };
  }
}

// ============================================
// MIDDLEWARE: SECURITY HEADERS
// ============================================

/**
 * Headers de seguridad básicos
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // HSTS (solo en producción)
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  next();
}

// ============================================
// MIDDLEWARE: AUTHENTICATION REQUIRED
// ============================================

/**
 * Requiere autenticación
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Se requiere autenticación'
      }
    });
    return;
  }
  
  const result = verifyToken(token);
  
  if (!result.valid || !result.decoded) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: result.error || 'Token inválido'
      }
    });
    return;
  }
  
  // Adjuntar usuario al request
  req.user = {
    id: result.decoded.sub || '',
    email: result.decoded.email || '',
    role: result.decoded.role || 'user'
  };
  
  next();
}

// ============================================
// MIDDLEWARE: ROLE AUTHORIZATION
// ============================================

/**
 * Tipos de roles permitidos
 */
type Role = 'admin' | 'agent' | 'user' | 'guest';

/**
 * Requiere un rol específico
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_AUTH',
          message: 'Se requiere autenticación'
        }
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para realizar esta acción'
        }
      });
      return;
    }
    
    next();
  };
}

// ============================================
// MIDDLEWARE: OPTIONAL AUTH
// ============================================

/**
 * Autenticación opcional - attach user if token provided
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);
  
  if (token) {
    const result = verifyToken(token);
    
    if (result.valid && result.decoded) {
      req.user = {
        id: result.decoded.sub || '',
        email: result.decoded.email || '',
        role: result.decoded.role || 'guest'
      };
    }
  }
  
  next();
}

// ============================================
// MIDDLEWARE: ADMIN ONLY
// ============================================

/**
 * Solo administradores
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NO_AUTH',
        message: 'Se requiere autenticación'
      }
    });
    return;
  }
  
  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Se requiere rol de administrador'
      }
    });
    return;
  }
  
  next();
}

export default {
  extractToken,
  verifyToken,
  securityHeaders,
  requireAuth,
  requireRole,
  optionalAuth,
  requireAdmin
};
