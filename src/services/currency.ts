// ============================================
// SERVICIO DE CONVERSIÓN DE DIVISAS
// Convierte cualquier moneda a la moneda de liquidación (EUR por defecto)
// Usa exchangerate-api.com (gratuito, sin API key para tasas básicas)
// ============================================

// Moneda en que se liquidan todos los pagos (configurable en .env)
export const SETTLEMENT_CURRENCY = (process.env.SETTLEMENT_CURRENCY || 'EUR').toUpperCase();

// Caché en memoria: { 'USD->EUR': { rate: 0.92, expiresAt: timestamp } }
const rateCache = new Map<string, { rate: number; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

// Tasas de fallback (se usan si la API falla)
const FALLBACK_RATES: Record<string, number> = {
  'USD->EUR': 0.92,
  'GBP->EUR': 1.17,
  'JPY->EUR': 0.0062,
  'ARS->EUR': 0.00095,
  'BRL->EUR': 0.18,
  'MXN->EUR': 0.054,
  'CLP->EUR': 0.00099,
  'PEN->EUR': 0.24,
  'COP->EUR': 0.00022,
  'EUR->EUR': 1,
  'USD->USD': 1,
  'EUR->USD': 1.09,
  'GBP->USD': 1.27,
};

/**
 * Obtiene la tasa de cambio de `from` a `to`
 * Usa caché de 1 hora para no saturar la API gratuita
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  const key = `${from.toUpperCase()}->${to.toUpperCase()}`;

  // Misma moneda — retorno inmediato sin llamada a API
  if (from.toUpperCase() === to.toUpperCase()) return 1;

  // Revisar caché
  const cached = rateCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rate;
  }

  try {
    // API gratuita sin key: https://open.er-api.com
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${from.toUpperCase()}`,
      { signal: AbortSignal.timeout(1500) } // timeout 1.5s
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as { rates: Record<string, number>; result: string };

    if (data.result !== 'success' || !data.rates) {
      throw new Error('Respuesta inválida de la API de divisas');
    }

    const rate = data.rates[to.toUpperCase()];
    if (!rate) throw new Error(`Moneda destino no encontrada: ${to}`);

    // Guardar en caché todas las tasas de esta base
    Object.entries(data.rates).forEach(([currency, r]) => {
      const k = `${from.toUpperCase()}->${currency}`;
      rateCache.set(k, { rate: r as number, expiresAt: Date.now() + CACHE_TTL_MS });
    });

    return rate;
  } catch (err) {
    console.warn(`⚠️  API de divisas falló (${key}), usando tasa de fallback:`, err);

    // Intentar fallback directo
    if (FALLBACK_RATES[key] !== undefined) return FALLBACK_RATES[key];

    // Intentar conversión via USD como moneda puente
    const fromUsd = FALLBACK_RATES[`${from.toUpperCase()}->USD`];
    const usdTo   = FALLBACK_RATES[`USD->${to.toUpperCase()}`];
    if (fromUsd && usdTo) return fromUsd * usdTo;

    // Si no hay fallback, devolver 1 (sin conversión) y loguear
    console.error(`❌ Sin tasa de fallback para ${key}, usando 1:1`);
    return 1;
  }
}

/**
 * Convierte un monto de cualquier moneda a la moneda de liquidación
 * Retorna: { amountSettlement, rate, originalAmount, originalCurrency }
 */
export async function convertToSettlement(
  amount: number,
  fromCurrency: string
): Promise<{
  amountSettlement: number;
  rate: number;
  originalAmount: number;
  originalCurrency: string;
  settlementCurrency: string;
}> {
  const rate = await getExchangeRate(fromCurrency, SETTLEMENT_CURRENCY);
  const amountSettlement = Math.round(amount * rate * 100) / 100; // redondear a 2 decimales

  return {
    amountSettlement,
    rate,
    originalAmount: amount,
    originalCurrency: fromCurrency.toUpperCase(),
    settlementCurrency: SETTLEMENT_CURRENCY,
  };
}

/**
 * Endpoint helper: devuelve tasas de cambio para una lista de monedas
 * (para que el frontend pueda mostrar precios convertidos)
 */
export async function getRatesForCurrencies(
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  await Promise.all(
    targetCurrencies.map(async (target) => {
      results[target] = await getExchangeRate(baseCurrency, target);
    })
  );
  return results;
}
