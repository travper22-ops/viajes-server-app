// ============================================
// RUTAS DE AUTENTICACIÓN (SUPABASE AUTH)
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin, getSupabaseAnon } from '../config/supabase.js';
import env from '../config/env.js';

const router = Router();

// ============================================
// INTERFACES
// ============================================

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name?: string;           // legacy
  firstName?: string;      // from frontend signup form
  lastName: string;
  phone?: string;
}

// ============================================
// HELPERS
// ============================================

function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

// ============================================
// VALIDACIÓN
// ============================================

function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Email y contraseña son requeridos'
      }
    });
    return;
  }

  next();
}

function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { email, password, name, firstName, lastName } = req.body as RegisterBody;
  const resolvedName = firstName || name;

  if (!email || !password || !resolvedName || !lastName) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Email, contraseña, nombre y apellido son requeridos'
      }
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: {
        code: 'WEAK_PASSWORD',
        message: 'La contraseña debe tener al menos 6 caracteres'
      }
    });
    return;
  }

  next();
}

// ============================================
// RUTAS - Usando Supabase Auth
// ============================================

// Login - Usa Supabase Auth
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;
    
    const supabaseAnon = getSupabaseAnon();
    
    if (!supabaseAnon) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' }
      });
      return;
    }

    // Buscar perfil de usuario
    const supabaseAdmin = getSupabaseAdmin();
    let userProfile = null;
    
    if (supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      userProfile = profile;
    }

    // Generar token JWT
    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email!,
      role: userProfile?.is_admin ? 'admin' : 'user'
    });

    res.json({
      success: true,
      token,
      access_token: token,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userProfile?.full_name || authData.user.user_metadata?.name || '',
          firstName: (userProfile?.full_name || '').split(' ')[0] || authData.user.user_metadata?.name || '',
          lastName: (userProfile?.full_name || '').split(' ').slice(1).join(' ') || authData.user.user_metadata?.lastName || '',
          role: userProfile?.is_admin ? 'admin' : 'user',
          phone: userProfile?.phone || ''
        },
        token,
        access_token: token
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_ERROR', message: errorMessage }
    });
  }
});

// Registro - Usa Supabase Auth
router.post('/register', validateRegister, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, lastName, phone } = req.body as RegisterBody;
    const name = req.body.firstName || req.body.name || '';
    
    const supabaseAnon = getSupabaseAnon();
    
    if (!supabaseAnon) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          lastName
        }
      }
    });

    if (authError) {
      res.status(400).json({
        success: false,
        error: { code: 'REGISTER_ERROR', message: authError.message }
      });
      return;
    }

    if (!authData.user) {
      res.status(500).json({
        success: false,
        error: { code: 'REGISTER_ERROR', message: 'Error al crear usuario' }
      });
      return;
    }

    // Crear perfil de usuario
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      await supabaseAdmin.from('user_profiles').insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: `${name} ${lastName}`.trim(),
        phone: phone || null,
        is_admin: false
      });
    }

    // Generar token JWT
    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email!,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          lastName,
          role: 'user'
        },
        token
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'REGISTER_ERROR', message: errorMessage }
    });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

// ============================================
// ENDPOINT ADMIN: Crear usuario directamente (sin email confirmation)
// ============================================
router.post('/admin/create-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, lastName, phone, role = 'user' } = req.body;

    if (!email || !password || !name || !lastName) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Faltan campos requeridos' }
      });
      return;
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Base de datos no configurada' }
      });
      return;
    }

    // Crear usuario en Supabase Auth (admin)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: { name, lastName }
    });

    if (authError) {
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_ERROR', message: authError.message }
      });
      return;
    }

    if (!authData.user) {
      res.status(500).json({
        success: false,
        error: { code: 'CREATE_ERROR', message: 'Error al crear usuario' }
      });
      return;
    }

    // Crear perfil
    await supabaseAdmin.from('user_profiles').insert({
      id: authData.user.id,
      email: email.toLowerCase(),
      full_name: `${name} ${lastName}`.trim(),
      phone: phone || null,
      is_admin: role === 'admin'
    });

    // Generar token
    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email!,
      role
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          lastName,
          role
        },
        token
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'ADMIN_CREATE_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// REFRESH TOKEN - Renovar token de acceso
// ============================================
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token es requerido' }
      });
      return;
    }

    // Usar Supabase para renovar el token
    const supabaseAnon = getSupabaseAnon();
    
    if (!supabaseAnon) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: 'Supabase no configurado' }
      });
      return;
    }

    // Intercambiar refresh token por nuevos tokens
    const { data: sessionData, error: sessionError } = await (supabaseAnon.auth as any).setSession({ access_token: refresh_token, refresh_token
    });

    if (sessionError) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Token de refresh inválido o expirado' }
      });
      return;
    }

    if (!sessionData.session) {
      res.status(401).json({
        success: false,
        error: { code: 'NO_SESSION', message: 'No se pudo crear una sesión' }
      });
      return;
    }

    // Generar nuestro propio JWT
    const user = sessionData.user;
    const token = generateToken({
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user'
    });

    res.json({
      success: true,
      data: {
        token,
        refresh_token: sessionData.session.refresh_token,
        expires_in: sessionData.session.expires_in,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
          lastName: user.user_metadata?.lastName
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en refresh token:', errorMessage);
    res.status(500).json({
      success: false,
      error: { code: 'REFRESH_ERROR', message: errorMessage }
    });
  }
});

// ============================================
// GET /me — Perfil del usuario autenticado
// ============================================
import { requireAuth, AuthRequest } from '../middleware/auth.js';

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } });
      return;
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'BD no configurada' } });
      return;
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Return minimal user from token
      res.json({ success: true, data: { user: req.user } });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.name || '',
          firstName: profile.name || '',
          lastName: profile.lastName || '',
          role: profile.role || 'user',
          phone: profile.phone || ''
        }
      }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    res.status(500).json({ success: false, error: { code: 'ME_ERROR', message: msg } });
  }
});

// ============================================
// POST /forgot-password — Recuperación de contraseña
// ============================================
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: { code: 'MISSING_EMAIL', message: 'Email es requerido' } });
      return;
    }

    const supabaseAnon = getSupabaseAnon();
    if (!supabaseAnon) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'BD no configurada' } });
      return;
    }

    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) {
      // Don't reveal if email exists — always return success
      console.warn('Forgot password error (silent):', error.message);
    }

    // Always respond with success to prevent email enumeration
    res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.'
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    res.status(500).json({ success: false, error: { code: 'FORGOT_ERROR', message: msg } });
  }
});

// ============================================
// POST /reset-password — Restablecer contraseña
// ============================================
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, accessToken } = req.body;
    if (!password || !accessToken) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Password y token requeridos' } });
      return;
    }

    const supabaseAnon = getSupabaseAnon();
    if (!supabaseAnon) {
      res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: 'BD no configurada' } });
      return;
    }

    // Set the session from the recovery token
    // @ts-ignore - Supabase accepts access_token alone in some versions
    const { error: sessionError } = await (supabaseAnon.auth as any).setSession({
      access_token: accessToken as string,
      refresh_token: accessToken as string
    });

    if (sessionError) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' } });
      return;
    }

    const { error } = await supabaseAnon.auth.updateUser({ password });
    if (error) {
      res.status(400).json({ success: false, error: { code: 'RESET_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    res.status(500).json({ success: false, error: { code: 'RESET_ERROR', message: msg } });
  }
});

export default router;
