/**
 * HolidaySearchForm — Formulario de búsqueda de paquetes vacacionales
 */
import { useState, type FormEvent } from 'react';
import DatePicker from '../ui/DatePicker';
import CounterField from '../ui/CounterField';

interface HolidaySearchFormProps {
  onSearch?: (data: {
    from: string;
    to: string;
    checkin: Date | null;
    checkout: Date | null;
  }) => void;
}

export default function HolidaySearchForm({ onSearch }: HolidaySearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [board, setBoard] = useState('Seleccionar');
  
  // Responsive: mobile=2 cols (50%/50%), sm=2 cols, lg=3 cols
  const col6 = 'w-1/2 px-1 sm:px-2';
  const col4 = 'w-full sm:w-1/2 lg:w-1/3 px-2';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.({ from, to, checkin, checkout });
  };

  return (
    <div className="tab-bg">
      <h2>Reserva Paquetes Vacacionales</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className={col6}><div className="input2"><span>Ciudad de origen</span><input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="Ingresa tu ciudad"/></div></div>
          <div className={col6}><div className="input2"><span>Ciudad/País de destino</span><input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Ingresa ciudad o país"/></div></div>
        </div>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className={col6}><DatePicker label="Entrada" value={checkin} onChange={setCheckin} placeholder="Check-in"/></div>
          <div className={col6}><DatePicker label="Salida" value={checkout} onChange={setCheckout} placeholder="Check-out" minDate={checkin || new Date()} alignRight/></div>
        </div>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Huéspedes" value={guests} min={1} max={20} onChange={setGuests}/></div>
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Habitaciones" value={rooms} min={1} max={10} onChange={setRooms}/></div>
          <div className="w-1/3 px-1 sm:px-2">
            <div className="input2"><span>Régimen</span>
              <select value={board} onChange={e => setBoard(e.target.value)}>
                {['Seleccionar', 'Todo Incluido', 'Desayuno', 'Media Pensión', 'Solo Alojamiento'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button className="search-btn" type="submit"><i className="fa fa-search"/> Buscar Paquetes</button>
      </form>
    </div>
  );
}
