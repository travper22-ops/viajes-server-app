/**
 * Footer — Réplica exacta del HTML original
 * 100% Font Awesome
 */
import { Link } from 'react-router-dom';

interface FooterLink {
  to: string;
  icon: string;
  label: string;
}

interface SocialLink {
  icon: string;
  href: string;
  color: string;
}

const COLS: FooterLink[][] = [
  [
    { to: '/vuelos',     icon: 'fa-plane',       label: 'Vuelos'          },
    { to: '/hoteles',    icon: 'fa-building',    label: 'Hoteles'         },
    { to: '/destinos',   icon: 'fa-map-marker',  label: 'Destinos'        },
    { to: '/vacaciones', icon: 'fa-anchor',      label: 'Vacaciones'      },
    { to: '/autobuses',  icon: 'fa-bus',         label: 'Autobús'         },
    { to: '/traslados',  icon: 'fa-home',        label: 'Taxi'            },
  ],
  [
    { to: '/sobre-nosotros', icon: 'fa-institution', label: 'Sobre Nosotros' },
    { to: '/contacto',      icon: 'fa-phone',       label: 'Contáctanos'   },
    { to: '/empleo',        icon: 'fa-user-secret', label: 'Empleos'       },
    { to: '/blog',          icon: 'fa-wordpress',   label: 'Blog'          },
    { to: '/coming-soon',   icon: 'fa-share',       label: 'Nuestra Historia' },
  ],
  [
    { to: '/coming-soon',   icon: 'fa-question',  label: "'FAQ's"         },
    { to: '/coming-soon',   icon: 'fa-laptop',   label: 'Próximamente'   },
    { to: '/mantenimiento', icon: 'fa-desktop',  label: 'Mantenimiento'  },
    { to: '/404-error',     icon: 'fa-info',     label: '404 Error'      },
  ],
];

const SOCIAL: { icon: string; href: string; color: string; bg: string }[] = [
  { icon: 'fa-brands fa-whatsapp',  href: '#!', color: '#fff', bg: '#25D366' },
  { icon: 'fa-brands fa-facebook-f', href: '#!', color: '#fff', bg: '#1877F2' },
  { icon: 'fa-brands fa-instagram',  href: '#!', color: '#fff', bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
  { icon: 'fa-brands fa-youtube',    href: '#!', color: '#fff', bg: '#FF0000' },
  { icon: 'fa-brands fa-tiktok',     href: '#!', color: '#fff', bg: '#000000' },
];

export default function Footer() {
  return (
    <footer>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

          {/* Links útiles */}
          <div className="lg:col-span-5 w-full">
            <h2>Enlaces Útiles</h2>
            <div className="flink grid grid-cols-1 sm:grid-cols-3 gap-4">
              {COLS.map((col, ci) => (
                <div key={ci}>
                  {col.map(l => (
                    <Link key={l.to + l.label} to={l.to}>
                      <i className={`fa ${l.icon}`}/>{l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sobre nosotros */}
          <div className="lg:col-span-4 w-full">
            <h2>Sobre Viajes y Experiencias</h2>
            <p>Descubre el mundo con Viajes y Experiencias. Somos líderes en soluciones de viaje, ofreciendo reservas de vuelos, hoteles, paquetes vacacionales y más. Nuestro compromiso es proporcionarte la mejor experiencia de viaje con precios competitivos y un servicio excepcional.</p>
            <p>Con años de experiencia en la industria turística, hemos ayudado a miles de viajeros a cumplir sus sueños.</p>
            <Link to="/sobre-nosotros" className="read">Leer Más</Link>
          </div>

          {/* Contacto */}
          <div className="lg:col-span-3 w-full">
            <h2>Información de Contacto</h2>
            <h4><i className="fa fa-phone" style={{ width: 18 }}/> +34 912 345 678</h4>
            <h5><i className="fa fa-clock-o" style={{ width: 18 }}/> (07:30 - 23:59 Hrs, Lun - Vie)</h5>
            <h6><i className="fa fa-envelope-o" style={{ width: 18 }}/> info@viajesyexperiencias.es</h6>
            <h6><i className="fa fa-map-marker" style={{ width: 18 }}/> Calle Gran Vía 28, 28013 Madrid</h6>
            <div className="social">
              {SOCIAL.map(s => {
                let className = 'social-';
                if (s.icon.includes('whatsapp')) className += 'whatsapp';
                else if (s.icon.includes('facebook')) className += 'facebook';
                else if (s.icon.includes('instagram')) className += 'instagram';
                else if (s.icon.includes('youtube')) className += 'youtube';
                else if (s.icon.includes('tiktok')) className += 'tiktok';
                
                return (
                  <a 
                    key={s.icon} 
                    href={s.href} 
                    className={className}
                    title={s.icon.split('-')[2]?.charAt(0).toUpperCase() + s.icon.split('-')[2]?.slice(1) || 'Social'}
                  >
                    <i className={`fa ${s.icon}`}/>
                  </a>
                );
              })}
            </div>
            <div className="back-to-top">
              <Link to="/">Inicio</Link> | <a href="#body">Volver Arriba <i className="fa fa-long-arrow-up"/></a>
            </div>
          </div>
        </div>
      </div>

      <div className="payment">
        <span>Aceptamos</span>
        <img 
          src="/img/payment.png" 
          alt="Métodos de pago" 
          className="payment-img"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.style.display = 'none';
          }}
        />
      </div>

      <div className="copy">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <span>© 2024 Viajes y Experiencias. Todos los derechos reservados.</span>
          <span>Diseñado por <a className="designedby" href="#!">Tu Agencia</a></span>
        </div>
      </div>
    </footer>
  );
}
