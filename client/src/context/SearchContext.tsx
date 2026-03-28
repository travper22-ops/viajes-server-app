/**
 * SearchContext — Estado global de búsquedas + llamadas a la API
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { 
  FlightSearchState, 
  HotelSearchState, 
  BusSearchState, 
  TaxiSearchState, 
  HolidaySearchState,
  FlightOffer,
  HotelOffer,
  Airport,
  CabinClass,
  TripType
} from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

const INITIAL_FLIGHT: FlightSearchState = { 
  from: '', 
  to: '', 
  departure: null, 
  returnDate: null, 
  adults: 1, 
  children: 0, 
  infants: 0, 
  cabinClass: 'ECONOMY', 
  tripType: 'round' 
};

const INITIAL_HOTEL: HotelSearchState = { 
  destination: '', 
  checkin: null, 
  checkout: null, 
  guests: 1, 
  rooms: 1 
};

const INITIAL_BUS: BusSearchState = { 
  from: '', 
  to: '', 
  date: null, 
  adults: 1, 
  children: 0 
};

const INITIAL_TAXI: TaxiSearchState = { 
  from: '', 
  to: '', 
  depDate: null, 
  retDate: null, 
  pickupTime: '' 
};

const INITIAL_HOLIDAY: HolidaySearchState = { 
  from: '', 
  to: '', 
  checkin: null, 
  checkout: null, 
  guests: 1, 
  rooms: 1 
};

interface SearchContextType {
  // Estados de búsqueda
  flightSearch: FlightSearchState;
  hotelSearch: HotelSearchState;
  busSearch: BusSearchState;
  taxiSearch: TaxiSearchState;
  holidaySearch: HolidaySearchState;
  
  // Resultados
  flightResults: FlightOffer[];
  hotelResults: HotelOffer[];
  busResults: any[];
  taxiResults: any[];
  holidayResults: any[];
  
  // Estado
  loading: boolean;
  error: string | null;
  currentBooking: any;
  
  // Actualizadores
  updateFlight: (params: Partial<FlightSearchState>) => void;
  updateHotel: (params: Partial<HotelSearchState>) => void;
  updateBus: (params: Partial<BusSearchState>) => void;
  updateTaxi: (params: Partial<TaxiSearchState>) => void;
  updateHoliday: (params: Partial<HolidaySearchState>) => void;
  
  // Setters para resultados
  setFlightResults: (results: FlightOffer[]) => void;
  setHotelResults: (results: HotelOffer[]) => void;
  setBusResults: (results: any[]) => void;
  setTaxiResults: (results: any[]) => void;
  setHolidayResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentBooking: (booking: any) => void;
  
  // Funciones de búsqueda
  searchFlights: (params: {
    from: string;
    to: string;
    departure: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: CabinClass;
  }) => Promise<FlightOffer[]>;
  searchHotels: (params: {
    destination: string;
    checkin: string;
    checkout: string;
    guests: number;
    rooms: number;
  }) => Promise<HotelOffer[]>;
  searchAirports: (query: string) => Promise<Airport[]>;
  resetAll: () => void;
  API: string;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [flightSearch, setFlightSearch] = useState<FlightSearchState>(INITIAL_FLIGHT);
  const [hotelSearch, setHotelSearch] = useState<HotelSearchState>(INITIAL_HOTEL);
  const [busSearch, setBusSearch] = useState<BusSearchState>(INITIAL_BUS);
  const [taxiSearch, setTaxiSearch] = useState<TaxiSearchState>(INITIAL_TAXI);
  const [holidaySearch, setHolidaySearch] = useState<HolidaySearchState>(INITIAL_HOLIDAY);

  const [flightResults, setFlightResults] = useState<FlightOffer[]>([]);
  const [hotelResults, setHotelResults] = useState<HotelOffer[]>([]);
  const [busResults, setBusResults] = useState<any[]>([]);
  const [taxiResults, setTaxiResults] = useState<any[]>([]);
  const [holidayResults, setHolidayResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  // ── Búsqueda de vuelos (Amadeus via backend) ──────────────────────────
  const searchFlights = useCallback(async (params: {
    from: string;
    to: string;
    departure: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: CabinClass;
  }): Promise<FlightOffer[]> => {
    setLoading(true);
    setError(null);
    setFlightResults([]);
    try {
      const qs = new URLSearchParams({
        from: params.from.toUpperCase(),
        to: params.to.toUpperCase(),
        departure: params.departure,
        ...(params.returnDate && { returnDate: params.returnDate }),
        adults: String(params.adults || 1),
        children: String(params.children || 0),
        infants: String(params.infants || 0),
        cabinClass: params.cabinClass || 'ECONOMY',
        maxResults: '20',
      });
      const r = await fetch(`${API}/flights/search?${qs}`);
      if (!r.ok) {
        const errorData = await r.json();
        throw new Error(errorData.error || 'Error buscando vuelos');
      }
      const data = await r.json() as { data?: FlightOffer[] };
      console.log('Flight search response:', data);
      const flights = data.data || [];
      setFlightResults(flights);
      return flights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error buscando vuelos';
      setError(errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Autocompletado de aeropuertos ─────────────────────────────────────
  const searchAirports = useCallback(async (query: string): Promise<Airport[]> => {
    if (!query || query.length < 2) return [];
    try {
      const r = await fetch(`${API}/airports/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await r.json() as { data?: Airport[] };
      return data.data || [];
    } catch {
      return [];
    }
  }, []);

  // ── Búsqueda de hoteles (placeholder hasta Amadeus Hotel API) ─────────
  const searchHotels = useCallback(async (params: {
    destination: string;
    checkin: string;
    checkout: string;
    guests: number;
    rooms: number;
  }): Promise<HotelOffer[]> => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(params as any);
      const r = await fetch(`${API}/hotels/search?${qs}`);
      const data = await r.json() as { hotels?: HotelOffer[] };
      const hotels = data.hotels || [];
      setHotelResults(hotels);
      return hotels;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error buscando hoteles';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFlight = useCallback((params: Partial<FlightSearchState>) => {
    setFlightSearch(prev => ({ ...prev, ...params }));
  }, []);

  const updateHotel = useCallback((params: Partial<HotelSearchState>) => {
    setHotelSearch(prev => ({ ...prev, ...params }));
  }, []);

  const updateBus = useCallback((params: Partial<BusSearchState>) => {
    setBusSearch(prev => ({ ...prev, ...params }));
  }, []);

  const updateTaxi = useCallback((params: Partial<TaxiSearchState>) => {
    setTaxiSearch(prev => ({ ...prev, ...params }));
  }, []);

  const updateHoliday = useCallback((params: Partial<HolidaySearchState>) => {
    setHolidaySearch(prev => ({ ...prev, ...params }));
  }, []);

  const resetAll = useCallback(() => {
    setFlightSearch(INITIAL_FLIGHT);
    setHotelSearch(INITIAL_HOTEL);
    setBusSearch(INITIAL_BUS);
    setTaxiSearch(INITIAL_TAXI);
    setHolidaySearch(INITIAL_HOLIDAY);
    setCurrentBooking(null);
  }, []);

  return (
    <SearchContext.Provider value={{
      flightSearch,
      hotelSearch,
      busSearch,
      taxiSearch,
      holidaySearch,
      updateFlight,
      updateHotel,
      updateBus,
      updateTaxi,
      updateHoliday,
      flightResults,
      setFlightResults,
      hotelResults,
      setHotelResults,
      busResults,
      setBusResults,
      taxiResults,
      setTaxiResults,
      holidayResults,
      setHolidayResults,
      loading,
      setLoading,
      error,
      setError,
      currentBooking,
      setCurrentBooking,
      searchFlights,
      searchHotels,
      searchAirports,
      resetAll,
      API,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch debe usarse dentro de <SearchProvider>');
  }
  return ctx;
}
