// ============================================
// SERVICIO DE CACHÉ INTELIGENTE
// Reduce costos de APIs y mejora rendimiento
// ============================================

import { getSupabaseAdmin } from '../config/supabase.js';

export interface CacheConfig {
  ttl: number; // Time To Live en minutos
  maxAge: number; // Edad máxima para considerar caché válido en minutos
  enableCache: boolean;
}

export interface CacheEntry<T = any> {
  id: string;
  cache_key: string;
  search_params: any;
  response_data: T;
  total_results: number;
  created_at: string;
  expires_at: string;
  last_accessed: string;
  access_count: number;
  is_valid: boolean;
}

// ============================================
// CONFIGURACIONES DE CACHÉ POR TIPO
// ============================================

const CACHE_CONFIGS = {
  // === AEROLÍNEAS Y AEROPUERTOS ===
  flights: {
    ttl: 360, // 6 horas - OPTIMIZADO PARA AHORRAR TOKENS
    maxAge: 720, // 12 horas máximo
    enableCache: true
  },
  'airport-routes': {
    ttl: 86400, // 1 día - Rutas de aeropuertos cambian poco
    maxAge: 172800, // 2 días máximo
    enableCache: true
  },
  'airline-routes': {
    ttl: 86400, // 1 día
    maxAge: 172800, // 2 días máximo
    enableCache: true
  },
  
  // === HOTELES ===
  hotels: {
    ttl: 720, // 12 horas - OPTIMIZADO
    maxAge: 1440, // 24 horas máximo
    enableCache: true
  },
  'hotel-autocomplete': {
    ttl: 259200, // 3 días
    maxAge: 604800, // 7 días máximo
    enableCache: true
  },
  'hotel-ratings': {
    ttl: 43200, // 30 días - Las ratings cambian poco
    maxAge: 86400, // 60 días máximo
    enableCache: true
  },
  
  // === TRANSFERS Y TRANSPORTE ===
  transfers: {
    ttl: 2880, // 48 horas (2 días) - OPTIMIZADO
    maxAge: 4320, // 72 horas máximo
    enableCache: true
  },
  buses: {
    ttl: 360, // 6 horas - OPTIMIZADO
    maxAge: 720, // 12 horas máximo
    enableCache: true
  },
  
  // === UBICACIONES Y DESTINOS ===
  locations: {
    ttl: 43200, // 30 días - MÁXIMO AHORRO
    maxAge: 86400, // 60 días máximo
    enableCache: true
  },
  'tour-activities': {
    ttl: 86400, // 1 día
    maxAge: 172800, // 2 días máximo
    enableCache: true
  },
  'points-of-interest': {
    ttl: 259200, // 3 días
    maxAge: 604800, // 7 días máximo
    enableCache: true
  },
  
  // === ASIENTOS Y EQUIPAJE ===
  seat_maps: {
    ttl: 120, // 2 horas - OPTIMIZADO
    maxAge: 240, // 4 horas máximo
    enableCache: true
  },
  baggage: {
    ttl: 720, // 12 horas - OPTIMIZADO
    maxAge: 1440, // 24 horas máximo
    enableCache: true
  },
  
  // === PRECIOS (NO cachear demasiado) ===
  pricing: {
    ttl: 60, // 1 hora
    maxAge: 120, // 2 horas máximo
    enableCache: true
  },
  'price-confirmation': {
    ttl: 30, // 30 minutos - Solo para comparar precios
    maxAge: 60, // 1 hora máximo
    enableCache: true
  },
  
  // === RESERVAS Y BOOKING ===
  'booking-data': {
    ttl: 0, // No cachear - siempre fresco
    maxAge: 0,
    enableCache: false
  },
  'order-status': {
    ttl: 0, // No cachear
    maxAge: 0,
    enableCache: false
  }
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Genera una clave de caché única basada en los parámetros
 */
export function generateCacheKey(params: any, prefix: string): string {
  // Ordenar las keys del objeto para que el mismo conjunto de params siempre genere la misma key
  const sortKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    return Object.keys(obj).sort().reduce((acc: any, k) => {
      acc[k] = sortKeys(obj[k]);
      return acc;
    }, {});
  };
  const sortedParams = JSON.stringify(sortKeys(params));
  // Usar un hash simple pero confiable (djb2)
  let hash = 5381;
  for (let i = 0; i < sortedParams.length; i++) {
    hash = ((hash << 5) + hash) ^ sortedParams.charCodeAt(i);
    hash = hash >>> 0; // mantener como uint32
  }
  return `${prefix}_${hash.toString(16).padStart(8, '0')}`;
}

/**
 * Verifica si una entrada de caché es válida
 */
export function isCacheValid(entry: CacheEntry, config: CacheConfig): boolean {
  if (!entry.is_valid) return false;

  const now = new Date();
  const expiresAt = new Date(entry.expires_at);
  const createdAt = new Date(entry.created_at);

  // Verificar si no ha expirado
  if (expiresAt <= now) return false;

  // Verificar si no es demasiado antigua
  const maxAge = new Date(createdAt.getTime() + config.maxAge * 60 * 1000);
  if (now > maxAge) return false;

  return true;
}

// ============================================
// CLASE PRINCIPAL DEL SERVICIO DE CACHÉ
// ============================================

export class CacheService {
  private config: CacheConfig;

  constructor(private cacheType: keyof typeof CACHE_CONFIGS) {
    this.config = CACHE_CONFIGS[cacheType];
  }

  /**
   * Obtiene datos del caché o ejecuta la función de fetch
   */
  async getOrFetch<T>(
    params: any,
    fetchFunction: () => Promise<{ data: T; totalResults?: number }>,
    customKey?: string
  ): Promise<{ data: T; fromCache: boolean; totalResults?: number }> {
    if (!this.config.enableCache) {
      const result = await fetchFunction();
      return { ...result, fromCache: false };
    }

    const cacheKey = customKey || generateCacheKey(params, this.cacheType);

    try {
      // Intentar obtener del caché
      const cached = await this.getFromCache(cacheKey);

      if (cached && isCacheValid(cached, this.config)) {
        // Actualizar estadísticas de hit
        await this.updateCacheStats(true);

        // Actualizar last_accessed
        await this.updateLastAccessed(cached.id);

        return {
          data: cached.response_data,
          fromCache: true,
          totalResults: cached.total_results
        };
      }

      // No hay caché válido, hacer la llamada a la API
      const result = await fetchFunction();

      // Guardar en caché
      await this.saveToCache(cacheKey, params, result.data, result.totalResults);

      // Actualizar estadísticas de miss
      await this.updateCacheStats(false);

      return { ...result, fromCache: false };

    } catch (error) {
      console.error(`Error en caché ${this.cacheType}:`, error);

      // En caso de error, intentar devolver caché expirado si existe
      try {
        const expiredCache = await this.getFromCache(cacheKey, true);
        if (expiredCache) {
          console.warn(`Usando caché expirado para ${cacheKey}`);
          return {
            data: expiredCache.response_data,
            fromCache: true,
            totalResults: expiredCache.total_results
          };
        }
      } catch (cacheError) {
        console.error('Error obteniendo caché expirado:', cacheError);
      }

      throw error;
    }
  }

  /**
   * Obtiene datos del caché
   */
  private async getFromCache(cacheKey: string, includeExpired = false): Promise<CacheEntry | null> {
    const tableName = `cache_${this.cacheType}`;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.error('Supabase no configurado - saltando caché');
      return null;
    }

    let query = supabase
      .from(tableName)
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('is_valid', true);

    if (!includeExpired) {
      query = query.gt('expires_at', new Date().toISOString());
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error(`Error obteniendo caché ${tableName}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Guarda datos en el caché
   */
  private async saveToCache(cacheKey: string, params: any, data: any, totalResults = 0): Promise<void> {
    const tableName = `cache_${this.cacheType}`;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.error('Supabase no configurado - no se puede guardar en caché');
      return;
    }

    const expiresAt = new Date(Date.now() + this.config.ttl * 60 * 1000);

    // Primero intentamos actualizar, si no existe entonces insertamos
    const { error: updateError, count } = await supabase
      .from(tableName)
      .update({
        search_params: params,
        response_data: data,
        total_results: totalResults,
        expires_at: expiresAt.toISOString(),
        is_valid: true,
        created_at: new Date().toISOString()
      })
      .eq('cache_key', cacheKey)
      .select('cache_key', { count: 'exact', head: true });

    // Si no se actualizó ninguna fila, insertamos
    if (!updateError && count === 0) {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({
          cache_key: cacheKey,
          search_params: params,
          response_data: data,
          total_results: totalResults,
          expires_at: expiresAt.toISOString(),
          is_valid: true,
          created_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          access_count: 0
        });

      if (insertError && insertError.code !== '23505') { // 23505 = duplicate key
        console.error(`Error guardando en caché ${tableName}:`, insertError);
      }
    }
  }

  /**
   * Actualiza la última vez que se accedió al caché
   */
  private async updateLastAccessed(cacheId: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('Supabase no configurado');
      return;
    }

    const tableName = `cache_${this.cacheType}`;

    const { error } = await supabase
      .from(tableName)
      .update({
        last_accessed: new Date().toISOString()
      })
      .eq('id', cacheId);

    if (error) {
      console.error(`Error actualizando last_accessed en ${tableName}:`, error);
    }
  }

  /**
   * Actualiza estadísticas del caché
   */
  private async updateCacheStats(wasHit: boolean): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('Supabase no configurado');
      return;
    }

    const { error } = await supabase.rpc('update_cache_access', {
      cache_type_param: this.cacheType,
      was_hit: wasHit
    });

    if (error) {
      console.error('Error actualizando estadísticas de caché:', error);
    }
  }

  /**
   * Invalida una entrada específica del caché
   */
  async invalidate(cacheKey: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('Supabase no configurado');
      return;
    }

    const tableName = `cache_${this.cacheType}`;

    const { error } = await supabase
      .from(tableName)
      .update({ is_valid: false })
      .eq('cache_key', cacheKey);

    if (error) {
      console.error(`Error invalidando caché ${tableName}:`, error);
    }
  }

  /**
   * Limpia todo el caché expirado
   */
  async cleanExpired(): Promise<number> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('Supabase no configurado');
      return 0;
    }

    const { data, error } = await supabase.rpc('clean_expired_cache');

    if (error) {
      console.error('Error limpiando caché expirado:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getStats(): Promise<any> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('Supabase no configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('cache_monitoring')
      .select('*')
      .eq('cache_type', this.cacheType)
      .single();

    if (error) {
      console.error('Error obteniendo estadísticas de caché:', error);
      return null;
    }

    return data;
  }
}

// ============================================
// INSTANCIAS DE SERVICIOS DE CACHÉ
// ============================================

export const flightsCache = new CacheService('flights');
export const hotelsCache = new CacheService('hotels');
export const transfersCache = new CacheService('transfers');
export const locationsCache = new CacheService('locations');
export const seatMapsCache = new CacheService('seat_maps');
export const baggageCache = new CacheService('baggage');
export const pricingCache = new CacheService('pricing');
export const busesCache = new CacheService('buses');

// ============================================
// FUNCIONES DE UTILIDAD PARA INTEGRACIÓN
// ============================================

/**
 * Wrapper para búsquedas de vuelos con caché
 */
export async function searchFlightsWithCache(params: any, amadeusSearchFunction: () => Promise<any>) {
  return flightsCache.getOrFetch(params, amadeusSearchFunction);
}

/**
 * Wrapper para búsquedas de hoteles con caché
 */
export async function searchHotelsWithCache(params: any, amadeusSearchFunction: () => Promise<any>) {
  return hotelsCache.getOrFetch(params, amadeusSearchFunction);
}

/**
 * Wrapper para búsquedas de traslados con caché
 */
export async function searchTransfersWithCache(params: any, amadeusSearchFunction: () => Promise<any>) {
  return transfersCache.getOrFetch(params, amadeusSearchFunction);
}

/**
 * Wrapper para búsquedas de ubicaciones con caché
 */
export async function searchLocationsWithCache(params: any, amadeusSearchFunction: () => Promise<any>) {
  return locationsCache.getOrFetch(params, amadeusSearchFunction);
}

/**
 * Wrapper para mapas de asientos con caché
 */
export async function getSeatMapWithCache(flightOfferId: string, amadeusFunction: () => Promise<any>) {
  return seatMapsCache.getOrFetch({ flightOfferId }, amadeusFunction, `seatmap_${flightOfferId}`);
}

/**
 * Wrapper para equipaje con caché
 */
export async function getBaggageWithCache(flightOfferId: string, amadeusFunction: () => Promise<any>) {
  return baggageCache.getOrFetch({ flightOfferId }, amadeusFunction, `baggage_${flightOfferId}`);
}

/**
 * Wrapper para pricing con caché
 */
export async function getPricingWithCache(offerId: string, offerType: string, amadeusFunction: () => Promise<any>) {
  return pricingCache.getOrFetch({ offerId, offerType }, amadeusFunction, `pricing_${offerType}_${offerId}`);
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN DEL CACHÉ
// ============================================

/**
 * Obtiene estadísticas generales del caché
 */
export async function getCacheStats(): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('Supabase no configurado');
    return [];
  }

  const { data, error } = await supabase
    .from('cache_monitoring')
    .select('*')
    .order('cache_type');

  if (error) {
    console.error('Error obteniendo estadísticas de caché:', error);
    return [];
  }

  return data || [];
}

/**
 * Limpia todo el caché expirado
 */
export async function cleanAllExpiredCache(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('Supabase no configurado');
    return 0;
  }

  const { data, error } = await supabase.rpc('clean_expired_cache');

  if (error) {
    console.error('Error limpiando caché expirado:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Invalida todo el caché de un tipo específico
 */
export async function invalidateCacheType(cacheType: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('Supabase no configurado');
    return;
  }

  const tableName = `cache_${cacheType}`;

  const { error } = await supabase
    .from(tableName)
    .update({ is_valid: false })
    .eq('is_valid', true);

  if (error) {
    console.error(`Error invalidando caché ${tableName}:`, error);
  }
}

/**
 * Obtiene las estadísticas de uso del caché por día
 */
export async function getCacheUsageStats(days = 30): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('Supabase no configurado');
    return [];
  }

  const { data, error } = await supabase
    .from('cache_stats')
    .select('*')
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error obteniendo estadísticas de uso:', error);
    return [];
  }

  return data || [];
}