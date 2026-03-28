import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import { SkeletonCard, EmptyState } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

const STATUS_CONFIG = {
  confirmed:  { label:'Confirmada',  color:'bg-green-100 text-green-700',  icon:<i className="fa fa-check-circle"/> },
  pending:    { label:'Pendiente',   color:'bg-yellow-100 text-yellow-700',icon:<i className="fa fa-clock-o"/> },
  cancelled:  { label:'Cancelada',   color:'bg-red-100 text-red-700',      icon:<i className="fa fa-times-circle"/> },
  refunded:   { label:'Reembolsada', color:'bg-gray-100 text-gray-600',    icon:<i className="fa fa-exclamation-circle"/> },
}
const TYPE_ICON = {
  flight:  <i className="fa fa-plane"/>,
  hotel:   <i className="fa fa-building"/>,
  bus:     <i className="fa fa-bus"/>,
  taxi:    <i className="fa fa-car"/>,
  package: <Package size={18} className="text-primary"/>,
}

const MOCK_BOOKINGS = [
  { id:'BK-001', type:'flight',  title:'Madrid → París',          date:'2025-06-15', returnDate:'2025-06-22', passengers:2, total:398,   status:'confirmed', ref:'IB1234' },
  { id:'BK-002', type:'hotel',   title:'Hotel Gran Madrid',        date:'2025-07-10', returnDate:'2025-07-15', passengers:2, total:945,   status:'confirmed', ref:'HT5678' },
  { id:'BK-003', type:'package', title:'Cancún Todo Incluido 7N',  date:'2025-08-01', returnDate:'2025-08-08', passengers:2, total:1798,  status:'pending',   ref:'PK9012' },
  { id:'BK-004', type:'bus',     title:'Madrid → Barcelona',       date:'2025-03-20', returnDate:null,          passengers:1, total:29,    status:'cancelled',  ref:'BU3456' },
]

export default function MyBookingsPage() {
  const { isLoggedIn, token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [cancelling, setCancelling] = useState(null) // ID de reserva cancelando

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetch(`${API}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setBookings(d.bookings?.length ? d.bookings : MOCK_BOOKINGS))
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoading(false))
  }, [isLoggedIn, token])

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter)

  const handleCancel = async (bookingId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return
    
    setCancelling(bookingId)
    try {
      const response = await fetch(`${API}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Actualizar la lista de reservas
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ))
        alert('Reserva cancelada exitosamente. Recibirás un email de confirmación.')
      } else {
        alert(data.error || 'Error al cancelar la reserva')
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      alert('Error al cancelar la reserva')
    } finally {
      setCancelling(null)
    }
  }

  const fmtDate = iso => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) }
    catch { return iso }
  }

  return (
    <div id="body">
      <MobileNav/><Header/>
      <PageBanner title="Mis Reservas" subtitle="Gestiona todas tus reservas" to="/" toLabel="Inicio"/>

      <div className="container mx-auto px-4 py-10">
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total reservas', value:bookings.length, icon:'fa-ticket', color:'text-primary' },
            { label:'Confirmadas', value:bookings.filter(b=>b.status==='confirmed').length, icon:'fa-check-circle', color:'text-green-600' },
            { label:'Pendientes',  value:bookings.filter(b=>b.status==='pending').length,   icon:'fa-clock',       color:'text-yellow-500' },
            { label:'Gastado',     value:`${bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+(b.total||0),0).toLocaleString()}€`, icon:'fa-eur', color:'text-gray-600' },
          ].map(s=>(
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <i className={`fa ${s.icon} ${s.color} text-2xl mb-2 block`}/>
              <div className="text-2xl font-bold font-poppins text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[{v:'all',l:'Todas'},{v:'confirmed',l:'Confirmadas'},{v:'pending',l:'Pendientes'},{v:'cancelled',l:'Canceladas'}].map(({v,l})=>(
            <button key={v} onClick={()=>setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter===v?'bg-primary text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading && <div className="space-y-4">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i} lines={3}/>)}</div>}
        {!loading && filtered.length === 0 && (
          <EmptyState icon="fa-ticket" title="Sin reservas" text="No tienes reservas en este estado">
            <Link to="/" className="mt-4 inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              Buscar viajes
            </Link>
          </EmptyState>
        )}

        <div className="space-y-4">
          {!loading && filtered.map(b => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {TYPE_ICON[b.type] || TYPE_ICON.package}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 font-poppins">{b.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span><i className="fa fa-calendar mr-1"/>{fmtDate(b.date)}{b.returnDate ? ` → ${fmtDate(b.returnDate)}` : ''}</span>
                        <span><i className="fa fa-user mr-1"/>{b.passengers} pax</span>
                        {b.ref && <span><i className="fa fa-hashtag mr-1"/>{b.ref}</span>}
                        <span className="font-mono text-gray-400">{b.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>
                      {sc.icon}{sc.label}
                    </span>
                    <div className="text-xl font-bold text-primary font-poppins">{(b.total||0).toLocaleString()}€</div>
                    {b.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(b.id)} 
                        disabled={cancelling === b.id}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelling === b.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Footer/>
    </div>
  )
}
