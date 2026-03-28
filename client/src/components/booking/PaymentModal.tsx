/**
 * PaymentModal — ventana flotante de pago
 * Incluye: selector EUR/USD, Stripe card, PayPal, transferencia.
 */
import { useState, useEffect, useRef } from 'react'
import BookingConfirmation from './BookingConfirmation'

declare global { interface Window { Stripe: any } }

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || ''
const API       = import.meta.env.VITE_API_URL    || 'http://localhost:5002/api/v1'

// Tasas de cambio aproximadas (fallback si el servidor no responde)
const USD_TO_EUR = 0.92
const EUR_TO_USD = 1.09

// Carga Stripe.js una sola vez y resuelve cuando window.Stripe esté listo
let _stripePromise: Promise<any> | null = null
function loadStripe(): Promise<any> {
  if (_stripePromise) return _stripePromise
  _stripePromise = new Promise(resolve => {
    // Ya cargado
    if (window.Stripe) { resolve(window.Stripe); return }

    const waitForStripe = (timeoutMs: number) => {
      const t = setInterval(() => { if (window.Stripe) { clearInterval(t); resolve(window.Stripe) } }, 100)
      setTimeout(() => { clearInterval(t); resolve(window.Stripe || null) }, timeoutMs)
    }

    // Script ya en el DOM — esperar
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]')
    if (existing) { waitForStripe(15000); return }

    // Inyectar script nuevo
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.async = true
    s.onload  = () => {
      if (window.Stripe) resolve(window.Stripe)
      else waitForStripe(5000) // esperar hasta 5s más tras onload
    }
    s.onerror = () => resolve(null)
    document.head.appendChild(s)
  })
  return _stripePromise
}

export interface BookingSummary {
  type: 'flight' | 'hotel' | 'transfer' | 'bus'
  title: string
  subtitle?: string
  details: Record<string, string>
  amount: number
  currency: string
  bookingRef: string
  customerEmail: string
  customerName: string
  passengers?: number
}

interface PaymentModalProps {
  open: boolean
  summary: BookingSummary
  onClose: () => void
  onSuccess: (paymentData: any) => void
  onConfirmClose?: () => void
}

const TABS = [
  { label: 'Tarjeta',       icon: 'fa-credit-card',      color: '#003580' },
  { label: 'PayPal',        icon: 'fa-brands fa-paypal', color: '#0070ba' },
  { label: 'Transferencia', icon: 'fa-building-columns', color: '#6b7280' },
]

export default function PaymentModal({ open, summary, onClose, onSuccess, onConfirmClose }: PaymentModalProps) {
  const [tab,           setTab]           = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [stripeReady,   setStripeReady]   = useState(false)
  const [stripeError,   setStripeError]   = useState(false)
  const [error,         setError]         = useState('')
  const [cardName,      setCardName]      = useState('')
  const [paid,          setPaid]          = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [bankDetails,   setBankDetails]   = useState<any>(null)
  // Selector de moneda
  const [currency,      setCurrency]      = useState<'EUR' | 'USD'>(
    summary.currency?.toUpperCase() === 'USD' ? 'USD' : 'EUR'
  )

  const stripeRef = useRef<any>(null)
  const cardRef   = useRef<HTMLDivElement>(null)
  const cardElem  = useRef<any>(null)

  // Calcular monto en la moneda seleccionada
  const baseAmount = summary.amount
  const baseCurrency = summary.currency?.toUpperCase() || 'EUR'
  const displayAmount = (() => {
    if (currency === baseCurrency) return baseAmount
    if (currency === 'USD') return Math.round(baseAmount * EUR_TO_USD * 100) / 100
    return Math.round(baseAmount * USD_TO_EUR * 100) / 100
  })()
  const amountFmt = `${displayAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency}`

  // Montar card element cuando el tab de tarjeta está visible y Stripe está listo
  const mountCard = (StripeClass: any) => {
    if (!StripeClass) { setStripeError(true); return }
    if (!stripeRef.current) stripeRef.current = StripeClass(STRIPE_PK)
    // Reusar card element si ya existe
    if (!cardElem.current) {
      cardElem.current = stripeRef.current.elements().create('card', {
        style: {
          base: { fontSize: '16px', color: '#1a1a1a', fontFamily: 'Inter, system-ui, sans-serif', '::placeholder': { color: '#9ca3af' }, iconColor: '#003580' },
          invalid: { color: '#dc2626' },
          complete: { color: '#16a34a' },
        },
        hidePostalCode: true,
      })
    }
    let attempts = 0
    const tryMount = () => {
      if (cardRef.current && cardElem.current) {
        try { cardElem.current.mount(cardRef.current); setStripeReady(true) }
        catch { /* ya montado */ setStripeReady(true) }
      } else if (attempts++ < 40) {
        setTimeout(tryMount, 100)
      } else {
        setStripeError(true)
      }
    }
    tryMount()
  }

  // Cargar Stripe cuando el modal se abre
  useEffect(() => {
    if (!open) return
    if (!STRIPE_PK) { setStripeReady(true); return }
    setStripeError(false)
    loadStripe().then(mountCard)
    return () => {
      cardElem.current?.unmount?.()
      cardElem.current = null
      stripeRef.current = null
      setStripeReady(false)
      _stripePromise = null
    }
  }, [open])

  // Remontar card cuando el usuario vuelve al tab de tarjeta
  useEffect(() => {
    if (!open || tab !== 0 || !STRIPE_PK) return
    if (stripeReady) return // ya montado
    loadStripe().then(mountCard)
  }, [tab, open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const authHeader = { Authorization: `Bearer ${localStorage.getItem('ta_token') || ''}` }
  const jsonHeaders = { 'Content-Type': 'application/json', ...authHeader }

  const handleCardPay = async () => {
    if (!STRIPE_PK) { handleDemoPay(); return }
    if (!stripeRef.current || !cardElem.current) { setError('Stripe no está listo, espera un momento'); return }
    if (!cardName.trim()) { setError('Ingresa el nombre del titular'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/create-intent`, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({
          amount: displayAmount,
          currency: currency.toLowerCase(),
          bookingRef: summary.bookingRef,
          customerEmail: summary.customerEmail,
          description: summary.title
        }),
      })
      const res = await r.json()
      const clientSecret = res.data?.clientSecret || res.clientSecret
      if (!clientSecret) throw new Error(res.error?.message || 'No se pudo iniciar el pago')
      const { error: stripeErr, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElem.current, billing_details: { name: cardName, email: summary.customerEmail } },
      })
      if (stripeErr) throw new Error(stripeErr.message)
      handleSuccess({ ...paymentIntent, method: 'card' })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDemoPay = async () => {
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 1200))
    handleSuccess({ id: 'demo_' + Date.now(), status: 'succeeded', method: 'card_demo' })
    setLoading(false)
  }

  const handlePayPalPay = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/paypal/create-order`, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({ amount: displayAmount, currency, bookingId: summary.bookingRef }),
      })
      const data = await r.json()
      if (!data.success) throw new Error(data.error?.message || 'Error PayPal')
      const cap = await (await fetch(`${API}/payment/paypal/capture`, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({ orderId: data.orderId, bookingId: summary.bookingRef }),
      })).json()
      if (!cap.success) throw new Error('Error al capturar pago PayPal')
      handleSuccess({ id: data.orderId, status: 'succeeded', method: 'paypal' })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleBankTransfer = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/payment/bank-transfer/create`, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({ amount: displayAmount, currency, bookingId: summary.bookingRef, customerEmail: summary.customerEmail }),
      })
      const data = await r.json()
      if (!data.success) throw new Error(data.error?.message || 'Error transferencia')
      setBankDetails(data.bankDetails)
      handleSuccess({ id: data.bankDetails?.reference, status: 'pending', method: 'bank_transfer' })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleSuccess = (paymentData: any) => {
    setPaymentResult(paymentData)
    setPaid(true)
    onSuccess(paymentData)
  }

  // ── Confirmación ─────────────────────────────────────────────
  if (paid && paymentResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className="payment-modal-inner bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <BookingConfirmation summary={summary} paymentData={paymentResult} bankDetails={bankDetails} onClose={onConfirmClose || onClose} />
        </div>
      </div>
    )
  }

  // ── Modal ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="payment-modal-inner bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <i className="fa fa-lock text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Pago seguro</p>
              <p className="text-xs text-gray-400">Cifrado SSL · PCI DSS</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fa fa-xmark" />
          </button>
        </div>

        {/* Resumen */}
        <div className="mx-6 mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{summary.title}</p>
              {summary.subtitle && <p className="text-xs text-gray-500 mt-0.5">{summary.subtitle}</p>}
              <div className="mt-2 space-y-0.5">
                {Object.entries(summary.details).map(([k, v]) => (
                  <p key={k} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{k}:</span> {v}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-primary">{amountFmt}</p>
              <p className="text-xs text-gray-400">Total a pagar</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
            <i className="fa fa-envelope text-gray-400 text-xs" />
            <p className="text-xs text-gray-500">
              Confirmación a: <span className="font-medium text-gray-700">{summary.customerEmail}</span>
            </p>
          </div>
        </div>

        {/* Selector de moneda */}
        <div className="mx-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Moneda de pago</p>
          <div className="flex gap-2">
            {(['EUR', 'USD'] as const).map(c => (
              <button key={c} type="button" onClick={() => setCurrency(c)}
                className={[
                  'flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2',
                  currency === c
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                ].join(' ')}>
                <span>{c === 'EUR' ? '€' : '$'}</span>
                <span>{c}</span>
                {c !== baseCurrency && (
                  <span className="text-xs font-normal opacity-60">
                    ≈ {c === 'USD'
                      ? `${(baseAmount * EUR_TO_USD).toFixed(2)}`
                      : `${(baseAmount * USD_TO_EUR).toFixed(2)}`}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs método de pago */}
        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {TABS.map((t, i) => (
              <button key={t.label} type="button" onClick={() => setTab(i)}
                className={[
                  'flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-xs font-semibold',
                  tab === i ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                ].join(' ')}>
                <i className={`fa ${t.icon} text-lg`} style={{ color: tab === i ? t.color : undefined }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del tab */}
        <div className="px-6 mt-5 pb-6">

          {/* Tarjeta */}
          <div style={{ display: tab === 0 ? 'block' : 'none' }} className="space-y-4">
            {stripeError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center space-y-3">
                <i className="fa fa-triangle-exclamation text-xl block" />
                <p>No se pudo cargar el formulario de tarjeta.</p>
                <button onClick={() => { _stripePromise = null; setStripeError(false); setStripeReady(false); loadStripe().then(mountCard) }}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <i className="fa fa-rotate-right mr-1" /> Reintentar
                </button>
                <p className="text-xs text-gray-500">O usa PayPal / Transferencia bancaria</p>
              </div>
            )}
            {!stripeReady && !stripeError && STRIPE_PK && (
              <div className="flex flex-col items-center gap-3 text-gray-400 py-8">
                <i className="fa fa-spinner fa-spin text-primary text-2xl" />
                <span className="text-sm">Cargando formulario seguro…</span>
              </div>
            )}
            {/* Formulario — siempre en DOM, visible solo cuando listo */}
            <div style={{ display: stripeReady && !stripeError ? 'block' : 'none' }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Nombre del titular *
                </label>
                <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Número de tarjeta
                </label>
                <div className="border-2 border-gray-200 rounded-xl px-4 py-4 bg-white focus-within:border-primary transition-colors" style={{ minHeight: 56 }}>
                  {/* cardRef siempre en DOM — Stripe necesita un elemento visible */}
                  <div ref={cardRef} style={{ minHeight: 24 }} />
                </div>
              </div>
            </div>
          </div>

          {/* PayPal */}
          {tab === 1 && (
            <div className="border-2 border-blue-100 rounded-xl p-5 bg-blue-50 text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-brands fa-paypal text-white text-2xl" />
              </div>
              <p className="font-bold text-blue-800 mb-1">Pagar con PayPal</p>
              <p className="text-sm text-blue-600">Completa el pago de forma segura con tu cuenta PayPal.</p>
            </div>
          )}

          {/* Transferencia */}
          {tab === 2 && (
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
              <p className="font-semibold text-gray-700 text-sm mb-1">Transferencia bancaria</p>
              <p className="text-xs text-gray-500">Recibirás los datos bancarios al confirmar. Plazo: 2–48h laborables.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex gap-2">
              <i className="fa fa-circle-exclamation mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón pagar */}
          <div className="mt-5">
            {tab === 0 && (
              <button type="button" onClick={handleCardPay}
                disabled={loading || (!!STRIPE_PK && !stripeReady && !stripeError)}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20 transition-all">
                {loading
                  ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
                  : <><i className="fa fa-lock" /> Pagar {amountFmt}{!STRIPE_PK && <span className="text-xs opacity-70"> (Demo)</span>}</>}
              </button>
            )}
            {tab === 1 && (
              <button type="button" onClick={handlePayPalPay} disabled={loading}
                className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg transition-all"
                style={{ backgroundColor: '#0070ba' }}>
                {loading
                  ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
                  : <><i className="fa fa-brands fa-paypal" /> Pagar {amountFmt} con PayPal</>}
              </button>
            )}
            {tab === 2 && (
              <button type="button" onClick={handleBankTransfer} disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg transition-all">
                {loading
                  ? <><i className="fa fa-spinner fa-spin" /> Procesando…</>
                  : <><i className="fa fa-building-columns" /> Solicitar datos de transferencia</>}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <i className="fa fa-shield-halved text-green-500" /> Pago 100% seguro · No almacenamos datos de tarjeta
          </p>
        </div>
      </div>
    </div>
  )
}
