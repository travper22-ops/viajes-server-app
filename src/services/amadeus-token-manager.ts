// @ts-nocheck
// ============================================
// AMADEUS TOKEN MANAGER
// Manejo explícito de OAuth tokens para producción
// ============================================

import env from '../config/env.js';

// ============================================
// INTERFACES
// ============================================

export interface AmadeusToken {
  accessToken: string;
  expiresAt: number; // Timestamp Unix en ms
  tokenType: string;
  expiresIn: number; // Segundos
}

export interface TokenMetrics {
  totalRequests: number;
  refreshCount: number;
  lastRefresh: string | null;
  lastError: string | null;
  isValid: boolean;
  expiresInSeconds: number;
}

// ============================================
// VARIABLES PRIVADAS
// ============================================

let currentToken: AmadeusToken | null = null;
let tokenMetrics: TokenMetrics = {
  totalRequests: 0,
  refreshCount: 0,
  lastRefresh: null,
  lastError: null,
  isValid: false,
  expiresInSeconds: 0
};

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutos antes del expiry

// ============================================
// FUNCIONES DE TOKEN
// ============================================

/**
 * Obtiene un nuevo token de Amadeus usando OAuth2
 * Documentación: https://developers.amadeus.com/reference/api-api-security-and-authentication
 */
async function fetchNewToken(): Promise<AmadeusToken> {
  const tokenUrl = env.AMADEUS_ENVIRONMENT === 'production'
    ? 'https://api.amadeus.com/v1/security/oauth2/token'
    : 'https://test.api.amadeus.com/v1/security/oauth2/token';

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.AMADEUS_CLIENT_ID,
    client_secret: env.AMADEUS_CLIENT_SECRET
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Amadeus OAuth Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    expiresAt: Date.now() + (data.expires_in * 1000),
    tokenType: data.token_type || 'Bearer'
  };
}

/**
 * Verifica si el token actual es válido
 * Considera válido si no ha expirado y tiene buffer de seguridad
 */
function isTokenValid(): boolean {
  if (!currentToken) return false;
  
  const now = Date.now();
  const bufferTime = currentToken.expiresAt - TOKEN_REFRESH_BUFFER_MS;
  
  return now < bufferTime;
}

/**
 * Obtiene un token válido, refreshing si es necesario
 * Este es el método principal que debe usarse en lugar del SDK
 */
export async function getValidToken(): Promise<string> {
  tokenMetrics.totalRequests++;
  
  // Verificar si necesitamos un nuevo token
  if (!isTokenValid()) {
    try {
      console.log('🔄 Refreshing Amadeus OAuth token...');
      currentToken = await fetchNewToken();
      tokenMetrics.refreshCount++;
      tokenMetrics.lastRefresh = new Date().toISOString();
      tokenMetrics.isValid = true;
      tokenMetrics.lastError = null;
      
      console.log(`✅ Token refreshed. Expires in ${currentToken.expiresIn}s`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error refreshing token:', errorMessage);
      tokenMetrics.lastError = errorMessage;
      tokenMetrics.isValid = false;
      throw error;
    }
  }
  
  // Calcular segundos hasta expiración
  if (currentToken) {
    tokenMetrics.expiresInSeconds = Math.max(0, Math.floor((currentToken.expiresAt - Date.now()) / 1000));
  }
  
  return currentToken!.accessToken;
}

/**
 * Fuerza un refresh del token
 */
export async function forceRefreshToken(): Promise<string> {
  console.log('🔄 Force refreshing Amadeus token...');
  currentToken = null;
  return getValidToken();
}

/**
 * Obtiene métricas del token
 */
export function getTokenMetrics(): TokenMetrics {
  return { ...tokenMetrics };
}

/**
 * Verifica el estado del token para debugging
 */
export function getTokenStatus(): {
  isValid: boolean;
  expiresAt: Date | null;
  expiresInSeconds: number;
  refreshNeeded: boolean;
} {
  if (!currentToken) {
    return {
      isValid: false,
      expiresAt: null,
      expiresInSeconds: 0,
      refreshNeeded: true
    };
  }
  
  const now = Date.now();
  const expiresAt = new Date(currentToken.expiresAt);
  const expiresInSeconds = Math.floor((currentToken.expiresAt - now) / 1000);
  const refreshNeeded = !isTokenValid();
  
  return {
    isValid: isTokenValid(),
    expiresAt,
    expiresInSeconds,
    refreshNeeded
  };
}

/**
 * Inicializa el token manager
 * Debe llamarse al iniciar el servidor
 */
export async function initTokenManager(): Promise<void> {
  console.log('🚀 Initializing Amadeus Token Manager...');
  
  try {
    await getValidToken();
    console.log('✅ Token Manager initialized successfully');
    
    // Programar refresh automático
    scheduleTokenRefresh();
  } catch (error) {
    console.error('❌ Failed to initialize Token Manager:', error);
  }
}

/**
 * Programa refresh automático del token
 */
function scheduleTokenRefresh(): void {
  if (!currentToken) return;
  
  // Refresh 5 minutos antes del expiry
  const refreshTime = currentToken.expiresAt - TOKEN_REFRESH_BUFFER_MS;
  const delay = Math.max(0, refreshTime - Date.now());
  
  console.log(`⏰ Scheduling token refresh in ${Math.floor(delay / 60000)} minutes`);
  
  setTimeout(async () => {
    try {
      await forceRefreshToken();
      scheduleTokenRefresh(); // Reprogramar
    } catch (error) {
      console.error('❌ Scheduled token refresh failed:', error);
      // Reintentar en 1 minuto
      setTimeout(scheduleTokenRefresh, 60000);
    }
  }, delay);
}

// ============================================
// WRAPPER PARA USO CON SDK
// ============================================

/**
 * Crea headers con el token válido para usar con APIs de Amadeus
 */
export async function getAmadeusHeaders(): Promise<Record<string, string>> {
  const token = await getValidToken();
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Realiza una petición a la API de Amadeus con manejo de token automático
 */
export async function amadeusRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAmadeusHeaders();
  
  const baseUrl = env.AMADEUS_ENVIRONMENT === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Amadeus API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// ============================================
// EXPORTS
// ============================================

export default {
  initTokenManager,
  getValidToken,
  forceRefreshToken,
  getTokenMetrics,
  getTokenStatus,
  getAmadeusHeaders,
  amadeusRequest
};
