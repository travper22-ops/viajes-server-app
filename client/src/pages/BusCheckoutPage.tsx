import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import PaymentModal from '../components/booking/PaymentModal'
import TermsCheckbox from '../components/booking/TermsCheckbox'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

export default function BusCheckoutPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  // Datos del autobús pasados desde BusPage
  const bus  = state?.bus  || { company:'Alsa', type:'Supra', dep:'10:00', arr:'16:10', duration:'6h 10m', stops:'Directo', price:45 }
  const from = state?.from || 'Madrid'
  const to   = state?.to   || 'Barcelona'
  const date = state?.date || ''

  const [contact, setContact] = useState({ firstName:'', lastName:'', email:'', phone:'' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)

  const taxes = Math.round(bus.price * 0.10)
  const total = bus.price + taxes

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact(c => ({ ...c, [k]: e.target.value }))

  const handleBook = async () => {
    if (!contact.email) { setErr('El email de contacto es obligatorio'); return }
    if (!termsAccepted) { setErr('Debes aceptar los términos y condiciones'); return }
    setErr(''); setLoading(true)
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({
          type: 'bus',
          contact: { email: contact.email, phone: contact.phone, firstName: contact.firstName, lastName: contact.lastName },
          items: [{
            type: 'bus',
            company: bus.company,
            serviceType: bus.type,
            from, to,
            departure: bus.dep,
            arrival: bus.arr,
            duration: bus.duration,
            stops: bus.stops,
            date: date instanceof Date ? date.toISOString().split('T')[0] : (date || ''),
            price: bus.price
          }],
          totalAmount: total,
          currency: 'EUR'
        })
      })
      const data = await res.json()
      const ref = data.data?.reference || data.reference || `BUS-${Date.now()}`
      setBookingRef(ref)
      setShowPayModal(true)
    } catch {
      // Fallback: abrir modal con ref local
      setBookingRef(`BUS-${Date.now()}`)
      setShowPayModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="body">
      <SEO title="Checkout Autobús | Finalizar Reserva" noIndex={true} />
      <MobileNav /><Header />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#003580', marginBottom:20, borderBottom:'1px solid #e5e5e5', paddingBottom:12 }}>
          <i className="fa fa-bus" style={{ marginRight:8 }}/>Finalizar Reserva — Autobús
        </h1>

        <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-start' }}>

          {/* Columna principal */}
          <div style={{ flex:'1 1 560px', minWidth:0 }}>

            {/* Resumen del viaje */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, marginBottom:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>
                <i className="fa fa-route" style={{ marginRight:6 }}/>Resumen del Viaje
              </h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
                <div style={{ textAlign:'center', minWidth:60 }}>
                  <i className="fa fa-bus" style={{ fontSize:32, color:'#003580' }}/>
                  <div style={{ fontSize:11, color:'#888', marginTop:4 }}>{bus.company}</div>
                  <div style={{ fontSize:10, color:'#aaa' }}>{bus.type}</div>
                </div>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div>
                      <div style={{ fontSize:20, fontWeight:700, color:'#003580' }}>{bus.dep}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{from}</div>
                    </div>
                    <div style={{ flex:1, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#888' }}>{bus.duration}</div>
                      <div style={{ height:1, background:'#e5e5e5', margin:'4px 0' }}/>
                      <div style={{ fontSize:11, color:'#22c55e' }}>{bus.stops}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:20, fontWeight:700, color:'#003580' }}>{bus.arr}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{to}</div>
                    </div>
                  </div>
                  {date && (
                    <div style={{ marginTop:8, fontSize:12, color:'#666' }}>
                      <i className="fa fa-calendar" style={{ marginRight:4, color:'#003580' }}/>
                      {date instanceof Date ? date.toLocaleDateString('es-ES') : date}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, marginBottom:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>
                <i className="fa fa-user" style={{ marginRight:6 }}/>Datos del Pasajero
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { k:'firstName', label:'Nombre',   ph:'Tu nombre',    type:'text'  },
                  { k:'lastName',  label:'Apellidos', ph:'Tus apellidos',type:'text'  },
                  { k:'email',     label:'Email *',   ph:'tu@email.com', type:'email' },
                  { k:'phone',     label:'Teléfono',  ph:'+34 600 000 000', type:'tel' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>{f.label}</label>
                    <input type={f.type} value={contact[f.k]} onChange={upd(f.k)} placeholder={f.ph}
                      style={{ width:'100%', border:'1px solid #e5e5e5', borderRadius:4, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }}/>
                  </div>
                ))}
              </div>
            </div>

            <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} />

            {err && (
              <div style={{ background:'#fff5f5', border:'1px solid #fecdd3', borderRadius:4, padding:'10px 14px', color:'#dc2626', fontSize:13, marginTop:12 }}>
                <i className="fa fa-exclamation-circle" style={{ marginRight:6 }}/>{err}
              </div>
            )}
          </div>

          {/* Resumen de precio */}
          <div style={{ flex:'0 0 280px', minWidth:260 }}>
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, position:'sticky', top:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>Resumen del Precio</h3>
              <div style={{ borderBottom:'1px solid #f0f0f0', paddingBottom:12, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#666', marginBottom:6 }}>
                  <span>Billete ({bus.company} {bus.type})</span>
                  <span>{bus.price}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#666' }}>
                  <span>Tasas y cargos</span>
                  <span>{taxes}€</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, color:'#003580', marginBottom:16 }}>
                <span>Total</span>
                <span>{total}€</span>
              </div>
              <button onClick={handleBook} disabled={loading}
                style={{ width:'100%', background:'#ee1d25', color:'#fff', border:'none', borderRadius:4, padding:'12px', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
                {loading ? <><i className="fa fa-spinner fa-spin" style={{ marginRight:6 }}/>Procesando...</> : <><i className="fa fa-lock" style={{ marginRight:6 }}/>Confirmar y Pagar</>}
              </button>
              <button onClick={() => navigate('/autobuses')}
                style={{ width:'100%', background:'none', border:'none', color:'#888', fontSize:12, marginTop:8, cursor:'pointer', padding:'6px' }}>
                ← Cambiar selección
              </button>
            </div>
          </div>

        </div>
      </div>

      {showPayModal && bookingRef && (
        <PaymentModal
          open={showPayModal}
          summary={{
            type: 'bus',
            title: `Autobús ${from} → ${to}`,
            subtitle: `${bus.company} ${bus.type} · ${bus.dep} - ${bus.arr}`,
            details: {
              'Fecha': date instanceof Date ? date.toLocaleDateString('es-ES') : (date || '—'),
              'Duración': bus.duration,
              'Paradas': bus.stops,
            },
            amount: total,
            currency: 'EUR',
            bookingRef,
            customerEmail: contact.email,
            customerName: `${contact.firstName} ${contact.lastName}`.trim() || 'Pasajero',
          }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false); navigate('/mis-reservas') }}
        />
      )}

      <Footer />
    </div>
  )
}
