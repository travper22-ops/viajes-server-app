/**
 * BusSearchForm — Formulario de búsqueda de autobuses
 */
import { useState, type FormEvent } from 'react';
import DatePicker from '../ui/DatePicker';
import CounterField from '../ui/CounterField';

interface BusSearchFormProps {
  onSearch?: (data: {
    from: string;
    to: string;
    date: Date | null;
  }) => void;
}

export default function BusSearchForm({ onSearch }: BusSearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  
  // Responsive: mobile=2 cols (50%/50%), sm=2 cols, lg=3 cols
  const col6 = 'w-1/2 px-1 sm:px-2';
  const col4 = 'w-full sm:w-1/2 lg:w-1/3 px-2';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.({ from, to, date });
  };

  return (
    <div className="tab-bg">
      <h2>Reserva Billetes de Autobús en Toda España</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className={col6}>
            <div className="input"><span>Desde</span><div style={{position:'relative'}}><i className="fa fa-bus input-icon"/><input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="Ciudad o Estación"/></div></div>
          </div>
          <div className={col6}>
            <div className="input"><span>Hasta</span><div style={{position:'relative'}}><i className="fa fa-bus input-icon"/><input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Ciudad o Estación"/></div></div>
          </div>
          <div className="w-full px-1 sm:px-2">
            <DatePicker label="Fecha de Viaje" value={date} onChange={setDate} placeholder="Seleccionar fecha"/>
          </div>
        </div>
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Adultos" value={adults} min={0} max={9} onChange={setAdults}/></div>
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Niños" value={children} min={0} max={8} onChange={setChildren}/></div>
          <div className="w-1/3 px-1 sm:px-2"><CounterField label="Bebés" value={infants} min={0} max={4} onChange={setInfants}/></div>
        </div>
        <button className="search-btn" type="submit"><i className="fa fa-search"/> Buscar Autobús</button>
      </form>
    </div>
  );
}
