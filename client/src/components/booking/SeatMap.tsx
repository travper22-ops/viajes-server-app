/**
 * SeatMap — mapa de asientos interactivo para autobús
 *
 * Props:
 *   totalSeats  : number              (default 40)
 *   occupiedSeats: Array<number>      (asientos ocupados)
 *   maxSelect   : number              (máximo seleccionables, default 4)
 *   onSelect    : function(seats[])
 */
import { useState } from 'react'

export default function SeatMap({
  totalSeats   = 40,
  occupiedSeats = [3, 7, 12, 15, 18, 22, 25, 28, 33],
  maxSelect    = 4,
  onSelect,
}) {
  const [selected, setSelected] = useState([])

  const toggle = (n) => {
    if (occupiedSeats.includes(n)) return
    setSelected(prev => {
      const next = prev.includes(n)
        ? prev.filter(s => s !== n)
        : prev.length < maxSelect ? [...prev, n] : prev
      onSelect?.(next)
      return next
    })
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Legend */}
      <div className="flex gap-4 text-xs mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-200 border border-green-400 rounded-sm inline-block" /> Disponible
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-primary border border-primary rounded-sm inline-block" /> Seleccionado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-300 border border-gray-400 rounded-sm inline-block" /> Ocupado
        </span>
      </div>

      {/* Bus front label */}
      <div className="flex flex-col items-center">
        <div className="bg-gray-300 rounded-lg px-6 py-2 text-xs text-gray-600 mb-4">
          <i className="fa fa-bus"/> Frente del autobús
        </div>

        {/* Seat grid */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 2rem)' }}>
          {Array.from({ length: totalSeats }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              title={`Asiento ${n}`}
              className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                occupiedSeats.includes(n)
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : selected.includes(n)
                  ? 'bg-primary text-white'
                  : 'bg-green-200 text-green-700 hover:bg-green-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selected.length > 0 && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          Seleccionados: <strong>{selected.join(', ')}</strong>
        </p>
      )}
    </div>
  )
}
