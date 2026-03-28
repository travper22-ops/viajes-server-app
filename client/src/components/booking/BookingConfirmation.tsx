/**
 * BookingConfirmation — pantalla de éxito post-pago
 * Muestra resumen, botón descarga PDF, info de email.
 * Se usa dentro del PaymentModal y también como página standalone.
 */
import { useRef } from 'react'
import type { BookingSummary } from './PaymentModal'

interface Props {
  summary: BookingSummary
  paymentData: any
  bankDetails?: any
  onClose?: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }
function nowStr() {
  const d = new Date()
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function BookingConfirmation({ summary, paymentData, bankDetails, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const isPending = paymentData?.method === 'bank_transfer'
  const isDemo    = paymentData?.id?.startsWith('demo_')

  const handleDownloadPDF = () => {
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Reserva ${summary.bookingRef}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 700px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #003580; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 22px; font-weight: 900; color: #003580; }
        .ref { font-size: 13px; color: #666; text-align: right; }
        .ref strong { font-size: 20px; color: #003580; display: block; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
        .badge.ok { background: #dcfce7; color: #166534; }
        .badge.pending { background: #fef9c3; color: #854d0e; }
        h2 { font-size: 16px; color: #003580; margin: 20px 0 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        td { padding: 7px 4px; border-bottom: 1px solid #f3f4f6; }
        td:first-child { color: #6b7280; width: 40%; }
        td:last-child { font-weight: 600; }
        .total-row td { font-size: 16px; font-weight: 900; color: #003580; border-top: 2px solid #003580; padding-top: 12px; }
        .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .bank-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px; }
      </style>
      </head><body>
      <div class="header">
        <div class="logo">✈ Viajes y Experiencias</div>
        <div class="ref">Referencia de reserva<strong>${summary.bookingRef}</strong>${nowStr()}</div>
      </div>
      <span class="badge ${isPending ? 'pending' : 'ok'}">${isPending ? '⏳ Pendiente de pago' : '✅ Pago confirmado'}</span>
      <h2>Detalles de la reserva</h2>
      <table>
        <tr><td>Tipo</td><td>${summary.title}</td></tr>
        ${summary.subtitle ? `<tr><td>Descripción</td><td>${summary.subtitle}</td></tr>` : ''}
        ${Object.entries(summary.details).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        ${summary.passengers ? `<tr><td>Pasajeros</td><td>${summary.passengers}</td></tr>` : ''}
      </table>
      <h2>Datos del cliente</h2>
      <table>
        <tr><td>Nombre</td><td>${summary.customerName}</td></tr>
        <tr><td>Email</td><td>${summary.customerEmail}</td></tr>
      </table>
      <h2>Pago</h2>
      <table>
        <tr><td>Método</td><td>${paymentData?.method === 'paypal' ? 'PayPal' : paymentData?.method === 'bank_transfer' ? 'Transferencia bancaria' : 'Tarjeta de crédito/débito'}</td></tr>
        <tr><td>Estado</td><td>${isPending ? 'Pendiente de transferencia' : 'Pagado'}</td></tr>
        ${paymentData?.id && !isDemo ? `<tr><td>ID transacción</td><td>${paymentData.id}</td></tr>` : ''}
        <tr class="total-row"><td>Total</td><td>${summary.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${summary.currency}</td></tr>
      </table>
      ${bankDetails ? `
      <h2>Datos para la transferencia</h2>
      <div class="bank-box">
        <table>
          <tr><td>Banco</td><td>${bankDetails.bankName}</td></tr>
          <tr><td>IBAN</td><td>${bankDetails.IBAN}</td></tr>
          <tr><td>BIC/SWIFT</td><td>${bankDetails.BIC}</td></tr>
          <tr><td>Importe</td><td>${bankDetails.amount} ${bankDetails.currency}</td></tr>
          <tr><td>Concepto (obligatorio)</td><td><strong>${bankDetails.reference}</strong></td></tr>
          ${bankDetails.expiryHours ? `<tr><td>Plazo</td><td>${bankDetails.expiryHours} horas</td></tr>` : ''}
        </table>
      </div>` : ''}
      <div class="footer">
        Este documento es el comprobante de tu reserva. Guárdalo para cualquier consulta.<br/>
        Viajes y Experiencias · ${summary.customerEmail}
      </div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return (
    <div ref={printRef} className="p-6">
      {/* Icono estado */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isPending ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <i className={`fa text-4xl ${isPending ? 'fa-clock text-yellow-500' : 'fa-circle-check text-green-500'}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 font-poppins">
          {isPending ? 'Reserva registrada' : '¡Pago completado!'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isPending
            ? 'Completa la transferencia para confirmar tu reserva'
            : 'Tu reserva está confirmada. Recibirás un email de confirmación.'}
        </p>
      </div>

      {/* Referencia */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center mb-5">
        <p className="text-xs text-gray-500 mb-1">Referencia de reserva</p>
        <p className="text-3xl font-mono font-bold text-primary tracking-wider">{summary.bookingRef}</p>
        <p className="text-xs text-gray-400 mt-1">{nowStr()}</p>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
        <p className="font-bold text-gray-700 text-sm mb-2">{summary.title}</p>
        {Object.entries(summary.details).map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium text-gray-700">{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-bold text-primary border-t border-gray-200 pt-2 mt-2">
          <span>Total pagado</span>
          <span>{summary.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {summary.currency}</span>
        </div>
      </div>

      {/* Datos bancarios si es transferencia */}
      {bankDetails && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
          <p className="font-bold text-yellow-800 text-sm mb-3 flex items-center gap-2">
            <i className="fa fa-building-columns" /> Datos para la transferencia
          </p>
          <div className="space-y-1.5 text-sm">
            {[['Banco', bankDetails.bankName], ['IBAN', bankDetails.IBAN], ['BIC/SWIFT', bankDetails.BIC],
              ['Importe', `${bankDetails.amount} ${bankDetails.currency}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-yellow-700">{k}</span>
                <span className="font-mono font-semibold text-yellow-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between bg-yellow-100 rounded-lg px-3 py-2 mt-2">
              <span className="text-yellow-700 font-semibold">Concepto (obligatorio)</span>
              <span className="font-mono font-bold text-yellow-900">{bankDetails.reference}</span>
            </div>
            {bankDetails.expiryHours && (
              <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                <i className="fa fa-clock" /> Plazo: {bankDetails.expiryHours}h para realizar la transferencia
              </p>
            )}
          </div>
        </div>
      )}

      {/* Email info */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
        <i className="fa fa-envelope text-blue-500 text-lg flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Confirmación enviada a</p>
          <p className="text-sm text-blue-600">{summary.customerEmail}</p>
          {!isPending && <p className="text-xs text-blue-400 mt-0.5">El itinerario completo llegará en las próximas 72h</p>}
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleDownloadPDF}
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
          <i className="fa fa-file-pdf" /> Descargar comprobante PDF
        </button>
        {onClose && (
          <button onClick={onClose}
            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
            <i className="fa fa-list" /> Ver mis reservas
          </button>
        )}
      </div>
    </div>
  )
}
