/**
 * BaggageInfo — Información de equipaje incluido en el vuelo
 *
 * Props:
 *   flightOfferId: string (ID de la oferta de vuelo)
 */
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

interface BaggageAllowance {
  quantityIncluded: number
  size: string
  weight?: number
  weightUnit?: string
}

interface BaggageInfoProps {
  flightOfferId: string
}

export default function BaggageInfo({ flightOfferId }: BaggageInfoProps) {
  const [baggage, setBaggage] = useState<BaggageAllowance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBaggageInfo()
  }, [flightOfferId])

  const fetchBaggageInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API}/baggage/flights/${flightOfferId}`)
      if (!response.ok) {
        throw new Error('Error cargando información de equipaje')
      }
      const data = await response.json()
      if (data.success) {
        setBaggage(data.data || [])
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getBaggageIcon = (size: string) => {
    switch (size.toLowerCase()) {
      case 'small':
        return 'fa-suitcase-rolling'
      case 'medium':
        return 'fa-suitcase'
      case 'large':
        return 'fa-suitcase'
      default:
        return 'fa-suitcase'
    }
  }

  const getBaggageDescription = (item: BaggageAllowance) => {
    const quantity = item.quantityIncluded > 1 ? `${item.quantityIncluded} x ` : ''
    const weight = item.weight ? `${item.weight} ${item.weightUnit}` : ''
    const size = item.size.toLowerCase()

    return `${quantity}${size} suitcase${item.quantityIncluded > 1 ? 's' : ''}${weight ? ` (${weight})` : ''}`
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center py-4">
          <i className="fa fa-spinner fa-spin text-xl text-gray-400 mb-2"></i>
          <p className="text-gray-600 text-sm">Cargando información de equipaje...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center py-4">
          <i className="fa fa-exclamation-triangle text-xl text-red-400 mb-2"></i>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!baggage || baggage.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center py-4">
          <i className="fa fa-info-circle text-xl text-blue-400 mb-2"></i>
          <p className="text-gray-600 text-sm">Información de equipaje no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <i className="fa fa-suitcase text-primary"></i>
        Equipaje incluido
      </h3>

      <div className="space-y-3">
        {baggage.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
            <div className="flex-shrink-0">
              <i className={`fa ${getBaggageIcon(item.size)} text-2xl text-primary`}></i>
            </div>
            <div className="flex-grow">
              <p className="font-medium text-gray-900 capitalize">
                {getBaggageDescription(item)}
              </p>
              <p className="text-sm text-gray-600">
                Equipaje de mano y facturado incluido en el precio
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <i className="fa fa-info-circle text-blue-500 mt-0.5"></i>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Información importante</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Dimensiones máximas: 55x40x20 cm para equipaje de mano</li>
              <li>• Peso máximo por maleta: según la aerolínea</li>
              <li>• Equipaje adicional puede tener costo extra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}