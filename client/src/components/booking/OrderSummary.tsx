import { Link } from 'react-router-dom'

export default function OrderSummary({ lines = [], total = 0, ctaLabel = 'Confirmar y Pagar', backTo, backLabel, onCta, ctaDisabled }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 sticky top-20 sm:top-4">
      <h3 className="font-bold font-poppins text-gray-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
        <i className="fa fa-receipt text-primary text-sm"/> Resumen del pedido
      </h3>
      <div className="space-y-2 mb-4">
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>{l.label}</span>
            <span className="font-medium">{parseFloat(l.amount).toFixed(0)}€</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 mb-5 flex justify-between items-center">
        <span className="font-bold text-gray-800">Total</span>
        <span className="text-2xl font-bold text-primary font-poppins">{parseFloat(total).toFixed(0)}€</span>
      </div>

      <div className="space-y-2 text-xs text-gray-500 mb-5">
        <div className="flex items-center gap-2"><i className="fa fa-lock text-green-500"/>Pago 100% seguro</div>
        <div className="flex items-center gap-2"><i className="fa fa-shield text-blue-500"/>Protección al comprador</div>
        <div className="flex items-center gap-2"><i className="fa fa-headphones text-primary"/>Soporte 24/7</div>
      </div>

      {onCta ? (
        <button onClick={onCta} disabled={ctaDisabled}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-3">
          <i className="fa fa-credit-card"/>{ctaLabel}
        </button>
      ) : (
        <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-xl mb-3 cursor-default">
          {ctaLabel}
        </button>
      )}
      {backTo && (
        <Link to={backTo} className="block text-center text-gray-400 hover:text-gray-600 text-sm transition-colors">
          {backLabel || '← Volver'}
        </Link>
      )}
    </div>
  )
}
