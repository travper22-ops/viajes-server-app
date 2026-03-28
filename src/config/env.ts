// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================

import 'dotenv/config';

// ============================================
// INTERFACES
// ============================================

export interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  
  // URLs
  FRONTEND_URL: string;
  ADMIN_URL: string;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  
  // Amadeus
  AMADEUS_CLIENT_ID: string;
  AMADEUS_CLIENT_SECRET: string;
  AMADEUS_ENVIRONMENT: 'test' | 'production';
  
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  
  // Kiwi/Tequila (Buses)
  KIWI_API_KEY: string;
  KIWI_BASE_URL: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

// ============================================
// CONFIGURACIÓN
// ============================================

export const env: EnvConfig = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3001',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  
  // Amadeus
  AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID || '',
  AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET || '',
  AMADEUS_ENVIRONMENT: (process.env.AMADEUS_ENVIRONMENT as 'test' | 'production') || 'test',
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@travelagency.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Travel Agency',
  
  // Kiwi/Tequila (Buses)
  KIWI_API_KEY: process.env.KIWI_API_KEY || '',
  KIWI_BASE_URL: process.env.KIWI_BASE_URL || 'https://tequila.kiwi.com/v2',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
};

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Verifica si las variables de entorno requeridas están configuradas
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required: (keyof EnvConfig)[] = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !env[key]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Verifica si Amadeus está configurado
 */
export function isAmadeusConfigured(): boolean {
  return !!(env.AMADEUS_CLIENT_ID && env.AMADEUS_CLIENT_SECRET);
}

/**
 * Verifica si Stripe está configurado
 */
export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

/**
 * Verifica si el email está configurado
 */
export function isEmailConfigured(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default env;
