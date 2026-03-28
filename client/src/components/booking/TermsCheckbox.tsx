import { useState, ChangeEvent } from 'react'
import { FileText, Check } from 'lucide-react'
import TermsModal from './TermsModal'

interface TermsCheckboxProps {
  onChange?: (accepted: boolean) => void
  checked?: boolean
  required?: boolean
}

export default function TermsCheckbox({ onChange, checked: checkedProp, required = true }: TermsCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [accepted, setAccepted] = useState(checkedProp ?? false)

  const handleAccept = () => {
    setAccepted(true)
    if (onChange) onChange(true)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setAccepted(checked)
    if (onChange) onChange(checked)
    // Always show terms when checking the box
    if (checked) {
      setIsOpen(true)
    }
  }

  return (
    <>
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="terms-checkbox"
          checked={accepted}
          onChange={handleChange}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="terms-checkbox" className="text-sm text-gray-600 flex-1">
          Acepto los{' '}
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            Terminos y Condiciones
          </button>
          {' '}y la{' '}
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            Politica de Privacidad
          </button>
          {required && <span className="text-red-500"> *</span>}
        </label>
      </div>

      <TermsModal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false)
          if (!accepted) {
            setAccepted(false)
            if (onChange) onChange(false)
          }
        }}
        onAccept={() => {
          handleAccept()
          setIsOpen(false)
        }}
      />
    </>
  )
}
