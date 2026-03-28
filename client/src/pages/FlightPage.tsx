/**
 * FlightPage — Página de resultados de vuelos
 * SEO: Meta tags dinámicos para búsqueda de vuelos
 */
// @ts-nocheck
import { useState, useEffect, Component, ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Header, MobileNav, Footer } from '../components/layout'
import DatePicker from '../components/ui/DatePicker'
import { useSearch } from '../context/SearchContext'
import SEO from '../components/seo/SEO'
// Autocomplete removed - use homepage for autocomplete search

// Error boundary to catch render errors
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error?: Error}> {
  state = { hasError: false, error: undefined }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('FlightPage Error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
          <h2>Algo salió mal</h2>
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: 10 }}>
            {this.state.error?.message || 'Error desconocido'}
          </pre>
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      )
    }
    return this.props.children
  }
}

const CARRIER_NAMES = { IB:'Iberia', VY:'Vueling', FR:'Ryanair', UX:'Air Europa', BA:'British Airways', AF:'Air France' }
const CARRIER_LOGOS = { IB:'/img/p_01.png', VY:'/img/p_02.png', FR:'/img/p_04.png', UX:'/img/p_03.png' }

// Aerolíneas por región
const AIRLINES = {
  'España': [
    { code: 'IB', name: 'Iberia' },
    { code: 'VY', name: 'Vueling' },
    { code: 'FR', name: 'Ryanair' },
    { code: 'UX', name: 'Air Europa' },
    { code: 'XK', name: 'Air Nostrum' },
    { code: 'H2', name: 'Air Horizont' },
    { code: 'U5', name: 'Plus Ultra' },
    { code: 'AV', name: 'Avianca' },
    { code: 'ED', name: 'Binter Canarias' },
    { code: 'E2', name: 'Air Europe' },
  ],
  'Europa': [
    { code: 'BA', name: 'British Airways' },
    { code: 'AF', name: 'Air France' },
    { code: 'LH', name: 'Lufthansa' },
    { code: 'KL', name: 'KLM' },
    { code: 'TK', name: 'Turkish Airlines' },
    { code: 'SN', name: 'Brussels Airlines' },
    { code: 'A3', name: 'Aegean Airlines' },
    { code: 'OS', name: 'Austrian Airlines' },
    { code: 'SQ', name: 'Singapore Airlines' },
    { code: 'QR', name: 'Qatar Airways' },
    { code: 'EK', name: 'Emirates' },
    { code: 'EY', name: 'Etihad Airways' },
    { code: 'CX', name: 'Cathay Pacific' },
    { code: 'JL', name: 'Japan Airlines' },
    { code: 'NH', name: 'ANA' },
    { code: 'AC', name: 'Air Canada' },
    { code: 'QF', name: 'Qantas' },
    { code: 'CZ', name: 'China Southern' },
    { code: 'MU', name: 'China Eastern' },
    { code: 'CA', name: 'Air China' },
    { code: 'SU', name: 'Aeroflot' },
    { code: 'S7', name: 'S7 Airlines' },
    { code: 'U6', name: 'UTair' },
    { code: 'A5', name: 'Air Alps' },
    { code: 'KM', name: 'Air Malta' },
    { code: 'BT', name: 'Air Baltic' },
    { code: 'LO', name: 'LOT Polish Airlines' },
    { code: 'OK', name: 'Czech Airlines' },
    { code: '6E', name: 'IndiGo' },
    { code: 'G8', name: 'SpiceJet' },
  ],
  'Norteamérica': [
    { code: 'AA', name: 'American Airlines' },
    { code: 'UA', name: 'United Airlines' },
    { code: 'DL', name: 'Delta Air Lines' },
    { code: 'B6', name: 'JetBlue' },
    { code: 'WN', name: 'Southwest Airlines' },
    { code: 'AS', name: 'Alaska Airlines' },
    { code: 'F9', name: 'Frontier Airlines' },
    { code: 'NK', name: 'Spirit Airlines' },
    { code: 'HA', name: 'Hawaiian Airlines' },
    { code: 'SY', name: 'Sun Country Airlines' },
  ],
  'México': [
    { code: 'AM', name: 'Aeroméxico' },
    { code: 'VB', name: 'Viva Aerobus' },
    { code: '4O', name: 'Interjet' },
    { code: '5D', name: 'Aerolíneas' },
    { code: 'Y4', name: 'Volaris' },
  ],
  'Centroamérica': [
    { code: 'CM', name: 'Copa Airlines' },
    { code: 'LR', name: 'LACSA' },
    { code: 'BB', name: 'Seaborne Airlines' },
    { code: 'M6', name: 'Volaris Costa Rica' },
    { code: 'M5', name: 'Transportes Aéreos' },
  ],
  'Caribe': [
    { code: '5T', name: 'LaCubana' },
    { code: 'CU', name: 'Cubana de Aviación' },
    { code: 'F4', name: 'Air Caraïbes' },
    { code: 'SS', name: 'Corsair' },
    { code: 'WN', name: 'Winston-Salem' },
    { code: 'B6', name: 'JetBlue Caribbean' },
  ],
  'Colombia': [
    { code: 'AV', name: 'Avianca' },
    { code: 'P5', name: 'Copa Airlines Colombia' },
    { code: '5Z', name: 'Viva Air Colombia' },
    { code: 'VE', name: 'Venezolana' },
    { code: '9A', name: 'Air Cartagena' },
    { code: '7R', name: 'LATAM Colombia' },
  ],
  'Venezuela': [
    { code: 'VE', name: 'Venezolana' },
    { code: 'V0', name: 'Conviasa' },
    { code: 'S2', name: 'Star Peru' },
    { code: 'Q6', name: 'Albatros Air' },
    { code: '8I', name: 'Insel Air' },
  ],
  'Perú': [
    { code: 'LA', name: 'LATAM Perú' },
    { code: '2I', name: 'Star Peru' },
    { code: 'JA', name: 'JetSmart Perú' },
    { code: 'P9', name: 'Peruvian Airlines' },
    { code: 'VL', name: 'Viva Air Perú' },
  ],
  'Chile': [
    { code: 'LA', name: 'LATAM Chile' },
    { code: 'JJ', name: 'LATAM Brasil' },
    { code: 'H2', name: 'Sky Airline' },
    { code: '4R', name: 'Reinair' },
    { code: '6R', name: 'Aerolíneas del Sur' },
  ],
  'Argentina': [
    { code: 'AR', name: 'Aerolíneas Argentinas' },
    { code: '4M', name: 'LATAM Argentina' },
    { code: '5T', name: 'Flybondi' },
    { code: 'U8', name: 'Amasz Uruguay' },
    { code: 'Z8', name: 'Andes Líneas Aéreas' },
  ],
  'Brasil': [
    { code: 'G3', name: 'Gol' },
    { code: 'AD', name: 'Azul Brazilian Airlines' },
    { code: 'JJ', name: 'LATAM Brasil' },
    { code: 'WH', name: 'WebJet' },
    { code: 'SS', name: 'Corsairfly' },
  ],
  'Ecuador': [
    { code: 'TA', name: 'TAME' },
    { code: '5E', name: 'Equair' },
    { code: 'E8', name: 'Aeroregional' },
    { code: 'HL', name: 'Ecuair' },
  ],
  'Bolivia': [
    { code: 'OB', name: 'Boliviana de Aviación' },
    { code: '5Z', name: 'Amasz Bolivia' },
    { code: 'U7', name: 'Amazon Sky' },
  ],
  'Uruguay': [
    { code: 'U5', name: 'Amasz Uruguay' },
    { code: 'Z8', name: 'BQB Líneas Aéreas' },
    { code: '6K', name: 'Aerovip' },
  ],
}

function fmtDuration(iso) {
  if (!iso || typeof iso !== 'string') return '—'
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return m ? `${m[1]||0}h ${m[2]||0}m` : iso
}
function fmtTime(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return '—'
  try {
    return new Date(isoStr).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })
  } catch {
    return '—'
  }
}

function FlightPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const { searchFlights, flightResults, loading, error, setFlightResults, setLoading, setError } = useSearch()

  const [fromV,  setFromV]  = useState<string>(sp.get('from') || '')
  const [toV,    setToV]    = useState<string>(sp.get('to') || '')
  const [depV,   setDepV]   = useState<Date | null>(null)
  const [retV,   setRetV]   = useState<Date | null>(null)
  const [adV,    setAdV]    = useState<string>(sp.get('adults') || '1')
  // Detectar tipo de viaje desde URL: si hay 'return' es ida y vuelta, si hay 'multi' es múltiple
  const [typeV,  setTypeV]  = useState<string>(
    sp.get('multi') ? 'Múltiples Destinos' : sp.get('return') ? 'Ida y Vuelta' : 'Solo Ida'
  )
  const [maxPrice,  setMaxPrice]  = useState<number>(1000)
  const [stops,     setStops]     = useState<number[]>([0, 1, 2])
  const [sortBy,    setSortBy]    = useState<string>('price')
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({})
  const [searched,  setSearched]  = useState<boolean>(false)
  const [showFilter,setShowFilter]= useState<boolean>(true)
  const [visibleCount, setVisibleCount] = useState<number>(10)
  const FLIGHTS_PER_PAGE = 10

  // Multi-destino: tramos y resultados por tramo
  const [multiLegs,    setMultiLegs]    = useState<{from:string;to:string;date:string}[]>([])
  const [multiResults, setMultiResults] = useState<{leg:{from:string;to:string;date:string}; flights:any[]}[]>([])
  const isMulti = multiLegs.length > 0

  // SEO dinámico basado en la búsqueda
  const seoTitle = fromV && toV 
    ? `Vuelos ${fromV} → ${toV} | Buscador de Vuelos` 
    : 'Buscar Vuelos | Agencia de Viajes'
  const seoDescription = fromV && toV && depV
    ? `Encuentra los mejores vuelos desde ${fromV} hasta ${toV}. Precios competitivos, escalas y vuelos directos.`
    : 'Busca y compara vuelos baratos. Encuentra ofertas en vuelos internacionales, nacionales y con escalas.'
  const seoKeywords = fromV && toV 
    ? `vuelos ${fromV}, vuelos a ${toV}, billetes avión, viajes baratos, reservar vuelos`
    : 'vuelos, billetes avión, viajes, reservar vuelos, ofertas vuelos'

  useEffect(() => {
    const multiParam = sp.get('multi')

    // ── MULTI DESTINO ──
    if (multiParam) {
      try {
        const legs = JSON.parse(multiParam) as {from:string;to:string;date:string}[]
        setMultiLegs(legs)
        setLoading(true)
        setError(null)
        setMultiResults([])
        // Buscar cada tramo en paralelo (solo ida, sin returnDate)
        Promise.all(
          legs.map(leg =>
            searchFlights({ from: leg.from, to: leg.to, departure: leg.date, adults: +adV })
              .then(flights => ({ leg, flights }))
              .catch(() => ({ leg, flights: [] }))
          )
        ).then(results => {
          setMultiResults(results)
          setSearched(true)
          setLoading(false)
        })
      } catch {
        setError('Error al procesar los tramos de multi-destino')
        setLoading(false)
      }
      return
    }

    // ── IDA / IDA Y VUELTA ──
    const from = sp.get('from'), to = sp.get('to'), dep = sp.get('departure')
    const ret = sp.get('return')
    if (from && to && dep) {
      setFromV(from)
      setToV(to)
      setMultiLegs([])
      // Pasar returnDate solo si existe — la API devuelve itineraries[1] para vuelta
      searchFlights({ from, to, departure: dep, returnDate: ret || undefined, adults: +adV })
        .then(() => setSearched(true))
    }
  }, [sp, adV, searchFlights])

  const doSearch = () => {
    if (!fromV || !toV) return
    // Si es múltiples destinos, redirigir a la homepage para usar el formulario completo
    if (typeV === 'Múltiples Destinos') {
      navigate('/')
      return
    }
    const depStr = depV instanceof Date ? depV.toISOString().split('T')[0] : ''
    const retStr = retV instanceof Date ? retV.toISOString().split('T')[0] : ''
    const isRoundTrip = typeV === 'Ida y Vuelta'
    const params = new URLSearchParams({ 
      from: fromV, 
      to: toV, 
      departure: depStr, 
      adults: adV,
      ...(isRoundTrip && retStr ? { return: retStr } : {}) 
    })
    navigate(`/vuelos?${params}`)
  }

  const filtered = (flightResults || [])
    .filter(f => {
      try {
        const price = parseFloat(f.price?.total?.toString() || '0')
        const seg = f.itineraries?.[0]?.segments || []
        const carrier = seg[0]?.carrierCode || ''
        const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(carrier)
        return price <= maxPrice && stops.includes(seg.length - 1) && airlineMatch
      } catch (e) {
        console.error('Error filtering flight:', e);
        return false;
      }
    })
    .sort((a, b) => sortBy === 'price'
      ? parseFloat(a.price?.total?.toString() || '0') - parseFloat(b.price?.total?.toString() || '0')
      : (a.itineraries?.[0]?.duration || '').localeCompare(b.itineraries?.[0]?.duration || ''))

  // ExtraerAerolíneas únicas de los resultados
  const availableCarriers = [...new Set(
    flightResults.flatMap(f => 
      (f.itineraries || []).flatMap(it => 
        (it.segments || []).map(seg => seg.carrierCode)
      )
    )
  )].filter(Boolean)

  // FiltrarAerolíneas por región solo mostrar las disponibles
  const availableAirlinesByRegion = Object.entries(AIRLINES).reduce((acc, [region, airlines]) => {
    const available = airlines.filter(a => availableCarriers.includes(a.code))
    if (available.length > 0) acc[region] = available
    return acc
  }, {})

  return (
    <div id="body">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url="https://travelagency.com/vuelos"
      />
      <MobileNav/>
      <Header/>

      {/* Barra de búsqueda azul */}
      <div className="search-int">
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
          <div className="sb-row">
            <div className="sb-field">
              <div className="text-box">
                <span>Tipo de Viaje</span>
                <select value={typeV} onChange={e => {
                  setTypeV(e.target.value)
                  if (e.target.value === 'Solo Ida') setRetV(null)
                }}>
                  <option>Solo Ida</option>
                  <option>Ida y Vuelta</option>
                  <option>Múltiples Destinos</option>
                </select>
              </div>
            </div>
            <div className="sb-field sb-field--grow">
              <div className="text-box">
                <span>Desde</span>
                <input type="text" value={fromV} onChange={e => setFromV(e.target.value)} placeholder="Origen (ej: MAD)"/>
              </div>
            </div>
            <div className="sb-field sb-field--grow">
              <div className="text-box">
                <span>Hasta</span>
                <input type="text" value={toV} onChange={e => setToV(e.target.value)} placeholder="Destino (ej: CDG)"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box">
                <span>Salida</span>
                <DatePicker value={depV} onChange={setDepV} placeholder="dd/mm/yyyy"/>
              </div>
            </div>
            <div className="sb-field">
              <div className="text-box">
                <span>Regreso</span>
                <DatePicker value={retV} onChange={setRetV} placeholder="dd/mm/yyyy" alignRight disabled={typeV === 'Solo Ida'}/>
              </div>
            </div>
            <div className="sb-field sb-field--sm">
              <div className="text-box">
                <span>Adultos</span>
                <select value={adV} onChange={e => setAdV(e.target.value)}>
                  {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="sb-btn">
              <button type="button" className="btn-search" onClick={doSearch}>
                <i className="fa fa-search"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px' }}>
        {fromV && toV && (
          <p style={{ fontSize:13, color:'#666', marginBottom:16 }}>
            <i className="fa fa-plane" style={{ color:'#003580', marginRight:6 }}/>
            <strong>{fromV}</strong> → <strong>{toV}</strong>
            {sp.get('departure') && (
              <span style={{ marginLeft:8, color:'#999' }}>
                {new Date(sp.get('departure') + 'T12:00').toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}
              </span>
            )}
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start">
          {/* Columna filtros - Mobile: full width, Desktop: fixed width */}
          <div className="w-full md:w-[220px] md:min-w-[200px] flex-shrink-0">
            <div className="filter-head" onClick={() => setShowFilter(f => !f)}>
              <i className="fa fa-sliders"/> Filtros
              <i className={`fa fa-chevron-${showFilter ? 'up' : 'down'}`} style={{ float:'right', marginTop:2 }}/>
            </div>
            {showFilter && (
              <div style={{ background:'#fff', border:'1px solid #e5e5e5', borderRadius:4, padding:16, marginTop:8 }}>
                <div style={{ marginBottom:16 }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:8 }}>Precio Máximo</h4>
                  <input type="range" min={50} max={2000} value={maxPrice}
                    onChange={e => setMaxPrice(+e.target.value)}
                    style={{ width:'100%', accentColor:'#003580' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginTop:4 }}>
                    <span>50€</span>
                    <span style={{ fontWeight:700, color:'#003580' }}>{maxPrice}€</span>
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:8 }}>Escalas</h4>
                  {[{v:0,l:'Directo'},{v:1,l:'1 Escala'},{v:2,l:'2+ Escalas'}].map(({v, l}) => (
                    <label key={v} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" checked={stops.includes(v)} style={{ accentColor:'#003580' }}
                        onChange={e => setStops(s => e.target.checked ? [...s, v] : s.filter(x => x !== v))}/>
                      {l}
                    </label>
                  ))}
                </div>
                <div style={{ marginBottom:16 }}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:8 }}>Aerolíneas</h4>
                  {Object.keys(availableAirlinesByRegion).length > 0 ? (
                    <>
                    {Object.entries(availableAirlinesByRegion).map(([region, airlines]) => (
                      <div key={region} style={{ marginBottom:6 }}>
                        <div 
                          style={{ 
                            fontSize:11, fontWeight:600, color:'#003580', 
                            marginBottom:4, cursor:'pointer', display:'flex', alignItems:'center', gap:4 
                          }}
                          onClick={() => setExpandedRegions(e => ({...e, [region]: !e[region]}))}
                        >
                          <i className={`fa fa-chevron-${expandedRegions[region] ? 'down' : 'right'}`} style={{ fontSize:10 }}/>
                          {region} ({airlines.length})
                        </div>
                        {expandedRegions[region] && (
                          <div style={{ paddingLeft:12 }}>
                            {airlines.map(airline => (
                              <label key={airline.code} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12, cursor:'pointer' }}>
                                <input type="checkbox" checked={selectedAirlines.includes(airline.code)} 
                                  onChange={e => setSelectedAirlines(s => e.target.checked 
                                    ? [...s, airline.code] 
                                    : s.filter(x => x !== airline.code))}
                                  style={{ accentColor:'#003580' }}/>
                                {airline.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    </>
                  ) : (
                    <p style={{ fontSize:12, color:'#888' }}>No hayAerolíneas disponibles</p>
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:8 }}>Ordenar</h4>
                  {[{v:'price',l:'Precio'},{v:'duration',l:'Duración'}].map(({v, l}) => (
                    <label key={v} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, fontSize:13, cursor:'pointer' }}>
                      <input type="radio" name="sort" checked={sortBy === v}
                        onChange={() => setSortBy(v)} style={{ accentColor:'#003580' }}/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna resultados - Mobile: full width, Desktop: flexible */}
          <div className="w-full md:flex-1 md:min-w-0">
            {/* ── RESULTADOS MULTI-DESTINO ── */}
            {isMulti ? (
              <div>
                <p style={{ fontSize:13, color:'#666', marginBottom:12 }}>
                  {loading ? 'Buscando vuelos...' : `Multi-destino · ${multiLegs.length} tramos`}
                </p>
                {loading && [0,1,2].map(i => (
                  <div key={i} className="flight-block" style={{ marginBottom:12 }}>
                    {[80,60,40].map((w,j) => <div key={j} className="skeleton" style={{ height:14, width:`${w}%`, marginBottom:8 }}/>)}
                  </div>
                ))}
                {!loading && multiResults.map(({ leg, flights }, legIdx) => (
                  <div key={legIdx} style={{ marginBottom:24 }}>
                    {/* Cabecera del tramo */}
                    <div style={{ background:'#003580', color:'#fff', borderRadius:'8px 8px 0 0', padding:'8px 16px', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:'50%', width:22, height:22, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>
                        {legIdx + 1}
                      </span>
                      <i className="fa fa-plane" style={{ fontSize:12 }}/>
                      Tramo {legIdx + 1}: {leg.from} → {leg.to}
                      <span style={{ marginLeft:'auto', fontWeight:400, fontSize:11, opacity:.8 }}>{leg.date}</span>
                    </div>
                    {flights.length === 0 ? (
                      <div style={{ background:'#fff8f0', border:'1px solid #fed7aa', borderRadius:'0 0 8px 8px', padding:16, fontSize:13, color:'#c2410c' }}>
                        <i className="fa fa-exclamation-triangle" style={{ marginRight:6 }}/>
                        No se encontraron vuelos para este tramo
                      </div>
                    ) : (
                      flights.slice(0, 5).map((flight, i) => {
                        const mseg = flight.itineraries?.[0]?.segments || []
                        const mfirst = mseg[0] || {}
                        const mlast  = mseg[mseg.length - 1] || {}
                        const mcarrier = mfirst.carrier || '??'
                        const mStops   = mseg.length - 1
                        const mbaggage = flight.baggage || null
                        return (
                          <div key={flight.id || i} className="flight-block"
                            style={{ borderRadius: i === Math.min(flights.length,5)-1 ? '0 0 8px 8px' : 0, borderTop:'none' }}>
                            <div className="flight-header-top">
                              <div className="flight-airline">
                                <img src={CARRIER_LOGOS[mcarrier] || '/img/p_01.png'} alt={mcarrier}
                                  onError={e => e.currentTarget.style.display='none'}/>
                                <span>{CARRIER_NAMES[mcarrier] || mcarrier}</span>
                              </div>
                              <div className="flight-times">
                                <div className="flight-time">
                                  <div className="flight-time-value">{fmtTime(mfirst.fromTime)}</div>
                                  <div className="flight-time-label">{mfirst.from}{mfirst.fromTerminal && <span> T{mfirst.fromTerminal}</span>}</div>
                                </div>
                                <div className="flight-duration">
                                  <div className="flight-duration-text">{fmtDuration(flight.itineraries?.[0]?.duration)}</div>
                                  <div className="flight-duration-line">
                                    {mStops > 0 && Array(mStops).fill(0).map((_,idx) => <div key={idx} className="flight-stop-dot"/>)}
                                  </div>
                                  <div className="flight-stops">{mStops === 0 ? 'Directo' : `${mStops} escala${mStops>1?'s':''}`}</div>
                                </div>
                                <div className="flight-time">
                                  <div className="flight-time-value">{fmtTime(mlast.toTime)}</div>
                                  <div className="flight-time-label">{mlast.to}{mlast.toTerminal && <span> T{mlast.toTerminal}</span>}</div>
                                </div>
                              </div>
                              <div className="flight-price-section">
                                {flight.seats && flight.seats <= 10 && (
                                  <div className="flight-seats-warning"><i className="fa fa-bolt"/> {flight.seats} plazas</div>
                                )}
                                <div className="flight-price">{parseFloat(flight.price?.total||0).toLocaleString('es-ES',{minimumFractionDigits:0})}€</div>
                                <div className="flight-price-label">por persona</div>
                                <button onClick={() => navigate('/vuelos/checkout', { state: { flight, multiLeg: leg, legIndex: legIdx } })} className="flight-btn">
                                  Reservar
                                </button>
                              </div>
                            </div>
                            {/* Detalle del tramo */}
                            <div className="pt-3 text-[11px] md:text-xs text-gray-600">
                              {mseg.length > 0 && (
                                <div className="bg-gray-100 p-2 rounded mb-2">
                                  <strong className="text-gray-800"><i className="fa fa-list"/> Itinerario:</strong>
                                  {mseg.map((seg, idx) => (
                                    <div key={idx} className="mt-1 flex flex-col sm:flex-row sm:justify-between text-gray-600 gap-1">
                                      <span><strong>{seg.from}</strong> → <strong>{seg.to}</strong> ({fmtTime(seg.fromTime)} - {fmtTime(seg.toTime)})</span>
                                      <span><i className="fa fa-clock-o"/> {fmtDuration(seg.duration)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {mStops > 0 && (
                                <div className="bg-yellow-50 p-2 rounded mb-2">
                                  <strong className="text-amber-700"><i className="fa fa-exchange"/> Escalas ({mStops}):</strong>
                                  {mseg.slice(0,-1).map((seg, idx) => (
                                    <div key={idx} className="mt-1 text-amber-700">• {seg.to} - <strong>Escala {fmtDuration(seg.layover?.duration)}</strong></div>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {mbaggage?.cabin && (
                                  <span className="bg-orange-50 px-2 py-1 rounded text-[10px] text-orange-700">
                                    <i className="fa fa-suitcase"/> Cabina: {mbaggage.cabin.count}x {mbaggage.cabin.weight}{mbaggage.cabin.weightUnit}
                                  </span>
                                )}
                                {mbaggage?.checked && (
                                  <span className="bg-green-50 px-2 py-1 rounded text-[10px] text-green-700">
                                    <i className="fa fa-plane"/> Bodega: {mbaggage.checked.count}x {mbaggage.checked.weight}{mbaggage.checked.weightUnit}
                                  </span>
                                )}
                                {mbaggage && !mbaggage.cabin && !mbaggage.checked && (
                                  <span className="text-[10px] text-gray-400"><i className="fa fa-suitcase"/> Sin equipaje</span>
                                )}
                                <span className="text-[10px] text-gray-500"><i className="fa fa-star text-amber-400"/> Atención personalizada</span>
                                <span className="text-[10px] text-gray-500"><i className="fa fa-shield text-green-500"/> Seguro incluido</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                ))}
              </div>
            ) : (
            /* ── RESULTADOS NORMALES (IDA / IDA Y VUELTA) ── */
            <div>
            <p style={{ fontSize:13, color:'#666', marginBottom:12 }}>
              {loading ? 'Buscando vuelos...' : `${filtered.length} vuelos encontrados`}
            </p>

            {error && !loading && (
              <div style={{ background:'#fff5f5', border:'1px solid #fecdd3', borderRadius:6, padding:16, color:'#dc2626', fontSize:13, marginBottom:12 }}>
                <i className="fa fa-exclamation-circle" style={{ marginRight:6 }}/>{error}
              </div>
            )}

            {loading && [0,1,2,3].map(i => (
              <div key={i} className="flight-block" style={{ marginBottom:12 }}>
                {[80,60,40].map((w, j) => (
                  <div key={j} className="skeleton" style={{ height:14, width:`${w}%`, marginBottom:8 }}/>
                ))}
              </div>
            ))}

            {!loading && searched && filtered.length === 0 && !error && (
              <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa' }}>
                <i className="fa fa-plane" style={{ fontSize:48, display:'block', marginBottom:12, opacity:.3 }}/>
                <p style={{ fontWeight:600 }}>No se encontraron vuelos</p>
                <p style={{ fontSize:13, marginTop:4 }}>Prueba con otras fechas o destinos</p>
              </div>
            )}

            {!loading && !searched && (
              <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa' }}>
                <i className="fa fa-search" style={{ fontSize:48, display:'block', marginBottom:12, opacity:.3 }}/>
                <p style={{ fontWeight:600 }}>Introduce origen y destino para buscar vuelos</p>
              </div>
            )}

            {/* Vuelos visibles (primeros 10) */}
            {!loading && filtered.slice(0, visibleCount).map((flight, i) => {
              const isRound = (flight.itineraries?.length || 0) >= 2

              // Itinerario IDA
              const seg0  = flight.itineraries?.[0]?.segments || []
              const first = seg0[0] || {}
              const last  = seg0[seg0.length - 1] || {}

              // Itinerario VUELTA
              const seg1    = flight.itineraries?.[1]?.segments || []
              const ret0    = seg1[0] || {}
              const retLast = seg1[seg1.length - 1] || {}

              const carrier  = first.carrier || '??'
              const nStops   = seg0.length - 1
              const nStopsR  = seg1.length - 1
              const baggage  = flight.baggage || null
              const amenities = flight.amenities || []
              
              return (
                <div key={flight.id || i} className="flight-block">
                  <div className="flight-header">
                    <div className="flight-header-top">
                      {/* Aerolínea */}
                      <div className="flight-airline">
                        <img src={CARRIER_LOGOS[carrier] || '/img/p_01.png'} alt={carrier}
                          onError={(e) => { e.currentTarget.style.display='none' }}/>
                        <span>{CARRIER_NAMES[carrier] || carrier}</span>
                      </div>

                      {/* Horarios — IDA (y VUELTA si aplica) */}
                      <div style={{ flex:1 }}>
                        {/* Tramo IDA */}
                        {isRound && (
                          <div style={{ fontSize:10, fontWeight:700, color:'#003580', textTransform:'uppercase', marginBottom:2 }}>
                            <i className="fa fa-plane" style={{ marginRight:4 }}/>Ida
                          </div>
                        )}
                        <div className="flight-times">
                          <div className="flight-time">
                            <div className="flight-time-value">{fmtTime(first.fromTime)}</div>
                            <div className="flight-time-label">{first.from}{first.fromTerminal && <span> T{first.fromTerminal}</span>}</div>
                          </div>
                          <div className="flight-duration">
                            <div className="flight-duration-text">{fmtDuration(flight.itineraries?.[0]?.duration)}</div>
                            <div className="flight-duration-line">
                              {nStops > 0 && Array(nStops).fill(0).map((_, idx) => (
                                <div key={idx} className="flight-stop-dot"/>
                              ))}
                            </div>
                            <div className="flight-stops">
                              {nStops === 0 ? 'Directo' : `${nStops} escala${nStops > 1 ? 's' : ''}`}
                            </div>
                          </div>
                          <div className="flight-time">
                            <div className="flight-time-value">{fmtTime(last.toTime)}</div>
                            <div className="flight-time-label">{last.to}{last.toTerminal && <span> T{last.toTerminal}</span>}</div>
                          </div>
                        </div>

                        {/* Tramo VUELTA */}
                        {isRound && seg1.length > 0 && (
                          <>
                            <div style={{ fontSize:10, fontWeight:700, color:'#16a34a', textTransform:'uppercase', margin:'6px 0 2px' }}>
                              <i className="fa fa-plane" style={{ marginRight:4, transform:'scaleX(-1)', display:'inline-block' }}/>Vuelta
                            </div>
                            <div className="flight-times">
                              <div className="flight-time">
                                <div className="flight-time-value">{fmtTime(ret0.fromTime)}</div>
                                <div className="flight-time-label">{ret0.from}</div>
                              </div>
                              <div className="flight-duration">
                                <div className="flight-duration-text">{fmtDuration(flight.itineraries?.[1]?.duration)}</div>
                                <div className="flight-duration-line">
                                  {nStopsR > 0 && Array(nStopsR).fill(0).map((_, idx) => (
                                    <div key={idx} className="flight-stop-dot"/>
                                  ))}
                                </div>
                                <div className="flight-stops">
                                  {nStopsR === 0 ? 'Directo' : `${nStopsR} escala${nStopsR > 1 ? 's' : ''}`}
                                </div>
                              </div>
                              <div className="flight-time">
                                <div className="flight-time-value">{fmtTime(retLast.toTime)}</div>
                                <div className="flight-time-label">{retLast.to}</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Precio y botón */}
                      <div className="flight-price-section">
                        {flight.seats && flight.seats <= 10 && (
                          <div className="flight-seats-warning">
                            <i className="fa fa-bolt"/> {flight.seats} plazas
                          </div>
                        )}
                        <div className="flight-price">
                          {parseFloat(flight.price?.total || 0).toLocaleString('es-ES', { minimumFractionDigits:0 })}€
                        </div>
                        <div className="flight-price-label">{isRound ? 'ida y vuelta' : 'por persona'}</div>
                        <button
                          onClick={() => navigate('/vuelos/checkout', { state: { flight, tripType: sp.get('return') ? 'round' : 'oneway' } })}
                          className="flight-btn">
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalles adicionales del vuelo */}
                  <div className="pt-3 text-[11px] md:text-xs text-gray-600">
                    <div className="flex flex-wrap gap-3 md:gap-4 mb-2">
                      <span><i className="fa fa-plane"/> Vuelo: <strong>{first.flightNumber}</strong></span>
                      {first.aircraft && <span><i className="fa fa-plane"/> {typeof first.aircraft === 'string' ? first.aircraft : first.aircraft?.code}</span>}
                      {first.fromTerminal && <span><i className="fa fa-building"/> Terminal {first.fromTerminal}</span>}
                    </div>

                    {/* Itinerario IDA */}
                    {seg0.length > 0 && (
                      <div className="bg-blue-50 p-2 rounded mb-2 text-[10px] md:text-xs">
                        <strong className="text-blue-800"><i className="fa fa-list"/> {isRound ? 'Itinerario Ida:' : 'Itinerario:'}</strong>
                        {seg0.map((seg, idx) => (
                          <div key={idx} className="mt-1 flex flex-col sm:flex-row sm:justify-between text-gray-600 gap-1">
                            <span><strong>{seg.from}</strong> → <strong>{seg.to}</strong> ({fmtTime(seg.fromTime)} - {fmtTime(seg.toTime)})</span>
                            <span><i className="fa fa-clock-o"/> {fmtDuration(seg.duration)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Itinerario VUELTA */}
                    {isRound && seg1.length > 0 && (
                      <div className="bg-green-50 p-2 rounded mb-2 text-[10px] md:text-xs">
                        <strong className="text-green-800"><i className="fa fa-list"/> Itinerario Vuelta:</strong>
                        {seg1.map((seg, idx) => (
                          <div key={idx} className="mt-1 flex flex-col sm:flex-row sm:justify-between text-gray-600 gap-1">
                            <span><strong>{seg.from}</strong> → <strong>{seg.to}</strong> ({fmtTime(seg.fromTime)} - {fmtTime(seg.toTime)})</span>
                            <span><i className="fa fa-clock-o"/> {fmtDuration(seg.duration)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Escalas ida */}
                    {nStops > 0 && (
                      <div className="bg-yellow-50 p-2 rounded mb-2">
                        <strong className="text-amber-700"><i className="fa fa-exchange"/> Escalas ida ({nStops}):</strong>
                        {seg0.slice(0, -1).map((seg, idx) => (
                          <div key={idx} className="mt-1 text-amber-700">
                            • {seg.to} - <strong>Escala {fmtDuration(seg.layover?.duration || flight.itineraries?.[0]?.layoverDuration)}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Escalas vuelta */}
                    {isRound && nStopsR > 0 && (
                      <div className="bg-yellow-50 p-2 rounded mb-2">
                        <strong className="text-amber-700"><i className="fa fa-exchange"/> Escalas vuelta ({nStopsR}):</strong>
                        {seg1.slice(0, -1).map((seg, idx) => (
                          <div key={idx} className="mt-1 text-amber-700">
                            • {seg.to} - <strong>Escala {fmtDuration(seg.layover?.duration || flight.itineraries?.[1]?.layoverDuration)}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Equipaje y Amenidades */}
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {baggage && (
                        <div className="flex flex-wrap gap-2">
                          {baggage.cabin && (
                            <span className="bg-orange-50 px-2 py-1 rounded text-[10px] text-orange-700">
                              <i className="fa fa-suitcase"/> Cabina: {baggage.cabin.count}x {baggage.cabin.weight}{baggage.cabin.weightUnit}
                            </span>
                          )}
                          {baggage.checked && (
                            <span className="bg-green-50 px-2 py-1 rounded text-[10px] text-green-700">
                              <i className="fa fa-plane"/> Bodega: {baggage.checked.count}x {baggage.checked.weight}{baggage.checked.weightUnit}
                            </span>
                          )}
                          {!baggage.cabin && !baggage.checked && (
                            <span className="text-[10px] text-gray-400"><i className="fa fa-suitcase"/> Sin equipaje</span>
                          )}
                        </div>
                      )}
                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {amenities.map((amenity, idx) => (
                            <span key={idx} className="bg-blue-50 px-2 py-1 rounded text-[10px] text-blue-700">
                              {amenity.code === 'MEAL' && <i className="fa fa-utensils"/>}
                              {amenity.code === 'WIFI' && <i className="fa fa-wifi"/>}
                              {amenity.code === 'ENTERTAINMENT' && <i className="fa fa-film"/>}
                              {amenity.code === 'POWER_SUPPLY' && <i className="fa fa-plug"/>}
                              {' '}{amenity.description || amenity.code}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] text-gray-500">
                          <i className="fa fa-star text-amber-400"/> Atención personalizada
                        </span>
                        <span className="text-[10px] text-gray-500">
                          <i className="fa fa-shield text-green-500"/> Seguro incluido
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Botón Ver más vuelos */}
            {!loading && filtered.length > visibleCount && (
              <div style={{ textAlign:'center', padding:'32px 0', marginTop:16 }}>
                <button
                  onClick={() => setVisibleCount(c => c + FLIGHTS_PER_PAGE)}
                  style={{ 
                    background:'#fff', 
                    color:'#003580', 
                    border:'2px solid #003580',
                    padding:'12px 32px', 
                    borderRadius:8, 
                    fontSize:15, 
                    fontWeight:600, 
                    cursor:'pointer',
                    transition:'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#003580'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.color = '#003580'
                  }}
                >
                  <i className="fa fa-plus-circle" style={{ marginRight:8 }}/>
                  Ver más vuelos ({filtered.length - visibleCount} más)
                </button>
              </div>
            )}

            {/* Mensaje cuando se muestran todos los vuelos */}
            {!loading && filtered.length > 0 && visibleCount >= filtered.length && (
              <div style={{ textAlign:'center', padding:'24px 0', color:'#888', fontSize:13 }}>
                <i className="fa fa-check-circle" style={{ color:'#22c55e', marginRight:6 }}/>
                Has visto todos los {filtered.length} vuelos disponibles
              </div>
            )}
            </div>
            )}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}

// Wrap with ErrorBoundary
export default function FlightPageWrapper() {
  return (
    <ErrorBoundary>
      <FlightPage />
    </ErrorBoundary>
  )
}
