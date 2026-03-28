/**
 * FlightSeatMap — Mapa de asientos interactivo para vuelos
 * 
 * Basado en la API de Amadeus SeatMap Display v1.9.2
 * 
 * Props:
 *   flightOfferId: string (ID de la oferta de vuelo)
 *   passengers: number (número de pasajeros)
 *   onSelect: function(seats[]) (callback cuando se seleccionan asientos)
 *   initialSeats?: string[] (asientos iniciales seleccionados)
 */
import { useState, useEffect, useMemo } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

// ============================================
// INTERFACES DEL SWAGGER - SEATMAP
// ============================================

interface FlightEndPoint {
  iataCode: string
  terminal?: string
  at: string
}

interface OperatingFlight {
  carrierCode: string
  number?: string
  suffix?: string
}

interface AircraftEquipment {
  code: string
}

interface Price {
  currency: string
  total: string
  base: string
  fees?: Array<{ amount: string; type: string }>
  taxes?: Array<{ amount: string; code: string }>
}

interface Coordinates {
  x: number
  y: number
}

interface SeatmapTravelerPricing {
  travelerId: string
  seatAvailabilityStatus?: 'AVAILABLE' | 'BLOCKED' | 'OCCUPIED'
  price?: Price
}

export interface Seat {
  number: string
  row?: number
  column?: string
  cabin?: string
  availability?: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED'
  characteristicsCodes?: string[]
  travelerPricing?: SeatmapTravelerPricing[]
  coordinates?: Coordinates
  price?: {
    total: number
    currency: string
  }
}

interface DeckConfiguration {
  width?: number
  length?: number
  startSeatRow?: number
  endSeatRow?: number
  startWingsX?: number
  endWingsX?: number
  exitRowsX?: number[]
}

interface Facility {
  code?: string
  column?: string
  row?: string
  position?: 'FRONT' | 'REAR' | 'SEAT'
  coordinates?: Coordinates
}

interface Deck {
  deckType?: 'UPPER' | 'MAIN' | 'LOWER'
  deckConfiguration?: DeckConfiguration
  facilities?: Facility[]
  seats?: Seat[]
}

interface AircraftCabinAmenities {
  power?: {
    description?: string
    isChargeable?: boolean
    powerType?: 'PLUG' | 'USB_PORT' | 'ADAPTOR' | 'PLUG_OR_USB_PORT'
    usbType?: 'USB_A' | 'USB_C' | 'USB_A_AND_USB_C'
  }
  wifi?: {
    description?: string
    isChargeable?: boolean
    wifiType?: 'WIFI' | 'WIFI_AND_MOBILE'
  }
  seat?: {
    description?: string
    isChargeable?: boolean
    recline?: number
  }
  entertainment?: Array<{
    description?: string
    isChargeable?: boolean
    mediaType?: 'MUSIC' | 'VIDEO' | 'GAMES'
  }>
  food?: {
    description?: string
    isChargeable?: boolean
    foodType?: 'MEAL' | 'FRESH_MEAL' | 'SNACK' | 'FRESH_SNACK'
  }
  beverage?: {
    description?: string
    isChargeable?: boolean
    beverageType?: 'ALCOHOLIC' | 'NON_ALCOHOLIC' | 'ALCOHOLIC_AND_NON_ALCOHOLIC'
  }
}

interface AvailableSeatsCounter {
  travelerId?: string
  value?: number
}

export interface SeatMapData {
  type?: string
  id?: string
  departure?: FlightEndPoint
  arrival?: FlightEndPoint
  carrierCode?: string
  number?: string
  operating?: OperatingFlight
  aircraft?: AircraftEquipment
  class?: string
  flightOfferId?: string
  segmentId?: string
  decks?: Deck[]
  aircraftCabinAmenities?: AircraftCabinAmenities
  availableSeatsCounters?: AvailableSeatsCounter[]
}

interface FlightSeatMapProps {
  flightOfferId: string
  passengers: number
  onSelect: (seats: Seat[]) => void
  initialSeats?: string[]
}

export default function FlightSeatMap({ 
  flightOfferId, 
  passengers, 
  onSelect,
  initialSeats = [] 
}: FlightSeatMapProps) {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDeck, setActiveDeck] = useState<number>(0)

  useEffect(() => {
    fetchSeatMap()
  }, [flightOfferId])

  // Initialize selected seats from props
  useEffect(() => {
    if (initialSeats.length > 0 && seatMap) {
      const initialSeatObjects: Seat[] = []
      initialSeats.forEach(seatNum => {
        seatMap.decks?.[activeDeck]?.seats?.forEach(seat => {
          if (seat.number === seatNum) {
            initialSeatObjects.push(seat)
          }
        })
      })
      if (initialSeatObjects.length > 0) {
        setSelectedSeats(initialSeatObjects)
        onSelect(initialSeatObjects)
      }
    }
  }, [initialSeats, seatMap])

  const fetchSeatMap = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API}/seats/flights/${flightOfferId}`)
      if (!response.ok) {
        throw new Error('Error cargando mapa de asientos')
      }
      const data = await response.json()
      if (data.success) {
        setSeatMap(data.data)
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = (seat: Seat) => {
    if (seat.availability !== 'AVAILABLE') return

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.number === seat.number)
      let next: Seat[]

      if (isSelected) {
        next = prev.filter(s => s.number !== seat.number)
      } else {
        if (prev.length >= passengers) {
          // Replace the last selected seat
          next = [...prev.slice(0, -1), seat]
        } else {
          next = [...prev, seat]
        }
      }

      onSelect(next)
      return next
    })
  }

  const getSeatClass = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.number === seat.number)
    
    // Get availability from travelerPricing if available
    const travelerPricing = seat.travelerPricing?.[0]
    const availability = travelerPricing?.seatAvailabilityStatus || seat.availability

    if (availability === 'OCCUPIED') {
      return 'bg-gray-300 border-gray-400 cursor-not-allowed'
    }
    if (availability === 'BLOCKED') {
      return 'bg-red-300 border-red-400 cursor-not-allowed'
    }
    if (isSelected) {
      return 'bg-primary border-primary text-white cursor-pointer'
    }
    
    // Different styling for available seats based on characteristics codes
    // New API codes: W (window), A (aisle), C (center), CH (chargeable), LS (leg space), RS (restricted), etc.
    const codes = seat.characteristicsCodes || []
    
    if (codes.includes('W') || codes.includes('WINDOW')) {
      return 'bg-blue-200 border-blue-400 hover:bg-blue-300 cursor-pointer'
    }
    if (codes.includes('E') || codes.includes('IE') || codes.includes('LS') || codes.includes('EXIT') || codes.includes('EXTRA_LEG_ROOM')) {
      return 'bg-purple-200 border-purple-400 hover:bg-purple-300 cursor-pointer'
    }
    if (codes.includes('RS') || codes.includes('RESTRICTED')) {
      return 'bg-orange-200 border-orange-400 hover:bg-orange-300 cursor-pointer'
    }
    if (codes.includes('1A_AQC_PREMIUM_SEAT')) {
      return 'bg-teal-200 border-teal-400 hover:bg-teal-300 cursor-pointer'
    }
    
    return 'bg-green-200 border-green-400 hover:bg-green-300 cursor-pointer'
  }

  const getSeatIcon = (seat: Seat) => {
    const codes = seat.characteristicsCodes || []
    
    // Window seat
    if (codes.includes('W') || codes.includes('WINDOW')) {
      return 'fa-window-maximize'
    }
    // Aisle seat
    if (codes.includes('A') || codes.includes('AISLE')) {
      return 'fa-exchange'
    }
    // Center seat
    if (codes.includes('C') || codes.includes('CENTER')) {
      return 'fa-columns'
    }
    // Exit/Extra leg room
    if (codes.includes('E') || codes.includes('IE') || codes.includes('LS') || codes.includes('EXIT') || codes.includes('EXTRA_LEG_ROOM')) {
      return 'fa-door-open'
    }
    // Restricted
    if (codes.includes('RS') || codes.includes('RESTRICTED')) {
      return 'fa-ban'
    }
    // Premium seat
    if (codes.includes('1A_AQC_PREMIUM_SEAT')) {
      return 'fa-star'
    }
    // Chargeable
    if (codes.includes('CH')) {
      return 'fa-dollar-sign'
    }
    return 'fa-chair'
  }

  const getSeatPrice = (seat: Seat): { total: number; currency: string } | undefined => {
    // First check traveler pricing
    if (seat.travelerPricing?.[0]?.price) {
      return {
        total: parseFloat(seat.travelerPricing[0].price!.total),
        currency: seat.travelerPricing[0].price!.currency
      }
    }
    // Then check direct price
    if (seat.price) {
      return seat.price
    }
    return undefined
  }

  // Get all decks
  const decks = seatMap?.decks || []
  const currentDeck = decks[activeDeck]

  // Helper to extract row number from seat
  const getSeatRow = (seat: Seat): number => {
    if (seat.row !== undefined) return seat.row
    // Derive row from seat number (e.g., "12A" -> 12)
    const match = seat.number.match(/^(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Helper to extract column from seat
  const getSeatColumn = (seat: Seat): string => {
    if (seat.column) return seat.column
    // Derive column from seat number (e.g., "12A" -> "A")
    const match = seat.number.match(/\D+$/)
    return match ? match[0] : ''
  }

  // Group seats by row
  const seatsByRow = useMemo(() => {
    if (!currentDeck?.seats) return {}
    
    const grouped: { [key: number]: Seat[] } = {}
    currentDeck.seats.forEach(seat => {
      const row = getSeatRow(seat)
      const col = getSeatColumn(seat)
      // Add derived properties to seat
      const seatWithMeta = { ...seat, row, column: col }
      
      if (!grouped[row]) {
        grouped[row] = []
      }
      grouped[row].push(seatWithMeta)
    })
    return grouped
  }, [currentDeck])

  const rows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b)

  // Get aircraft info for display
  const aircraftInfo = useMemo(() => {
    if (!seatMap?.aircraft) return 'Avión'
    
    const aircraftNames: Record<string, string> = {
      '320': 'Airbus A320',
      '321': 'Airbus A321',
      '319': 'Airbus A319',
      '737': 'Boeing 737',
      '757': 'Boeing 757',
      '767': 'Boeing 767',
      '777': 'Boeing 777',
      '787': 'Boeing 787',
      'E190': 'Embraer E190',
      'E195': 'Embraer E195'
    }
    return aircraftNames[seatMap.aircraft.code] || `Avión ${seatMap.aircraft.code}`
  }, [seatMap?.aircraft])

  // Get amenities for display
  const amenities = seatMap?.aircraftCabinAmenities

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <i className="fa fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p className="text-gray-600">Cargando mapa de asientos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <i className="fa fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchSeatMap}
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!seatMap || decks.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-center text-gray-600">No hay información de asientos disponible</p>
      </div>
    )
  }

  // Get unique columns for grid layout
  const columns = currentDeck?.seats 
    ? [...new Set(currentDeck.seats.map(s => getSeatColumn(s)))].sort()
    : ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Selecciona tus asientos - {aircraftInfo}
        </h3>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>
            {seatMap.departure?.iataCode} → {seatMap.arrival?.iataCode}
            {seatMap.number && ` • Vuelo ${seatMap.carrierCode}${seatMap.number}`}
          </p>
          <p>
            Has seleccionado {selectedSeats.length} de {passengers} asiento{passengers !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Deck selector */}
      {decks.length > 1 && (
        <div className="mb-4 flex gap-2">
          {decks.map((deck, index) => (
            <button
              key={index}
              onClick={() => setActiveDeck(index)}
              className={`px-3 py-1 rounded text-sm ${
                activeDeck === index 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {deck.deckType === 'MAIN' ? 'Cubierta Principal' : 
               deck.deckType === 'UPPER' ? 'Cubierta Superior' : 
               deck.deckType === 'LOWER' ? 'Cubierta Inferior' : `Cubierta ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Amenities info */}
      {amenities && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
          <div className="flex flex-wrap gap-4">
            {amenities.power && (
              <span className="flex items-center gap-1">
                <i className="fa fa-plug" /> 
                {amenities.power.isChargeable ? 'Pago' : 'Gratis'} • 
                {amenities.power.powerType === 'PLUG' ? 'Enchufe' : 
                 amenities.power.powerType === 'USB_PORT' ? 'USB' : 'Enchufe + USB'}
              </span>
            )}
            {amenities.wifi && (
              <span className="flex items-center gap-1">
                <i className="fa fa-wifi" /> 
                WiFi {amenities.wifi.isChargeable ? '(Pago)' : '(Gratis)'}
              </span>
            )}
            {amenities.food && (
              <span className="flex items-center gap-1">
                <i className="fa fa-utensils" /> 
                Comida {amenities.food.isChargeable ? '(Pago)' : '(Gratis)'}
              </span>
            )}
            {amenities.beverage && (
              <span className="flex items-center gap-1">
                <i className="fa fa-glass-water" /> 
                Bebidas {amenities.beverage.isChargeable ? '(Pago)' : '(Gratis)'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-200 border border-green-400 rounded-sm inline-block" />
          Estándar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-200 border border-blue-400 rounded-sm inline-block" />
          Ventana
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-purple-200 border border-purple-400 rounded-sm inline-block" />
          Extra / Salida
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-primary border border-primary rounded-sm inline-block" />
          Seleccionado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-300 border border-gray-400 rounded-sm inline-block" />
          Ocupado
        </span>
      </div>

      {/* Seat Map */}
      <div className="bg-white p-4 rounded border overflow-x-auto">
        {/* Aircraft nose */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 rounded-full px-6 py-2 text-xs text-blue-600">
            <i className="fa fa-plane" /> {seatMap.departure?.terminal ? `Terminal ${seatMap.departure.terminal}` : 'Cabina del piloto'}
          </div>
        </div>

        {/* Wings indicator */}
        {currentDeck?.deckConfiguration?.startWingsX && (
          <div className="relative h-4 mb-2 mx-8">
            <div className="absolute left-0 right-0 h-2 bg-gray-300 rounded top-1"
              style={{
                left: `${((currentDeck.deckConfiguration.startWingsX - 1) / (currentDeck.deckConfiguration.length || 30)) * 100}%`,
                right: `${(1 - (currentDeck.deckConfiguration.endWingsX || currentDeck.deckConfiguration.startWingsX) / (currentDeck.deckConfiguration.length || 30)) * 100}%`
              }}
            />
          </div>
        )}

        {/* Seats */}
        <div className="space-y-1">
          {rows.map(row => (
            <div key={row} className="flex items-center justify-center gap-1">
              {/* Row number */}
              <span className="w-6 text-xs text-gray-500 text-right">{row}</span>

              {/* Seats */}
              {columns.map(column => {
                const seat = seatsByRow[row]?.find(s => s.column === column)
                if (!seat) {
                  return <span key={column} className="w-8 h-8" />
                }
                
                return (
                  <button
                    key={seat.number}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.availability !== 'AVAILABLE'}
                    className={`w-8 h-8 text-xs border rounded-sm flex items-center justify-center transition-colors ${getSeatClass(seat)}`}
                    title={`${seat.number} - ${seat.characteristicsCodes?.join(', ') || 'Asiento'}${getSeatPrice(seat) ? ` (${getSeatPrice(seat)!.total} ${getSeatPrice(seat)!.currency})` : ''}`}
                  >
                    <i className={`fa ${getSeatIcon(seat)} text-xs`} />
                  </button>
                )
              })}

              {/* Row number (right side) */}
              <span className="w-6 text-xs text-gray-500 text-left">{row}</span>
            </div>
          ))}
        </div>

        {/* Aisle indicators */}
        {columns.length > 3 && (
          <div className="flex justify-center mt-4 text-xs text-gray-500">
            <span>Pasillo →</span>
          </div>
        )}
      </div>

      {/* Available seats counter */}
      {seatMap.availableSeatsCounters && seatMap.availableSeatsCounters.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Asientos disponibles: {seatMap.availableSeatsCounters[0]?.value || 'N/A'}
        </div>
      )}

      {/* Selected seats summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold text-sm mb-2">Asientos seleccionados:</h4>
          <div className="space-y-1">
            {selectedSeats.map(seat => (
              <div key={seat.number} className="flex justify-between text-sm">
                <span>
                  Asiento {seat.number}
                  {seat.characteristicsCodes?.includes('WINDOW') && ' (Ventana)'}
                  {seat.characteristicsCodes?.includes('EXIT') && ' (Salida/Emergency)'}
                  {seat.characteristicsCodes?.includes('EXTRA_LEG_ROOM') && ' (Piernas extras)'}
                </span>
                {getSeatPrice(seat) && (
                  <span className="font-semibold">
                    {getSeatPrice(seat)!.total} {getSeatPrice(seat)!.currency}
                  </span>
                )}
              </div>
            ))}
          </div>
          {selectedSeats.some(s => getSeatPrice(s)) && (
            <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
              <span>Total asientos:</span>
              <span>
                {selectedSeats.reduce((sum, s) => sum + (getSeatPrice(s)?.total || 0), 0)} EUR
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
