import { Link } from 'react-router-dom'

export default function BlogCard({ post }) {
  const { title, excerpt, date, author, comments, img, to = '#' } = post
  const [day, month, year] = (date || '01 Ene 2024').split(' ')

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      {/* Imagen — img/1.jpg, img/b1-2.jpg, img/b2-1.jpg etc. */}
      <div className="blog-img-wrap relative">
        <img src={img || '/img/1.jpg'} alt={title}
          className="w-full h-48 sm:h-52 object-cover"
          onError={e=>{e.target.onerror=null;e.target.src='/img/_placeholder.svg'}} />
        {/* Badge de fecha sobre la imagen */}
        <div className="absolute top-4 left-4 bg-primary text-white text-center rounded-lg px-3 py-2 min-w-[52px] shadow-md">
          <span className="block text-xl font-bold leading-none">{day}</span>
          <small className="block text-xs uppercase">{month}</small>
          <small className="block text-xs">{year}</small>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-3 hover:text-primary">
          <Link to={to}>{title}</Link>
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">{excerpt}</p>

        {/* Meta con iconos Lucide */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><i className="fa fa-user"/>{author}</span>
          <span className="flex items-center gap-1"><i className="fa fa-calendar"/>{date}</span>
          <span className="flex items-center gap-1"><i className="fa fa-comment"/>{comments} Comentarios</span>
        </div>

        <Link to={to} className="inline-flex items-center gap-1 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2 rounded transition-colors">
          Leer más <i className="fa fa-arrow-right text-xs"/>
        </Link>
      </div>
    </article>
  )
}
