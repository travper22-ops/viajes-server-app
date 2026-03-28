import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import { SeatMap, PassengerForm, OrderSummary, FlightSeatMap, BaggageInfo } from '../components/booking'
import PaymentModal from '../components/booking/PaymentModal'
import TermsCheckbox from '../components/booking/TermsCheckbox'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const EXTRAS = [
  { id:'meal',   label:'Menú a bordo',          price:12, icon:'fa-cutlery' },
  { id:'bag',    label:'Maleta facturada 23kg', price:35, icon:'fa-suitcase' },
  { id:'seat',   label:'Selección de asiento',  price:15, icon:'fa-th-large' },
  { id:'cancel', label:'Seguro de cancelación', price:18, icon:'fa-shield' },
]

function fmtTime(iso) { 
  if (!iso || typeof iso !== 'string') return '--:--'
  try {
    return new Date(iso).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})
  } catch {
    return '--:--'
  }
}
function fmtDur(iso)  { 
  if(!iso || typeof iso !== 'string') return '?'
  const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/); 
  return m ? `${m[1]||0}h ${m[2]||0}m` : '?' 
}

export default function FlightCheckoutPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { token } = useAuth()

  const flight    = state?.flight || null
  const multiLeg  = state?.multiLeg  || null   // { from, to, date } — solo en multi-destino
  const legIndex  = state?.legIndex  ?? null   // número de tramo (0-based)
  const isMulti   = !!multiLeg
  // isRound: true solo si hay 2 itinerarios reales en el vuelo
  const isRound   = !isMulti && (flight?.itineraries?.length || 0) >= 2

  // Itinerario de ida (o único tramo en multi)
  const seg0   = flight?.itineraries?.[0]?.segments || []
  const first  = seg0[0] || {}
  const last   = seg0[seg0.length-1] || {}

  // Itinerario de vuelta (solo en ida y vuelta)
  const seg1    = flight?.itineraries?.[1]?.segments || []
  const ret0    = seg1[0] || {}
  const retLast = seg1[seg1.length-1] || {}

  const price    = parseFloat(flight?.price?.total || 89)
  const currency = flight?.price?.currency || 'EUR'

  const [passengers,    setPassengers]    = useState(1)
  const [extras,        setExtras]        = useState([])
  const [showSeats,     setShowSeats]     = useState(false)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedFlightSeats, setSelectedFlightSeats] = useState([])
  const [contact,       setContact]       = useState({ 
    firstName: '',
    lastName: '', 
    email:'', 
    phone:'' 
  })
  const [passengerData, setPassengerData] = useState([{}])
  const [bookingRef,    setBookingRef]    = useState<string | null>(null)
  const [step,          setStep]          = useState('form') // form | paying | done
  const [err,           setErr]           = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPayModal,  setShowPayModal]  = useState(false)

  const toggleExtra = id => setExtras(e => e.includes(id)?e.filter(x=>x!==id):[...e,id])
  const extraTotal  = EXTRAS.filter(e=>extras.includes(e.id)).reduce((s,e)=>s+e.price,0)
  const seatsTotal  = selectedFlightSeats.reduce((sum, seat) => sum + (seat.price?.total || 0), 0)
  const total       = price * passengers + extraTotal + seatsTotal

  const lines = [
    { label:`Tarifa base (${passengers} pax)`, amount: price * passengers },
    ...EXTRAS.filter(e=>extras.includes(e.id)).map(e=>({ label:e.label, amount:e.price })),
    ...(selectedFlightSeats.length > 0 ? [{
      label: `Asientos seleccionados (${selectedFlightSeats.length})`,
      amount: seatsTotal
    }] : []),
  ]

  // Crear reserva en el backend antes de pagar
  const createBooking = async () => {
    console.log('🏗️ Iniciando createBooking...')
    setErr('')

    // Validar datos requeridos
    // Tomar nombre del primer pasajero si no hay nombre de contacto explícito
    const p0name = (passengerData[0] as any)?.name || ''
    const [p0first = '', ...p0rest] = p0name.trim().split(' ')
    const p0last = p0rest.join(' ')
    const resolvedContact = {
      ...contact,
      firstName: contact.firstName || p0first,
      lastName:  contact.lastName  || p0last,
    }
    if (!resolvedContact.firstName) {
      setErr('Introduce el nombre del Viajero 1.')
      return null
    }
    if (!contact.email) {
      const errorMsg = 'Introduce tu email de contacto.'
      console.log('❌ Error de validación:', errorMsg)
      setErr(errorMsg)
      return null
    }
    if (!termsAccepted) {
      const errorMsg = 'Debes aceptar los Terminos y Condiciones.'
      console.log('❌ Error de validación:', errorMsg)
      setErr(errorMsg)
      return null
    }

    console.log('✅ Validaciones pasaron, contact:', contact);
    console.log('✅ termsAccepted:', termsAccepted);

    try {
      // Crear array de pasajeros basado en el número de pasajeros
      const passengerList = [];
      
      // Si hay datos específicos de pasajeros, usar esos
      if (passengerData && passengerData.length > 0 && passengerData[0]?.firstName) {
        passengerList.push(...passengerData);
      } else {
        // Si no, crear pasajeros basados en el contacto
        const numPassengers = passengers || 1;
        for (let i = 0; i < numPassengers; i++) {
          passengerList.push({
            firstName: i === 0 ? resolvedContact.firstName : `Pasajero ${i}`,
            lastName: i === 0 ? resolvedContact.lastName : `${i}`,
            email: contact.email,
            phone: contact.phone,
            dateOfBirth: '1990-01-01'
          });
        }
      }

      const bookingPayload = {
        type: 'flight',
        passengers: passengerList,
        search_params: { 
          from: first.from, 
          to: last.to 
        },
        selected_offer: { 
          ...flight, 
          total_price: total 
        },
        extras: EXTRAS.filter(e => extras.includes(e.id)),
        contact: {
          firstName: resolvedContact.firstName,
          lastName: resolvedContact.lastName,
          email: contact.email,
          phone: contact.phone
        },
        seats: selectedSeats,
      };

      console.log('📤 Enviando payload a backend:', bookingPayload);
      console.log('🌐 URL del API:', `${API}/bookings`);
      console.log('🌐 Token presente:', !!token);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // timeout de 15 segundos

      const r = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify(bookingPayload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('📥 Respuesta recibida - Status:', r.status);
      console.log('📥 Headers:', r.headers);
      
      let data;
      try {
        const text = await r.text();
        console.log('📥 Respuesta texto:', text ? text.substring(0, 200) : '(vacía)');
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('❌ Error parseando JSON:', parseErr);
        throw new Error('Respuesta inválida del servidor');
      }
      
      console.log('📥 Datos parseados:', data);

      if (!r.ok) {
        throw new Error(data.error?.message || data.error || `Error HTTP ${r.status}`);
      }

      return data.booking?.ref || data.data?.ref;
    } catch(e: any) {
      const errorMsg = e.message || 'Error desconocido al crear reserva';
      console.error('💥 Error en createBooking:', errorMsg);
      console.error('💥 Error completo:', e);
      // If API down, generate local ref for demo
      console.warn('Booking API unavailable, using local ref:', errorMsg);
      return 'VYE-' + Date.now().toString(36).toUpperCase();
    }
  }

  const handlePayNow = async () => {
    console.log('🛒 Iniciando creación de reserva...');
    const ref = await createBooking();
    console.log('📋 Resultado de createBooking:', ref);
    if (ref) {
      setBookingRef(ref);
      setShowPayModal(true); // abrir modal en vez de cambiar step
    }
  }

  // La confirmación se muestra dentro del PaymentModal

  return (
    <div id="body">
      <MobileNav/><Header/>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-6 border-b border-gray-200 pb-4 flex items-center gap-2">
          <i className="fa fa-plane"/> Resumen y Pago
        </h1>

        {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><i className="fa fa-exclamation-circle"/>{err}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Resumen vuelo */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-700 font-poppins mb-4 flex items-center gap-2">
                <i className="fa fa-plane"/>
                {isMulti ? `Tramo ${(legIndex ?? 0) + 1}: ${multiLeg.from} → ${multiLeg.to}` : 'Detalles del vuelo'}
              </h3>
              {flight ? (
                <div className="space-y-3">
                  {/* Etiqueta multi-destino */}
                  {isMulti && (
                    <div style={{ background:'#003580', color:'#fff', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:'50%', width:20, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>
                        {(legIndex ?? 0) + 1}
                      </span>
                      <i className="fa fa-plane" style={{ fontSize:11 }}/>
                      Multi-destino · Tramo {(legIndex ?? 0) + 1} · {multiLeg.date}
                    </div>
                  )}

                  {/* Tramo principal (ida o único) */}
                  <div>
                    {isRound && <div className="text-xs font-bold text-primary uppercase mb-1"><i className="fa fa-plane mr-1"/>Ida</div>}
                    <div className="flex flex-wrap items-center gap-6 bg-blue-50 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{fmtTime(first.fromTime)}</div>
                        <div className="text-sm font-semibold text-gray-600">{first.from}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-gray-400">{fmtDur(flight.itineraries?.[0]?.duration)}</div>
                        <div className="border-t border-gray-300 my-1"/>
                        <div className="text-xs text-gray-500">{seg0.length-1===0?'Directo':`${seg0.length-1} escala`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{fmtTime(last.toTime)}</div>
                        <div className="text-sm font-semibold text-gray-600">{last.to}</div>
                      </div>                      {!isRound && (
                        <div className="text-right ml-auto">
                          <div className="text-xl font-bold text-primary">{price.toFixed(0)}€/pax</div>
                          <div className="text-xs text-gray-400">{currency}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vuelo de VUELTA */}
                  {isRound && seg1.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-green-600 uppercase mb-1"><i className="fa fa-plane mr-1" style={{transform:'scaleX(-1)',display:'inline-block'}}/>Vuelta</div>
                      <div className="flex flex-wrap items-center gap-6 bg-green-50 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{fmtTime(ret0.fromTime)}</div>
                          <div className="text-sm font-semibold text-gray-600">{ret0.from}</div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="text-xs text-gray-400">{fmtDur(flight.itineraries?.[1]?.duration)}</div>
                          <div className="border-t border-gray-300 my-1"/>
                          <div className="text-xs text-gray-500">{seg1.length-1===0?'Directo':`${seg1.length-1} escala`}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{fmtTime(retLast.toTime)}</div>
                          <div className="text-sm font-semibold text-gray-600">{retLast.to}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Precio total (ida y vuelta) */}
                  {isRound && (
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">{price.toFixed(0)}€/pax</span>
                      <span className="text-xs text-gray-400 ml-2">{currency} · ida y vuelta</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                  <i className="fa fa-exclamation-triangle mr-2"/>No llegaste desde la búsqueda. <Link to="/vuelos" className="underline">Busca un vuelo</Link> primero.
                </div>
              )}
            </div>

            {/* Pasajeros */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700 font-poppins flex items-center gap-2"><i className="fa fa-users"/>Pasajeros</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setPassengers(p=>Math.max(1,p-1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">-</button>
                  <span className="font-bold w-4 text-center">{passengers}</span>
                  <button onClick={()=>setPassengers(p=>Math.min(9,p+1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
                </div>
              </div>
              {Array.from({length:passengers}).map((_,i)=>(
                <PassengerForm key={i} index={i+1}
                  onChange={d=>setPassengerData(pd=>{const a=[...pd];a[i]={...(a[i]||{}), ...d};return a})}/>
              ))}
            </div>

            {/* Contacto — solo email y teléfono; el nombre se recoge en Viajero 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-700 font-poppins mb-1 flex items-center gap-2">
                <i className="fa fa-envelope text-primary"/>Datos de Contacto
              </h3>
              <p className="text-xs text-gray-400 mb-4">Enviaremos la confirmación a este correo. El nombre se toma del Viajero 1.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email *</label>
                  <input type="email" required value={contact.email}
                    onChange={e=>setContact(c=>({...c,email:e.target.value}))}
                    placeholder="tu@email.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono</label>
                  <input type="tel" value={contact.phone}
                    onChange={e=>setContact(c=>({...c,phone:e.target.value}))}
                    placeholder="+34 600 000 000"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"/>
                </div>
              </div>
            </div>

            {/* Equipaje */}
            {flight?.id && (
              <BaggageInfo flightOfferId={flight.id} />
            )}

            {/* Asientos de vuelo */}
            {flight?.id && (
              <FlightSeatMap
                flightOfferId={flight.id}
                passengers={passengers}
                onSelect={setSelectedFlightSeats}
              />
            )}

            {/* Asientos */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={()=>setShowSeats(s=>!s)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-bold text-gray-700 font-poppins flex items-center gap-2"><i className="fa fa-th-large"/> Selección de Asientos</h3>
                {showSeats ? <i className="fa fa-chevron-up"/> : <i className="fa fa-chevron-down"/>}
              </button>
              {showSeats && (
                <div className="px-5 pb-5">
                  <SeatMap onSelect={setSelectedSeats} selected={selectedSeats}/>
                </div>
              )}
            </div>

            {/* Extras */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-700 font-poppins mb-4"><i className="fa fa-plus-circle text-primary mr-2"/>Añade extras</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXTRAS.map(ex=>(
                  <label key={ex.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${extras.includes(ex.id)?'border-primary bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
                    <input type="checkbox" className="accent-primary" checked={extras.includes(ex.id)} onChange={()=>toggleExtra(ex.id)}/>
                    <i className={`fa ${ex.icon} text-xl text-gray-600`}/>
                    <div className="flex-1"><div className="font-medium text-sm text-gray-800">{ex.label}</div></div>
                    <div className="font-bold text-primary text-sm">+{ex.price}€</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pago — ahora se abre en modal */}

            {/* Terminos y Condiciones */}
            <TermsCheckbox onChange={setTermsAccepted} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary lines={lines} total={total} backTo="/vuelos" backLabel="← Cambiar vuelo"
              ctaLabel={step==='paying' ? 'Completa el pago arriba' : `Ir a pagar ${total.toFixed(0)}€`}
              onCta={step==='form' ? handlePayNow : undefined}
              ctaDisabled={step==='paying'}/>
          </div>
        </div>
      </div>
      <Footer/>

      {/* Modal de pago */}
      {showPayModal && bookingRef && (
        <PaymentModal
          open={showPayModal}
          summary={{
            type: 'flight',
            title: isMulti
              ? `Multi-destino · Tramo ${(legIndex ?? 0) + 1}: ${multiLeg.from} → ${multiLeg.to}`
              : isRound && seg1.length > 0
                ? `Vuelo ${first.from || '?'} ↔ ${last.to || '?'} (Ida y Vuelta)`
                : `Vuelo ${first.from || '?'} → ${last.to || '?'}`,
            subtitle: `${first.carrier || ''} · ${seg0.length - 1 === 0 ? 'Directo' : `${seg0.length - 1} escala`}`,
            details: {
              'Salida':   `${fmtTime(first.fromTime)} · ${first.from}`,
              'Llegada':  `${fmtTime(last.toTime)} · ${last.to}`,
              ...(isRound && seg1.length > 0 ? {
                'Salida (vuelta)':  `${fmtTime(ret0.fromTime)} · ${ret0.from}`,
                'Llegada (vuelta)': `${fmtTime(retLast.toTime)} · ${retLast.to}`,
              } : {}),
              ...(isMulti ? { 'Fecha tramo': multiLeg.date } : {}),
              'Duración':   fmtDur(flight?.itineraries?.[0]?.duration),
              'Pasajeros':  String(passengers),
            },
            amount: total,
            currency,
            bookingRef,
            customerEmail: contact.email,
            customerName: `${(passengerData[0] as any)?.name || contact.firstName || 'Pasajero'}`,
            passengers,
          }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { 
            // No cerrar el modal aquí — el modal muestra la confirmación internamente
            // Solo navegar cuando el usuario cierre el modal de confirmación
          }}
          onConfirmClose={() => {
            setShowPayModal(false)
            if (token) navigate('/mis-reservas')
            else navigate('/')
          }}
        />
      )}
    </div>
  )
}
