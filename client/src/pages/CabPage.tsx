import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import DatePicker from '../components/ui/DatePicker'
import SEO from '../components/seo/SEO'

const CABS = [
  { id:1, name:'Seat Ibiza o Similar',      type:'Turismo',    pax:4,  bags:2, price:89,  features:['A/C','4 Plazas','2 Maletas','Wi-Fi'] },
  { id:2, name:'Ford Galaxy o Similar',      type:'Monovolumen',pax:7,  bags:4, price:129, features:['A/C','7 Plazas','4 Maletas','Wi-Fi','Silla bebé'] },
  { id:3, name:'Mercedes Clase E o Similar', type:'Ejecutivo',  pax:4,  bags:3, price:179, features:['A/C','4 Plazas','3 Maletas','Wi-Fi','Agua incluida'] },
  { id:4, name:'Toyota Hiace o Similar',     type:'Minibús',    pax:12, bags:8, price:249, features:['A/C','12 Plazas','8 Maletas'] },
]

export default function CabPage() {
  const navigate = useNavigate()
  const [from,setFrom]=useState('Madrid')
  const [to,setTo]=useState('Valencia')
  const [date,setDate]=useState(null)
  const [time,setTime]=useState('')
  const [tripType,setTripType]=useState('Solo Ida')
  const [showFilter,setShowFilter]=useState(true)
  const [maxPrice,setMaxPrice]=useState(300)
  const [selectedTypes,setSelectedTypes]=useState(['Turismo','Monovolumen','Ejecutivo','Minibús'])
  const [sortBy,setSortBy]=useState('price')

  const filtered = CABS
    .filter(c=>c.price<=maxPrice && selectedTypes.includes(c.type))
    .sort((a,b)=>sortBy==='price'?a.price-b.price:a.pax-b.pax)

  return (
    <div id="body">
      <SEO
        title="Traslados y Taxis | Reserva tu Traslado"
        description="Reserva traslados al aeropuerto, taxis y coches con conductor. Servicio puntual y profesional en toda España. Precio fijo sin sorpresas."
        keywords="traslados, taxi, transfer aeropuerto, coche con conductor, traslado privado"
        url="https://travelagency.com/traslados"
      />
      <MobileNav/><Header/>

      <div className="search-int">
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
          <div className="sb-row">
            <div className="sb-field">
              <div className="text-box"><span>Tipo de viaje</span>
                <select value={tripType} onChange={e=>setTripType(e.target.value)}>
                  <option>Solo Ida</option><option>Ida y Vuelta</option><option>Aeropuerto</option>
                </select>
              </div>
            </div>
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
            <div className="sb-field">
              <div className="text-box"><span>Hora recogida</span>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)}/>
              </div>
            </div>
            <div className="sb-btn">
              <button className="btn-search"><i className="fa fa-search"/></button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'24px 16px'}}>
        <p style={{fontSize:13,color:'#666',marginBottom:16}}>
          <i className="fa fa-car" style={{color:'#003580',marginRight:6}}/>{CABS.length} traslados disponibles · {from} → {to}
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {CABS.map(cab=>(
            <div key={cab.id} className="flight-block">
              <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:16}}>
                <div style={{flex:'0 0 80px',textAlign:'center'}}>
                  <i className="fa fa-car" style={{fontSize:40,color:'#003580'}}/>
                  <div style={{fontSize:11,color:'#888',marginTop:4}}>{cab.type}</div>
                </div>
                <div style={{flex:1}}>
                  <h3 style={{fontSize:16,fontWeight:700,color:'#003580',marginBottom:8}}>{cab.name}</h3>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {cab.features.map(f=>(
                      <span key={f} style={{border:'1px solid #e5e5e5',borderRadius:12,padding:'2px 10px',fontSize:11,color:'#666'}}>
                        <i className="fa fa-check" style={{marginRight:4,color:'#003580',fontSize:10}}/>{f}
                      </span>
                    ))}
                  </div>
                  <div style={{marginTop:8,display:'flex',gap:16,fontSize:12,color:'#888'}}>
                    <span><i className="fa fa-users" style={{marginRight:4}}/>Hasta {cab.pax} pasajeros</span>
                    <span><i className="fa fa-suitcase" style={{marginRight:4}}/>Hasta {cab.bags} maletas</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:24,fontWeight:800,color:'#003580',fontFamily:'Poppins,sans-serif'}}>{cab.price}€</div>
                  <div style={{fontSize:11,color:'#aaa',marginBottom:8}}>precio total</div>
                  <button onClick={()=>navigate('/traslados/checkout',{state:{cab,from,to,date,time}})}
                    style={{background:'#ee1d25',color:'#fff',border:'none',padding:'8px 18px',borderRadius:4,fontSize:13,fontWeight:700,cursor:'pointer'}}
                    onMouseEnter={e=>e.target.style.background='#003580'}
                    onMouseLeave={e=>e.target.style.background='#ee1d25'}>
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  )
}

