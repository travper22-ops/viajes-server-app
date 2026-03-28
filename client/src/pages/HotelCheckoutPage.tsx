import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import { useAuth } from '../context/AuthContext'
import PaymentModal from '../components/booking/PaymentModal'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

// Datos por defecto
const MOCK_ROOM = {
  id: 'room-1',
  type: 'Habitación Estándar',
  size: 22,
  beds: '1 cama doble',
  price: 189,
  img: '/img/b1-2.jpg'
}

export default function HotelCheckoutPage() {
  const { id: hotelId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hotel, setHotel] = useState<any>(null)
  const [room, setRoom] = useState<any>(MOCK_ROOM)
  const [showPayModal, setShowPayModal] = useState(false)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos del huésped
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Fechas
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '2',
    // Habitación seleccionada
    roomId: searchParams.get('roomId') || '',
    // Notas
    specialRequests: ''
  })
  
  // Calcular noches y total
  const nights = formData.checkIn && formData.checkOut 
    ? Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000*60*60*24))
    : 1
  const roomPrice = room?.price || 189
  const taxes = Math.round(roomPrice * nights * 0.1)
  const total = roomPrice * nights + taxes
  
  // Cargar datos del hotel
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Cargar hotel
        const hotelResponse = await fetch(`${API}/hotels/${hotelId}`)
        if (hotelResponse.ok) {
          const hotelData = await hotelResponse.json()
          setHotel(hotelData)
          
          // Si hay roomId en params, cargar habitación
          const roomId = searchParams.get('roomId')
          if (roomId && hotelData.rooms) {
            const selectedRoom = hotelData.rooms.find(r => r.id === roomId)
            if (selectedRoom) {
              setRoom(selectedRoom)
            }
          }
        }
      } catch (err) {
        console.error('Error loading hotel:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (hotelId) {
      fetchData()
    }
  }, [hotelId])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.email) {
      setError('Nombre y email son obligatorios')
      return
    }
    // Crear referencia local y abrir modal de pago
    const ref = 'HTL-' + Date.now().toString(36).toUpperCase()
    setBookingRef(ref)
    setShowPayModal(true)
  }
  
  if (loading) {
    return (
      <div id="body">
        <MobileNav />
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-500">Cargando...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  
  return (
    <div id="body">
      <MobileNav />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-800 mb-6 border-b border-gray-200 pb-4">
          Finalizar Reserva de Hotel
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna izquierda - Formulario */}
            <div className="lg:col-span-8">
              {/* Resumen del hotel */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex gap-4">
                  <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    <img src={room?.img || '/img/b1-2.jpg'} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{hotel?.name || 'Hotel'}</h3>
                    <p className="text-sm text-gray-500">{hotel?.address?.cityName || 'Ciudad'}</p>
                    <p className="text-sm text-primary font-medium mt-1">{room?.type || 'Habitación Estándar'}</p>
                  </div>
                </div>
              </div>
              
              {/* Fechas */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <h3 className="text-base font-bold font-poppins text-gray-700 mb-3">
                  <i className="fa fa-calendar text-primary mr-2" />
                  Fechas de la estancia
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Entrada</label>
                    <input 
                      type="date" 
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Salida</label>
                    <input 
                      type="date" 
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      min={formData.checkIn}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
              
              {/* Datos del huésped */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <h3 className="text-base font-bold font-poppins text-gray-700 mb-3">
                  <i className="fa fa-user text-primary mr-2" />
                  Datos del huésped
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Nombre</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Apellidos</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Correo electrónico</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Teléfono</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Notas especiales */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <h3 className="text-base font-bold font-poppins text-gray-700 mb-3">
                  <i className="fa fa-comment text-primary mr-2" />
                  Notas especiales
                </h3>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Alguna petición especial..."
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>
              
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">
                    <i className="fa fa-exclamation-circle mr-2"></i>
                    {error}
                  </p>
                </div>
              )}
              
              {/* Términos */}
              <div className="flex items-start gap-2 mb-6">
                <input type="checkbox" id="terms" required className="mt-1" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Acepto los <Link to="/terminos" className="text-primary underline">términos y condiciones</Link> y la <Link to="/privacidad" className="text-primary underline">política de privacidad</Link>
                </label>
              </div>
              
              {/* Botón submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-2"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="fa fa-lock mr-2"></i>
                    Confirmar y pagar {total}€
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-2">
                No se te cobrará nada hasta confirmar
              </p>
            </div>
            
            {/* Columna derecha - Resumen */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4">
                <h3 className="font-bold text-gray-800 mb-4">Resumen del pedido</h3>
                
                <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span>{room?.type || 'Habitación'} x {nights} noches</span>
                    <span>{roomPrice * nights}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasas e impuestos (10%)</span>
                    <span>{taxes}€</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span className="text-primary">{total}€</span>
                </div>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <i className="fa fa-check text-green-500"></i>
                    <span>Cancelación gratuita hasta 48h antes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa fa-check text-green-500"></i>
                    <span>Confirmación inmediata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa fa-check text-green-500"></i>
                    <span>Mejor precio garantizado</span>
                  </div>
                </div>
                
                <Link 
                  to={`/hoteles/${hotelId}`} 
                  className="block text-center text-sm text-primary mt-4 pt-4 border-t border-gray-100"
                >
                  ← Volver al hotel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />

      {/* Modal de pago */}
      {showPayModal && bookingRef && (
        <PaymentModal
          open={showPayModal}
          summary={{
            type: 'hotel',
            title: hotel?.name || 'Reserva de Hotel',
            subtitle: `${room?.type || 'Habitación'} · ${nights} ${nights === 1 ? 'noche' : 'noches'}`,
            details: {
              'Hotel': hotel?.name || 'Hotel',
              'Habitación': room?.type || 'Estándar',
              'Entrada': formData.checkIn,
              'Salida': formData.checkOut,
              'Huéspedes': formData.guests,
            },
            amount: total,
            currency: 'EUR',
            bookingRef,
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false) }}
        />
      )}
    </div>
  )
}
