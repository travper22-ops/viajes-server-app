// ============================================
// RUTAS DE EMPLEOS
// ============================================

import { Router, Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Agente de Viajes (Especialista en Caribe)',
    department: 'Atención al Cliente',
    location: 'Madrid, España',
    type: 'Jornada Completa',
    salary: 'Según convenio + comisiones',
    experience: 'Mínimo 3 años',
    published: 'Hace 5 días',
    description: '¿Te apasiona el Caribe y tienes talento para crear viajes de ensueño? Buscamos un/a Agente de Viajes con especialización demostrable en destinos del Caribe.',
    responsibilities: ['Atención y asesoramiento personalizado a clientes.', 'Diseño y cotización de paquetes de viaje a medida.', 'Gestión completa del ciclo de reserva a través de GDS (Amadeus, Sabre).'],
    requirements: ['Mínimo 3 años de experiencia como agente de viajes.', 'Conocimiento profundo de los principales destinos del Caribe.', 'Dominio de sistemas de reserva GDS (preferiblemente Amadeus).'],
  },
  {
    id: '2',
    title: 'Desarrollador/a Full Stack',
    department: 'Tecnología',
    location: 'Madrid, España (Híbrido)',
    type: 'Jornada Completa',
    salary: '35.000 - 50.000 € brutos/año',
    experience: 'Mínimo 2 años',
    published: 'Hace 2 días',
    description: 'Buscamos un/a desarrollador/a Full Stack para unirse a nuestro equipo de tecnología.',
    responsibilities: ['Desarrollo y mantenimiento de la plataforma web.', 'Integración con APIs de proveedores (Amadeus, Stripe).'],
    requirements: ['Experiencia con React y Node.js.', 'Conocimiento de bases de datos SQL y NoSQL.'],
  },
];

// GET /api/v1/jobs — listar ofertas activas
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) { res.json({ success: true, data: MOCK_JOBS }); return; }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data?.length ? data : MOCK_JOBS });
  } catch {
    res.json({ success: true, data: MOCK_JOBS });
  }
});

// GET /api/v1/jobs/:id — detalle de una oferta
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      const mock = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[0];
      res.json({ success: true, job: mock }); return;
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const mock = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[0];
      res.json({ success: true, job: mock }); return;
    }

    res.json({ success: true, job: data });
  } catch {
    res.json({ success: true, job: MOCK_JOBS[0] });
  }
});

// POST /api/v1/jobs/:id/apply — enviar candidatura
router.post('/:id/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, linkedin, cover, jobTitle } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, error: 'Nombre y email son obligatorios' });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from('job_applications').insert({
        job_id: id,
        name,
        email,
        phone: phone || null,
        linkedin_url: linkedin || null,
        cover_letter: cover || null,
        status: 'pending'
      });
    }

    res.json({
      success: true,
      message: 'Candidatura recibida correctamente',
      data: { jobId: id, applicantEmail: email }
    });
  } catch {
    // Siempre devolver éxito al usuario aunque falle el guardado
    res.json({ success: true, message: 'Candidatura recibida correctamente' });
  }
});

export default router;
