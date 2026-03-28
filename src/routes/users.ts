// ============================================
// RUTAS DE USUARIOS
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  changePassword
} from '../controllers/users.js';

const router = Router();

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Ninguna ruta pública en users

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Obtener perfil del usuario
router.get('/profile/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario solo pueda ver su propio perfil (o es admin)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No puedes ver el perfil de otro usuario' }
      });
      return;
    }

    const result = await getProfile(userId);
    
    if (!result.success) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: result.error }
      });
      return;
    }

    res.json({
      success: true,
      data: result.profile
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PROFILE_ERROR', message: errorMessage }
    });
  }
});

// Actualizar perfil
router.put('/profile/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario solo pueda actualizar su propio perfil (o es admin)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No puedes modificar el perfil de otro usuario' }
      });
      return;
    }

    const result = await updateProfile(userId, req.body);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: result.error }
      });
      return;
    }

    res.json({
      success: true,
      data: result.profile
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PROFILE_UPDATE_ERROR', message: errorMessage }
    });
  }
});

// Obtener preferencias
router.get('/preferences/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const result = await getPreferences(userId);
    
    res.json({
      success: true,
      data: result.preferences
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PREFERENCES_ERROR', message: errorMessage }
    });
  }
});

// Actualizar preferencias
router.put('/preferences/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const result = await updatePreferences(userId, req.body);
    
    res.json({
      success: true,
      data: result.preferences
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PREFERENCES_UPDATE_ERROR', message: errorMessage }
    });
  }
});

// Cambiar contraseña
router.post('/change-password/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PASSWORD', message: 'Se requiere contraseña actual y nueva' }
      });
      return;
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_CHANGE_FAILED', message: result.error }
      });
      return;
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      success: false,
      error: { code: 'PASSWORD_ERROR', message: errorMessage }
    });
  }
});

export default router;
