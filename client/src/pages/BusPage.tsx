import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import DatePicker from '../components/ui/DatePicker'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'
const MOCK = [
  { id:1, company:'Alsa',    type:'Supra',    dep:'10:00',arr:'16:10',duration:'6h 10m',stops:'Directo', seats:36,price:45,oldPrice:55,amenities:['WiFi','AC','USB'] },
  { id:2, company:'Alsa',    type:'Económico',dep:'12:30',arr:'19:00',duration:'6h 30m',stops:'Directo', seats:12,price:29,oldPrice:38,amenities:['AC'] },
  { id:3, company:'Avanza',  type:'Premium',  dep:'15:00',arr:'21:20',duration:'6h 20m',stops:'1 Parada',seats:24,price:39,oldPrice:49,amenities:['WiFi','AC','Cafetería'] },
  { id:4, company:'FlixBus', type:'Estándar', dep:'18:00',arr:'00:30',duration:'6h 30m',stops:'Directo', seats:5, price:19,oldPrice:28,amenities:['WiFi','USB'] },
]

export default function BusPage() {
  const navigate = useNavigate()
  const [buses,setBuses]=useState(MOCK)
  const [loading,setLoading]=useState(false)
  const [from,setFrom]=useState('Madrid')
  const [to,setTo]=useState('Barcelona')
  const [date,setDate]=useState(null)
  const [adults,setAdults]=useState(1)
  const [maxP,setMaxP]=useState(100)
  const [onlyDirect,setOnlyDirect]=useState(false)
  const [showFilter,setShowFilter]=useState(true)

  const doSearch = async () => {
    setLoading(true)
    try {
      // Convertir nombres de ciudad a códigos IATA básicos
      const cityToIATA: Record<string, string> = {
        'madrid': 'MAD', 'barcelona': 'BCN', 'valencia': 'VLC', 'sevilla': 'SVQ',
        'bilbao': 'BIO', 'malaga': 'AGP', 'alicante': 'ALC', 'zaragoza': 'ZAZ',
        'paris': 'CDG', 'london': 'LHR', 'rome': 'FCO', 'berlin': 'BER',
        'amsterdam': 'AMS', 'lisbon': 'LIS', 'lisboa': 'LIS', 'porto': 'OPO',
      }
      const fromCode = cityToIATA[from.toLowerCase()] || from.toUpperCase().slice(0, 3)
      const toCode   = cityToIATA[to.toLowerCase()]   || to.toUpperCase().slice(0, 3)
      const qs = new URLSearchParams({
        departure: fromCode,
        arrival: toCode,
        ...(date && { date: date instanceof Date ? date.toISOString().split('T')[0] : date }),
        adults: String(adults),
      })
      const r = await fetch(`${API}/buses/search?${qs}`)
      const d = await r.json()
      // backend devuelve { success, data: [...] }
      const list = d.data || d.buses || []
      if (list.length > 0) {
        // normalizar campos del backend al formato del frontend
        setBuses(list.map((b: any, i: number) => ({
          id: b.id || i,
          company: b.company || 'Bus',
          type: b.bus_type || b.type || 'Estándar',
          dep: b.departure_time ? new Date(b.departure_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : b.dep || '--:--',
          arr: b.arrival_time   ? new Date(b.arrival_time).toLocaleTimeString('es-ES',   { hour: '2-digit', minute: '2-digit' }) : b.arr || '--:--',
          duration: b.duration || '?',
          stops: b.stops || 'Directo',
          seats: b.seats_available ?? b.seats ?? 50,
          price: b.price?.amount ?? b.price ?? 0,
          oldPrice: b.oldPrice || null,
          amenities: b.amenities || [],
        })))
      } else {
        setBuses(MOCK)
      }
    } catch { setBuses(MOCK) }
    finally { setLoading(false) }
  }

  const filtered = buses.filter(b=>b.price<=maxP&&(!onlyDirect||b.stops==='Directo')).sort((a,b)=>a.price-b.price)

  return (
    <div id="body">
      <SEO
        title="Autobuses | Billetes de Autobús Baratos"
        description="Compra billetes de autobús al mejor precio. Rutas nacionales e internacionales con Alsa, Avanza, FlixBus y más. Reserva online fácil y rápido."
        keywords="autobús, billetes autobús, bus barato, Alsa, Avanza, FlixBus, viaje en bus"
        url="https://travelagency.com/autobuses"
      />
      <MobileNav/><Header/>

      <div className="search-int">
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
          <div className="sb-row">
            <div className="sb-field sb-field--grow">
              <div className="text-box"><span>Desde</span>
                <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Ciudad de origen"/>
              </div>
            </div>
            <div className="sb-field sb-field--grow">
              <div className="text-box"><span>Hasta</span>
                <input value={to} onChange={e=>setTo(e.target.value)} placeholder="Ciudad de destino"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box"><span>Fecha</span>
                <DatePicker value={date} onChange={setDate} placeholder="dd/mm/yyyy"/>
              </div>
            </div>
            <div className="sb-field sb-field--sm">
              <div className="text-box"><span>Pasajeros</span>
                <select value={adults} onChange={e=>setAdults(+e.target.value)}>
                  {[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}
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
                  <h4 className="filter-section-title">Precio Máximo</h4>
                  <input type="range" min={5} max={150} value={maxP} onChange={e=>setMaxP(+e.target.value)} style={{width:'100%',accentColor:'#003580'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginTop:4}}>
                    <span>5€</span><span style={{fontWeight:700,color:'#003580'}}>{maxP}€</span>
                  </div>
                </div>
                <div>
                  <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}>
                    <input type="checkbox" checked={onlyDirect} onChange={e=>setOnlyDirect(e.target.checked)} style={{accentColor:'#003580'}}/>
                    Solo viajes directos
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* RESULTADOS */}
          <div className="results-col">
            <p style={{fontSize:13,color:'#666',marginBottom:12}}>
              {loading?'Buscando autobuses...':`${filtered.length} servicios encontrados · ${from} → ${to}`}
            </p>
            {loading&&[0,1,2].map(i=>(
              <div key={i} style={{border:'1px solid #e5e5e5',borderRadius:6,padding:16,marginBottom:12}}>
                {[80,60,40].map((w,j)=><div key={j} className="skeleton" style={{height:14,width:`${w}%`,marginBottom:8}}/>)}
              </div>
            ))}
            {filtered.map(b=>(
              <div key={b.id} className="bus-block">
                <div className="bus-block-img">
                  {b.img
                    ? <img src={b.img} alt={b.company} loading="lazy"/>
                    : <i className="fa fa-bus bus-block-img-icon"/>}
                  <div className="bus-block-company-badge">{b.company}</div>
                </div>
                <div className="bus-block-body">
                  <div className="bus-block-times">
                    <div style={{textAlign:'center'}}>
                      <div className="bus-block-time-val">{b.dep}</div>
                      <div className="bus-block-time-lbl">{from}</div>
                    </div>
                    <div className="bus-block-mid">
                      <div className="bus-block-duration">{b.duration}</div>
                      <div className="bus-block-line"/>
                      <div className="bus-block-stops">{b.stops}</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div className="bus-block-time-val">{b.arr}</div>
                      <div className="bus-block-time-lbl">{to}</div>
                    </div>
                  </div>
                  <div className="bus-block-amenities">
                    {b.amenities.map(a=>(
                      <span key={a} className="bus-block-amenity">
                        {a==='WiFi'&&<i className="fa fa-wifi" style={{marginRight:3}}/>}
                        {a==='AC'&&<i className="fa fa-snowflake-o" style={{marginRight:3}}/>}
                        {a==='USB'&&<i className="fa fa-plug" style={{marginRight:3}}/>}
                        {a==='Cafetería'&&<i className="fa fa-coffee" style={{marginRight:3}}/>}
                        {a}
                      </span>
                    ))}
                    {b.seats<=10&&<span className="bus-block-seats"><i className="fa fa-bolt"/> {b.seats} plazas</span>}
                  </div>
                  <div className="bus-block-price-col">
                    {b.oldPrice&&<div className="bus-block-old-price">{b.oldPrice}€</div>}
                    <div className="bus-block-price">{b.price}€</div>
                    <div className="bus-block-price-label">por persona</div>
                    <button className="bus-block-btn"
                      onClick={()=>navigate('/autobuses/checkout',{state:{bus:b,from,to,date}})}>
                      Reservar
                    </button>
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
