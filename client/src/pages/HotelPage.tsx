import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import DatePicker from '../components/ui/DatePicker'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

// Fallback data when API fails
const MOCK = [
  { id:1, name:'Hotel Gran Madrid', stars:5, rating:9.2, reviews:1240, price:189, img:'/img/about-02.jpg', location:'Centro, Madrid', amenities:['WiFi','Piscina','Spa','Restaurante'], badge:'Más Vendido' },
  { id:2, name:'Apartamentos Sol',   stars:3, rating:8.5, reviews:876,  price:75,  img:'/img/about-03.jpg', location:'Barrio Letras, Madrid', amenities:['WiFi','Cocina','AC'], badge:null },
  { id:3, name:'Hotel Boutique Retiro',stars:4,rating:8.9,reviews:520,  price:129, img:'/img/about-04.jpg', location:'Retiro, Madrid', amenities:['WiFi','Desayuno','Parking'], badge:'Oferta' },
  { id:4, name:'Hostal Madrid Centro',stars:2, rating:7.8, reviews:312,  price:48,  img:'/img/about-02.jpg', location:'Gran Vía, Madrid', amenities:['WiFi','AC'], badge:null },
  { id:5, name:'Meliá Castilla',      stars:5, rating:9.0, reviews:2100, price:219, img:'/img/about-03.jpg', location:'Chamartín, Madrid', amenities:['WiFi','Piscina','Spa','Parking'], badge:'Popular' },
]

// Transformar datos de Amadeus al formato del frontend
function transformHotelData(hotel: any) {
  // Si ya tiene el formato del frontend, retornarlo
  if (hotel.price && hotel.stars) {
    return hotel;
  }

  // Transformar desde formato Amadeus
  const address = hotel.address || {};
  const location = hotel.location || {};
  const images = hotel.images || [];
  const rooms = hotel.rooms || [];
  
  return {
    id: hotel.id,
    name: hotel.name,
    stars: hotel.rating || 4,
    rating: hotel.rating ? hotel.rating.toFixed(1) : '4.5',
    reviews: Math.floor(Math.random() * 500) + 100,
    price: hotel.totalPrice ? Math.round(hotel.totalPrice / (hotel.nights || 1)) : (rooms[0]?.pricePerNight || 100),
    img: images[0]?.url || '/img/about-02.jpg',
    location: `${address.cityName || 'Centro'}, ${address.countryCode || 'España'}`,
    amenities: hotel.amenities || ['WiFi', 'Restaurante'],
    badge: hotel.rating >= 4.5 ? 'Popular' : null,
    // Datos completos para la página de detalles
    ...hotel,
    rooms: rooms,
    address: address,
    geoCode: location
  };
}

interface StarsProps {
  n: number;
}

function Stars({ n }: StarsProps) {
  return <span>{[1,2,3,4,5].map(i=><i key={i} className={`fa fa-star${i<=n?'':'-o'}`} style={{color:i<=n?'#f9a825':'#ddd',fontSize:12}}/> )}</span>
}

export default function HotelPage() {
  const [searchParams] = useSearchParams()
  const [hotels, setHotels] = useState(MOCK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Get search params from URL if coming from homepage
  const initialDest = searchParams.get('destination') || searchParams.get('city') || 'Madrid'
  const initialCheckin = searchParams.get('checkin') || null
  const initialCheckout = searchParams.get('checkout') || null
  const initialGuests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : 2

  const [dest, setDest] = useState(initialDest)
  const [checkin, setCheckin] = useState(initialCheckin ? new Date(initialCheckin) : null)
  const [checkout, setCheckout] = useState(initialCheckout ? new Date(initialCheckout) : null)
  const [guests, setGuests] = useState(initialGuests)
  const [maxPrice, setMaxPrice] = useState(300)
  const [sortBy, setSortBy] = useState('price')
  const [stars, setStars] = useState([1,2,3,4,5])
  const [showFilter, setShowFilter] = useState(true)

  // Auto-search on mount if params exist
  useEffect(() => {
    if (initialDest && initialCheckin && initialCheckout) {
      doSearch()
    }
  }, [])

  const doSearch = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query params - backend expects 'city' not 'destination'
      const params = new URLSearchParams()
      params.append('city', dest)
      
      if (checkin) {
        const checkinDate = checkin instanceof Date ? checkin.toISOString().split('T')[0] : checkin
        params.append('checkIn', checkinDate)
      }
      
      if (checkout) {
        const checkoutDate = checkout instanceof Date ? checkout.toISOString().split('T')[0] : checkout
        params.append('checkOut', checkoutDate)
      }
      
      params.append('guests', guests.toString())
      
      console.log('Searching hotels with params:', params.toString())
      
      const response = await fetch(`${API}/hotels/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Hotel search response:', data)
      
      // Transform data from Amadeus format to frontend format
      const hotelData = data.data || data.hotels || []
      
      if (hotelData.length > 0) {
        const transformedHotels = hotelData.map(transformHotelData)
        setHotels(transformedHotels)
        
        if (data.isMock) {
          console.warn('⚠️ Using mock data - Amadeus API not configured or returned error')
        }
      } else {
        console.log('No hotels found, using fallback data')
        setHotels(MOCK)
      }
    } catch (err: unknown) {
      console.error('Hotel search error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setHotels(MOCK)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort hotels (client-side filtering)
  const filtered = [...hotels]
    .filter(h => {
      const price = h.price || (h as any).totalPrice || 0
      const hotelStars = h.stars || (typeof h.rating === 'number' ? h.rating : 4)
      return price <= maxPrice
    })
    .filter(h => {
      const hotelStars = h.stars || Math.round(typeof h.rating === 'number' ? h.rating : 4)
      return stars.includes(hotelStars) || stars.includes(Math.floor(hotelStars))
    })
    .sort((a,b) => {
      const priceA = a.price || (a as any).totalPrice || 0
      const priceB = b.price || (b as any).totalPrice || 0
      const ratingA = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating as string) || 0
      const ratingB = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating as string) || 0
      const starsA = a.stars || 0
      const starsB = b.stars || 0
      
      if (sortBy === 'price') return priceA - priceB
      if (sortBy === 'rating') return ratingB - ratingA
      return starsB - starsA
    })

  return (
    <div id="body">
      <SEO
        title="Hoteles al Mejor Precio | Reserva Online"
        description="Encuentra y reserva hoteles en España y el mundo. Compara precios, lee valoraciones y elige el alojamiento perfecto para tu viaje."
        keywords="hoteles, reservar hotel, hoteles baratos, alojamiento, hotel Madrid, hotel Barcelona"
        url="https://travelagency.com/hoteles"
      />
      <MobileNav/><Header/>
      <PageBanner
        title="Hoteles"
        subtitle="Encuentra los mejores hoteles al mejor precio"
        breadcrumbs={[{ to: '/', icon: 'fa-home', label: 'Inicio' }, { label: 'Hoteles' }]}
      />

      {/* BARRA BÚSQUEDA INLINE */}
      <div className="search-int">
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
          <div className="sb-row">
            <div className="sb-field sb-field--grow">
              <div className="text-box"><span>Destino</span>
                <input value={dest} onChange={e=>setDest(e.target.value)} placeholder="Ciudad o nombre del hotel"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box"><span>Entrada</span>
                <DatePicker value={checkin} onChange={setCheckin} placeholder="Check-in"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box"><span>Salida</span>
                <DatePicker value={checkout} onChange={setCheckout} placeholder="Check-out" minDate={checkin||new Date()} alignRight/>
              </div>
            </div>
            <div className="sb-field sb-field--sm">
              <div className="text-box"><span>Huéspedes</span>
                <select value={guests} onChange={e=>setGuests(+e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="sb-btn">
              <button className="btn-search" onClick={doSearch}><i className="fa fa-search"/></button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 16px'}}>

        {/* FILTROS + RESULTADOS */}
        <div className="results-layout">

          {/* FILTROS */}
          <div className="filters-col">
            <div className="filter-head" onClick={()=>setShowFilter(f=>!f)}>
              <span><i className="fa fa-sliders" style={{marginRight:6}}/>Filtros</span>
              <i className={`fa fa-chevron-${showFilter?'up':'down'}`}/>
            </div>
            {showFilter&&(
              <div className="filter-body">
                <div style={{marginBottom:16}}>
                  <h4 className="filter-section-title">Precio Máximo/noche</h4>
                  <input type="range" min={30} max={500} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)} style={{width:'100%',accentColor:'#003580'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginTop:4}}>
                    <span>30€</span><span style={{fontWeight:700,color:'#003580'}}>{maxPrice}€</span>
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  <h4 className="filter-section-title">Categoría</h4>
                  {[5,4,3,2,1].map(n=>(
                    <label key={n} style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,fontSize:13,cursor:'pointer'}}>
                      <input type="checkbox" checked={stars.includes(n)} style={{accentColor:'#003580'}}
                        onChange={e=>setStars(s=>e.target.checked?[...s,n]:s.filter(x=>x!==n))}/>
                      <Stars n={n}/>
                    </label>
                  ))}
                </div>
                <div>
                  <h4 className="filter-section-title">Ordenar</h4>
                  {[{v:'price',l:'Precio'},{v:'rating',l:'Valoración'},{v:'stars',l:'Estrellas'}].map(({v,l})=>(
                    <label key={v} style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,fontSize:13,cursor:'pointer'}}>
                      <input type="radio" name="hsort" checked={sortBy===v} onChange={()=>setSortBy(v)} style={{accentColor:'#003580'}}/>{l}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RESULTADOS */}
          <div className="results-col">
            <p style={{fontSize:13,color:'#666',marginBottom:12}}>
              {loading?'Buscando hoteles...':`${filtered.length} hoteles encontrados`}
            </p>
            {loading&&[0,1,2].map(i=>(
              <div key={i} style={{border:'1px solid #e5e5e5',borderRadius:6,padding:16,marginBottom:12}}>
                {[80,60,40].map((w,j)=><div key={j} className="skeleton" style={{height:14,width:`${w}%`,marginBottom:8}}/>)}
              </div>
            ))}
            {filtered.map(h=>(
              <div key={h.id} className="hotel-block">
                <div className="hotel-block-img">
                  {h.img
                    ? <img src={h.img} alt={h.name} loading="lazy" onError={(e)=>{e.currentTarget.style.display='none';(e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'}}/>
                    : null}
                  <div className="hotel-block-img-placeholder" style={{display: h.img ? 'none' : 'flex'}}>
                    <i className="fa fa-building"/>
                  </div>
                  {h.badge && <span className="hotel-block-badge">{h.badge}</span>}
                </div>
                <div className="hotel-block-body">
                  <div className="hotel-block-top">
                    <div className="hotel-block-info">
                      <h3 style={{fontSize:16,fontWeight:700,color:'#003580',marginBottom:4}}>{h.name}</h3>
                      <Stars n={h.stars}/>
                      <p style={{fontSize:12,color:'#888',marginTop:4}}>
                        <i className="fa fa-map-marker" style={{marginRight:4,color:'#003580'}}/>{h.location}
                      </p>
                      <div className="hotel-block-amenities">
                        {h.amenities.map(a=>(
                          <span key={a} className="hotel-block-amenity">
                            <i className="fa fa-check" style={{marginRight:3,color:'#003580',fontSize:10}}/>{a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="hotel-block-price-col">
                      <div className="hotel-block-rating">
                        {h.rating} <i className="fa fa-star" style={{fontSize:11}}/>
                      </div>
                      <div className="hotel-block-reviews">({h.reviews} valoraciones)</div>
                      <div className="hotel-block-price">{h.price}€</div>
                      <div className="hotel-block-price-label">por noche</div>
                      <Link to={`/hoteles/${h.id}`} className="hotel-block-btn">Ver Hotel</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer/>
    </div>
  )
}
