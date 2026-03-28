import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import PaymentModal from '../components/booking/PaymentModal'
import TermsCheckbox from '../components/booking/TermsCheckbox'
import DatePicker from '../components/ui/DatePicker'
import SEO from '../components/seo/SEO'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

export default function CabCheckoutPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  const cab      = state?.cab  || { name:'Seat Ibiza o Similar', type:'Turismo', pax:4, bags:2, price:89, features:['A/C','4 Plazas','2 Maletas','Wi-Fi'] }
  const fromCity = state?.from || 'Madrid'
  const toCity   = state?.to   || 'Valencia'

  const [pickup,   setPickup]   = useState<Date | null>(state?.date ? new Date(state.date) : null)
  const [time,     setTime]     = useState<string>(state?.time || '')
  const [fromAddr, setFromAddr] = useState('')
  const [toAddr,   setToAddr]   = useState('')
  const [notes,    setNotes]    = useState('')
  const [contact,  setContact]  = useState({ firstName:'', lastName:'', email:'', phone:'' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)

  const taxes    = Math.round(cab.price * 0.10)
  const discount = 10
  const total    = cab.price + taxes - discount

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact(c => ({ ...c, [k]: e.target.value }))

  const handleBook = async () => {
    if (!contact.email) { setErr('El email de contacto es obligatorio'); return }
    if (!termsAccepted) { setErr('Debes aceptar los términos y condiciones'); return }
    setErr(''); setLoading(true)
    try {
      const pickupDateStr = pickup instanceof Date ? pickup.toISOString().split('T')[0] : ''
      const startDateTime = pickupDateStr && time ? `${pickupDateStr}T${time}:00` : pickupDateStr
      const res = await fetch(`${API}/transfers/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({
          transferType: 'PRIVATE',
          start: { dateTime: startDateTime, address: { line: fromAddr || fromCity, cityName: fromCity }, name: fromAddr || fromCity },
          end:   { address: { line: toAddr || toCity, cityName: toCity }, name: toAddr || toCity },
          passengers: [{ firstName: contact.firstName || 'Pasajero', lastName: contact.lastName || '',
            contacts: [{ purpose:'STANDARD', phones:[{ deviceType:'MOBILE', countryCallingCode:'34', number: contact.phone || '600000000' }] }] }],
          note: notes, totalPrice: total, currency: 'EUR'
        })
      })
      const data = await res.json()
      setBookingRef(data.data?.confirmationCode || data.data?.id || `TRF-${Date.now()}`)
      setShowPayModal(true)
    } catch {
      setBookingRef(`TRF-${Date.now()}`)
      setShowPayModal(true)
    } finally { setLoading(false) }
  }

  const fieldStyle: React.CSSProperties = { width:'100%', border:'1px solid #e5e5e5', borderRadius:4, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }
  const labelStyle: React.CSSProperties = { display:'block', fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }

  return (
    <div id="body">
      <SEO title="Checkout Traslado | Finalizar Reserva" noIndex={true} />
      <MobileNav /><Header />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#003580', marginBottom:20, borderBottom:'1px solid #e5e5e5', paddingBottom:12 }}>
          <i className="fa fa-car" style={{ marginRight:8 }}/>Finalizar Reserva — Traslado
        </h1>
        <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-start' }}>

          {/* Columna principal */}
          <div style={{ flex:'1 1 560px', minWidth:0 }}>

            {/* Resumen vehículo */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, marginBottom:16, display:'flex', gap:16 }}>
              <div style={{ width:100, height:70, flexShrink:0, background:'#f5f8fb', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/img/cab/car.png" alt={cab.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display='none' }}/>
              </div>
              <div>
                <h2 style={{ fontSize:15, fontWeight:700, color:'#003580', marginBottom:4 }}>{cab.name}</h2>
                <span style={{ fontSize:11, background:'#f0f4ff', color:'#003580', padding:'2px 8px', borderRadius:12 }}>{cab.type}</span>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                  {(cab.features || []).map((f: string) => (
                    <span key={f} style={{ fontSize:11, background:'#f0f9ff', color:'#0369a1', padding:'2px 8px', borderRadius:12 }}>
                      <i className="fa fa-check" style={{ marginRight:3, fontSize:9 }}/>{f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Datos del viaje */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, marginBottom:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>
                <i className="fa fa-map-marker" style={{ marginRight:6 }}/>Datos del Viaje
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Dirección de recogida</label>
                  <input value={fromAddr} onChange={e => setFromAddr(e.target.value)} placeholder={`Calle, número — ${fromCity}`} style={fieldStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Dirección de destino</label>
                  <input value={toAddr} onChange={e => setToAddr(e.target.value)} placeholder={`Calle, número — ${toCity}`} style={fieldStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Fecha de recogida</label>
                  <div className="text-box" style={{ border:'1px solid #e5e5e5', borderRadius:4 }}>
                    <DatePicker value={pickup} onChange={setPickup} placeholder="dd/mm/yyyy" minDate={new Date()}/>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Hora de recogida</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...fieldStyle, height:42 }}/>
                </div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={labelStyle}>Instrucciones especiales</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Ej: vuelo con retraso, necesito silla infantil..."
                    style={{ ...fieldStyle, resize:'vertical' }}/>
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, marginBottom:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>
                <i className="fa fa-user" style={{ marginRight:6 }}/>Datos del Pasajero
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
            </div>

            <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} />
            {err && (
              <div style={{ background:'#fff5f5', border:'1px solid #fecdd3', borderRadius:4, padding:'10px 14px', color:'#dc2626', fontSize:13, marginTop:12 }}>
                <i className="fa fa-exclamation-circle" style={{ marginRight:6 }}/>{err}
              </div>
            )}
          </div>

          {/* Resumen precio */}
          <div style={{ flex:'0 0 280px', minWidth:260 }}>
            <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:16, position:'sticky', top:16 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:12 }}>Resumen del Precio</h3>
              <div style={{ borderBottom:'1px solid #f0f0f0', paddingBottom:12, marginBottom:12 }}>
                {[
                  { label:`Vehículo — ${cab.name}`, amount: cab.price, highlight: false },
                  { label:'Tasas y servicios',       amount: taxes,     highlight: false },
                  { label:'Descuento reserva online',amount: -discount, highlight: true  },
                ].map((l, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color: l.highlight ? '#22c55e' : '#666', marginBottom:6 }}>
                    <span>{l.label}</span>
                    <span>{l.amount >= 0 ? `${l.amount}€` : `-${Math.abs(l.amount)}€`}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, color:'#003580', marginBottom:16 }}>
                <span>Total</span><span>{total}€</span>
              </div>
              <button onClick={handleBook} disabled={loading}
                style={{ width:'100%', background:'#ee1d25', color:'#fff', border:'none', borderRadius:4, padding:'12px', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
                {loading ? <><i className="fa fa-spinner fa-spin" style={{ marginRight:6 }}/>Procesando...</> : <><i className="fa fa-lock" style={{ marginRight:6 }}/>Confirmar y Pagar</>}
              </button>
              <button onClick={() => navigate('/traslados')}
                style={{ width:'100%', background:'none', border:'none', color:'#888', fontSize:12, marginTop:8, cursor:'pointer', padding:'6px' }}>
                ← Cambiar vehículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPayModal && bookingRef && (
        <PaymentModal
          open={showPayModal}
          summary={{
            type: 'transfer',
            title: `Traslado ${fromCity} → ${toCity}`,
            subtitle: cab.name,
            details: {
              'Vehículo': cab.name,
              'Fecha': pickup ? pickup.toLocaleDateString('es-ES') : '—',
              'Hora': time || '—',
              'Pasajeros': `hasta ${cab.pax}`,
            },
            amount: total, currency: 'EUR', bookingRef,
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
