// ============================================
// SERVICIO DE AMADEUS - SEATMAP DISPLAY API
// ============================================
// Basado en: https://test.api.amadeus.com/v1/shopping/seatmaps
// Version: 1.9.2

import { getAmadeus } from '../config/amadeus.js';
import { seatMapsCache } from './cache.js';

// ============================================
// INTERFACES DEL SWAGGER - SEATMAP
// ============================================

// FlightEndPoint - Información de llegada/salida
export interface FlightEndPoint {
  iataCode: string;      // Código IATA (ej: JFK, LON)
  terminal?: string;     // Terminal (ej: T2)
  at: string;            // Fecha/hora en formato ISO 8601
}

// FlightSegment - Segmento de vuelo
export interface FlightSegment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;   // Código de Aerolínea (ej: AF, BA)
  number: string;        // Número de vuelo (ej: 6201)
  aircraft?: {
    code: string;        // Código IATA de aeronave (ej: 320)
  };
  operating?: {
    carrierCode: string;
    number?: string;
    suffix?: string;
  };
  duration?: string;     // Duración en formato ISO 8601 (ej: PT1H30M)
  stops?: Array<{
    iataCode: string;
    duration?: string;
    arrivalAt?: string;
    departureAt?: string;
  }>;
  id?: string;
  numberOfStops?: number;
  blacklistedInEU?: boolean;
}

// OperatingFlight - Información del vuelo operativo
export interface OperatingFlight {
  carrierCode: string;
  number?: string;
  suffix?: string;
}

// AircraftEquipment - Información de la aeronave
export interface AircraftEquipment {
  code: string;  // Código IATA (ej: 318, 320, 787)
}

// Price - Información de precio
export interface Price {
  currency: string;      // Moneda (ej: EUR, USD)
  total: string;         // Total
  base: string;          // Base sin impuestos
  fees?: Array<{
    amount: string;
    type: 'SUPPLIER' | 'TICKETING' | 'FORM_OF_PAYMENT';
  }>;
  taxes?: Array<{
    amount: string;
    code: string;
  }>;
}

// TravelerPricing - Precio por viajero
export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: 'ADULT' | 'CHILD' | 'SENIOR' | 'YOUNG' | 'HELD_INFANT' | 'SEATED_INFANT' | 'STUDENT';
  price?: Price;
  fareDetailsBySegment?: Array<{
    segmentId: string;
    cabin?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    fareBasis?: string;
    brandedFare?: string;
    class?: string;
  }>;
}

// FlightOffer - Oferta de vuelo (para POST)
export interface FlightOffer {
  type: string;
  id: string;
  source?: 'GDS';
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  lastTicketingDate?: string;
  numberOfBookableSeats?: number;
  itineraries?: Array<{
    duration?: string;
    segments: FlightSegment[];
  }>;
  price?: Price;
  pricingOptions?: {
    fareType?: string[];
    includedCheckedBagsOnly?: boolean;
  };
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
}

// Traveler - Información del pasajero
export interface Traveler {
  id: string;
  dateOfBirth: string;
  name?: {
    firstName: string;
    lastName: string;
  };
  contact?: {
    emailAddress?: string;
    phones?: Array<{
      deviceType?: string;
      number?: string;
    }>;
  };
}

// Coordinates - Coordenadas del asiento
export interface Coordinates {
  x: number;  // Coordinate for the Length
  y: number;  // Coordinate for the Width
}

// Amenity - Amenidad base
export interface Amenity {
  description?: string;
  isChargeable?: boolean;
  quantity?: number;
}

// AircraftCabinAmenities_Power - Amenidades de poder
export interface AircraftCabinAmenities_Power extends Amenity {
  powerType?: 'PLUG' | 'USB_PORT' | 'ADAPTOR' | 'PLUG_OR_USB_PORT';
  usbType?: 'USB_A' | 'USB_C' | 'USB_A_AND_USB_C';
}

// AircraftCabinAmenities_Wifi - Amenidades de WiFi
export interface AircraftCabinAmenities_Wifi extends Amenity {
  wifiType?: 'WIFI' | 'WIFI_AND_MOBILE';
  connectivityType?: 'AIR_TO_GROUND' | 'SATELLITE';
  wifiCoverage?: 'FULL' | 'PARTIAL';
}

// AircraftCabinAmenities_Food - Amenidades de comida
export interface AircraftCabinAmenities_Food extends Amenity {
  foodType?: 'MEAL' | 'FRESH_MEAL' | 'SNACK' | 'FRESH_SNACK';
}

// AircraftCabinAmenities_Beverage - Amenidades de bebida
export interface AircraftCabinAmenities_Beverage extends Amenity {
  beverageType?: 'ALCOHOLIC' | 'NON_ALCOHOLIC' | 'ALCOHOLIC_AND_NON_ALCOHOLIC';
}

// AircraftCabinAmenities_Entertainment - Amenidades de entretenimiento
export interface AircraftCabinAmenities_Entertainment extends Amenity {
  mediaType?: 'MUSIC' | 'VIDEO' | 'GAMES';
  entertainmentType?: 'AUDIO_VIDEO_ON_DEMAND' | 'IP_TV' | 'SCREEN';
}

// Media - Contenido multimedia
export interface Media {
  title?: string;
  href?: string;
  description?: {
    text?: string;
    lang?: string;
  };
  mediaType?: 'image' | 'video' | 'audio';
}

// AircraftCabinAmenities - Todas las amenidades de la cabina
export interface AircraftCabinAmenities {
  power?: AircraftCabinAmenities_Power;
  seat?: Amenity & {
    recline?: number;
    legRest?: boolean;
    seatDirection?: string;
    legSpace?: number;
    spaceUnit?: 'INCHES' | 'CM';
    tilt?: 'NORMAL' | 'RECLINED' | 'FLAT_BED' | 'FULL_FLAT_BED';
    medias?: Media[];
  };
  wifi?: AircraftCabinAmenities_Wifi;
  entertainment?: AircraftCabinAmenities_Entertainment[];
  food?: AircraftCabinAmenities_Food;
  beverage?: AircraftCabinAmenities_Beverage;
}

// DeckConfiguration - Configuración del deck
export interface DeckConfiguration {
  width?: number;           // Width (y-axis) of the deck
  length?: number;          // Length (x-axis) of the deck
  startSeatRow?: number;    // seat row where the deck is starting
  endSeatRow?: number;      // seat row where the deck is ending
  startWingsX?: number;     // Start x coordinate of the wings
  endWingsX?: number;       // End x coordinate of the wings
  startWingsRow?: number;   // seat row where the wing is starting
  endWingsRow?: number;     // seat row where the wing is ending
  exitRowsX?: number[];     // X coordinate of the exit rows
}

// Facility - Instalación (toilet, galley, etc)
export interface Facility {
  code?: string;
  column?: string;
  row?: string;
  position?: 'FRONT' | 'REAR' | 'SEAT';
  coordinates?: Coordinates;
}

// SeatmapTravelerPricing - Precio del asiento por pasajero
export interface SeatmapTravelerPricing {
  travelerId: string;
  seatAvailabilityStatus?: 'AVAILABLE' | 'BLOCKED' | 'OCCUPIED';
  price?: Price;
}

// Seat - Asiento individual
export interface Seat {
  cabin?: string;            // Cabin of the seat (ej: ECO, PREMIUM, BUSINESS)
  number?: string;           // Número de asiento (ej: 12B)
  characteristicsCodes?: string[];  // Características del asiento
  travelerPricing?: SeatmapTravelerPricing[];
  coordinates?: Coordinates;
  // Propiedades adicionales para renderizado
  row?: number;
  column?: string;
  availability?: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
  price?: {
    total: number;
    currency: string;
  };
}

// Deck - Cubierta del avión
export interface Deck {
  deckType?: 'UPPER' | 'MAIN' | 'LOWER';
  deckConfiguration?: DeckConfiguration;
  facilities?: Facility[];
  seats?: Seat[];
}

// AvailableSeatsCounter - Contador de asientos disponibles
export interface AvailableSeatsCounter {
  travelerId?: string;
  value?: number;  // Number of Seats with status AVAILABLE
}

// Dictionary - Diccionarios del API
export interface DictionaryLocation {
  cityCode: string;
  countryCode: string;
}

export interface Dictionaries {
  locations?: Record<string, DictionaryLocation>;
  facilities?: Record<string, string>;
  seatCharacteristics?: Record<string, string>;
}

// Link - Enlace HATEOAS
export interface Link {
  href?: string;
  method?: string;
  rel?: string;
}

// SeatMap - Respuesta principal del API
export interface SeatMap {
  type?: string;
  id?: string;
  self?: Link;
  departure?: FlightEndPoint;
  arrival?: FlightEndPoint;
  carrierCode?: string;       // Código de Aerolínea proveedora
  number?: string;          // Número de vuelo
  operating?: OperatingFlight;
  aircraft?: AircraftEquipment;
  class?: string;            // Reservation booking designator (RBD)
  flightOfferId?: string;   // ID de la oferta de vuelo
  segmentId?: string;       // ID del segmento
  decks?: Deck[];
  aircraftCabinAmenities?: AircraftCabinAmenities;
  availableSeatsCounters?: AvailableSeatsCounter[];
}

// SeatMapResponseFull - Respuesta completa del API (incluye diccionarios)
export interface SeatMapResponseFull {
  data?: SeatMap[];
  dictionaries?: Dictionaries;
  meta?: {
    count?: number;
    lights?: number;
  };
}

// ============================================
// INTERFACES DE PETICIÓN/RESPUESTA
// ============================================

export interface SeatMapRequestByFlightOffer {
  data: FlightOffer[];
  included?: {
    travelers?: Record<string, Traveler>;
  };
}

export interface SeatMapResponse {
  success: boolean;
  data?: SeatMap[];
  dictionaries?: Dictionaries;
  error?: string;
}

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

/**
 * Obtener mapa de asientos desde una orden de vuelo existente (GET)
 * Endpoint: GET /shopping/seatmaps?flightOrderId=xxx
 */
export async function getSeatMapByOrderId(
  orderId: string,
  options?: {
    seatNumberServiceBookingStatusRequired?: boolean;
  }
): Promise<SeatMapResponse> {
  const result = await seatMapsCache.getOrFetch(
    { orderId, options },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock');
        return {
          data: getMockSeatMap(),
          totalResults: 1
        };
      }

      try {
        // Llamar al endpoint de Amadeus: GET /v1/shopping/seatmaps
        const params: Record<string, string> = {
          flightOrderId: orderId
        };
        
        if (options?.seatNumberServiceBookingStatusRequired) {
          params.seatNumberServiceBookingStatusRequired = 'true';
        }

        const response = await (amadeus as any).shopping.seatMaps.get(params);
        
        console.log(`💺 SeatMap (order) - Obtenido desde API para orden: ${orderId}`);
        return {
          data: response.data,
          totalResults: Array.isArray(response.data) ? response.data.length : 1
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`❌ Error obteniendo SeatMap por orden: ${errorMessage}`);
        
        // En caso de error, devolver datos mock
        return {
          data: getMockSeatMap(),
          totalResults: 1
        };
      }
    }
  );

  return { success: true, data: result.data, dictionaries: getMockDictionaries() };
}

// ============================================
// DICCIONARIOS MOCK
// ============================================

function getMockDictionaries() {
  return {
    locations: {
      'NCE': { cityCode: 'NCE', countryCode: 'FR' },
      'ORY': { cityCode: 'PAR', countryCode: 'FR' }
    },
    facilities: {
      'LA': 'Lavatory',
      'G': 'Galley',
      'CL': 'Closet',
      'SO': 'Storage Space'
    },
    seatCharacteristics: {
      '1': 'Restricted seat - General',
      '9': 'Center seat (not window, not aisle)',
      'A': 'Aisle seat',
      'RS': 'Right side of aircraft',
      'DE': 'Deportee',
      'C': 'Crew seat',
      'CH': 'Chargeable seats',
      'E': 'Exit row seat',
      'LS': 'Left side of aircraft',
      'K': 'Bulkhead seat',
      'L': 'Leg space seat',
      '1A_AQC_PREMIUM_SEAT': 'Premium seat',
      'O': 'Preferential seat',
      '1A': 'Seat not allowed for infant',
      '1B': 'Seat not allowed for medical',
      '1D': 'Restricted recline seat',
      'U': 'Seat suitable for unaccompanied minors',
      'V': 'Seat to be left vacant or offered last',
      'W': 'Window seat',
      'IE': 'Seat not suitable for child',
      'FC': 'Front of cabin class/compartment'
    }
  };
}

/**
 * Obtener mapa de asientos desde una oferta de vuelo (POST)
 * Endpoint: POST /shopping/seatmaps
 */
export async function getSeatMapByFlightOffer(
  flightOffers: FlightOffer[],
  travelers?: Record<string, Traveler>
): Promise<SeatMapResponse> {
  // Crear clave de cache basada en el ID de la primera oferta
  const offerId = flightOffers[0]?.id || 'unknown';
  
  const result = await seatMapsCache.getOrFetch(
    { offerId, travelerCount: travelers ? Object.keys(travelers).length : 0 },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock');
        return {
          data: getMockSeatMap(flightOffers),
          totalResults: 1
        };
      }

      try {
        // Construir cuerpo de la petición según el Swagger
        const requestBody: SeatMapRequestByFlightOffer = {
          data: flightOffers
        };
        
        if (travelers) {
          requestBody.included = { travelers };
        }

        // Timeout corto para no bloquear el checkout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );

        const apiPromise = (async () => {
          const response = await (amadeus as any).shopping.seatMaps.post(
            JSON.stringify(requestBody),
            { 'X-HTTP-Method-Override': 'GET' }
          );
          return response.data;
        })();

        const data = await Promise.race([apiPromise, timeoutPromise])
          .catch(() => getMockSeatMap(flightOffers));
        
        console.log(`💺 SeatMap (offer) - Obtenido para oferta: ${offerId}`);
        return {
          data,
          totalResults: Array.isArray(data) ? data.length : 1
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`❌ Error obteniendo SeatMap por oferta: ${errorMessage}`);
        
        // En caso de error, devolver datos mock
        return {
          data: getMockSeatMap(flightOffers),
          totalResults: 1
        };
      }
    }
  );

  return { success: true, data: result.data, dictionaries: getMockDictionaries() };
}

/**
 * Función legacy para compatibilidad - Obtener mapa de asientos por flightOfferId
 */
export async function getSeatMap(flightOfferId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const result = await getSeatMapByFlightOffer([
    {
      type: 'flight-offer',
      id: flightOfferId
    }
  ]);
  
  return {
    success: result.success,
    data: result.data?.[0],
    error: result.error
  };
}

// ============================================
// DATOS MOCK REALISTAS - Versión detallada según parte 4 del Swagger
// ============================================

function getMockSeatMap(flightOffers?: FlightOffer[]): SeatMap[] {
  // Extraer información del vuelo si se proporciona una oferta
  const flightInfo = flightOffers?.[0]?.itineraries?.[0]?.segments?.[0];
  const carrierCode = flightInfo?.carrierCode || 'AF';
  const flightNumber = flightInfo?.number || '6201';
  const aircraftCode = flightInfo?.aircraft?.code || '320';
  const departure = flightInfo?.departure?.iataCode || 'NCE';
  const arrival = flightInfo?.arrival?.iataCode || 'ORY';
  const departureTime = flightInfo?.departure?.at || new Date().toISOString();
  const arrivalTime = flightInfo?.arrival?.at || new Date(Date.now() + 5400000).toISOString();

  // Generar asientos para un Airbus A320 (32 filas, configuración 3-3) - Versión detallada
  const generateSeats = () => {
    const seats: Seat[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Asientos ocupados y bloqueados según el API real
    const occupiedSeats = ['2A', '2C', '5B', '5E', '8A', '8F', '12D', '15A', '15F', '18C', '22B', '25E', '27A', '27F', '31D', '31E', '31F'];
    const blockedSeats = ['1A', '1F', '10A', '10F', '12A', '12B', '12C', '24A', '24B', '24C', '25A', '25B', '25C', '26A', '26B', '26C'];
    const exitRowSeats = ['12A', '12B', '12C', '12D', '12E', '12F', '31A', '31B', '31D', '31E', '31F'];
    const premiumSeats = ['7', '8', '9', '10', '11']; // Premium rows
    
    for (let row = 1; row <= 32; row++) {
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        const seatNumber = `${row}${column}`;
        
        // Características detalladas del asiento según el API real
        const characteristics: string[] = [];
        
        // Window seats
        if (column === 'A' || column === 'F') characteristics.push('W');
        // Aisle seats  
        if (column === 'C' || column === 'D') characteristics.push('A');
        // Center seats
        if (column === 'B' || column === 'E') characteristics.push('C');
        
        // Chargeable
        characteristics.push('CH');
        
        // Extra leg room seats
        if (row >= 7 && row <= 11) characteristics.push('LS');
        if (row >= 24 && row <= 30) characteristics.push('LS');
        
        // Restricted seats
        if (row >= 21 && row <= 23) characteristics.push('RS');
        
        // Exit row
        if (exitRowSeats.includes(seatNumber)) {
          characteristics.push('E');
          characteristics.push('IE');
          characteristics.push('1');
          characteristics.push('1A');
          characteristics.push('1B');
        }
        
        // Premium seat
        if (row >= 7 && row <= 11) characteristics.push('1A_AQC_PREMIUM_SEAT');
        
        // First class indicators
        if (row >= 1 && row <= 6) {
          characteristics.push('FC');
          characteristics.push('K');
          characteristics.push('O');
          characteristics.push('1B');
        }
        
        // Number indicators
        if (column === 'B' || column === 'E') characteristics.push('9');
        
        // Near toilet/exit
        if (row === 32) {
          characteristics.push('1D');
          characteristics.push('V');
        }
        
        // DE (near door/exit)
        if (row === 31) characteristics.push('DE');
        
        // U (unavailable for selection until gate)
        if (row >= 13 && row <= 16) characteristics.push('U');
        
        // Determinar disponibilidad
        let availability: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED' = 'AVAILABLE';
        
        if (occupiedSeats.includes(seatNumber)) {
          availability = 'OCCUPIED';
        } else if (blockedSeats.includes(seatNumber)) {
          availability = 'BLOCKED';
        }
        
        // Generar travelerPricing
        const travelerPricing: SeatmapTravelerPricing[] = [
          {
            travelerId: '1',
            seatAvailabilityStatus: availability === 'OCCUPIED' ? 'OCCUPIED' : (availability === 'BLOCKED' ? 'BLOCKED' : 'AVAILABLE'),
            price: availability !== 'OCCUPIED' ? {
              currency: 'EUR',
              total: row >= 12 ? '15.00' : '11.00',
              base: row >= 12 ? '15.00' : '11.00',
              taxes: [{ amount: '0.00', code: 'SUPPLIER' }]
            } : undefined
          },
          {
            travelerId: '2',
            seatAvailabilityStatus: availability === 'OCCUPIED' ? 'OCCUPIED' : (availability === 'BLOCKED' ? 'BLOCKED' : 'AVAILABLE'),
            price: availability !== 'OCCUPIED' ? {
              currency: 'EUR',
              total: row >= 12 ? '15.00' : '11.00',
              base: row >= 12 ? '15.00' : '11.00',
              taxes: [{ amount: '0.00', code: 'SUPPLIER' }]
            } : undefined
          }
        ];
        
        seats.push({
          number: seatNumber,
          cabin: row <= 6 ? 'ECONOMY' : 'ECONOMY',
          characteristicsCodes: characteristics,
          travelerPricing,
          coordinates: {
            x: row,
            y: colIndex
          }
        });
      }
    }
    
    return seats;
  };

  // Generar facilities
  const generateFacilities = (): Facility[] => {
    return [
      // Galley front
      { code: 'LA', column: 'A', position: 'FRONT', coordinates: { x: 0, y: 0 } },
      { code: 'G', column: 'F', position: 'FRONT', coordinates: { x: 0, y: 6 } },
      { code: 'G', column: 'E', position: 'FRONT', coordinates: { x: 0, y: 5 } },
      { code: 'G', column: 'D', position: 'FRONT', coordinates: { x: 0, y: 4 } },
      // Crew seat
      { code: 'CL', column: 'A', row: '1', position: 'SEAT', coordinates: { x: 1, y: 0 } },
      { code: 'CL', column: 'B', row: '1', position: 'SEAT', coordinates: { x: 1, y: 1 } },
      // Galley rear
      { code: 'SO', column: 'E', row: '32', position: 'SEAT', coordinates: { x: 31, y: 5 } },
      { code: 'SO', column: 'F', row: '32', position: 'SEAT', coordinates: { x: 31, y: 6 } },
      { code: 'LA', column: 'A', row: '32', position: 'REAR', coordinates: { x: 32, y: 0 } },
      { code: 'G', column: 'F', row: '32', position: 'REAR', coordinates: { x: 32, y: 6 } },
      { code: 'G', column: 'E', row: '32', position: 'REAR', coordinates: { x: 32, y: 5 } },
      { code: 'G', column: 'D', row: '32', position: 'REAR', coordinates: { x: 32, y: 4 } }
    ];
  };

  const mockSeatMap: SeatMap = {
    type: 'seatmap',
    id: `seatmap_${Date.now()}`,
    departure: {
      iataCode: departure,
      terminal: '2',
      at: departureTime
    },
    arrival: {
      iataCode: arrival,
      terminal: '2',
      at: arrivalTime
    },
    carrierCode,
    number: flightNumber,
    operating: {
      carrierCode
    },
    aircraft: {
      code: aircraftCode
    },
    class: 'X',
    flightOfferId: flightOffers?.[0]?.id || '1',
    segmentId: '1',
    decks: [
      {
        deckType: 'MAIN',
        deckConfiguration: {
          width: 7,
          length: 33,
          startSeatRow: 1,
          endSeatRow: 32,
          startWingsX: 13,
          endWingsX: 13,
          startWingsRow: 13,
          endWingsRow: 13,
          exitRowsX: [12, 13]
        },
        facilities: generateFacilities(),
        seats: generateSeats()
      }
    ],
    aircraftCabinAmenities: {
      power: {
        isChargeable: false,
        powerType: 'USB_PORT',
        usbType: 'USB_C'
      },
      seat: {
        legSpace: 29,
        spaceUnit: 'INCHES',
        tilt: 'NORMAL',
        medias: [
          {
            title: 'Comfortable Seats',
            href: 'https://pdt.content.amadeus.com/AncillaryServicesMedia/14223418_395.jpg',
            description: {
              text: 'Settle in with comfortable seats and an ecoTHREAD blanket made from 100% recycled plastic bottles.',
              lang: 'EN'
            },
            mediaType: 'image'
          },
          {
            title: 'Stay Connected',
            href: 'https://pdt.content.amadeus.com/AncillaryServicesMedia/71344149_DFL.jpg',
            description: {
              text: 'Stay connected next time you fly. Choose from our great value Wi-Fi plans.',
              lang: 'EN'
            },
            mediaType: 'image'
          },
          {
            title: 'Be Curious',
            href: 'https://pdt.content.amadeus.com/AncillaryServicesMedia/42266150_401.jpg',
            description: {
              text: 'With special seat,meals, toys, and dedicated children\'s ice channels, we encourage curious minds and inspire tomorrow\'s explorers.',
              lang: 'EN'
            },
            mediaType: 'image'
          }
        ]
      },
      wifi: {
        isChargeable: true,
        wifiCoverage: 'FULL'
      },
      entertainment: [
        {
          isChargeable: false,
          entertainmentType: 'AUDIO_VIDEO_ON_DEMAND'
        },
        {
          isChargeable: false,
          entertainmentType: 'IP_TV'
        }
      ],
      food: {
        isChargeable: false,
        foodType: 'SNACK'
      },
      beverage: {
        isChargeable: false,
        beverageType: 'ALCOHOLIC_AND_NON_ALCOHOLIC'
      }
    },
    availableSeatsCounters: [
      { travelerId: '1', value: 116 },
      { travelerId: '2', value: 116 }
    ]
  };

  return [mockSeatMap];
}

export default {
  getSeatMap,
  getSeatMapByOrderId,
  getSeatMapByFlightOffer
};
