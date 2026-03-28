/**
 * HotelSearchForm — Formulario de búsqueda de hoteles
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../ui/DatePicker';
import CounterField from '../ui/CounterField';

interface HotelSearchFormProps {
  onSearch?: (data: {
    dest: string;
    checkin: Date | null;
    checkout: Date | null;
    guests: number;
    rooms: number;
    board: string;
  }) => void;
}

export default function HotelSearchForm({ onSearch }: HotelSearchFormProps) {
  const navigate = useNavigate();
  const [dest, setDest] = useState('');
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [board, setBoard] = useState('Seleccionar');
  
  // Responsive: mobile=2 cols (50%/50%), sm=2 cols, lg=3 cols
  // Para móviles: Entrada/Salida lado a lado (50% cada uno)
  const col6 = 'w-1/2 px-1 sm:px-2';
  const col4 = 'w-full sm:w-1/2 lg:w-1/3 px-2';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Si hay onSearch, llamarlo (para uso en otras páginas)
    if (onSearch) {
      onSearch?.({ dest, checkin, checkout, guests, rooms, board });
      return;
    }
    
    // Por defecto, navegar a la página de hoteles
    const params = new URLSearchParams();
    if (dest) params.append('destination', dest);
    if (checkin) {
      const checkinDate = checkin instanceof Date ? checkin.toISOString().split('T')[0] : checkin;
      params.append('checkin', checkinDate);
    }
    if (checkout) {
      const checkoutDate = checkout instanceof Date ? checkout.toISOString().split('T')[0] : checkout;
      params.append('checkout', checkoutDate);
    }
    params.append('guests', String(guests));
    
    navigate(`/hoteles?${params.toString()}`);
  };

  return (
    <div className="tab-bg">
      <h2>Reserva Hoteles, Resorts y Alojamientos</h2>
      <form onSubmit={handleSubmit}>
        <div className="input2"><span>Buscar ofertas de hoteles</span>
          <input type="text" value={dest} onChange={e => setDest(e.target.value)} placeholder="Ingresa destino o nombre del hotel"/>
        </div>
        <div className="flex flex-wrap -mx-2">
          <div className={col6}><DatePicker label="Entrada" value={checkin} onChange={setCheckin} placeholder="Check-in"/></div>
          <div className={col6}><DatePicker label="Salida" value={checkout} onChange={setCheckout} placeholder="Check-out" minDate={checkin || new Date()} alignRight/></div>
        </div>
        {/* Huéspedes y Habitaciones en móvil: 3 en una fila */}
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Huéspedes" value={guests} min={1} max={20} onChange={setGuests}/></div>
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Habitaciones" value={rooms} min={1} max={10} onChange={setRooms}/></div>
          <div className="w-1/3 px-1 sm:px-2">
            <div className="input2"><span>Régimen</span>
              <select value={board} onChange={e => setBoard(e.target.value)}>
                {['Seleccionar', 'Todo Incluido', 'Desayuno', 'Media Pensión', 'Pensión Completa', 'Solo Alojamiento'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button className="search-btn" type="submit"><i className="fa fa-search"/> Buscar Hoteles</button>
      </form>
    </div>
  );
}
