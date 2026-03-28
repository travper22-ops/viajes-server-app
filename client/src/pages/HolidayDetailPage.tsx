import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import PaymentModal from '../components/booking/PaymentModal'
import TermsCheckbox from '../components/booking/TermsCheckbox'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const MOCK: Record<string, any> = {
  '1': { id:1, city:'Madrid',    nights:3, price:299, oldPrice:399, rating:4.8, reviews:234, img:'/img/t1.png', origin:'BCN', destination:'MAD', includes:['Vuelo','Hotel 4★','Desayuno'], description:'Descubre la capital de España con este paquete completo. Vuelo directo, hotel en el centro y desayuno incluido cada mañana.' },
  '2': { id:2, city:'Barcelona', nights:4, price:349, oldPrice:449, rating:4.9, reviews:512, img:'/img/t2.png', origin:'MAD', destination:'BCN', includes:['Vuelo','Hotel 4★','Desayuno','City Tour'], description:'La ciudad condal te espera. Visita la Sagrada Familia, el Barrio Gótico y disfruta de la gastronomía catalana.' },
  '3': { id:3, city:'Sevilla',   nights:3, price:279, oldPrice:359, rating:4.7, reviews:187, img:'/img/t3.png', origin:'MAD', destination:'SVQ', includes:['Vuelo','Hotel 3★','Desayuno'], description:'Flamenco, tapas y monumentos únicos. Sevilla es una de las ciudades más bonitas de España.' },
  '4': { id:4, city:'Valencia',  nights:5, price:429, oldPrice:549, rating:4.8, reviews:321, img:'/img/t4.png', origin:'MAD', destination:'VLC', includes:['Vuelo','Hotel 5★','Media Pensión','Traslados'], description:'La ciudad de la paella y la Ciudad de las Artes y las Ciencias. Un destino perfecto para toda la familia.' },
  '5': { id:5, city:'Bilbao',    nights:2, price:199, oldPrice:249, rating:4.6, reviews:98,  img:'/img/t1.png', origin:'MAD', destination:'BIO', includes:['Vuelo','Hotel 3★'], description:'El Guggenheim, la Ría y la mejor gastronomía del norte. Bilbao sorprende a todos sus visitantes.' },
  '6': { id:6, city:'Granada',   nights:4, price:319, oldPrice:399, rating:4.9, reviews:443, img:'/img/t2.png', origin:'MAD', destination:'GRX', includes:['Vuelo','Hotel 4★','Desayuno','Alhambra'], description:'La Alhambra, el Albaicín y los sabores del sur. Granada es magia pura.' },
}

export default function HolidayDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [pkg,     setPkg]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guests,  setGuests]  = useState(2)
  const [contact, setContact] = useState({ firstName:'', lastName:'', email:'', phone:'' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [booking, setBooking] = useState(false)
  const [err,     setErr]     = useState('')
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)

  useEffect(() => {
    fetch(`${API}/packages/${id}`)
      .then(r => r.json())
      .then(d => setPkg(d.data || d.package || MOCK[id!] || null))
      .catch(() => setPkg(MOCK[id!] || null))
      .finally(() => setLoading(false))
  }, [id])

  const total = pkg ? pkg.price * guests : 0
  const taxes = Math.round(total * 0.10)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact(c => ({ ...c, [k]: e.target.value }))

  const handleBook = async () => {
    if (!contact.email) { setErr('El email de contacto es obligatorio'); return }
    if (!termsAccepted) { setErr('Debes aceptar los términos y condiciones'); return }
    setErr(''); setBooking(true)
    try {
      const res = await fetch(`${API}/packages/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({
          packageId: id,
          passengers: Array.from({ length: guests }, (_, i) => ({
            type: 'ADULT', firstName: i === 0 ? contact.firstName : '', lastName: i === 0 ? contact.lastName : ''
          })),
          contact: { email: contact.email, phone: contact.phone, firstName: contact.firstName, lastName: contact.lastName },
          totalAmount: total + taxes,
          currency: 'EUR'
        })
      })
      const data = await res.json()
      setBookingRef(data.data?.reference || data.reference || `PKG-${Date.now()}`)
      setShowPayModal(true)
    } catch {
      setBookingRef(`PKG-${Date.now()}`)
      setShowPayModal(true)
    } finally { setBooking(false) }
  }

  const fieldStyle: React.CSSProperties = { width:'100%', border:'1px solid #e5e5e5', borderRadius:4, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }

  if (loading) return (
    <div id="body"><MobileNav/><Header/>
      <div style={{ textAlign:'center', padding:'80px 0', color:'#aaa' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize:32, display:'block', marginBottom:12 }}/>Cargando paquete...
      </div>
      <Footer/>
    </div>
  )

  if (!pkg) return (
    <div id="body"><MobileNav/><Header/>
      <div style={{ textAlign:'center', padding:'80px 0', color:'#aaa' }}>
        <i className="fa fa-exclamation-circle" style={{ fontSize:40, display:'block', marginBottom:12 }}/>
        <p>Paquete no encontrado</p>
        <Link to="/vacaciones" style={{ color:'#003580', marginTop:12, display:'inline-block' }}>← Ver todos los paquetes</Link>
      </div>
      <Footer/>
    </div>
  )

  return (
    <div id="body">
      <SEO
        title={`${pkg.city || pkg.name} ${pkg.nights ? `${pkg.nights} noches` : ''} | Paquete Vacacional`}
        description={pkg.description || `Paquete vacacional a ${pkg.city}. Vuelo + hotel incluido.`}
        url={`https://travelagency.com/vacaciones/${id}`}
      />
      <MobileNav /><Header />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        <Link to="/vacaciones" style={{ fontSize:13, color:'#003580', display:'inline-flex', alignItems:'center', gap:6, marginBottom:16 }}>
          <i className="fa fa-arrow-left"/>Volver a paquetes
        </Link>

        <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-start' }}>

          {/* Columna principal */}
          <div style={{ flex:'1 1 560px', minWidth:0 }}>

            {/* Imagen y título */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
              <div style={{ position:'relative' }}>
                <img src={pkg.img || pkg.image_url || '/img/t1.png'} alt={pkg.city || pkg.name} loading="lazy"
                  style={{ width:'100%', height:260, objectFit:'cover', display:'block' }}
                  onError={e => { (e.target as HTMLImageElement).style.background='#e0e8f5' }}/>
                {pkg.oldPrice && (
                  <div style={{ position:'absolute', top:12, right:12, background:'#ee1d25', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
                    {Math.round((1 - pkg.price / pkg.oldPrice) * 100)}% descuento
                  </div>
                )}
              </div>
              <div style={{ padding:20 }}>
                <h1 style={{ fontSize:22, fontWeight:700, color:'#003580', marginBottom:8 }}>
                  {pkg.city || pkg.name} {pkg.nights ? `· ${pkg.nights} noches` : ''}
                </h1>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ background:'#003580', color:'#fff', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:4 }}>
                    {pkg.rating} <i className="fa fa-star" style={{ fontSize:10 }}/>
                  </span>
                  <span style={{ fontSize:12, color:'#888' }}>({pkg.reviews} valoraciones)</span>
                </div>
                <p style={{ color:'#555', lineHeight:1.7, marginBottom:16 }}>{pkg.description}</p>
                {pkg.includes?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {pkg.includes.map((inc: string) => (
                      <span key={inc} style={{ border:'1px solid #003580', borderRadius:20, padding:'4px 12px', fontSize:12, color:'#003580', fontWeight:600 }}>
                        <i className="fa fa-check" style={{ marginRight:4, fontSize:10 }}/>{inc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de reserva */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:20, marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:16 }}>
                <i className="fa fa-user" style={{ marginRight:6 }}/>Datos del Contacto
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                {([
                  { k:'firstName', label:'Nombre',   ph:'Tu nombre',       type:'text'  },
                  { k:'lastName',  label:'Apellidos', ph:'Tus apellidos',   type:'text'  },
                  { k:'email',     label:'Email *',   ph:'tu@email.com',    type:'email' },
                  { k:'phone',     label:'Teléfono',  ph:'+34 600 000 000', type:'tel'   },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={contact[f.k]} onChange={upd(f.k)} placeholder={f.ph} style={fieldStyle}/>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Número de personas</label>
                <select value={guests} onChange={e => setGuests(+e.target.value)}
                  style={{ ...fieldStyle, height:38 }}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} />
              {err && (
                <div style={{ background:'#fff5f5', border:'1px solid #fecdd3', borderRadius:4, padding:'10px 14px', color:'#dc2626', fontSize:13, marginTop:12 }}>
                  <i className="fa fa-exclamation-circle" style={{ marginRight:6 }}/>{err}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar precio */}
          <div style={{ flex:'0 0 280px', minWidth:260 }}>
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:20, position:'sticky', top:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:16 }}>Resumen del Precio</h3>
              <div style={{ borderBottom:'1px solid #f0f0f0', paddingBottom:12, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#666', marginBottom:6 }}>
                  <span>{pkg.price}€ × {guests} persona{guests > 1 ? 's' : ''}</span>
                  <span>{pkg.price * guests}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#666' }}>
                  <span>Tasas e impuestos</span>
                  <span>{taxes}€</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:700, color:'#003580', marginBottom:20 }}>
                <span>Total</span>
                <span>{total + taxes}€</span>
              </div>
              <button onClick={handleBook} disabled={booking}
                style={{ width:'100%', background:'#ee1d25', color:'#fff', border:'none', borderRadius:4, padding:'13px', fontSize:14, fontWeight:700, cursor:booking?'not-allowed':'pointer', opacity:booking?0.7:1 }}>
                {booking ? <><i className="fa fa-spinner fa-spin" style={{ marginRight:6 }}/>Procesando...</> : <><i className="fa fa-lock" style={{ marginRight:6 }}/>Reservar Ahora</>}
              </button>
              <Link to="/vacaciones"
                style={{ display:'block', textAlign:'center', fontSize:12, color:'#888', marginTop:10 }}>
                ← Ver más paquetes
              </Link>
            </div>
          </div>

        </div>
      </div>

      {showPayModal && bookingRef && (
        <PaymentModal
          open={showPayModal}
          summary={{
            type: 'flight',
            title: `Paquete ${pkg.city || pkg.name}`,
            subtitle: pkg.includes?.join(' · '),
            details: {
              'Destino': pkg.city || pkg.name,
              'Noches': pkg.nights ? `${pkg.nights} noches` : '—',
              'Personas': String(guests),
            },
            amount: total + taxes,
            currency: 'EUR',
            bookingRef,
            customerEmail: contact.email,
            customerName: `${contact.firstName} ${contact.lastName}`.trim() || 'Pasajero',
            passengers: guests,
          }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false); navigate('/mis-reservas') }}
        />
      )}
      <Footer />
    </div>
  )
}
