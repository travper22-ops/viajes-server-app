// ============================================
// RUTAS DE DESTINOS
// ============================================

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// DATOS MOCK
// ============================================

const destinations = [
  {
    id: 'dest-001',
    name: 'Madrid',
    country: 'España',
    description: 'La capital de España, conocida por sus museos, parques y vida nocturna.',
    image: '/img/madrid.jpg',
    rating: 4.5,
    popularFlights: 150,
    hotelsCount: 250,
    attractions: ['Palacio Real', 'Museo del Prado', 'Retiro', 'Gran Vía']
  },
  {
    id: 'dest-002',
    name: 'Barcelona',
    country: 'España',
    description: 'Ciudad costera famosa por su arquitectura modernista y playas.',
    image: '/img/barcelona.jpg',
    rating: 4.7,
    popularFlights: 180,
    hotelsCount: 300,
    attractions: ['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Casa Batlló']
  },
  {
    id: 'dest-003',
    name: 'París',
    country: 'Francia',
    description: 'La Ciudad de la Luz, famosa por la Torre Eiffel y el Louvre.',
    image: '/img/paris.jpg',
    rating: 4.8,
    popularFlights: 200,
    hotelsCount: 400,
    attractions: ['Torre Eiffel', 'Louvre', 'Notre Dame', 'Campos Elíseos']
  },
  {
    id: 'dest-004',
    name: 'Londres',
    country: 'Reino Unido',
    description: 'Metrópolis histórica con museos de clase mundial y arquitectura icónica.',
    image: '/img/london.jpg',
    rating: 4.6,
    popularFlights: 220,
    hotelsCount: 350,
    attractions: ['Big Ben', 'Tower Bridge', 'Buckingham', 'British Museum']
  },
  {
    id: 'dest-005',
    name: 'Roma',
    country: 'Italia',
    description: 'La Ciudad Eterna, con vestiges del Imperio Romano.',
    image: '/img/rome.jpg',
    rating: 4.7,
    popularFlights: 160,
    hotelsCount: 280,
    attractions: ['Coliseo', 'Vaticano', 'Fontana de Trevi', 'Foro Romano']
  },
  {
    id: 'dest-006',
    name: 'Nueva York',
    country: 'Estados Unidos',
    description: 'La ciudad que nunca duerme, con rascacielos y cultura diversa.',
    image: '/img/nyc.jpg',
    rating: 4.8,
    popularFlights: 300,
    hotelsCount: 500,
    attractions: ['Estatua de la Libertad', 'Central Park', 'Times Square', 'Empire State']
  }
];

// ============================================
// RUTAS
// ============================================

// Obtener todos los destinos
router.get('/', (req: Request, res: Response): void => {
  const { country, search } = req.query;

  let filtered = [...destinations];

  if (country) {
    filtered = filtered.filter(d => 
      d.country.toLowerCase().includes((country as string).toLowerCase())
    );
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(searchTerm) ||
      d.country.toLowerCase().includes(searchTerm)
    );
  }

  res.json({
    success: true,
    data: filtered,
    meta: {
      count: filtered.length,
      total: destinations.length
    }
  });
});

// Obtener destino por ID
router.get('/:destinationId', (req: Request, res: Response): void => {
  const { destinationId } = req.params;
  
  const destination = destinations.find(d => d.id === destinationId);

  if (!destination) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Destino no encontrado' }
    });
    return;
  }

  res.json({
    success: true,
    data: destination
  });
});

// Obtener destinos populares
router.get('/popular/list', (req: Request, res: Response): void => {
  const popular = destinations
    .sort((a, b) => b.popularFlights - a.popularFlights)
    .slice(0, 6);

  res.json({
    success: true,
    data: popular
  });
});

export default router;
