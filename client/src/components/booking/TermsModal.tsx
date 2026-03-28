import { useState } from 'react'
import { X, Check, FileText, Shield } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  title?: string
}

export default function TermsModal({ isOpen, onClose, onAccept, title = 'Terminos y Condiciones' }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState('terms')
  const [accepted, setAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  if (!isOpen) return null

  const handleAccept = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Only accept if both checkboxes are checked
    if (accepted && privacyAccepted) {
      // Llamar al callback de aceptación
      if (onAccept) {
        onAccept()
      }
      // Cerrar el modal
      onClose()
    }
  }

  const allAccepted = accepted && privacyAccepted

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 flex flex-col"
        style={{ maxHeight: '70dvh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Términos y Privacidad</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 transition-colors ${
              activeTab === 'terms' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Terminos y Condiciones</span>
            <span className="sm:hidden">Terminos</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 transition-colors ${
              activeTab === 'privacy' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Politica de Privacidad</span>
            <span className="sm:hidden">Privacidad</span>
          </button>
        </div>

        {/* Content */}
        <div className="terms-content flex-1 overflow-y-auto p-4 md:p-6 overscroll-contain"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {activeTab === 'terms' ? (
            <div className="prose prose-sm max-w-none text-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">1. Introduccion</h3>
              <p className="mb-3 text-xs md:text-sm">
                Bienvenido a Travel Agency. Estos Terminos y Condiciones establecen el acuerdo legal entre 
                usted ("el Cliente") y Travel Agency ("la Empresa") para la reserva de servicios turisticos.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">2. Reserva y Pago</h3>
              <p className="mb-3 text-xs md:text-sm">
                Al realizar una reserva a traves de nuestra plataforma, usted acepta pagar el total indicado 
                incluyendo impuestos y tasas. Los precios mostrados pueden variar y estan sujetos a cambios 
                hasta la confirmacion del pago.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">3. Politica de Cancelacion</h3>
              <p className="mb-2 text-xs md:text-sm">
                Las cancelaciones deben realizarse con al menos 48 horas de antelacion para obtener un reembolso 
                completo. Las cancelaciones realizadas con menos de 48 horas pueden estar sujetas a cargos por 
                cancelacion de hasta el 50% del valor de la reserva.
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-xs md:text-sm">
                <li>Cancelacion +48h antes: Reembolso completo</li>
                <li>Cancelacion 24-48h antes: Reembolso del 50%</li>
                <li>Cancelacion menos de 24h: Sin reembolso</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">4. Documentacion de Viaje</h3>
              <p className="mb-3 text-xs md:text-sm">
                Es responsabilidad del Cliente verificar y obtener todos los documentos de viaje necesarios, 
                incluyendo pasaportes, visas y certificados de vaccinacion. La Empresa no se hace responsable 
                de problemas de documentacion.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">5. Limitacion de Responsabilidad</h3>
              <p className="mb-3 text-xs md:text-sm">
                La Empresa actua como intermediario entre el Cliente y los proveedores de servicios 
                (aerolineas, hoteles, etc.). No somos responsables de actos fortuitos, retrasos, perdidas 
                o danos causados por terceros.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">6. Contacto</h3>
              <p className="mb-3 text-xs md:text-sm">
                Para cualquier consulta sobre estos terminos, puede contactarnos en:
                <br />Email: soporte@travelagency.com
                <br />Telefono: +34 900 XXX XXX
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">1. Responsable del Tratamiento</h3>
              <p className="mb-3 text-xs md:text-sm">
                Travel Agency es el responsable del tratamiento de sus datos personales conforme al RGPD.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">2. Datos que Recopilamos</h3>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-xs md:text-sm">
                <li>Nombre completo y datos de contacto (email, telefono)</li>
                <li>Datos de pago y facturacion</li>
                <li>Documentos de viaje (pasaporte, DNI)</li>
                <li>Preferencias de viaje e historial de reservas</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">3. Finalidad del Tratamiento</h3>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-xs md:text-sm">
                <li>Gestion y tramitacion de reservas</li>
                <li>Comunicacion sobre el estado de sus reservas</li>
                <li>Atencion al cliente y soporte</li>
                <li>Envio de ofertas y promociones (con su consentimiento)</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">4. Base Legal</h3>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-xs md:text-sm">
                <li>Ejecucion del contrato de reserva (Art. 6.1.b RGPD)</li>
                <li>Cumplimiento de obligaciones legales (Art. 6.1.c RGPD)</li>
                <li>Consentimiento para comunicaciones comerciales (Art. 6.1.a RGPD)</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">5. Destinatarios</h3>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-xs md:text-sm">
                <li>Aerolineas, hoteles y proveedores de servicios</li>
                <li>Entidades financieras para procesamiento de pagos</li>
                <li>Autoridades cuando sea requerido por ley</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">6. Derechos</h3>
              <p className="mb-3 text-xs md:text-sm">
                Puede ejercer sus derechos de acceso, rectificacion, supresion y portabilidad 
                dirigiendose a soporte@travelagency.com.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {/* Checkboxes en una sola fila compacta */}
          <div className="flex flex-col gap-2 mb-3">
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                id="terms-accept"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-xs text-gray-600">He leído y acepto los Términos y Condiciones</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                id="privacy-accept"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-xs text-gray-600">He leído y acepto la Política de Privacidad</span>
            </label>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={!allAccepted}
              className={`px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm ${
                allAccepted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-3 h-3 flex-shrink-0" />
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
