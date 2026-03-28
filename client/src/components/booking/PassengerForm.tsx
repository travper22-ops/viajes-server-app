/**
 * PassengerForm — datos de cada viajero
 * Props:
 *   index      : número del viajero (empieza en 1)
 *   seatLabel  : etiqueta del asiento
 *   onChange   : callback con los datos actualizados (objeto completo)
 *   isContact  : si es true, el nombre se usa también como contacto principal
 */
import { useState } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import DatePicker from '../ui/DatePicker'

const genderOptions = ['Hombre', 'Mujer', 'Prefiero no decirlo']

interface PassengerData {
  name: string
  birthDate: string   // ISO string YYYY-MM-DD
  id: string
  nationality: string
  gender: string
}

interface PassengerFormProps {
  index?: number
  seatLabel?: string
  onChange?: (data: PassengerData) => void
  isContact?: boolean
}

export default function PassengerForm({ index = 1, seatLabel, onChange, isContact = false }: PassengerFormProps) {
  const [data, setData] = useState<PassengerData>({
    name: '', birthDate: '', id: '', nationality: '', gender: ''
  })
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null)

  const update = (field: keyof PassengerData, value: string) => {
    const updated = { ...data, [field]: value }
    setData(updated)
    onChange?.(updated)
  }

  const handleBirthDate = (date: Date | null) => {
    setBirthDateObj(date)
    const iso = date ? date.toISOString().split('T')[0] : ''
    update('birthDate', iso)
  }

  // Fecha máxima: hoy (no puede nacer en el futuro)
  const maxDate = new Date()

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index}
        </span>
        <h3 className="font-bold text-gray-700 font-poppins text-sm">
          Viajero {index}
          {isContact && <span className="ml-2 text-xs font-normal text-primary">(Contacto principal)</span>}
        </h3>
        {seatLabel && (
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Asiento {seatLabel}
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Nombre — ocupa 2 columnas */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Input
              label="Nombre completo"
              placeholder="Nombre y apellidos"
              value={data.name}
              onChange={e => update('name', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, color:'#6b7280', textTransform:'uppercase', fontWeight:600, marginBottom:4 }}>
              Fecha de nacimiento
            </label>
            <DatePicker
              value={birthDateObj}
              onChange={handleBirthDate}
              placeholder="dd/mm/yyyy"
              maxDate={maxDate}
              allowPast={true}
              defaultYear={new Date().getFullYear()}
            />
          </div>
          <Input
            label="DNI / Pasaporte"
            placeholder="12345678A"
            value={data.id}
            onChange={e => update('id', e.target.value)}
          />
          <Input
            label="Nacionalidad"
            placeholder="Española"
            value={data.nationality}
            onChange={e => update('nationality', e.target.value)}
          />
          <Select
            label="Género"
            options={genderOptions}
            onChange={e => update('gender', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
