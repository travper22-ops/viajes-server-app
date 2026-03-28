// ============================================
// CONTROLADOR DE USUARIOS
// ============================================

import { getSupabaseAdmin } from '../config/supabase.js';

// ============================================
// INTERFACES
// ============================================

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  address?: Record<string, unknown>;
}

export interface UserPreferences {
  emailNotifications?: boolean;
  travelReminders?: boolean;
  newsletter?: boolean;
  language?: string;
  currency?: string;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener perfil del usuario
 */
export async function getProfile(userId: string): Promise<{ success: boolean; profile?: Record<string, unknown>; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, profile };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error getting profile:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function updateProfile(
  userId: string, 
  updates: ProfileUpdate
): Promise<{ success: boolean; profile?: Record<string, unknown>; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const allowedFields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'nationality',
      'passport_number',
      'address'
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        filteredUpdates[dbKey] = value;
      }
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, profile };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error updating profile:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtener preferencias del usuario
 */
export async function getPreferences(userId: string): Promise<{ success: boolean; preferences?: Record<string, unknown>; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const defaults = {
      email_notifications: true,
      travel_reminders: true,
      newsletter: false,
      language: 'es',
      currency: 'EUR'
    };

    return { 
      success: true, 
      preferences: preferences || defaults 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error getting preferences:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Actualizar preferencias del usuario
 */
export async function updatePreferences(
  userId: string, 
  updates: UserPreferences
): Promise<{ success: boolean; preferences?: Record<string, unknown>; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return { success: true, preferences };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error updating preferences:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Cambiar contraseña del usuario
 */
export async function changePassword(
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    // Intentar iniciar sesión con la contraseña actual para verificar
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userId, // Assuming userId is email
      password: currentPassword
    });

    if (signInError) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;

    return { success: true, message: 'Contraseña actualizada correctamente' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error changing password:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export default {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  changePassword
};
