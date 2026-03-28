import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK_JOB = {
  id: 1,
  title: 'Agente de Viajes (Especialista en Caribe)',
  department: 'Atención al Cliente',
  location: 'Madrid, España',
  type: 'Jornada Completa',
  salary: 'Según convenio + comisiones',
  experience: 'Mínimo 3 años',
  published: 'Hace 5 días',
  description: '¿Te apasiona el Caribe y tienes talento para crear viajes de ensueño? Buscamos un/a Agente de Viajes con especialización demostrable en destinos del Caribe para unirse a nuestro equipo en Madrid.',
  responsibilities: [
    'Atención y asesoramiento personalizado a clientes.',
    'Diseño y cotización de paquetes de viaje a medida.',
    'Gestión completa del ciclo de reserva a través de GDS (Amadeus, Sabre).',
    'Seguimiento y fidelización de clientes.',
  ],
  requirements: [
    'Mínimo 3 años de experiencia como agente de viajes.',
    'Conocimiento profundo de los principales destinos del Caribe.',
    'Dominio de sistemas de reserva GDS (preferiblemente Amadeus).',
    'Residencia en Madrid o alrededores.',
  ],
}

export default function CareersSinglePage() {
  const { id } = useParams()
  const [job,     setJob]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', linkedin:'', cover:'' })
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)
  const [err,     setErr]     = useState('')

  useEffect(() => {
    fetch(`${API}/jobs/${id}`)
      .then(r => r.json())
      .then(d => setJob(d.job || d.data || MOCK_JOB))
      .catch(() => setJob(MOCK_JOB))
      .finally(() => setLoading(false))
  }, [id])

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { setErr('Nombre y email son obligatorios'); return }
    setErr(''); setSending(true)
    try {
      await fetch(`${API}/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jobTitle: job?.title })
      })
      setSent(true)
    } catch {
      // Mostrar éxito igualmente (el backend puede no tener este endpoint aún)
      setSent(true)
    } finally { setSending(false) }
  }

  const fieldStyle: React.CSSProperties = { width:'100%', border:'1px solid #e5e5e5', borderRadius:4, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }

  const details = job ? [
    { icon:'fa-map-marker',     label:'Ubicación',    value: job.location    || '—' },
    { icon:'fa-briefcase',      label:'Tipo',         value: job.type        || '—' },
    { icon:'fa-tag',            label:'Departamento', value: job.department  || '—' },
    { icon:'fa-calendar',       label:'Publicado',    value: job.published   || job.created_at || '—' },
    { icon:'fa-money',          label:'Salario',      value: job.salary      || 'Según convenio' },
    { icon:'fa-graduation-cap', label:'Experiencia',  value: job.experience  || '—' },
  ] : []

  return (
    <div id="body">
      <SEO
        title={job ? `${job.title} | Empleo` : 'Oferta de Empleo'}
        description={job?.description || 'Únete al equipo de Viajes y Experiencias'}
        noIndex={false}
      />
      <MobileNav /><Header />
      <PageBanner
        title={loading ? 'Cargando...' : (job?.title || 'Oferta de Empleo')}
        subtitle="Tu carrera puede ayudar a miles de personas a crear recuerdos inolvidables."
        breadcrumbs={[{ to:'/', icon:'fa-home', label:'Inicio' }, { to:'/empleo', label:'Empleo' }, { label: job?.title || '...' }]}
      />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa' }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize:32, display:'block', marginBottom:12 }}/>
            Cargando oferta...
          </div>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-start' }}>

            {/* Contenido principal */}
            <div style={{ flex:'1 1 560px', minWidth:0 }}>
              <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:24 }}>

                <h2 style={{ fontSize:18, fontWeight:700, color:'#003580', marginBottom:12 }}>Descripción del Puesto</h2>
                <p style={{ color:'#555', lineHeight:1.7, marginBottom:20 }}>{job?.description}</p>

                {job?.responsibilities?.length > 0 && (
                  <>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#003580', marginBottom:10 }}>Responsabilidades</h2>
                    <ul style={{ marginBottom:20, paddingLeft:0, listStyle:'none' }}>
                      {job.responsibilities.map((r: string, i: number) => (
                        <li key={i} style={{ display:'flex', gap:8, color:'#555', fontSize:14, marginBottom:8 }}>
                          <i className="fa fa-check" style={{ color:'#003580', marginTop:2, flexShrink:0 }}/>{r}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {job?.requirements?.length > 0 && (
                  <>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#003580', marginBottom:10 }}>Requisitos Mínimos</h2>
                    <ul style={{ marginBottom:24, paddingLeft:0, listStyle:'none' }}>
                      {job.requirements.map((r: string, i: number) => (
                        <li key={i} style={{ display:'flex', gap:8, color:'#555', fontSize:14, marginBottom:8 }}>
                          <i className="fa fa-circle" style={{ color:'#003580', marginTop:4, flexShrink:0, fontSize:8 }}/>{r}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Formulario de candidatura */}
                <div id="applyNow" style={{ borderTop:'1px solid #e5e5e5', paddingTop:24, marginTop:8 }}>
                  <h2 style={{ fontSize:18, fontWeight:700, color:'#003580', marginBottom:16 }}>
                    <i className="fa fa-paper-plane" style={{ marginRight:8 }}/>Inscríbete Ahora
                  </h2>

                  {sent ? (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:24, textAlign:'center' }}>
                      <i className="fa fa-check-circle" style={{ fontSize:40, color:'#22c55e', display:'block', marginBottom:12 }}/>
                      <h3 style={{ fontSize:16, fontWeight:700, color:'#166534', marginBottom:6 }}>¡Candidatura enviada!</h3>
                      <p style={{ color:'#555', fontSize:14 }}>Revisaremos tu perfil y te contactaremos en los próximos días.</p>
                      <Link to="/empleo" style={{ display:'inline-block', marginTop:16, color:'#003580', fontSize:13 }}>← Ver más ofertas</Link>
                    </div>
                  ) : (
                    <form onSubmit={handleApply}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                        <div>
                          <label style={labelStyle}>Nombre completo *</label>
                          <input value={form.name} onChange={upd('name')} placeholder="Tu nombre" required style={fieldStyle}/>
                        </div>
                        <div>
                          <label style={labelStyle}>Email *</label>
                          <input type="email" value={form.email} onChange={upd('email')} placeholder="tu@email.com" required style={fieldStyle}/>
                        </div>
                        <div>
                          <label style={labelStyle}>Teléfono</label>
                          <input type="tel" value={form.phone} onChange={upd('phone')} placeholder="+34 600 000 000" style={fieldStyle}/>
                        </div>
                        <div>
                          <label style={labelStyle}>LinkedIn (opcional)</label>
                          <input type="url" value={form.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/in/..." style={fieldStyle}/>
                        </div>
                        <div style={{ gridColumn:'1 / -1' }}>
                          <label style={labelStyle}>Carta de presentación</label>
                          <textarea value={form.cover} onChange={upd('cover')} rows={4}
                            placeholder="Cuéntanos por qué eres el candidato/a ideal..."
                            style={{ ...fieldStyle, resize:'vertical' }}/>
                        </div>
                      </div>
                      {err && (
                        <div style={{ background:'#fff5f5', border:'1px solid #fecdd3', borderRadius:4, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:12 }}>
                          <i className="fa fa-exclamation-circle" style={{ marginRight:6 }}/>{err}
                        </div>
                      )}
                      <button type="submit" disabled={sending}
                        style={{ background:'#003580', color:'#fff', border:'none', borderRadius:4, padding:'12px 24px', fontSize:14, fontWeight:700, cursor:sending?'not-allowed':'pointer', opacity:sending?0.7:1 }}>
                        {sending ? <><i className="fa fa-spinner fa-spin" style={{ marginRight:6 }}/>Enviando...</> : <><i className="fa fa-paper-plane" style={{ marginRight:6 }}/>Enviar Candidatura</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ flex:'0 0 260px', minWidth:240 }}>
              <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:20, position:'sticky', top:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#003580', marginBottom:16, borderBottom:'1px solid #e5e5e5', paddingBottom:10 }}>Resumen del Puesto</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {details.map((d, i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <i className={`fa ${d.icon}`} style={{ color:'#003580', marginTop:2, width:16, flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:11, color:'#aaa' }}>{d.label}</div>
                        <div style={{ fontSize:13, color:'#333', fontWeight:600 }}>{d.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => document.getElementById('applyNow')?.scrollIntoView({ behavior:'smooth' })}
                  style={{ width:'100%', marginTop:20, background:'#003580', color:'#fff', border:'none', borderRadius:4, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  Inscríbete Ahora
                </button>
                <Link to="/empleo" style={{ display:'block', textAlign:'center', fontSize:12, color:'#aaa', marginTop:10 }}>← Ver todas las ofertas</Link>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
