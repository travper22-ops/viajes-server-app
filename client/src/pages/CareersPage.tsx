import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import { SkeletonCard, EmptyState } from '../components/ui'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK_JOBS = [
  { id:1, title:'Agente de Viajes Senior',      department:'Ventas',          location:'Madrid',    type:'Completa',  salary:'28.000-35.000€', description:'Buscamos agente con experiencia en vuelos internacionales y paquetes vacacionales.' },
  { id:2, title:'Especialista en Vuelos',        department:'Operaciones',     location:'Barcelona', type:'Completa',  salary:'26.000-32.000€', description:'Gestión y reserva de vuelos nacionales e internacionales, atención al cliente.' },
  { id:3, title:'Desarrollador React Frontend',  department:'Tecnología',       location:'Remoto',    type:'Completa',  salary:'40.000-55.000€', description:'Desarrollo de plataforma de reservas online. React, TypeScript, TailwindCSS.' },
  { id:4, title:'Atención al Cliente',           department:'Servicio Cliente', location:'Madrid',    type:'Parcial',   salary:'18.000-22.000€', description:'Soporte a clientes vía teléfono y email. Horario de tarde.' },
  { id:5, title:'Diseñador UX/UI',              department:'Tecnología',       location:'Madrid',    type:'Completa',  salary:'32.000-42.000€', description:'Diseño de la experiencia de usuario en nuestra web y app móvil.' },
]

const DEPT_COLORS = {
  'Ventas':          'bg-blue-100 text-blue-700',
  'Operaciones':     'bg-green-100 text-green-700',
  'Tecnología':      'bg-purple-100 text-purple-700',
  'Servicio Cliente':'bg-orange-100 text-orange-700',
}

export default function CareersPage() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('Todos')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch(`${API}/jobs`)
      .then(r => r.json())
      .then(d => setJobs(d.jobs?.length ? d.jobs : MOCK_JOBS))
      .catch(() => setJobs(MOCK_JOBS))
      .finally(() => setLoading(false))
  }, [])

  const depts = ['Todos', ...new Set(jobs.map(j=>j.department))]
  const filtered = jobs.filter(j =>
    (filter === 'Todos' || j.department === filter) &&
    (!search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div id="body">
      <MobileNav/><Header/>
      <PageBanner title="Trabaja con Nosotros" subtitle="Únete al equipo de Viajes y Experiencias" to="/" toLabel="Inicio"/>

      <div className="container mx-auto px-4 py-10">
        {/* Por qué nosotros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon:'fa-star', title:'Gran ambiente', desc:'Equipo joven, dinámico y apasionado por los viajes' },
            { icon:'fa-plane', title:'Viajes gratuitos', desc:'Descuentos exclusivos en vuelos, hoteles y paquetes' },
            { icon:'fa-bar-chart', title:'Crece con nosotros', desc:'Plan de carrera y formación continua' },
          ].map(c=>(
            <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className={`fa ${c.icon} text-primary text-xl`}/>
              </div>
              <h3 className="font-bold text-gray-800 font-poppins mb-1">{c.title}</h3>
              <p className="text-gray-500 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar puesto…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {depts.map(d=>(
              <button key={d} onClick={()=>setFilter(d)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${filter===d?'bg-primary text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Listado */}
        {loading && <div className="space-y-4">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i} lines={2}/>)}</div>}
        {!loading && filtered.length === 0 && <EmptyState icon="fa-briefcase" title="No hay vacantes en este departamento" text="Revisa otros departamentos o envíanos tu CV espontáneo"/>}
        <div className="space-y-4">
          {!loading && filtered.map(job=>(
            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DEPT_COLORS[job.department]||'bg-gray-100 text-gray-600'}`}>
                      {job.department}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <i className="fa fa-map-marker text-primary text-xs"/>{job.location}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 font-poppins text-lg mb-1">{job.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{job.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {job.salary && <div className="text-sm font-bold text-primary">{job.salary}</div>}
                  <Link to={`/empleo/${job.id}`}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                    Ver oferta
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CV espontáneo */}
        <div className="mt-12 bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-8 text-center text-white">
          <i className="fa fa-envelope text-4xl mb-3 block opacity-80"/>
          <h2 className="text-xl font-bold font-poppins mb-2">¿No encuentras tu puesto?</h2>
          <p className="text-white/80 text-sm mb-4">Envíanos tu CV espontáneo y te avisaremos cuando haya una vacante para ti.</p>
          <a href="mailto:rrhh@viajesyexperiencias.es"
            className="inline-block bg-white text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Enviar CV espontáneo
          </a>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
