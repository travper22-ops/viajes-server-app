import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import TravelDatePicker from '../components/ui/TravelDatePicker'
import { StarRating } from '../components/ui'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

// Type constant (placeholder for API type)
const HOTEL = 'hotel'

// Fallback data when API fails
const MOCK_HOTEL = {
  name: 'Hotel Gran Madrid 5 estrellas', location: 'Gran Vía 28, Centro, Madrid',
  rating: 9.2, reviews: 1240, price: 189,
  imgs: ['/img/about-01.jpg','/img/about-02.jpg','/img/about-03.jpg','/img/about-04.jpg','/img/about-05.jpg'],
  amenities: [
    {icon:'fa-wifi',         label:'WiFi Gratis'},
    {icon:'fa-swimming-pool', label:'Piscina'},
    {icon:'fa-spa',          label:'Spa'},
    {icon:'fa-utensils',     label:'Restaurante'},
    {icon:'fa-parking',     label:'Parking'},
    {icon:'fa-dumbbell',     label:'Gimnasio'},
    {icon:'fa-snowflake',   label:'Aire Acondicionado'},
    {icon:'fa-coffee',      label:'Desayuno incluido'},
  ],
  rooms: [
    { id:'room-1', type:'Habitación Estándar', size:22, beds:'1 cama doble', price:189, img:'/img/b1-2.jpg' },
    { id:'room-2', type:'Suite Deluxe',        size:38, beds:'1 cama king',  price:289, img:'/img/b1-3.jpg' },
    { id:'room-3', type:'Junior Suite',        size:50, beds:'1 cama king + sofá', price:389, img:'/img/b2-1.jpg' },
  ],
  reviews_list: [
    { author:'Ana M.', rating:5, date:'Feb 2025', text:'Hotel increíble, el servicio es de primera. La habitación estaba perfectamente limpia y el desayuno era abundante.' },
    { author:'Carlos R.', rating:4, date:'Ene 2025', text:'Muy buena ubicación en el centro. Un poco ruidoso por la noche pero en general una experiencia excelente.' },
    { author:'Laura T.', rating:5, date:'Dic 2024', text:'Todo perfecto. Lo recomendaría sin dudarlo. El spa es espectacular.' },
  ],
}

// Transformar datos de Amadeus al formato del frontend
function transformHotelDetail(hotel) {
  if (!hotel) return MOCK_HOTEL;
  
  // Si ya tiene el formato del frontend
  if (hotel.name && hotel.amenities && hotel.rooms) {
    return hotel;
  }
  
  // Transformar desde formato Amadeus
  const address = hotel.address || {};
  const images = hotel.images || [];
  const rooms = hotel.rooms || [];
  
  // Map amenities de Amadeus a iconos
  const amenityIcons = {
    'WIFI': {icon:'fa-wifi', label:'WiFi'},
    'POOL': {icon:'fa-swimming-pool', label:'Piscina'},
    'SPA': {icon:'fa-spa', label:'Spa'},
    'GYM': {icon:'fa-dumbbell', label:'Gimnasio'},
    'RESTAURANT': {icon:'fa-utensils', label:'Restaurante'},
    'PARKING': {icon:'fa-parking', label:'Parking'},
    'BAR': {icon:'fa-glass', label:'Bar'},
    'ROOM_SERVICE': {icon:'fa-concierge-bell', label:'Room Service'},
    'BREAKFAST': {icon:'fa-coffee', label:'Desayuno'},
    'AIR_CONDITIONING': {icon:'fa-snowflake', label:'Aire Acondicionado'}
  };
  
  const amenities = (hotel.amenities || []).map(a => {
    const key = String(a).toUpperCase();
    return amenityIcons[key] || {icon:'fa-check', label:String(a)};
  });
  
  return {
    id: hotel.id,
    name: hotel.name || 'Hotel',
    location: `${address.cityName || 'Centro'}, ${address.countryCode || 'España'}`,
    rating: hotel.rating ? hotel.rating.toFixed(1) : '4.5',
    reviews: Math.floor(Math.random() * 500) + 100,
    price: hotel.pricePerNight || hotel.totalPrice || 100,
    imgs: images.length > 0 ? images.map(img => img.url) : MOCK_HOTEL.imgs,
    amenities: amenities.length > 0 ? amenities : MOCK_HOTEL.amenities,
    rooms: rooms.map(room => ({
      id: room.id,
      type: room.roomType || 'Habitación Estándar',
      size: room.beds || 25,
      beds: room.bedType || '1 cama doble',
      price: room.pricePerNight || room.price?.total || 100,
      img: '/img/b1-2.jpg'
    })),
    reviews_list: MOCK_HOTEL.reviews_list,
    address,
    description: hotel.description,
    contact: hotel.contact,
    geoCode: hotel.location
  };
}

function FImg({ src, alt, className }) {
  return <img src={src} alt={alt} className={className}
    onError={e=>{e.target.onerror=null;e.target.src='/img/_placeholder.svg'}}/>
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState<any>(MOCK_HOTEL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx]   = useState(0)
  const [checkin,  setCheckin]  = useState(null)
  const [checkout, setCheckout] = useState(null)
  const [guests,   setGuests]   = useState(2)
  const [fav,      setFav]      = useState(false)

  // Cargar datos del hotel desde la API
  useEffect(() => {
    async function fetchHotel() {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams()
        params.append('checkIn', new Date().toISOString().split('T')[0])
        params.append('checkOut', new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0])
        params.append('guests', '2')
        
        const response = await fetch(`${API}/hotels/${id}?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Hotel detail response:', data)
        
        // Transformar datos
        const transformedHotel = transformHotelDetail(data)
        setHotel(transformedHotel)
      } catch (err) {
        console.error('Error loading hotel:', err)
        setError(err.message)
        // Usar datos mock en caso de error
        setHotel(MOCK_HOTEL)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchHotel()
    }
  }, [id])

  const prev = () => setImgIdx(i=>(i-1+hotel.imgs.length)%hotel.imgs.length)
  const next = () => setImgIdx(i=>(i+1)%hotel.imgs.length)

  // Calcular noches
  const nights = checkin && checkout ? 
    Math.ceil((new Date(checkout) - new Date(checkin)) / (1000*60*60*24)) : 3

  const handleRoomSelect = (roomId) => {
    navigate(`/hoteles/${id}/checkout?roomId=${roomId}`)
  }

  return (
    <div id="body">
      <MobileNav/>
      <Header/>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <Link to="/" className="hover:text-primary">Inicio</Link> /
          <Link to="/hoteles" className="hover:text-primary mx-1">Hoteles</Link> /
          <span className="text-gray-700 font-medium ml-1">{loading ? 'Cargando...' : hotel.name}</span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <i className="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-500">Cargando información del hotel...</p>
            </div>
          </div>
        ) : error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-700 text-sm">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              Mostrando datos de demostración. Error: {error}
            </p>
          </div>
        )}

        {/* Título + acciones */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins text-gray-800">{hotel.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <i className="fa fa-map-marker"/>{hotel.location}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setFav(f=>!f)}
              className={`flex items-center gap-1.5 border px-3 py-2 rounded-lg text-sm transition-colors ${fav?'bg-red-50 border-red-300 text-red-500':'border-gray-200 text-gray-500 hover:border-red-300'}`}>
              <i className="fa fa-heart"/> {fav?'Guardado':'Guardar'}
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:border-primary px-3 py-2 rounded-lg text-sm transition-colors">
              <i className="fa fa-share-alt"/> Compartir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">

            {/* Galería */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-gray-100">
              <div className="relative h-72 md:h-96">
                <FImg src={HOTEL.imgs[imgIdx]} alt={HOTEL.name} className="w-full h-full object-cover"/>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                  <i className="fa fa-chevron-left"/>
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                  <i className="fa fa-chevron-right"/>
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {imgIdx+1}/{HOTEL.imgs.length}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 p-3 overflow-x-auto">
                {HOTEL.imgs.map((img,i)=>(
                  <button key={i} onClick={()=>setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i===imgIdx?'border-primary':'border-transparent'}`}>
                    <FImg src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-4xl font-black text-primary font-poppins">{HOTEL.rating}</div>
              <div>
                <div className="font-bold text-gray-800">Excelente</div>
                <StarRating value={Math.round(HOTEL.rating/2)} max={5}/>
                <div className="text-xs text-gray-500 mt-1">{HOTEL.reviews.toLocaleString()} opiniones verificadas</div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4">Servicios e instalaciones</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HOTEL.amenities.map(({icon,label})=>(
                  <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 text-sm font-medium text-gray-700">
                    <i className={`fa ${icon} text-primary`}/> {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Habitaciones */}
            <div className="mb-8">
              <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4">Habitaciones disponibles</h2>
              <div className="space-y-4">
                {HOTEL.rooms.map((r,i)=>(
                  <div key={i} className="flex flex-col sm:flex-row border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                      <FImg src={r.img} alt={r.type} className="w-full h-full object-cover"/>
                    </div>
                    <div className="p-4 flex flex-1 justify-between items-center gap-4">
                      <div>
                        <h3 className="font-bold text-gray-800 font-poppins">{r.type}</h3>
                        <p className="text-xs text-gray-500 mt-1">{r.size}m² · {r.beds}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Cancelación gratis</span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Desayuno incl.</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-primary font-poppins">{r.price}€</div>
                        <div className="text-xs text-gray-400 mb-2">por noche</div>
                        <Link to={`/hoteles/${id}/checkout`}
                          className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                          Reservar
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseñas */}
            <div>
              <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4">Opiniones de huéspedes</h2>
              <div className="space-y-4">
                {HOTEL.reviews_list.map((r,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {r.author[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{r.author}</div>
                          <div className="text-xs text-gray-400">{r.date}</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(s=>(
                          <i className="fa fa-star"/>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-4 shadow-sm">
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-3xl font-bold text-primary font-poppins">{HOTEL.price}€</div>
                <span className="text-sm text-gray-400">por noche</span>
              </div>

              <div className="space-y-3 mb-4">
                <TravelDatePicker
                  mode="range"
                  label="Entrada"
                  labelEnd="Salida"
                  value={checkin}
                  valueEnd={checkout}
                  onChange={setCheckin}
                  onChangeEnd={setCheckout}
                  placeholder="¿Cuándo llegas?"
                  placeholderEnd="¿Cuándo te vas?"
                />
                <div className="search-input">
                  <label className="text-xs text-gray-500 uppercase block mb-1">Huéspedes</label>
                  <select value={guests} onChange={e=>setGuests(+e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} huésped{n>1?'es':''}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between"><span>{HOTEL.price}€ × 3 noches</span><span>{HOTEL.price*3}€</span></div>
                <div className="flex justify-between"><span>Tasas y cargos</span><span>15€</span></div>
                <div className="flex justify-between font-bold text-base text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span><span className="text-primary">{HOTEL.price*3+15}€</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs text-green-700">
                <i className="fa fa-shield"/> Cancelación gratuita hasta 48h antes
              </div>

              <Link to={`/hoteles/${id}/checkout`}
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl text-center text-sm transition-colors">
                <i className="fa fa-lock mr-2"/>Reservar ahora
              </Link>
              <p className="text-center text-xs text-gray-400 mt-2">No se te cobrará nada aún</p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
