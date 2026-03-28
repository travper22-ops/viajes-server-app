/**
 * TopBar — Réplica exacta: barra azul superior con soporte, login e idioma
 * 100% Font Awesome, sin Lucide
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LANGS = ['Español','English','Deutsch','Français']

export default function TopBar({
  welcomeText = 'Bienvenido a Viajes y Experiencias',
  loginTo     = '/login',
}) {
  const { user, isLoggedIn, logout } = useAuth()
  const [langOpen, setLangOpen] = useState(false)
  const [lang,     setLang]     = useState('Español')
  const [userOpen, setUserOpen] = useState(false)

  return (
    <div className="top-bar">
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          <span style={{ fontSize:14 }}>{welcomeText}</span>

          <ul className="navbar-nav" style={{ margin:0, padding:0 }}>
            <li><a className="nav-link" href="#!">Soporte 24/7</a></li>

            {isLoggedIn ? (
              <li style={{ position:'relative' }}>
                <button onClick={()=>{setUserOpen(o=>!o);setLangOpen(false)}}
                  style={{ background:'none',border:'none',cursor:'pointer',color:'#f3f3f3',fontSize:13,padding:'0 8px',display:'flex',alignItems:'center',gap:6 }}>
                  <i className="fa fa-user-circle"/>
                  <span>{user?.name?.split(' ')[0]}</span>
                  <i className="fa fa-chevron-down" style={{fontSize:10}}/>
                </button>
                {userOpen&&(
                  <div style={{ position:'absolute',right:0,top:'100%',marginTop:4,background:'#fff',border:'1px solid #f1f1f1',borderRadius:4,minWidth:160,zIndex:999,boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
                    <Link to="/perfil" onClick={()=>setUserOpen(false)}
                      style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 15px',color:'#333',fontSize:13,borderBottom:'1px solid #f1f1f1' }}>
                      <i className="fa fa-user" style={{color:'#003580'}}/>Mi Perfil
                    </Link>
                    <Link to="/mis-reservas" onClick={()=>setUserOpen(false)}
                      style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 15px',color:'#333',fontSize:13,borderBottom:'1px solid #f1f1f1' }}>
                      <i className="fa fa-ticket" style={{color:'#003580'}}/>Mis Reservas
                    </Link>
                    <button onClick={()=>{logout();setUserOpen(false)}}
                      style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 15px',color:'#ee1d25',fontSize:13,background:'none',border:'none',cursor:'pointer',width:'100%',textAlign:'left' }}>
                      <i className="fa fa-sign-out"/>Cerrar Sesión
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li><Link className="nav-link" to={loginTo}>Iniciar Sesión o Crear Cuenta</Link></li>
            )}

            <li style={{ position:'relative' }}>
              <button onClick={()=>{setLangOpen(o=>!o);setUserOpen(false)}}
                style={{ background:'none',border:'none',cursor:'pointer',color:'#f3f3f3',fontSize:13,padding:'0 8px',display:'flex',alignItems:'center',gap:4 }}>
                {lang} <i className="fa fa-chevron-down" style={{fontSize:10}}/>
              </button>
              {langOpen&&(
                <div style={{ position:'absolute',right:0,top:'100%',marginTop:4,background:'#fff',border:'1px solid #f1f1f1',borderRadius:4,minWidth:120,zIndex:999,boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
                  {LANGS.map(l=>(
                    <button key={l} onClick={()=>{setLang(l);setLangOpen(false)}}
                      style={{ display:'block',width:'100%',textAlign:'left',padding:'10px 15px',fontSize:13,background:'none',border:'none',borderBottom:'1px solid #f1f1f1',cursor:'pointer',color:l===lang?'#003580':'#333',fontWeight:l===lang?700:400 }}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
