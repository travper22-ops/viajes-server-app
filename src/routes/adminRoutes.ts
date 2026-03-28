// ============================================
// RUTAS DE ADMINISTRACIÓN
// Endpoints para gestión del sistema y caché
// ============================================
import { Router } from 'express';
import { z } from 'zod';  // ← Corregido: va entre llaves
import { requireAuth as authenticateJWT } from '../middleware/auth'; // ← Agregar esto

const router = Router();

const statsQuerySchema = z.object({
  year: z.coerce.number().optional(), // coerce para convertir string de query a number
});

const usersQuerySchema = z.object({
  status: z.enum(['active', 'suspended', 'banned']).optional(),
});

// GET /admin/stats - Protegido con JWT
router.get('/stats', authenticateJWT, (req, res, next) => {
  try {
    const query = statsQuerySchema.parse(req.query);
    // TODO: Llamar al controller aquí
    res.status(200).json({ success: true, data: { year: query.year } });
  } catch (error) {
    next(error); // ← Importante: pasa el error al middleware
  }
});

// GET /admin/users - Protegido con JWT  
router.get('/users', authenticateJWT, (req, res, next) => {
  try {
    const query = usersQuerySchema.parse(req.query);
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

export default router;
