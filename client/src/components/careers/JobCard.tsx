import { Link } from 'react-router-dom'

const DEPT_ICONS = {
  'Tecnología':       'fa-code',
  'Ventas':           'fa-bar-chart',
  'Operaciones':      'fa-cogs',
  'Servicio Cliente': 'fa-headphones',
  'Marketing':        'fa-bullhorn',
  'RRHH':             'fa-users',
  'Finanzas':         'fa-money',
}

export default function JobCard({ job, to }) {
  const dest    = to ?? `/empleo/${job.id}`
  const deptIcon = DEPT_ICONS[job.dept] || DEPT_ICONS[job.department] || 'fa-briefcase'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex gap-4 items-start">
        {/* Icono departamento */}
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <i className={`fa ${deptIcon} text-primary text-xl`}/>
        </div>

        <div className="flex-1">
          <Link to={dest}
            className="font-bold text-gray-800 font-poppins hover:text-primary text-lg leading-tight block mb-1">
            {job.title}
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">{job.excerpt || job.description}</p>
          <div className="flex flex-wrap gap-2">
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
                <i className="fa fa-map-marker"/>{job.location}
              </span>
            )}
            {(job.type) && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded font-medium">
                <i className="fa fa-briefcase"/>{job.type}
              </span>
            )}
            {(job.dept || job.department) && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">
                <i className="fa fa-tag"/>{job.dept || job.department}
              </span>
            )}
            {job.salary && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                <i className="fa fa-eur text-xs"/>{job.salary}
              </span>
            )}
            {job.posted && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">
                <i className="fa fa-clock-o"/>{job.posted}
              </span>
            )}
          </div>
        </div>

        <Link to={dest}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors hidden sm:flex items-center gap-2">
          Ver oferta <i className="fa fa-arrow-right text-xs"/>
        </Link>
      </div>
    </div>
  )
}
