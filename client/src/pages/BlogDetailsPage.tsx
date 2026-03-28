import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import { BlogSidebar } from '../components/blog'
import { SkeletonCard } from '../components/ui'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK_POST = {
  id:1, slug:'guia-viaje',
  title:'Guía Completa para Planificar tu Viaje Soñado',
  content:`<p>Planificar un viaje puede ser tan emocionante como el viaje mismo. En esta guía te damos los mejores consejos para que tu próxima aventura sea perfecta.</p>
<h2>1. Define tu presupuesto</h2>
<p>El primer paso es establecer cuánto estás dispuesto a gastar. Esto te ayudará a determinar el destino, duración y tipo de alojamiento.</p>
<h2>2. Elige el destino</h2>
<p>Una vez que tienes claro el presupuesto, es momento de elegir dónde quieres ir. Considera factores como el clima, la seguridad y la temporada.</p>
<h2>3. Reserva con anticipación</h2>
<p>Cuanto antes reserves vuelos y hotel, mejores precios encontrarás. Lo ideal es reservar con 2-3 meses de antelación.</p>
<h2>4. Organiza tu itinerario</h2>
<p>No planifiques cada hora del día, deja espacio para la improvisación. Marca los lugares que definitivamente quieres ver y deja el resto fluir.</p>`,
  published_at:'2025-03-09',
  author_name:'Redacción',
  cover_image:'/img/1.jpg',
  category_name:'Tips de Viaje',
}

export default function BlogDetailsPage() {
  const { slug } = useParams()
  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/blog/${slug}`)
      .then(r => r.json())
      .then(d => setPost(d.post || MOCK_POST))
      .catch(() => setPost(MOCK_POST))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div id="body">
      <MobileNav/><Header/>
      <PageBanner title={post?.title || 'Blog'} to="/blog" toLabel="Blog"/>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">{Array.from({length:5}).map((_,i)=><SkeletonCard key={i} lines={2}/>)}</div>
            ) : post ? (
              <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <img src={post.cover_image||'/img/1.jpg'} alt={post.title}
                  className="w-full h-72 object-cover"
                  onError={e=>{e.target.onerror=null;e.target.src='/img/_placeholder.svg'}}/>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    {post.category_name && (
                      <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">{post.category_name}</span>
                    )}
                    <span><i className="fa fa-calendar mr-1"/>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) : ''}
                    </span>
                    <span><i className="fa fa-user mr-1"/>{post.author_name}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mb-6 leading-tight">{post.title}</h1>
                  <div
                    className="prose prose-gray max-w-none text-gray-600 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4"
                    dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }}
                  />
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-3">
                      {['Twitter','Facebook','WhatsApp'].map(net=>(
                        <button key={net} className="text-xs text-gray-500 hover:text-primary transition-colors">
                          <i className={`fa fa-${net.toLowerCase()} mr-1`}/>{net}
                        </button>
                      ))}
                    </div>
                    <Link to="/blog" className="text-sm text-primary hover:underline">← Volver al blog</Link>
                  </div>
                </div>
              </article>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <i className="fa fa-newspaper text-5xl mb-4 block opacity-30"/>
                <p>Artículo no encontrado.</p>
                <Link to="/blog" className="text-primary underline mt-2 block">Ver todos los artículos</Link>
              </div>
            )}
          </div>
          <aside className="lg:col-span-1">
            <BlogSidebar/>
          </aside>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
