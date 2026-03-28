import { useState, useEffect } from 'react'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import { BlogCard } from '../components/blog'
import { BlogSidebar } from '../components/blog'
import { Pagination, SkeletonCard, EmptyState } from '../components/ui'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK_POSTS = [
  { id:1, slug:'guia-viaje', title:'Guía Completa para Planificar tu Viaje Soñado', excerpt:'Planificar un viaje puede ser tan emocionante como el viaje mismo. Descubre los mejores consejos.', published_at:'2024-03-09', author_name:'Admin', cover_image:'/img/1.jpg', category_name:'Tips de Viaje' },
  { id:2, slug:'lecciones-viajando', title:'7 Lecciones Increíbles que Puedes Aprender Viajando', excerpt:'Viajar no solo te permite descubrir nuevos lugares, sino también a ti mismo. Cada destino ofrece lecciones valiosas.', published_at:'2024-03-09', author_name:'Admin', cover_image:'/img/b1-2.jpg', category_name:'Tips de Viaje' },
  { id:3, slug:'destinos-verano', title:'Los Mejores Destinos de Verano 2026 en España', excerpt:'Con la llegada del verano, llega la pregunta inevitable: ¿a dónde voy este año? España tiene destinos increíbles.', published_at:'2024-03-01', author_name:'Admin', cover_image:'/img/b1-3.jpg', category_name:'Destinos Europa' },
]

export default function BlogPage() {
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const [category, setCategory] = useState('')
  const [search,   setSearch]   = useState('')
  const [cats,     setCats]     = useState([])
  const LIMIT = 6

  useEffect(() => {
    const qs = new URLSearchParams({ page, limit:LIMIT, ...(category&&{category}), ...(search&&{search}) })
    fetch(`${API}/blog?${qs}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts||[]); setTotal(d.pagination?.total||0) })
      .catch(() => { setPosts(MOCK_POSTS); setTotal(MOCK_POSTS.length) })
      .finally(() => setLoading(false))
  }, [page, category, search])

  useEffect(() => {
    fetch(`${API}/blog/categories`)
      .then(r=>r.json()).then(d=>setCats(d.categories||[])).catch(()=>{})
  }, [])

  // Normalize API post shape to what BlogCard expects
  const normalized = posts.map(p => ({
    id: p.id, title: p.title, excerpt: p.excerpt,
    date: p.published_at ? new Date(p.published_at).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '',
    author: p.author_name || 'Admin',
    comments: 0,
    img: p.cover_image || '/img/1.jpg',
    to: `/blog/${p.slug || p.id}`,
  }))

  return (
    <div id="body">
      <SEO
        title="Blog de Viajes | Consejos e Inspiración"
        description="Descubre consejos de viaje, guías de destinos y las mejores experiencias. Inspiración para planificar tus próximas vacaciones."
        keywords="blog viajes, consejos viaje, guías destinos, inspiración viajes, tips viajero"
        url="https://travelagency.com/blog"
      />
      <MobileNav/><Header/>
      <PageBanner title="Nuestro Blog" subtitle="Inspiración y consejos para tu próxima aventura"
        breadcrumbs={[{to:'/',icon:'fa-home',label:'Inicio'},{label:'Blog'}]}/>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8 space-y-8">
            {loading
              ? Array.from({length:3}).map((_,i)=><SkeletonCard key={i} lines={4}/>)
              : normalized.length
                ? normalized.map(post=><BlogCard key={post.id} post={post}/>)
                : <EmptyState icon="fa-newspaper" title="No hay artículos" desc="Aún no hay posts publicados en esta categoría."/>
            }
            {total > LIMIT && <Pagination current={page} total={Math.ceil(total/LIMIT)} onChange={setPage}/>}
          </main>
          <div className="lg:col-span-4">
            <BlogSidebar categories={cats} onCategorySelect={c=>{setCategory(c);setPage(1)}} onSearch={s=>{setSearch(s);setPage(1)}}/>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
