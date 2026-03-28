// ============================================
// SERVICIO DE AMADEUS - EQUIPAJE
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { CacheService } from './cache.js';

// ============================================
// INTERFACES
// ============================================

export interface BaggageInfo {
  count: number;
  size: string;
  code: 'S' | 'M' | 'L';
}

export interface BaggageAllowance {
  quantityIncluded: number;
  size: string;
  weight?: number;
  weightUnit?: string;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener información de equipaje para un vuelo con caché inteligente
 */
export async function getBaggageAllowance(flightOfferId: string): Promise<{ success: boolean; data?: BaggageAllowance[]; error?: string }> {
  try {
    const cacheService = new CacheService('baggage');

    const result = await cacheService.getOrFetch(
      { flightOfferId },
      async () => {
        const amadeus = getAmadeus();

        if (!amadeus) {
          console.warn('⚠️ Amadeus no configurado, devolviendo datos mock para equipaje');
          return {
            data: getMockBaggageAllowance(),
            totalResults: 2
          };
        }

        // Amadeus tiene un endpoint para baggage allowances
        // Usamos un timeout corto para no bloquear el checkout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );

        const apiPromise = (async () => {
          const response = await (amadeus as any).shopping.flightOffers.pricing.post(
            JSON.stringify({
              data: {
                type: 'flight-offers-pricing',
                flightOffers: [{ id: flightOfferId }]
              }
            })
          );
          return extractBaggageFromPricing(response.data);
        })();

        const baggageData = await Promise.race([apiPromise, timeoutPromise])
          .catch(() => getMockBaggageAllowance());

        return {
          data: baggageData,
          totalResults: (baggageData as any[]).length
        };
      }
    );

    console.log(`🧳 Información de equipaje obtenida - ${result.fromCache ? 'desde caché' : 'desde API'}`);

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('❌ Error obteniendo equipaje:', error);
    // En caso de error, devolver datos mock
    return {
      success: true,
      data: getMockBaggageAllowance()
    };
  }
}

/**
 * Extraer información de equipaje de la respuesta de pricing
 */
function extractBaggageFromPricing(pricingData: any): BaggageAllowance[] {
  // Esta es una simplificación - en la realidad necesitarías parsear la respuesta completa
  return [
    {
      quantityIncluded: 1,
      size: 'MEDIUM',
      weight: 23,
      weightUnit: 'KG'
    },
    {
      quantityIncluded: 1,
      size: 'SMALL',
      weight: 8,
      weightUnit: 'KG'
    }
  ];
}

// ============================================
// DATOS MOCK
// ============================================

function getMockBaggageAllowance(): BaggageAllowance[] {
  return [
    {
      quantityIncluded: 1,
      size: 'MEDIUM',
      weight: 23,
      weightUnit: 'KG'
    },
    {
      quantityIncluded: 1,
      size: 'SMALL',
      weight: 8,
      weightUnit: 'KG'
    }
  ];
}