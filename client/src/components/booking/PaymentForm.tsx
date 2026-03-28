/**
 * PaymentForm — Stripe Elements + PayPal + Transferencia
 * - Stripe se inicializa UNA sola vez al montar (no en cada cambio de tab)
 * - El card element se mantiene en DOM, solo se oculta con CSS
 * - Sin remounting, sin doble carga de Stripe.js
 */
import { useState, useEffect, useRef } from 'react'

declare global { interface Window { Stripe: any } }

interface PaymentFormProps {
  amount?: number | string
  currency?: string
  bookingRef?: string
  customerEmail?: string
  onPaymentSuccess?: (data: any) => void
  onPaymentError?: (error: any) => void
}

interface BankDetails {
  bankName: string; IBAN: string; BIC: string; reference: string
  amount?: number | string; currency?: string; expiryHours?: number
}

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || ''
const API       = import.meta.env.VITE_API_URL    || 'http://localhost:5002/api/v1'

// Singleton — Stripe.js se carga una sola vez por página
let _stripePromise: Promise<any> | null = null
function loadStripeOnce(): Promise<any> {
  if (_stripePromise) return _stripePromise
  _stripePromise = new Promise(resolve => {
    if (window.Stripe) return resolve(window.Stripe)
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]')
    if (existing) {
      const t = setInterval(() => { if (window.Stripe) { clearInterval(t); resolve(window.Stripe) } }, 50)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.onload = () => resolve(window.Stripe)
    document.head.appendChild(s)
  })
  return _stripePromise
}

const METHODS = [
  { label: 'Tarjeta',       icon: 'fa-credit-card',      color: '#003580' },
  { label: 'PayPal',        icon: 'fa-brands fa-paypal', color: '#0070ba' },
  { label: 'Transferencia', icon: 'fa-building-columns', color: '#6b7280' },
]

export default function PaymentForm({
  amount, currency = 'EUR', bookingRef, customerEmail = '',
  onPaymentSuccess, onPaymentError,
}: PaymentFormProps) {
  const [method,         setMethod]         = useState(0)
  const [loading,        setLoading]        = useState(false)
  const [stripeReady,    setStripeReady]    = useState(false)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [bankDetails,    setBankDetails]    = useState<BankDetails | null>(null)
  const [conversionInfo, setConversionInfo] = useState<{ settlementAmount: number; settlementCurrency: string; exchangeRate: number } | null>(null)

  const stripeRef  = useRef<any>(null)
  const cardRef    = useRef<HTMLDivElement>(null)
  const cardElem   = useRef<any>(null)

  // ── Inicializar Stripe UNA sola vez al montar ──────────────────
  useEffect(() => {
    if (!STRIPE_PK) { setStripeReady(false); return }
    loadStripeOnce().then(StripeClass => {
      if (!StripeClass) return
      stripeRef.current = StripeClass(STRIPE_PK)
      const card = stripeRef.current.elements().create('card', {
        style: {
          base: { fontSize: '16px', color: '#1a1a1a', fontFamily: 'Inter, system-ui, sans-serif', '::placeholder': { color: '#9ca3af' }, iconColor: '#003580' },
          invalid: { color: '#dc2626', iconColor: '#dc2626' },
          complete: { color: '#16a34a', iconColor: '#16a34a' },
        },
        hidePostalCode: true,
      })
      cardElem.current = card
      // Montar en el div ref — esperar a que esté en DOM
      const tryMount = () => {
        if (cardRef.current) { card.mount(cardRef.current); setStripeReady(true) }
        else setTimeout(tryMount, 80)
      }
      tryMount()
    })
    return () => { cardElem.current?.unmount?.() }
  }, []) // <-- sin dependencias: solo se ejecuta al montar

  // ── Tasa de cambio ─────────────────────────────────────────────
  useEffect(() => {
    if (!amount || !currency || currency.toUpperCase() === 'EUR') return
    fetch(`${API}/payment/rates?from=${currency.toUpperCase()}&amount=${parseFloat(String(amount))}`)
      .then(r => r.json())
      .then(d => { if (d?.data?.settlementAmount) setConversionInfo(d.data) })
      .catch(() => {})
  }, [amount, currency])

  // ── Handlers ───────────────────────────────────────────────────
  const handleCardPay = async () => {
    if (!STRIPE_PK) { handleDemoPay(); return }
    if (!stripeRef.current || !cardElem.current) { setError('Stripe no está listo aún, espera un momento'); return }
    if (!cardholderName.trim()) { setError('Ingresa el nombre del titular de la tarjeta'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({ amount: parseFloat(String(amount)), currency: currency.toLowerCase(), bookingRef, customerEmail: customerEmail || undefined, description: `Reserva ${bookingRef || 'viaje'}` }),
      })
      const res = await r.json()
      const clientSecret = res.data?.clientSecret || res.clientSecret
      if (!clientSecret) throw new Error(res.data?.error?.message || res.error?.message || 'No se pudo iniciar el pago')
      if (res.data?.exchangeRate) setConversionInfo(res.data)
      const { error: stripeErr, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElem.current, billing_details: { name: cardholderName, email: customerEmail || undefined } },
      })
      if (stripeErr) throw new Error(stripeErr.message)
      setSuccess(true); onPaymentSuccess?.(paymentIntent)
    } catch (err: any) { setError(err.message); onPaymentError?.(err) }
    finally { setLoading(false) }
  }

  const handleDemoPay = async () => {
    setLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 1200))
      setSuccess(true); onPaymentSuccess?.({ id: 'demo_' + Date.now(), status: 'succeeded' })
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handlePayPalPay = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({ amount: parseFloat(String(amount)), currency: currency.toUpperCase(), bookingId: bookingRef }),
      })
      const data = await r.json()
      if (!data.success) throw new Error(data.error?.message || 'Error al crear orden PayPal')
      const capture = await (await fetch(`${API}/payment/paypal/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({ orderId: data.orderId, bookingId: bookingRef }),
      })).json()
      if (!capture.success) throw new Error('Error al capturar pago de PayPal')
      setSuccess(true); onPaymentSuccess?.({ id: data.orderId, status: 'succeeded', method: 'paypal' })
    } catch (err: any) { setError(err.message); onPaymentError?.(err) }
    finally { setLoading(false) }
  }

  const handleBankTransfer = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/bank-transfer/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` },
        body: JSON.stringify({ amount: parseFloat(String(amount)), currency: currency.toUpperCase(), bookingId: bookingRef, customerEmail: customerEmail || undefined }),
      })
      const data = await r.json()
      if (!data.success) throw new Error(data.error?.message || 'Error al generar transferencia')
      setBankDetails(data.bankDetails)
      setSuccess(true); onPaymentSuccess?.({ id: data.bankDetails.reference, status: 'pending', method: 'bank_transfer' })
    } catch (err: any) { setError(err.message); onPaymentError?.(err) }
    finally { setLoading(false) }
  }

  const amountFmt = amount
    ? `${parseFloat(String(amount)).toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
    : ''

  // ── Pantalla de éxito ──────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa fa-check text-green-600 text-2xl" />
        </div>
        <h3 className="font-bold text-green-800 text-xl mb-1">¡Pago realizado con éxito!</h3>
        {bookingRef && <p className="text-green-600 text-sm">Referencia: <span className="font-mono font-bold">{bookingRef}</span></p>}
        <p className="text-green-600 text-sm mt-2">Recibirás la confirmación en tu correo electrónico.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Título */}
      <h3 className="text-lg font-bold font-poppins text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <i className="fa fa-lock text-white text-sm" />
        </span>
        Método de Pago
      </h3>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {METHODS.map((m, i) => (
          <button key={m.label} type="button" onClick={() => setMethod(i)}
            className={[
              'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 cursor-pointer',
              method === i ? 'border-primary bg-blue-50 text-primary shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
            ].join(' ')}>
            <i className={`fa ${m.icon} text-xl`} style={{ color: method === i ? m.color : undefined }} />
            <span className="text-xs font-semibold">{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tarjeta Stripe ─────────────────────────────────────── */}
      {/* El div del card SIEMPRE está en el DOM — solo se oculta visualmente */}
      <div style={{ display: method === 0 ? 'block' : 'none' }} className="space-y-4">
        {!stripeReady && STRIPE_PK ? (
          <div className="border-2 border-gray-100 rounded-xl p-6 bg-gray-50 flex items-center gap-3 text-gray-400 text-sm">
            <i className="fa fa-spinner fa-spin text-primary text-lg" />
            <span>Cargando formulario de pago seguro…</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre del titular <span className="text-red-400">*</span>
              </label>
              <input type="text" value={cardholderName} onChange={e => setCardholderName(e.target.value)}
                placeholder="Nombre exactamente como aparece en la tarjeta"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Datos de la tarjeta</label>
              <div className="border-2 border-gray-200 rounded-xl px-4 py-4 bg-white focus-within:border-primary transition-colors" style={{ minHeight: 60 }}>
                {/* cardRef siempre montado */}
                <div ref={cardRef} style={{ minHeight: 24 }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
              <i className="fa fa-shield-halved text-green-500" />
              <span>Pago 100% seguro · Cifrado SSL · PCI DSS · Powered by Stripe</span>
            </div>
            {!STRIPE_PK && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex gap-2">
                <i className="fa fa-triangle-exclamation mt-0.5" />
                <span>Modo demo — añade <code className="font-mono bg-amber-100 px-1 rounded">VITE_STRIPE_PK</code> en <code className="font-mono bg-amber-100 px-1 rounded">.env</code> para pagos reales.</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PayPal ─────────────────────────────────────────────── */}
      {method === 1 && (
        <div className="border-2 border-blue-100 rounded-xl p-5 bg-blue-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fa fa-brands fa-paypal text-white text-lg" />
            </div>
            <div>
              <p className="font-bold text-blue-800 text-sm">Pagar con PayPal</p>
              <p className="text-blue-600 text-xs">El pago se procesa de forma segura sin salir de esta página</p>
            </div>
          </div>
          <p className="text-xs text-blue-500">Protección al comprador incluida · Pago rápido y seguro</p>
        </div>
      )}

      {/* ── Transferencia ──────────────────────────────────────── */}
      {method === 2 && (
        <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
          {bankDetails ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <i className="fa fa-check-circle text-green-500 text-xl" />
                <p className="font-bold text-green-700 text-sm">Datos bancarios generados</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-semibold text-gray-600">Banco:</span> {bankDetails.bankName}</p>
                <p><span className="font-semibold text-gray-600">IBAN:</span> <span className="font-mono text-xs">{bankDetails.IBAN}</span></p>
                <p><span className="font-semibold text-gray-600">BIC/SWIFT:</span> {bankDetails.BIC}</p>
                <p><span className="font-semibold text-gray-600">Importe:</span> {bankDetails.amount} {bankDetails.currency}</p>
                <p className="font-bold text-primary">Concepto: {bankDetails.reference}</p>
              </div>
              {bankDetails.expiryHours && (
                <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                  <i className="fa fa-clock" /> Plazo: {bankDetails.expiryHours}h para realizar la transferencia
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-700 text-sm mb-1">Transferencia bancaria</p>
              <p className="text-xs text-gray-500 mb-3">Recibirás los datos en pantalla. Confirmación en 24–48h laborables.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
                Concepto: <span className="font-bold text-gray-700">{bookingRef || 'Tu referencia de reserva'}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Conversión de moneda */}
      {conversionInfo && currency.toUpperCase() !== conversionInfo.settlementCurrency && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
          <i className="fa fa-circle-info mt-0.5 flex-shrink-0" />
          <span>
            Tu pago de <strong>{parseFloat(String(amount)).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency.toUpperCase()}</strong> se procesará como{' '}
            <strong>{conversionInfo.settlementAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {conversionInfo.settlementCurrency}</strong>{' '}
            (1 {currency.toUpperCase()} = {conversionInfo.exchangeRate.toFixed(4)} {conversionInfo.settlementCurrency})
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <i className="fa fa-circle-exclamation mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Botones */}
      <div className="mt-5">
        {method === 0 && (
          <button type="button" onClick={handleCardPay}
            disabled={loading || (!!STRIPE_PK && !stripeReady)}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/25">
            {loading
              ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
              : <><i className="fa fa-lock" /> Pagar {amountFmt}{!STRIPE_PK && <span className="text-xs opacity-70 ml-1">(Demo)</span>}</>}
          </button>
        )}
        {method === 1 && (
          <button type="button" onClick={handlePayPalPay} disabled={loading}
            className="w-full disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg"
            style={{ backgroundColor: '#0070ba' }}>
            {loading
              ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
              : <><i className="fa fa-brands fa-paypal" /> Pagar con PayPal {amountFmt}</>}
          </button>
        )}
        {method === 2 && (
          <button type="button" onClick={handleBankTransfer} disabled={loading || !!bankDetails}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg">
            {loading
              ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
              : bankDetails
                ? <><i className="fa fa-check" /> Datos generados</>
                : <><i className="fa fa-building-columns" /> Solicitar datos de transferencia</>}
          </button>
        )}
      </div>
    </div>
  )
}
