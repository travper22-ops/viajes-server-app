/**
 * TaxiSearchForm — Formulario de búsqueda de taxis/traslados
 */
import { useState, type FormEvent } from 'react';
import DatePicker from '../ui/DatePicker';

interface TaxiSearchFormProps {
  onSearch?: (data: {
    from: string;
    to: string;
    depDate: Date | null;
    retDate: Date | null;
  }) => void;
}

export default function TaxiSearchForm({ onSearch }: TaxiSearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depDate, setDepDate] = useState<Date | null>(null);
  const [retDate, setRetDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  
  // Responsive: mobile=2 cols (50%/50%), sm=2 cols
  const col6 = 'w-1/2 px-1 sm:px-2';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.({ from, to, depDate, retDate });
  };

  return (
    <div className="tab-bg">
      <h2>Reserva Traslados Baratos para más de 900+ ciudades</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className={col6}>
            <div className="input"><span>Origen</span><div style={{position:'relative'}}><i className="fa fa-map-marker input-icon"/><input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="Ciudad"/></div></div>
          </div>
          <div className={col6}>
            <div className="input"><span>Destino</span><div style={{position:'relative'}}><i className="fa fa-map-marker input-icon"/><input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Ciudad"/></div></div>
          </div>
          <div className={col6}><DatePicker label="Salida" value={depDate} onChange={setDepDate} placeholder="Fecha de salida"/></div>
          <div className={col6}><DatePicker label="Regreso" value={retDate} onChange={setRetDate} placeholder="Fecha de regreso" alignRight/></div>
          <div className={col6}>
            <div className="input2"><span>Hora de Recogida</span><input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}/></div>
          </div>
          <div className={col6}>
            <div className="input2"><span>Hora de Llegada</span><input type="time" value={dropoffTime} onChange={e => setDropoffTime(e.target.value)}/></div>
          </div>
        </div>
        <button className="search-btn" type="submit"><i className="fa fa-search"/> Buscar Taxi</button>
      </form>
    </div>
  );
}
