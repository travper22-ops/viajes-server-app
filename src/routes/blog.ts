// ============================================
// RUTAS DE BLOG
// ============================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ============================================
// DATOS MOCK
// ============================================

const blogPosts = [
  {
    id: 'post-001',
    title: '10 lugares imperdibles para visitar en España',
    slug: 'lugares-imperdibles-espana',
    excerpt: 'Descubre los destinos más espectaculares de la geografía española.',
    content: 'Contenido completo del artículo...',
    coverImage: '/img/blog/spain.jpg',
    author: 'Equipo Travel',
    category: 'Destinos',
    tags: ['España', 'Viajes', 'Turismo'],
    status: 'published',
    publishedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'post-002',
    title: 'Guía completa para encontrar vuelos baratos',
    slug: 'guia-vuelos-baratos',
    excerpt: 'Aprende los mejores trucos para ahorrar en tus viajes.',
    content: 'Contenido completo del artículo...',
    coverImage: '/img/blog/flights.jpg',
    author: 'Equipo Travel',
    category: 'Consejos',
    tags: ['Vuelos', 'Ahorro', 'Consejos'],
    status: 'published',
    publishedAt: '2025-01-20T12:00:00Z',
    createdAt: '2025-01-18T09:00:00Z'
  },
  {
    id: 'post-003',
    title: 'Qué empacar para tu próximo viaje',
    slug: 'que-empacar-viaje',
    excerpt: 'La lista definitiva de cosas que no pueden faltar en tu maleta.',
    content: 'Contenido completo del artículo...',
    coverImage: '/img/blog/packing.jpg',
    author: 'Equipo Travel',
    category: 'Consejos',
    tags: ['Equipaje', 'Viajes', 'Preparación'],
    status: 'published',
    publishedAt: '2025-02-01T14:00:00Z',
    createdAt: '2025-01-28T10:00:00Z'
  }
];

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Obtener todos los posts (solo publicados)
router.get('/', (req: Request, res: Response): void => {
  const { category, tag, search } = req.query;

  let filtered = blogPosts.filter(p => p.status === 'published');

  if (category) {
    filtered = filtered.filter(p => 
      p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (tag) {
    filtered = filtered.filter(p => 
      p.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase())
    );
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.excerpt.toLowerCase().includes(searchTerm)
    );
  }

  res.json({
    success: true,
    data: filtered,
    meta: { count: filtered.length }
  });
});

// Obtener post por slug
router.get('/:slug', (req: Request, res: Response): void => {
  const { slug } = req.params;
  
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Artículo no encontrado' }
    });
    return;
  }

  res.json({
    success: true,
    data: post
  });
});

// ============================================
// RUTAS DE ADMIN
// ============================================

// Crear post (solo admin)
router.post('/', requireAdmin, (req: AuthRequest, res: Response): void => {
  const { title, content, category, tags, coverImage } = req.body;

  if (!title || !content) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_DATA', message: 'Título y contenido requeridos' }
    });
    return;
  }

  const newPost = {
    id: `post-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    excerpt: content.substring(0, 150) + '...',
    content,
    coverImage: coverImage || '/img/blog/default.jpg',
    author: req.user?.email || 'Admin',
    category: category || 'General',
    tags: tags || [],
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: newPost
  });
});

// Actualizar post (solo admin)
router.put('/:id', requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  
  const postIndex = blogPosts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Artículo no encontrado' }
    });
    return;
  }

  const updatedPost = {
    ...blogPosts[postIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedPost
  });
});

// Eliminar post (solo admin)
router.delete('/:id', requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  
  const postIndex = blogPosts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Artículo no encontrado' }
    });
    return;
  }

  res.json({
    success: true,
    message: 'Artículo eliminado correctamente'
  });
});

export default router;
