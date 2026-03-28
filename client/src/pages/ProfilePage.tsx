import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import { useAuth } from '../context/AuthContext'
import DatePicker from '../components/ui/DatePicker'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1'

export default function ProfilePage() {
  const { user, logout, token, isLoggedIn, updateUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: ''
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    travelReminders: true,
    newsletter: false
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('profile') // profile | security | preferences

  useEffect(() => {
    if (!isLoggedIn) { 
      navigate('/login'); 
      return 
    }
    fetchProfile()
  }, [isLoggedIn])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API}/users/profile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (response.ok && data.profile) {
        setProfile({
          firstName: data.profile.first_name || '',
          lastName: data.profile.last_name || '',
          email: data.user?.email || '',
          phone: data.profile.phone || '',
          dateOfBirth: data.profile.date_of_birth || '',
          nationality: data.profile.nationality || '',
          passportNumber: data.profile.passport_number || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Usar datos del contexto si falla
      if (user) {
        setProfile(prev => ({ ...prev, email: user.email }))
      }
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const response = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          nationality: profile.nationality,
          passportNumber: profile.passportNumber
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setErr(data.error || 'Error al guardar perfil')
      }
    } catch(e) { 
      setErr(e.message) 
    }
    finally { setLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErr('')
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErr('Las contraseñas no coinciden')
      return
    }
    
    if (passwords.newPassword.length < 6) {
      setErr('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API}/users/password`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaved(true)
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSaved(false), 3000)
      } else {
        setErr(data.error || 'Error al cambiar contraseña')
      }
    } catch(e) { 
      setErr(e.message) 
    }
    finally { setLoading(false) }
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/users/preferences`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailNotifications: preferences.emailNotifications,
          travelReminders: preferences.travelReminders,
          newsletter: preferences.newsletter
        })
      })
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch(e) { 
      console.error('Error saving preferences:', e)
    }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { 
    await logout(); 
    navigate('/') 
  }

  const userName = `${profile.firstName} ${profile.lastName}`.trim() || user?.email?.split('@')[0] || 'Usuario'

  if (!user) return null

  const TABS = [
    { id:'profile',     label:'Mi perfil',     icon:'fa-user' },
    { id:'security',    label:'Seguridad',      icon:'fa-lock' },
    { id:'preferences', label:'Preferencias',   icon:'fa-sliders' },
  ]

  return (
    <div id="body">
      <MobileNav/><Header/>
      <PageBanner title="Mi cuenta" breadcrumbs={[{to:'/',icon:'fa-home',label:'Inicio'},{label:'Mi perfil'}]}/>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-blue-800 p-6 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-3xl font-bold">
                  {userName[0]?.toUpperCase()||'U'}
                </div>
                <h3 className="font-bold text-white font-poppins">{userName}</h3>
                <p className="text-white/70 text-xs mt-1">{profile.email || user.email}</p>
                <span className="inline-block mt-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full capitalize">{user.role || 'usuario'}</span>
              </div>
              <nav className="p-2">
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${tab===t.id?'bg-primary/10 text-primary':'text-gray-600 hover:bg-gray-50'}`}>
                    <i className={`fa ${t.icon} w-4 text-center`}/>{t.label}
                  </button>
                ))}
                <Link to="/mis-reservas"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <i className="fa fa-ticket w-4 text-center"/>Mis reservas
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100">
                  <i className="fa fa-right-from-bracket w-4 text-center"/>Cerrar sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">

            {tab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 font-poppins text-lg mb-6">Información personal</h2>
                {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{err}</div>}
                {saved && <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><i className="fa fa-check-circle"/>Cambios guardados correctamente</div>}
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre</label>
                      <div className="relative">
                        <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                        <input type="text" value={profile.firstName} onChange={e=>setProfile(p=>({...p, firstName: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                          placeholder="Tu nombre"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Apellidos</label>
                      <div className="relative">
                        <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                        <input type="text" value={profile.lastName} onChange={e=>setProfile(p=>({...p, lastName: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                          placeholder="Tus apellidos"/>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <div className="relative">
                      <i className="fa fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                      <input type="email" value={profile.email} disabled
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-gray-50 text-gray-500"
                        placeholder="tu@email.com"/>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">El email no se puede modificar</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono</label>
                    <div className="relative">
                      <i className="fa fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                      <input type="tel" value={profile.phone} onChange={e=>setProfile(p=>({...p, phone: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="+34 600 000 000"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de nacimiento</label>
                      <DatePicker
                        value={profile.dateOfBirth ? new Date(profile.dateOfBirth) : null}
                        onChange={d => setProfile(p=>({...p, dateOfBirth: d ? d.toISOString().split('T')[0] : ''}))}
                        placeholder="dd/mm/yyyy"
                        allowPast
                        className="profile-datepicker"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Nacionalidad</label>
                      <input type="text" value={profile.nationality} onChange={e=>setProfile(p=>({...p, nationality: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="Española"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Número de pasaporte</label>
                    <input type="text" value={profile.passportNumber} onChange={e=>setProfile(p=>({...p, passportNumber: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="Número de pasaporte"/>
                  </div>
                  <button type="submit" disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
                    {loading ? <><i className="fa fa-circle-o-notch fa-spin"/>Guardando...</> : <><i className="fa fa-floppy-o"/>Guardar cambios</>}
                  </button>
                </form>
              </div>
            )}

            {tab === 'security' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 font-poppins text-lg mb-6">Seguridad de la cuenta</h2>
                {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{err}</div>}
                {saved && <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><i className="fa fa-check-circle"/>Contraseña actualizada</div>}
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña actual</label>
                    <div className="relative">
                      <i className="fa fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                      <input type="password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p, currentPassword: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="••••••••"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <i className="fa fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                      <input type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p, newPassword: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="••••••••"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Confirmar nueva contraseña</label>
                    <div className="relative">
                      <i className="fa fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                      <input type="password" value={passwords.confirmPassword} onChange={e=>setPasswords(p=>({...p, confirmPassword: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="••••••••"/>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
                    {loading ? <><i className="fa fa-circle-o-notch fa-spin"/>Cambiando...</> : <><i className="fa fa-key"/>Cambiar contraseña</>}
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fa fa-mobile-screen text-green-500 text-lg"/>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Verificación en 2 pasos</p>
                        <p className="text-gray-500 text-xs">No activada</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">Próximamente</span>
                  </div>
                </div>
              </div>
            )}

            {tab === 'preferences' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 font-poppins text-lg mb-6">Preferencias</h2>
                {saved && <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><i className="fa fa-check-circle"/>Preferencias guardadas</div>}
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label:'Ofertas y promociones por email', sub:'Recibe las mejores ofertas semanales', defaultOn:true },
                    { key: 'travelReminders', label:'Recordatorios de viaje', sub:'Avisos antes de tu salida', defaultOn:true },
                    { key: 'newsletter', label:'Newsletter mensual', sub:'Inspiración y destinos del mes', defaultOn:false },
                  ].map(p=>(
                    <div key={p.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                        <p className="text-gray-500 text-xs">{p.sub}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                          checked={preferences[p.key]} 
                          onChange={e=>{
                            setPreferences(pv => ({...pv, [p.key]: e.target.checked}))
                          }}
                          className="sr-only peer"/>
                        <div className="w-10 h-6 bg-gray-300 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"/>
                      </label>
                    </div>
                  ))}
                </div>
                <button onClick={handleSavePreferences} disabled={loading}
                  className="mt-6 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
                  {loading ? <><i className="fa fa-circle-o-notch fa-spin"/>Guardando...</> : <><i className="fa fa-floppy-o"/>Guardar preferencias</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
