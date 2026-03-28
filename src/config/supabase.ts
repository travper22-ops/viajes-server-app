// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import env from './env.js';

// ============================================
// INTERFACES
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      bookings: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      payments: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
}

// ============================================
// CLIENTES
// ============================================

let supabaseAdmin: SupabaseClient | null = null;
let supabaseAnon: SupabaseClient | null = null;

/**
 * Inicializa los clientes de Supabase
 */
export function initSupabase(): {
  admin: SupabaseClient | null;
  anon: SupabaseClient | null;
} {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase no configurado');
    return { admin: null, anon: null };
  }
  
  try {
    // Cliente anon (para frontend)
    supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    
    // Cliente admin (para server - tiene más permisos)
    if (env.SUPABASE_SERVICE_KEY) {
      supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    
    console.log('✅ Supabase conectado correctamente');
    return { admin: supabaseAdmin, anon: supabaseAnon };
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return { admin: null, anon: null };
  }
}

/**
 * Obtiene el cliente de Supabase para admin
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseAdmin) {
    const { admin } = initSupabase();
    return admin;
  }
  return supabaseAdmin;
}

/**
 * Obtiene el cliente de Supabase anon
 */
export function getSupabaseAnon(): SupabaseClient | null {
  if (!supabaseAnon) {
    const { anon } = initSupabase();
    return anon;
  }
  return supabaseAnon;
}

// ============================================
// HELPERS DE BASE DE DATOS
// ============================================

/**
 * Query builder genérico
 */
export async function queryTable(
  table: string,
  options: {
    select?: string;
    eq?: { column: string; value: unknown };
    in?: { column: string; values: unknown[] };
    order?: { column: string; ascending?: boolean };
    limit?: number;
    range?: { from: number; to: number };
  } = {}
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  
  let query = supabase.from(table).select(options.select || '*');
  
  if (options.eq) {
    query = query.eq(options.eq.column, options.eq.value);
  }
  
  if (options.in) {
    query = query.in(options.in.column, options.in.values);
  }
  
  if (options.order) {
    query = query.order(options.order.column, { 
      ascending: options.order.ascending ?? true 
    });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.range) {
    query = query.range(options.range.from, options.range.to);
  }
  
  return query;
}

/**
 * Inserta un registro
 */
export async function insertRecord(
  table: string,
  data: Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  
  return supabase.from(table).insert(data);
}

/**
 * Actualiza un registro
 */
export async function updateRecord(
  table: string,
  id: string,
  data: Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  
  return supabase.from(table).update(data).eq('id', id);
}

/**
 * Elimina un registro
 */
export async function deleteRecord(
  table: string,
  id: string
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  
  return supabase.from(table).delete().eq('id', id);
}

/**
 * Obtiene un registro por ID
 */
export async function getRecordById(
  table: string,
  id: string
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  
  return supabase.from(table).select('*').eq('id', id).single();
}

export default {
  initSupabase,
  getSupabaseAdmin,
  getSupabaseAnon,
  queryTable,
  insertRecord,
  updateRecord,
  deleteRecord,
  getRecordById
};
