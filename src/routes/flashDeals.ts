// ============================================
// FLASH DEALS — Vuelos baratos de última hora
// Busca en rutas populares con salida en 1-7 días
// ============================================

import { Router, Request, Response } from 'express';
import { amadeusRequest } from '../services/amadeus-token-manager.js';
import { transformFlightOffer } from '../services/amadeus.js';

const router = Router();

// Rutas populares para buscar ofertas — cobertura mundial completa
const POPULAR_ROUTES = [

  // ── Europa ↔ Europa ──────────────────────────────────────────────────────
  { from: 'MAD', to: 'CDG' }, { from: 'CDG', to: 'MAD' },
  { from: 'MAD', to: 'LHR' }, { from: 'LHR', to: 'MAD' },
  { from: 'BCN', to: 'FCO' }, { from: 'FCO', to: 'BCN' },
  { from: 'MAD', to: 'AMS' }, { from: 'AMS', to: 'MAD' },
  { from: 'LHR', to: 'FRA' }, { from: 'FRA', to: 'LHR' },
  { from: 'CDG', to: 'FCO' }, { from: 'MAD', to: 'LIS' },

  // ── Sudamérica → Europa ──────────────────────────────────────────────────
  // Colombia
  { from: 'BOG', to: 'MAD' }, { from: 'BOG', to: 'LHR' },
  { from: 'BOG', to: 'CDG' }, { from: 'BOG', to: 'FRA' },
  { from: 'BOG', to: 'AMS' }, { from: 'BOG', to: 'FCO' },
  { from: 'BOG', to: 'LIS' }, { from: 'BOG', to: 'BCN' },
  // Perú
  { from: 'LIM', to: 'MAD' }, { from: 'LIM', to: 'LHR' },
  { from: 'LIM', to: 'CDG' }, { from: 'LIM', to: 'FRA' },
  { from: 'LIM', to: 'AMS' }, { from: 'LIM', to: 'FCO' },
  // Argentina
  { from: 'EZE', to: 'MAD' }, { from: 'EZE', to: 'LHR' },
  { from: 'EZE', to: 'CDG' }, { from: 'EZE', to: 'FRA' },
  { from: 'EZE', to: 'AMS' }, { from: 'EZE', to: 'FCO' },
  { from: 'EZE', to: 'LIS' },
  // Brasil
  { from: 'GRU', to: 'MAD' }, { from: 'GRU', to: 'LHR' },
  { from: 'GRU', to: 'CDG' }, { from: 'GRU', to: 'FRA' },
  { from: 'GRU', to: 'AMS' }, { from: 'GRU', to: 'LIS' },
  { from: 'GIG', to: 'MAD' }, { from: 'GIG', to: 'LHR' },
  // Chile
  { from: 'SCL', to: 'MAD' }, { from: 'SCL', to: 'LHR' },
  { from: 'SCL', to: 'CDG' }, { from: 'SCL', to: 'FRA' },
  // Venezuela
  { from: 'CCS', to: 'MAD' }, { from: 'CCS', to: 'LHR' },
  { from: 'CCS', to: 'CDG' }, { from: 'CCS', to: 'LIS' },
  // Ecuador
  { from: 'UIO', to: 'MAD' }, { from: 'UIO', to: 'CDG' },
  { from: 'GYE', to: 'MAD' }, { from: 'GYE', to: 'LHR' },
  // Bolivia
  { from: 'VVI', to: 'MAD' }, { from: 'LPB', to: 'MAD' },
  // Paraguay
  { from: 'ASU', to: 'MAD' }, { from: 'ASU', to: 'CDG' },
  // Uruguay
  { from: 'MVD', to: 'MAD' }, { from: 'MVD', to: 'LHR' },
  { from: 'MVD', to: 'CDG' }, { from: 'MVD', to: 'FRA' },
  // México (Centroamérica/Norteamérica hispanohablante)
  { from: 'MEX', to: 'MAD' }, { from: 'MEX', to: 'CDG' },
  { from: 'MEX', to: 'LHR' }, { from: 'MEX', to: 'FRA' },
  // Cuba / Caribe
  { from: 'HAV', to: 'MAD' }, { from: 'HAV', to: 'CDG' },
  { from: 'SDQ', to: 'MAD' }, { from: 'SDQ', to: 'CDG' },
  { from: 'PTY', to: 'MAD' }, { from: 'PTY', to: 'CDG' },

  // ── Europa → Sudamérica ──────────────────────────────────────────────────
  { from: 'MAD', to: 'BOG' }, { from: 'MAD', to: 'LIM' },
  { from: 'MAD', to: 'EZE' }, { from: 'MAD', to: 'GRU' },
  { from: 'MAD', to: 'SCL' }, { from: 'MAD', to: 'CCS' },
  { from: 'MAD', to: 'UIO' }, { from: 'MAD', to: 'MVD' },
  { from: 'MAD', to: 'ASU' }, { from: 'MAD', to: 'MEX' },
  { from: 'LHR', to: 'GIG' }, { from: 'LHR', to: 'EZE' },
  { from: 'LHR', to: 'BOG' }, { from: 'LHR', to: 'LIM' },
  { from: 'CDG', to: 'SCL' }, { from: 'CDG', to: 'GRU' },
  { from: 'CDG', to: 'BOG' }, { from: 'CDG', to: 'EZE' },
  { from: 'FRA', to: 'GRU' }, { from: 'FRA', to: 'EZE' },
  { from: 'AMS', to: 'BOG' }, { from: 'AMS', to: 'LIM' },
  { from: 'LIS', to: 'GRU' }, { from: 'LIS', to: 'EZE' },
  { from: 'LIS', to: 'BOG' }, { from: 'LIS', to: 'LIM' },
  { from: 'FCO', to: 'GRU' }, { from: 'FCO', to: 'EZE' },

  // ── Sudamérica → Estados Unidos ──────────────────────────────────────────
  { from: 'BOG', to: 'MIA' }, { from: 'BOG', to: 'JFK' },
  { from: 'BOG', to: 'LAX' }, { from: 'BOG', to: 'ORD' },
  { from: 'BOG', to: 'IAH' }, { from: 'BOG', to: 'ATL' },
  { from: 'LIM', to: 'MIA' }, { from: 'LIM', to: 'JFK' },
  { from: 'LIM', to: 'LAX' }, { from: 'LIM', to: 'IAH' },
  { from: 'EZE', to: 'MIA' }, { from: 'EZE', to: 'JFK' },
  { from: 'EZE', to: 'LAX' }, { from: 'EZE', to: 'ORD' },
  { from: 'GRU', to: 'MIA' }, { from: 'GRU', to: 'JFK' },
  { from: 'GRU', to: 'LAX' }, { from: 'GRU', to: 'IAH' },
  { from: 'SCL', to: 'MIA' }, { from: 'SCL', to: 'JFK' },
  { from: 'SCL', to: 'LAX' }, { from: 'SCL', to: 'IAH' },
  { from: 'CCS', to: 'MIA' }, { from: 'CCS', to: 'JFK' },
  { from: 'UIO', to: 'MIA' }, { from: 'UIO', to: 'JFK' },
  { from: 'GYE', to: 'MIA' }, { from: 'GYE', to: 'JFK' },
  { from: 'MVD', to: 'MIA' }, { from: 'MVD', to: 'JFK' },
  { from: 'ASU', to: 'MIA' }, { from: 'ASU', to: 'JFK' },
  { from: 'MEX', to: 'MIA' }, { from: 'MEX', to: 'JFK' },
  { from: 'MEX', to: 'LAX' }, { from: 'MEX', to: 'ORD' },
  { from: 'HAV', to: 'MIA' }, { from: 'SDQ', to: 'MIA' },
  { from: 'SDQ', to: 'JFK' }, { from: 'PTY', to: 'MIA' },
  { from: 'PTY', to: 'JFK' },

  // ── Estados Unidos → Sudamérica ──────────────────────────────────────────
  { from: 'MIA', to: 'BOG' }, { from: 'MIA', to: 'LIM' },
  { from: 'MIA', to: 'EZE' }, { from: 'MIA', to: 'GRU' },
  { from: 'MIA', to: 'SCL' }, { from: 'MIA', to: 'CCS' },
  { from: 'MIA', to: 'UIO' }, { from: 'MIA', to: 'MVD' },
  { from: 'MIA', to: 'ASU' }, { from: 'MIA', to: 'MEX' },
  { from: 'JFK', to: 'BOG' }, { from: 'JFK', to: 'LIM' },
  { from: 'JFK', to: 'EZE' }, { from: 'JFK', to: 'GRU' },
  { from: 'JFK', to: 'SCL' }, { from: 'JFK', to: 'MEX' },
  { from: 'LAX', to: 'BOG' }, { from: 'LAX', to: 'LIM' },
  { from: 'LAX', to: 'GRU' }, { from: 'LAX', to: 'SCL' },
  { from: 'LAX', to: 'MEX' }, { from: 'IAH', to: 'BOG' },
  { from: 'IAH', to: 'LIM' }, { from: 'IAH', to: 'GRU' },
  { from: 'ORD', to: 'BOG' }, { from: 'ORD', to: 'MEX' },
  { from: 'ATL', to: 'BOG' }, { from: 'ATL', to: 'LIM' },

  // ── Sudamérica ↔ Sudamérica ──────────────────────────────────────────────
  { from: 'BOG', to: 'LIM' }, { from: 'LIM', to: 'BOG' },
  { from: 'BOG', to: 'EZE' }, { from: 'EZE', to: 'BOG' },
  { from: 'BOG', to: 'GRU' }, { from: 'GRU', to: 'BOG' },
  { from: 'BOG', to: 'SCL' }, { from: 'SCL', to: 'BOG' },
  { from: 'LIM', to: 'EZE' }, { from: 'EZE', to: 'LIM' },
  { from: 'LIM', to: 'GRU' }, { from: 'GRU', to: 'LIM' },
  { from: 'LIM', to: 'SCL' }, { from: 'SCL', to: 'LIM' },
  { from: 'GRU', to: 'EZE' }, { from: 'EZE', to: 'GRU' },
  { from: 'GRU', to: 'SCL' }, { from: 'SCL', to: 'GRU' },
  { from: 'BOG', to: 'CCS' }, { from: 'CCS', to: 'BOG' },
  { from: 'BOG', to: 'UIO' }, { from: 'UIO', to: 'BOG' },
  { from: 'LIM', to: 'UIO' }, { from: 'UIO', to: 'LIM' },
  { from: 'BOG', to: 'MVD' }, { from: 'MVD', to: 'EZE' },
  { from: 'BOG', to: 'ASU' }, { from: 'ASU', to: 'EZE' },

  // ── Europa ↔ Asia ────────────────────────────────────────────────────────
  { from: 'MAD', to: 'DXB' }, { from: 'DXB', to: 'MAD' },
  { from: 'LHR', to: 'BKK' }, { from: 'BKK', to: 'LHR' },
  { from: 'CDG', to: 'NRT' }, { from: 'NRT', to: 'CDG' },
  { from: 'FRA', to: 'SIN' }, { from: 'SIN', to: 'FRA' },
  { from: 'LHR', to: 'HKG' }, { from: 'HKG', to: 'LHR' },

  // ── Sudamérica ↔ Asia ────────────────────────────────────────────────────
  { from: 'GRU', to: 'NRT' }, { from: 'NRT', to: 'GRU' },
  { from: 'BOG', to: 'DXB' }, { from: 'DXB', to: 'BOG' },
  { from: 'EZE', to: 'NRT' }, { from: 'SCL', to: 'NRT' },

  // ── África ↔ Europa / América ────────────────────────────────────────────
  { from: 'CMN', to: 'MAD' }, { from: 'MAD', to: 'CMN' },
  { from: 'JNB', to: 'LHR' }, { from: 'LHR', to: 'JNB' },
  { from: 'CAI', to: 'CDG' }, { from: 'CDG', to: 'CAI' },
  { from: 'LOS', to: 'LHR' }, { from: 'MIA', to: 'JNB' },
  { from: 'JNB', to: 'GRU' }, { from: 'GRU', to: 'JNB' },

  // ── Caribe ↔ Europa / EEUU ───────────────────────────────────────────────
  { from: 'HAV', to: 'CDG' }, { from: 'CDG', to: 'HAV' },
  { from: 'MIA', to: 'HAV' }, { from: 'JFK', to: 'SDQ' },
  { from: 'SDQ', to: 'CDG' }, { from: 'PTY', to: 'CDG' },
];

// Cache simple en memoria (30 min)
let cachedDeals: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function fetchFlashDeals(): Promise<any[]> {
  const now = Date.now();
  if (cachedDeals && now - cacheTime < CACHE_TTL) return cachedDeals;

  const deals: any[] = [];
  // Fechas: mañana y pasado mañana
  const dates: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Buscar en paralelo — rotamos 8 rutas aleatorias cada ciclo de caché
  const shuffled = [...POPULAR_ROUTES].sort(() => Math.random() - 0.5)
  const routesToSearch = shuffled.slice(0, 8);
  const searches = routesToSearch.flatMap(route =>
    dates.slice(0, 2).map(date => ({ ...route, date }))
  );

  const results = await Promise.allSettled(
    searches.map(async ({ from, to, date }) => {
      const qs = new URLSearchParams({
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate: date,
        adults: '1',
        max: '3',
        travelClass: 'ECONOMY',
      });
      const resp = await amadeusRequest<any>(`/v2/shopping/flight-offers?${qs}`);
      return (resp.data || []).map((f: any) =>
        transformFlightOffer(f, resp.dictionaries || {})
      );
    })
  );

  results.forEach(r => {
    if (r.status === 'fulfilled') deals.push(...r.value);
  });

  // Ordenar por precio y quedarse con los 12 más baratos
  // Umbral más alto para rutas intercontinentales
  const sorted = deals
    .filter(d => parseFloat(d.price?.total || '9999') < 900)
    .sort((a, b) => parseFloat(a.price?.total) - parseFloat(b.price?.total))
    .slice(0, 12);

  cachedDeals = sorted;
  cacheTime = now;
  return sorted;
}

// GET /api/v1/flash-deals
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const deals = await fetchFlashDeals();
    res.json({ success: true, data: deals, cachedAt: new Date(cacheTime).toISOString() });
  } catch (err) {
    console.error('❌ Flash deals error:', err);
    res.json({ success: true, data: [], error: 'No se pudieron cargar ofertas en este momento' });
  }
});

// POST /api/v1/flash-deals/subscribe — guarda suscripción push
router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      res.status(400).json({ success: false, error: 'Suscripción inválida' });
      return;
    }
    // En producción guardarías esto en Supabase
    // Por ahora confirmamos recepción
    console.log('📲 Nueva suscripción push registrada:', subscription.endpoint.slice(0, 60) + '...');
    res.json({ success: true, message: 'Suscripción registrada' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error registrando suscripción' });
  }
});

export default router;
