/**
 * MobileNav — Barra fija inferior en móvil (réplica exacta)
 */
import { Link } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/vuelos', icon: 'fa-plane', label: 'Vuelos' },
  { to: '/hoteles', icon: 'fa-bed', label: 'Hoteles' },
  { to: '/destinos', icon: 'fa-map-marker', label: 'Destinos' },
  { to: '/vacaciones', icon: 'fa-briefcase', label: 'Vacaciones' },
  { to: '/login', icon: 'fa-user', label: 'Acceder' },
];

export default function MobileNav() {
  return (
    <div className="mob-nav">
      {NAV_ITEMS.map(item => (
        <div key={item.to} className="col-item">
          <Link to={item.to}>
            <i className={`fa ${item.icon}`} />
            <span>{item.label}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
