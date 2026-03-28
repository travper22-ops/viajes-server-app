/**
 * FlashDeals — Sección de ofertas de última hora
 * Muestra vuelos baratos reales de Amadeus (próximos 1-3 días)
 * + botón para activar notificaciones push
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

interface FlashFlight {
  id: string
  price: { total: string; currency: string }
  itineraries: { duration: string; segments: any[] }[]
}

function fmtTime(iso: string) {
  if (!iso) return '--:--'
  try { return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) } catch { return '--:--' }
}
function fmtDur(iso: string) {
  if (!iso) return ''
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return m ? `${m[1] || 0}h ${m[2] || 0}m` : ''
}
function fmtDate(iso: string) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) } catch { return '' }
}

// ── Countdown hasta medianoche ────────────────────────────────────────────────
function useCountdown() {
  const getSecondsLeft = () => {
    const now = new Date()
    const midnight = new Date(now); midnight.setHours(24, 0, 0, 0)
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
  }
  const [secs, setSecs] = useState(getSecondsLeft)
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsLeft()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── Push notifications ────────────────────────────────────────────────────────
async function registerPush(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    // Suscribir al push (sin VAPID key real usamos userVisibleOnly)
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true })
    await fetch(`${API}/flash-deals/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
    return 'granted'
  } catch { return 'denied' }
}

export default function FlashDeals() {
  const navigate = useNavigate()
  const countdown = useCountdown()
  const [deals, setDeals] = useState<FlashFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [pushState, setPushState] = useState<'idle' | 'asking' | 'granted' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    // Detectar si ya tiene permiso
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setPushState('granted')
      else if (Notification.permission === 'denied') setPushState('denied')
    } else {
      setPushState('unsupported')
    }
    // Registrar SW silenciosamente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    fetch(`${API}/flash-deals`)
      .then(r => r.json())
      .then(d => setDeals(d.data || []))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false))
  }, [])

  const handlePush = useCallback(async () => {
    setPushState('asking')
    const result = await registerPush()
    setPushState(result)
  }, [])

  const goToFlight = (deal: FlashFlight) => {
    const seg0 = deal.itineraries?.[0]?.segments || []
    const from = seg0[0]?.from || seg0[0]?.departure?.iataCode || ''
    const to   = seg0[seg0.length - 1]?.to || seg0[seg0.length - 1]?.arrival?.iataCode || ''
    const dep  = seg0[0]?.fromTime || seg0[0]?.departure?.at || ''
    const date = dep ? dep.split('T')[0] : ''
    if (from && to && date) navigate(`/vuelos?from=${from}&to=${to}&departure=${date}&adults=1`)
    else navigate('/vuelos')
  }

  if (!loading && deals.length === 0) return null

  return (
    <section style={{ background: 'linear-gradient(135deg, #003580 0%, #0057b8 100%)', padding: '40px 0', marginBottom: 0 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: '#ee1d25', color: '#fff', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 4, letterSpacing: 1, textTransform: 'uppercase', animation: 'flashPulse 1.5s infinite' }}>
              ⚡ FLASH
            </span>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0, fontFamily: 'Poppins, sans-serif' }}>
              Ofertas de Última Hora
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Expiran en</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {countdown.split(':').map((v, i) => (
                  <span key={i} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 900, fontSize: 16, padding: '4px 8px', borderRadius: 6, fontFamily: 'monospace', minWidth: 32, textAlign: 'center' }}>{v}</span>
                ))}
              </div>
            </div>
            {/* Botón push */}
            {pushState === 'idle' && (
              <button onClick={handlePush} style={{ background: '#fff', color: '#003580', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <i className="fa fa-bell" /> Avisar de ofertas
              </button>
            )}
            {pushState === 'asking' && (
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}><i className="fa fa-spinner fa-spin" /> Activando...</span>
            )}
            {pushState === 'granted' && (
              <span style={{ color: '#4ade80', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><i className="fa fa-bell" /> Notificaciones activas</span>
            )}
            {pushState === 'denied' && (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}><i className="fa fa-bell-slash" /> Notificaciones bloqueadas</span>
            )}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ minWidth: 220, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, flex: '0 0 220px' }}>
                {[80, 60, 40].map((w, j) => <div key={j} style={{ height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: 8, width: `${w}%` }} />)}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {deals.map(deal => {
              const seg0 = deal.itineraries?.[0]?.segments || []
              const first = seg0[0] || {}
              const last  = seg0[seg0.length - 1] || {}
              const from  = first.from || first.departure?.iataCode || '?'
              const to    = last.to   || last.arrival?.iataCode    || '?'
              const dep   = first.fromTime || first.departure?.at  || ''
              const arr   = last.toTime   || last.arrival?.at      || ''
              const price = parseFloat(deal.price?.total || '0')
              const stops = seg0.length - 1
              return (
                <div key={deal.id} onClick={() => goToFlight(deal)}
                  style={{ minWidth: 210, flex: '0 0 210px', background: '#fff', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.15)' }}>
                  {/* Ruta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: 18, color: '#003580' }}>{from}</span>
                    <i className="fa fa-plane" style={{ color: '#003580', fontSize: 12 }} />
                    <span style={{ fontWeight: 900, fontSize: 18, color: '#003580' }}>{to}</span>
                  </div>
                  {/* Horario */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 6 }}>
                    <span>{fmtTime(dep)}</span>
                    <span style={{ fontSize: 10, color: '#999' }}>{fmtDur(deal.itineraries?.[0]?.duration)}</span>
                    <span>{fmtTime(arr)}</span>
                  </div>
                  {/* Fecha + escalas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 12 }}>
                    <span>{fmtDate(dep)}</span>
                    <span>{stops === 0 ? 'Directo' : `${stops} escala`}</span>
                  </div>
                  {/* Precio */}
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#999' }}>desde</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#ee1d25', lineHeight: 1 }}>
                        {price.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€
                      </div>
                      <div style={{ fontSize: 10, color: '#999' }}>por persona</div>
                    </div>
                    <button style={{ background: '#003580', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      Reservar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 12, textAlign: 'right' }}>
          * Precios en tiempo real de Amadeus · Sujetos a disponibilidad
        </p>
      </div>

      <style>{`
        @keyframes flashPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
      `}</style>
    </section>
  )
}
