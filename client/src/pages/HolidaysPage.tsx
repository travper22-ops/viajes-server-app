import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import DatePicker from '../components/ui/DatePicker'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK_PACKAGES = [
  { id:1, img:'/img/t1.png', city:'Madrid',    nights:3, price:299, oldPrice:399, rating:4.8, reviews:234, origin:'BCN', destination:'MAD', includes:['Vuelo','Hotel 4★','Desayuno'] },
  { id:2, img:'/img/t2.png', city:'Barcelona', nights:4, price:349, oldPrice:449, rating:4.9, reviews:512, origin:'MAD', destination:'BCN', includes:['Vuelo','Hotel 4★','Desayuno','City Tour'] },
  { id:3, img:'/img/t3.png', city:'Sevilla',   nights:3, price:279, oldPrice:359, rating:4.7, reviews:187, origin:'MAD', destination:'SVQ', includes:['Vuelo','Hotel 3★','Desayuno'] },
  { id:4, img:'/img/t4.png', city:'Valencia',  nights:5, price:429, oldPrice:549, rating:4.8, reviews:321, origin:'MAD', destination:'VLC', includes:['Vuelo','Hotel 5★','Media Pensión','Traslados'] },
  { id:5, img:'/img/t1.png', city:'Bilbao',    nights:2, price:199, oldPrice:249, rating:4.6, reviews:98,  origin:'MAD', destination:'BIO', includes:['Vuelo','Hotel 3★'] },
  { id:6, img:'/img/t2.png', city:'Granada',   nights:4, price:319, oldPrice:399, rating:4.9, reviews:443, origin:'MAD', destination:'GRX', includes:['Vuelo','Hotel 4★','Desayuno','Alhambra'] },
]

export default function HolidaysPage() {
  const [searchParams] = useSearchParams()
  const [from,     setFrom]     = useState(searchParams.get('from') || '')
  const [to,       setTo]       = useState(searchParams.get('to') || '')
  const [checkin,  setCheckin]  = useState<Date | null>(null)
  const [checkout, setCheckout] = useState<Date | null>(null)
  const [guests,   setGuests]   = useState(2)
  const [packages, setPackages] = useState(MOCK_PACKAGES)
  const [loading,  setLoading]  = useState(false)
  const [sortBy,   setSortBy]   = useState('price')
  const [showFilter, setShowFilter] = useState(true)

  const doSearch = async () => {
    if (!from || !to || !checkin || !checkout) return
    setLoading(true)
    try {
      const dep  = checkin  instanceof Date ? checkin.toISOString().split('T')[0]  : ''
      const ret  = checkout instanceof Date ? checkout.toISOString().split('T')[0] : ''
      const qs   = new URLSearchParams({ origin: from, destination: to, departureDate: dep, returnDate: ret, checkIn: dep, checkOut: ret, adults: String(guests) })
      const res  = await fetch(`${API}/packages/search?${qs}`)
      const data = await res.json()
      const list = data.data || data.packages || []
      setPackages(list.length ? list : MOCK_PACKAGES)
    } catch {
      setPackages(MOCK_PACKAGES)
    } finally { setLoading(false) }
  }

  const sorted = [...packages].sort((a, b) =>
    sortBy === 'price'  ? a.price - b.price :
    sortBy === 'rating' ? b.rating - a.rating : a.nights - b.nights
  )

  return (
    <div id="body">
      <SEO
        title="Paquetes Vacacionales | Vacaciones Todo Incluido"
        description="Descubre nuestros paquetes vacacionales con vuelo, hotel y actividades incluidas. Las mejores ofertas para tus vacaciones en España y el mundo."
        keywords="paquetes vacacionales, vacaciones todo incluido, ofertas viajes, vuelo más hotel"
        url="https://travelagency.com/vacaciones"
      />
      <MobileNav /><Header />

      {/* Barra de búsqueda */}
      <div className="search-int">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <div className="sb-row">
            <div className="sb-field sb-field--grow">
              <div className="text-box"><span>Ciudad origen</span>
                <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Código IATA (ej: MAD)"/>
              </div>
            </div>
            <div className="sb-field sb-field--grow">
              <div className="text-box"><span>Destino</span>
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="Código IATA (ej: BCN)"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box"><span>Salida</span>
                <DatePicker value={checkin} onChange={setCheckin} placeholder="dd/mm/yyyy" minDate={new Date()}/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box"><span>Regreso</span>
                <DatePicker value={checkout} onChange={setCheckout} placeholder="dd/mm/yyyy" minDate={checkin || new Date()} alignRight/>
              </div>
            </div>
            <div className="sb-field sb-field--sm">
              <div className="text-box"><span>Personas</span>
                <select value={guests} onChange={e => setGuests(+e.target.value)}>
                  {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="sb-btn">
              <button className="btn-search" onClick={doSearch}><i className="fa fa-search"/></button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>
        <div className="results-layout">

          {/* Filtros */}
          <div className="filters-col">
            <div className="filter-head" onClick={() => setShowFilter(f => !f)}>
              <span><i className="fa fa-sliders" style={{ marginRight:6 }}/>Filtros</span>
              <i className={`fa fa-chevron-${showFilter ? 'up' : 'down'}`}/>
            </div>
            {showFilter && (
              <div className="filter-body">
                <h4 className="filter-section-title">Ordenar</h4>
                {[{v:'price',l:'Precio'},{v:'rating',l:'Valoración'},{v:'nights',l:'Noches'}].map(({v,l}) => (
                  <label key={v} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, fontSize:13, cursor:'pointer' }}>
                    <input type="radio" name="psort" checked={sortBy===v} onChange={() => setSortBy(v)} style={{ accentColor:'#003580' }}/>{l}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="results-col">
            <p style={{ fontSize:13, color:'#666', marginBottom:12 }}>
              {loading ? 'Buscando paquetes...' : `${sorted.length} paquetes encontrados`}
            </p>

            {loading && [0,1,2].map(i => (
              <div key={i} style={{ border:'1px solid #e5e5e5', borderRadius:6, padding:16, marginBottom:12 }}>
                {[80,60,40].map((w,j) => <div key={j} className="skeleton" style={{ height:14, width:`${w}%`, marginBottom:8 }}/>)}
              </div>
            ))}

            {!loading && (
              <div className="packages-grid">
                {sorted.map(p => (
                  <div key={p.id} className="package-card"
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(0,53,128,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}>
                    <div style={{ position:'relative' }}>
                      <img src={p.img || p.image_url || '/img/t1.png'} alt={p.city || p.name} loading="lazy"
                        style={{ width:'100%', height:160, objectFit:'cover', display:'block' }}
                        onError={e => { (e.target as HTMLImageElement).style.background='#e0e8f5' }}/>
                      {p.oldPrice && (
                        <div style={{ position:'absolute', top:8, right:8, background:'#ee1d25', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:12 }}>
                          {Math.round((1 - p.price / p.oldPrice) * 100)}% dto
                        </div>
                      )}
                    </div>
                    <div style={{ padding:14 }}>
                      <h3 style={{ fontSize:16, fontWeight:700, color:'#003580', marginBottom:6 }}>
                        {p.city || p.name} {p.nights ? `· ${p.nights} noches` : ''}
                      </h3>
                      {p.includes?.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                          {p.includes.map((inc: string) => (
                            <span key={inc} style={{ border:'1px solid #e5e5e5', borderRadius:12, padding:'2px 8px', fontSize:11, color:'#666' }}>
                              <i className="fa fa-check" style={{ marginRight:3, color:'#003580', fontSize:10 }}/>{inc}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                        <div>
                          {p.oldPrice && <div style={{ fontSize:12, color:'#aaa', textDecoration:'line-through' }}>{p.oldPrice}€</div>}
                          <div style={{ fontSize:22, fontWeight:800, color:'#003580', fontFamily:'Poppins,sans-serif' }}>{p.price}€</div>
                          <div style={{ fontSize:11, color:'#888' }}>por persona</div>
                        </div>
                        <Link to={`/vacaciones/${p.id}`}
                          style={{ background:'#ee1d25', color:'#fff', padding:'8px 16px', borderRadius:4, fontSize:13, fontWeight:700, textDecoration:'none' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#003580')}
                          onMouseLeave={e => (e.currentTarget.style.background='#ee1d25')}>
                          Ver Paquete
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
