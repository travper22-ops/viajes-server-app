/**
 * Cloudflare Turnstile CAPTCHA component
 * En desarrollo usa la test key oficial (siempre pasa).
 * En producción usa VITE_TURNSTILE_SITE_KEY del .env
 */
import { useEffect, useRef, useState } from 'react'

// Test key oficial de Cloudflare — funciona en cualquier dominio, siempre verifica OK
const DEV_KEY  = '1x00000000000000000000AA'
const PROD_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACja9tlfKDiFTC2e'
const SITE_KEY = import.meta.env.DEV ? DEV_KEY : PROD_KEY

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

export default function Turnstile({ onVerify, onError, theme = 'light' }: TurnstileProps) {
  const ref      = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const render = () => {
      if (!window.turnstile || !ref.current) return
      if (widgetId.current !== null) return
      try {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme,
          callback: onVerify,
          'error-callback': () => {
            // En caso de error (dominio no configurado, etc.), bypass automático
            console.warn('Turnstile error — captcha omitido automáticamente')
            onVerify('bypass-error')
            setFailed(true)
          },
          'expired-callback': () => {
            onError?.()
            widgetId.current = null
          },
        })
      } catch (e) {
        console.warn('Turnstile render error:', e)
        onVerify('bypass-render-error')
        setFailed(true)
      }
    }

    if (window.turnstile) {
      render()
    } else {
      // Evitar cargar el script dos veces
      if (!document.querySelector('script[src*="turnstile"]')) {
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true
        script.onload = render
        script.onerror = () => {
          // Si el script no carga (sin internet, bloqueado), saltamos el captcha
          console.warn('Turnstile no pudo cargar — captcha omitido')
          onVerify('bypass-no-script')
          setFailed(true)
        }
        document.head.appendChild(script)
      } else {
        // Script ya en DOM, esperar a que cargue
        timeout = setTimeout(() => {
          if (window.turnstile) {
            render()
          } else {
            // Script en DOM pero no cargó — bypass
            console.warn('Turnstile timeout — captcha omitido')
            onVerify('bypass-timeout')
            setFailed(true)
          }
        }, 2000)
      }
    }

    return () => {
      clearTimeout(timeout)
      if (widgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId.current) } catch {}
        widgetId.current = null
      }
    }
  }, [])

  if (failed) return null

  return <div ref={ref} className="my-3" />
}
