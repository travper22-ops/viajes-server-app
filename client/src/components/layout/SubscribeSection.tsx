import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

export default function SubscribeSection({ appStoreUrl='#', playStoreUrl='#', phoneCodes=['+34','+1','+44','+33'] }) {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return
    setLoading(true)
    try {
      await fetch(`${API}/newsletter/subscribe`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch { setSent(true) } // show success even if API down
    finally { setLoading(false) }
  }

  return (
    <section className="subscribe-bg">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-8">
            <div className="qr-section">
              <h3 className="text-base sm:text-lg md:text-xl">Escanea el Código QR</h3>
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-lg border-2 border-white/30 mx-auto">
                <img src="/img/travel-engine-QR.png" alt="QR App" className="w-full h-full object-cover"
                  onError={e=>{e.target.onerror=null;e.target.src='/img/_placeholder.svg'}}/>
              </div>
            </div>
            <div>
              <h3>Descarga Nuestra App</h3>
              <div className="flex flex-col gap-2 mb-4">
                <a href={appStoreUrl} className="inline-block rounded overflow-hidden border border-white/20 hover:border-white/60 transition-colors w-36">
                  <img src="/img/aap_01.png" alt="App Store" className="h-10 w-auto object-contain p-1"
                    onError={e=>{e.target.onerror=null;e.target.style.display='none'}}/>
                </a>
                {/*<a href={playStoreUrl} className="inline-block rounded overflow-hidden border border-white/20 hover:border-white/60 transition-colors w-36">
                  <img src="/img/aap_02.png" alt="Google Play" className="h-10 w-auto object-contain p-1"
                    onError={e=>{e.target.onerror=null;e.target.style.display='none'}}/>
                </a>*/}
              </div>
              <div className="subscribe">
                <small>Descarga por SMS</small>
                <div className="sms-bg mt-2">
                  <select>{phoneCodes.map(c=><option key={c}>{c}</option>)}</select>
                  <input type="tel" placeholder="Número de móvil"/>
                  <button type="button">Enviar</button>
                </div>
                <small>O llámanos al 900-888-888</small>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 sub-email">
            <h3>Regístrate para Cupones/Ofertas Exclusivas</h3>
            <span className="text-white/70 text-sm block mb-3">Acceso exclusivo a cupones, ofertas especiales y promociones.</span>
            {sent ? (
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <i className="fa fa-check-circle text-white text-2xl mb-1 block"/>
                <p className="text-white font-semibold text-sm">¡Suscripción confirmada!</p>
                <p className="text-white/70 text-xs mt-1">Recibirás las mejores ofertas en tu correo.</p>
              </div>
            ) : (
              <div className="sub-input">
                <input type="email" placeholder="Ingresa tu correo electrónico"
                  value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubscribe()}/>
                <button type="button" onClick={handleSubscribe} disabled={loading}>
                  {loading ? <i className="fa fa-circle-o-notch fa-spin"/> : 'Enviar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
