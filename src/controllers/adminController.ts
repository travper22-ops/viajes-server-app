// ============================================
// CONTROLADOR DE ADMINISTRACIÓN
// ============================================

import { Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';

// ── Estadísticas del caché ───────────────────────────────────────
export async function getCacheStats(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { data: stats, error } = await supabase
      .from('cache_stats_summary')
      .select('*');

    if (error) throw error;

    const totalEntries  = stats?.reduce((s, r) => s + Number(r.total_entries  || 0), 0) || 0;
    const totalAccesses = stats?.reduce((s, r) => s + Number(r.total_accesses || 0), 0) || 0;
    const totalValid    = stats?.reduce((s, r) => s + Number(r.valid_entries  || 0), 0) || 0;

    // Hit rate últimos 30 días
    const { data: metrics } = await supabase
      .from('cache_performance_metrics')
      .select('total_requests, cache_hits')
      .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
      .limit(30);

    let hitRate = 0;
    if (metrics?.length) {
      const reqs = metrics.reduce((s, m) => s + (m.total_requests || 0), 0);
      const hits = metrics.reduce((s, m) => s + (m.cache_hits || 0), 0);
      hitRate = reqs > 0 ? Math.round((hits / reqs) * 100) : 0;
    }

    res.json({
      totalEntries,
      totalHits: totalAccesses,
      totalMisses: Math.max(0, totalEntries - totalValid),
      hitRate,
      cacheSize: `${(totalEntries * 2).toFixed(1)} KB`,
      lastCleanup: new Date().toISOString()
    });
  } catch (err) {
    console.error('getCacheStats error:', err);
    res.status(500).json({ error: 'Error obteniendo estadísticas del caché' });
  }
}

// ── Entradas del caché ───────────────────────────────────────────
export async function getCacheEntries(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { type, limit = 50 } = req.query;

    let query = supabase
      .from('cache_entries_view')
      .select('*')
      .order('last_accessed', { ascending: false })
      .limit(Number(limit));

    if (type) query = query.eq('cache_type', type);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('getCacheEntries error:', err);
    res.status(500).json({ error: 'Error obteniendo entradas del caché' });
  }
}

// ── Limpiar caché ────────────────────────────────────────────────
export async function clearCache(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { type } = req.query;

    if (type && typeof type === 'string') {
      const validTables = ['flights', 'hotels', 'transfers', 'locations', 'seat_maps', 'baggage'];
      if (!validTables.includes(type)) {
        return res.status(400).json({ error: `Tipo de caché inválido: ${type}` });
      }
      const tableName = `cache_${type}`;
      const { error } = await supabase.from(tableName).delete().lt('expires_at', new Date(Date.now() + 999999999).toISOString());
      if (error) throw error;
    } else {
      const { error } = await supabase.rpc('cleanup_expired_cache');
      if (error) throw error;
    }

    res.json({ success: true, message: 'Caché limpiado exitosamente' });
  } catch (err) {
    console.error('clearCache error:', err);
    res.status(500).json({ error: 'Error limpiando caché' });
  }
}

// ── Métricas de rendimiento ──────────────────────────────────────
export async function getCacheMetrics(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { data, error } = await supabase
      .from('cache_performance_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('getCacheMetrics error:', err);
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
}

// ── Lista de contenido ───────────────────────────────────────────
export async function getContentList(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { type } = req.query;

    let query = supabase
      .from('content_items')
      .select('*')
      .order('updated_at', { ascending: false });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('getContentList error:', err);
    res.status(500).json({ error: 'Error obteniendo contenido' });
  }
}

// ── Actualizar contenido ─────────────────────────────────────────
export async function updateContent(req: Request, res: Response) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });

    const { id } = req.params;
    const { title, content, excerpt, status } = req.body;

    const { data, error } = await supabase
      .from('content_items')
      .update({ title, content, excerpt, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('updateContent error:', err);
    res.status(500).json({ error: 'Error actualizando contenido' });
  }
}
