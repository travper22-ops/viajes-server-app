/**
 * BlogSidebar — barra lateral del blog
 */
import { Link } from 'react-router-dom'
import Card from '../ui/Card'

// Thumbnail por categoría usando FA icons
const CAT_ICONS = {
  'Destinos':              'fa-map-location-dot',
  'Consejos de Viaje':     'fa-lightbulb',
  'Ofertas':               'fa-tag',
  'Cultura y Gastronomía': 'fa-cutlery',
  'Viajes de Aventura':    'fa-male',
  'Hoteles':               'fa-building',
  'Vuelos':                'fa-plane',
}
// Color de fondo por índice — paleta suave profesional
const THUMB_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-amber-500',
  'bg-purple-600', 'bg-rose-600', 'bg-cyan-600',
]

const defaultRecent = [
  { title: 'Guía Completa para Planificar tu Viaje Soñado',        date: '09 Mar 2024', to: '/blog/1', icon: 'fa-map-location-dot' },
  { title: '7 Lecciones Increíbles que Puedes Aprender Viajando',  date: '09 Mar 2024', to: '/blog/2', icon: 'fa-earth-europe'     },
  { title: 'Los mejores destinos para el verano 2024',             date: '01 Mar 2024', to: '/blog/3', icon: 'fa-sun'             },
]
const defaultCategories = [
  { label: 'Destinos',              count: 12 },
  { label: 'Consejos de Viaje',     count: 8  },
  { label: 'Ofertas',               count: 5  },
  { label: 'Cultura y Gastronomía', count: 7  },
  { label: 'Viajes de Aventura',    count: 4  },
]
const defaultTags = ['Europa','Caribe','Asia','Vuelos Baratos','Hotel','Mochilero','Familia','Luna de miel','Verano','Invierno']

export default function BlogSidebar({
  recentPosts = defaultRecent,
  categories  = defaultCategories,
  tags        = defaultTags,
}) {
  return (
    <aside className="space-y-6">

      {/* Buscador */}
      <Card>
        <h3 className="font-bold text-gray-800 font-poppins mb-3">
          <i className="fa fa-search text-primary mr-2"/>Buscar
        </h3>
        <div className="flex">
          <input type="text" placeholder="Buscar artículos..."
            className="flex-1 border border-gray-200 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
          <button className="bg-primary text-white px-3 py-2 rounded-r text-sm hover:bg-primary/90 transition-colors">
            <i className="fa fa-search"/>
          </button>
        </div>
      </Card>

      {/* Artículos recientes */}
      <Card>
        <h3 className="font-bold text-gray-800 font-poppins mb-4 border-b border-gray-100 pb-2">
          <i className="fa fa-clock text-primary mr-2"/>Artículos Recientes
        </h3>
        <div className="space-y-3">
          {recentPosts.map((p, i) => (
            <Link key={i} to={p.to} className="flex gap-3 group items-center">
              <div className={`w-12 h-12 ${THUMB_COLORS[i % THUMB_COLORS.length]} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                <i className={`fa ${p.icon ?? 'fa-newspaper'} text-white text-lg`}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 group-hover:text-primary leading-tight line-clamp-2">{p.title}</p>
                <small className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                  <i className="fa fa-calendar text-xs"/>{p.date}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Categorías */}
      <Card>
        <h3 className="font-bold text-gray-800 font-poppins mb-4 border-b border-gray-100 pb-2">
          <i className="fa fa-folder text-primary mr-2"/>Categorías
        </h3>
        <ul className="space-y-1">
          {categories.map((c, i) => (
            <li key={i}>
              <Link to="/blog"
                className="flex justify-between items-center text-sm text-gray-600 hover:text-primary hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <i className={`fa ${CAT_ICONS[c.label] ?? 'fa-folder'} text-primary text-xs w-4 text-center`}/>
                  {c.label}
                </span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* Etiquetas */}
      <Card>
        <h3 className="font-bold text-gray-800 font-poppins mb-3 border-b border-gray-100 pb-2">
          <i className="fa fa-tags text-primary mr-2"/>Etiquetas
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <Link key={i} to="/blog"
              className="text-xs border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary px-2.5 py-1 rounded-full transition-colors">
              {t}
            </Link>
          ))}
        </div>
      </Card>

    </aside>
  )
}
