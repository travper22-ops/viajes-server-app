import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import SEO from '../components/seo/SEO'
import FlightSearchForm   from '../components/search/FlightSearchForm'
import HotelSearchForm    from '../components/search/HotelSearchForm'
import HolidaySearchForm  from '../components/search/HolidaySearchForm'
import BusSearchForm      from '../components/search/BusSearchForm'
import TaxiSearchForm     from '../components/search/TaxiSearchForm'
import FlashDeals         from '../components/FlashDeals'

/* ─── Datos estáticos ─────────────────────────── */
const MAIN_TABS = [
  { id:'flights',  icon:'fa-plane',    label:'Vuelos'    },
  { id:'hotels',   icon:'fa-bed',      label:'Hoteles'   },
  { id:'holidays', icon:'fa-briefcase',label:'Vacaciones'},
  { id:'bus',      icon:'fa-bus',      label:'Autobús'   },
  { id:'cab',      icon:'fa-cab',      label:'Taxi'      },
]

const OFFERS = [
  { id:1, img:'/img/img-01.png', title:'Hasta 20% de Descuento', desc:'Descuento directo + 10% en tu próxima reserva', code:'AFIND50', until:'31 Dic' },
  { id:2, img:'/img/img-02.png', title:'Hasta 20% de Descuento', desc:'Descuento directo + 10% en tu próxima reserva', code:'AFIND50', until:'31 Dic' },
  { id:3, img:'/img/img-03.png', title:'Hasta 20% de Descuento', desc:'Descuento directo + 10% en tu próxima reserva', code:'AFIND50', until:'31 Dic' },
  { id:4, img:'/img/img-01.png', title:'Hasta 20% de Descuento', desc:'Descuento directo + 10% en tu próxima reserva', code:'VERANO25', until:'15 Ago' },
  { id:5, img:'/img/img-02.png', title:'Hasta 30% de Descuento', desc:'Flash sale este fin de semana', code:'FLASH30', until:'01 Jul' },
  { id:6, img:'/img/img-03.png', title:'2x1 en Hoteles',         desc:'Reserva 2 noches y paga solo 1', code:'2X1HTL', until:'30 Sep' },
]

const TOURS = [
  { img:'/img/t1.png', city:'Madrid'    },
  { img:'/img/t2.png', city:'Barcelona' },
  { img:'/img/t3.png', city:'Sevilla'   },
  { img:'/img/t4.png', city:'Valencia'  },
]

const BLOG = [
  { img:'/img/about-02.jpg', title:'Los mejores destinos de verano' },
  { img:'/img/about-03.jpg', title:'Consejos para viajar barato'    },
  { img:'/img/about-04.jpg', title:'Guía para tu primer viaje a Europa' },
]

const PARTNERS = [
  '/img/p_01.png','/img/p_02.png','/img/p_03.png',
  '/img/p_04.png','/img/p_05.png','/img/p_06.png',
]

const BANNER1 = ['/img/b1-2.jpg','/img/b1-3.jpg']
const BANNER2 = ['/img/b2-1.jpg','/img/b2-2.jpg']

/* ─── Mini carrusel ───────────────────────────── */
function Carousel({ images }) {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCur(i => (i+1) % images.length), 3000)
    return () => clearInterval(t)
  }, [images.length])
  return (
    <div style={{ position:'relative', borderRadius:4, overflow:'hidden' }}>
      {images.map((src,i) => (
        <img key={src} src={src} alt=""
          style={{ display: i===cur?'block':'none', borderRadius:4, width:'100%' }}
          onError={e => { e.target.onerror=null; e.target.style.background='#e8eef8'; e.target.style.height='120px' }}
        />
      ))}
      <div style={{ position:'absolute', bottom:6, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
        {images.map((_,i) => (
          <span key={i} onClick={() => setCur(i)} style={{
            width:10, height:10, borderRadius:'50%',
            background: i===cur ? '#fff' : 'rgba(255,255,255,0.5)',
            cursor:'pointer', display:'block'
          }}/>
        ))}
      </div>
    </div>
  )
}

/* ─── Slider de ofertas ───────────────────────── */
function OffersSlider({ items }) {
  const [start, setStart] = useState(0)
  const visible = 3
  const prev = () => setStart(s => Math.max(0, s-1))
  const next = () => setStart(s => Math.min(items.length - visible, s+1))
  const shown = items.slice(start, start + visible)

  return (
    <div>
      <div style={{ display:'flex', gap:0 }}>
        {shown.map(o => (
          <div key={o.id} className="best-block-bg" style={{ flex:'1', minWidth:0 }}>
            <img src={o.img} alt={o.title}
              onError={e=>{ e.target.onerror=null; e.target.style.background='#dde3f0'; e.target.style.height='120px' }}/>
            <div className="best-block-footer">
              <h4>{o.title}</h4>
              <span className="desc">{o.desc}</span>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ flex:1 }}><div className="coup">{o.code}</div></div>
                <div><small>Válido hasta: {o.until}</small></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="slider-nav">
        <button type="button" onClick={prev} disabled={start===0}><i className="fa fa-chevron-left"/></button>
        <button type="button" onClick={next} disabled={start >= items.length - visible}><i className="fa fa-chevron-right"/></button>
      </div>
    </div>
  )
}

/* ─── HomePage ────────────────────────────────── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState('flights')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [prefix, setPrefix] = useState('+34')

  return (
    <div id="body">
      <SEO
        title="Vuelos, Hoteles y Paquetes Turísticos"
        description="Tu agencia de viajes online. Reserva vuelos baratos, hoteles, paquetes vacacionales, autobuses y traslados. Los mejores precios garantizados."
        keywords="agencia de viajes, vuelos baratos, hoteles, paquetes turísticos, vacaciones, autobuses, traslados"
        url="https://travelagency.com/"
      />
      <MobileNav/>
      <Header/>

      {/* ── BANNER ───────────────────────────────── */}
      <div className="banner-bg" style={{ background:'#003580 url(/img/banner.jpg) center/cover no-repeat' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>

            {/* Buscador — col-lg-7 */}
            <div className="search-col" style={{ flex:'0 0 58.333%', maxWidth:'58.333%', minWidth:280 }}>
              <div className="search-bg">
                {/* Pestañas principales */}
                <div className="mtab" style={{ zIndex: 10, position: 'relative' }}>
                  {MAIN_TABS.map(t => (
                    <div key={t.id} 
                      className={`mtab-item${activeTab===t.id?' active':''}`}
                      style={{ cursor: 'pointer', userSelect: 'none', zIndex: 11, position: 'relative' }}
                      onClick={() => { console.log('Tab clicked:', t.id); setActiveTab(t.id); }}>
                      <i className={`fa ${t.icon}`}/> {t.label}
                    </div>
                  ))}
                </div>
                {/* Contenido por pestaña */}
                {activeTab==='flights'  && <FlightSearchForm/>}
                {activeTab==='hotels'   && <HotelSearchForm/>}
                {activeTab==='holidays' && <HolidaySearchForm/>}
                {activeTab==='bus'      && <BusSearchForm/>}
                {activeTab==='cab'      && <TaxiSearchForm/>}
              </div>
            </div>

            {/* Carruseles — col-lg-5 */}
            <div style={{ flex:'0 0 38%', maxWidth:'38%', minWidth:240 }}>
              <div className="banner-slide"><Carousel images={BANNER1}/></div>
              <div className="banner-slide" style={{ marginBottom:0 }}><Carousel images={BANNER2}/></div>
            </div>

          </div>
        </div>
      </div>

      {/* ── BEST PRICE + SOPORTE ─────────────────── */}
      <section className="best-flight-bg">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }} className="best-offers">
            <div style={{ flex:'0 0 calc(50% - 8px)', minWidth:280 }}>
              <a href="#!" className="best-bg">
                <div className="icon-wrap"><i className="fa fa-dollar"/></div>
                <div>
                  <span>MEJOR PRECIO GARANTIZADO</span>
                  <small>¿Encontraste un precio más bajo? Te reembolsamos el 100% de la diferencia.</small>
                </div>
              </a>
            </div>
            <div style={{ flex:'0 0 calc(50% - 8px)', minWidth:280 }}>
              <a href="#!" className="support-bg">
                <div className="icon-wrap"><i className="fa fa-headphones"/></div>
                <div>
                  <span>SOPORTE 24×7</span>
                  <small>Siempre aquí para ti – contáctanos las 24 horas del día, los 7 días de la semana.</small>
                </div>
              </a>
            </div>
          </div>

          <h2 className="title"><strong>Mejores Vuelos</strong></h2>
          <OffersSlider items={OFFERS}/>
        </div>
      </section>

      {/* ── OFERTAS FLASH ────────────────────────── */}
      <FlashDeals />

      {/* ── PAQUETES TURÍSTICOS ───────────────────── */}
      <section style={{ marginBottom:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', position:'relative' }}>
          <h2 className="title1"><strong>Paquetes Turísticos</strong></h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:0, margin:'0 -8px' }} className="tour-items">
            {TOURS.map(t => (
              <div key={t.city} style={{ flex:'0 0 25%', maxWidth:'25%', padding:'0 8px' }}>
                <Link to="/vacaciones" className="tour-block">
                  <img src={t.img} alt={t.city}
                    onError={e=>{e.target.onerror=null;e.target.style.background='#dde3f0';e.target.style.height='160px'}}/>
                  <h2>{t.city}</h2>
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:20, paddingBottom:40 }}>
            <Link to="/vacaciones" className="view-more">Ver Más</Link>
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────── */}
      <section className="blog">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', position:'relative' }}>
          <h2 className="title1"><strong>Blog de Viajes</strong></h2>
          <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -8px' }}>
            {BLOG.map(b => (
              <div key={b.title} style={{ flex:'0 0 33.333%', maxWidth:'33.333%', padding:'0 8px' }}>
                <Link to="/blog" className="tour-block">
                  <img src={b.img} alt={b.title}
                    onError={e=>{e.target.onerror=null;e.target.style.background='#e0e8f5';e.target.style.height='160px'}}/>
                  <h2>{b.title}</h2>
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:20, paddingBottom:40 }}>
            <Link to="/blog" className="view-more">Ver Más</Link>
          </div>
        </div>
      </section>

      {/* ── AEROLÍNEAS ASOCIADAS ──────────────────── */}
      <section className="partner">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <h2 className="title1"><strong>Aerolíneas Asociadas</strong></h2>
          <div style={{ display:'flex', flexWrap:'wrap', margin:'0 -8px', alignItems:'center' }}>
            {PARTNERS.map((p,i) => (
              <div key={i} style={{ flex:'0 0 16.666%', maxWidth:'16.666%', padding:'0 8px' }}>
                <img src={p} alt={`Aerolínea ${i+1}`} className="plogo"
                  onError={e=>{e.target.onerror=null;e.target.style.background='#f0f0f0';e.target.style.height='50px'}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUSCRIPCIÓN / APP ────────────────────── */}
      <section className="subscribe-bg">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <div className="app-download">

            {/* QR */}
            <div>
              <div className="qr">
                <img src="/img/travel-engine-QR.png" alt="QR"
                  onError={e=>{e.target.onerror=null;e.target.style.background='#eee';e.target.style.height='80px';e.target.style.width='80px'}}/>
                <h3>Escanea el Código QR</h3>
              </div>
            </div>

            {/* Descarga app + SMS */}
            <div>
              <div className="download">
                <h3>Descarga Nuestra App</h3>
                <a href="#"><img src="/img/aap_01.png" alt="App Store"/></a>
                {' '}
                <img src="/img/aap_02.png" alt="Google Play"/>
              </div>
              <div className="subscribe-box">
                <small>Descarga por SMS</small>
                <div className="sms-bg" style={{ marginTop:6 }}>
                  <select value={prefix} onChange={e=>setPrefix(e.target.value)}>
                    <option>+34</option><option>+1</option><option>+44</option>
                  </select>
                  <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Número de móvil de 10 dígitos"/>
                  <button type="button">Enviar</button>
                </div>
                <small style={{ display:'block',marginTop:6 }}>
                  O llámanos al 900-888-888 para descargar la app
                </small>
              </div>
            </div>

            {/* Email suscripción */}
            <div>
              <div className="sub-email">
                <h3>Regístrate para Cupones/Ofertas Exclusivas</h3>
                <span style={{ fontSize:13, color:'#666' }}>
                  Acceso exclusivo a cupones, ofertas especiales y promociones.
                </span>
                <div className="sub-input">
                  <input type="text" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Ingresa tu correo electrónico"/>
                  <button type="button">Enviar</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
