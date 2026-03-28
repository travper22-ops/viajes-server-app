// ============================================
// SERVICIO DE AMADEUS - BRANDED FARES UPSELL API
// ============================================
// Basado en: https://test.api.amadeus.com/v1/shopping/flight-offers/upselling
// Version: 1.2.0

import { getAmadeus } from '../config/amadeus.js';
import { seatMapsCache } from './cache.js';

// ============================================
// INTERFACES DEL SWAGGER - BRANDED FARES UPSELL
// ============================================

// FlightEndPoint - Punto de vuelo
export interface FlightEndPoint {
  iataCode: string;
  terminal?: string;
  at?: string;
}

// FlightStop - Escala
export interface FlightStop {
  iataCode?: string;
  duration?: string;
  arrivalAt?: string;
  departureAt?: string;
}

// AircraftEquipment - Aeronave
export interface AircraftEquipment {
  code: string;
}

// OperatingFlight - Información operativa
export interface OperatingFlight {
  carrierCode: string;
  number?: string;
}

// FlightSegment - Segmento de vuelo
export interface FlightSegment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;
  number: string;
  aircraft?: AircraftEquipment;
  operating?: OperatingFlight;
  duration?: string;
  stops?: FlightStop[];
  id?: string;
  numberOfStops?: number;
  blacklistedInEU?: boolean;
}

// Itinerario
export interface Itinerary {
  duration?: string;
  segments: FlightSegment[];
}

// Price - Precio
export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Array<{ amount: string; type: string }>;
  taxes?: Array<{ amount: string; code: string }>;
  grandTotal?: string;
  refundableTaxes?: string;
}

// Extended Price
export interface Extended_Price extends Price {
  margin?: string;
  billingCurrency?: string;
  additionalServices?: Array<{ amount: string; type: string }>;
}

// PricingOptions - Opciones de precio
export interface PricingOptions {
  fareType?: string[];
  includedCheckedBagsOnly?: boolean;
  refundableFare?: boolean;
  noRestrictionFare?: boolean;
  noPenaltyFare?: boolean;
}

// BaggageAllowance - Equipaje permitido
export interface BaggageAllowance {
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}

// ChargeableSeat - Asiento cargo (novedad v1.2.0)
export interface ChargeableSeat {
  id?: string;
  number?: string;
}

// ChargeableCheckedBags - Equipaje facturado cargo
export interface ChargeableCheckedBags extends BaggageAllowance {
  id?: string;
}

// AllotmentDetails - Detalles de allotmente
export interface AllotmentDetails {
  tourName?: string;
  tourReference?: string;
}

// SliceDiceIndicator - Indicador de disponibilidad
export type SliceDiceIndicator = 'LOCAL_AVAILABILITY' | 'SUB_OD_AVAILABILITY_1' | 'SUB_OD_AVAILABILITY_2';

// AdditionalServiceType - Tipo de servicio adicional
export type AdditionalServiceType = 'CHECKED_BAGS' | 'MEALS' | 'SEATS' | 'OTHER_SERVICES';

// ServiceName - Nombre del servicio
export type ServiceName = 'PRIORITY_BOARDING' | 'AIRPORT_CHECKIN';

// FareDetailsBySegment - Detalles de tarifa por segmento
export interface FareDetailsBySegment {
  segmentId: string;
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  class?: string;
  isAllotment?: boolean;
  includedCheckedBags?: BaggageAllowance;
  amenities?: Array<{
    code?: string;
    description?: string;
    isChargeable?: boolean;
    amenityType?: string;
  }>;
  // Additional services (novedad v1.2.0)
  additionalServices?: {
    chargeableCheckedBags?: ChargeableCheckedBags;
    chargeableSeat?: ChargeableSeat;
    chargeableSeatNumber?: string;
    otherServices?: string[];
  };
}

// TravelerPricing - Precio por viajero
export interface TravelerPricing {
  travelerId: string;
  fareOption?: string;
  travelerType: string;
  associatedAdultId?: string;
  price?: Price;
  fareDetailsBySegment?: FareDetailsBySegment[];
}

// FlightOffer - Oferta de vuelo
export interface FlightOffer {
  type?: string;
  id: string;
  source?: string;
  instantTicketingRequired?: boolean;
  disablePricing?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  paymentCardRequired?: boolean;
  lastTicketingDate?: string;
  lastTicketingDateTime?: string;
  numberOfBookableSeats?: number;
  itineraries: Itinerary[];
  price?: Extended_Price;
  pricingOptions?: PricingOptions;
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
  fareRules?: any;
}

// Payment - Información de pago
export interface Payment {
  brand?: string;
  binNumber?: number;
  flightOfferIds?: string[];
}

// FlightOfferUpsellIn - Request body
export interface FlightOfferUpsellIn {
  type?: string;
  flightOffers: FlightOffer[];
  payments?: Payment[];
}

// FlightOfferUpsellRequest - Request completo
export interface FlightOfferUpsellRequest {
  data: FlightOfferUpsellIn;
}

// Collection_Meta_Upsell
export interface Collection_Meta_Upsell {
  count?: number;
  oneWayUpselledCombinations?: Array<{
    flightOfferId: string;
    upselledFlightOfferIds: string[];
  }>;
}

// Dictionaries
export interface Dictionaries {
  locations?: Record<string, { cityCode: string; countryCode: string }>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
  carriers?: Record<string, string>;
}

// Upsell Response
export interface UpsellResponse {
  warnings?: any[];
  meta?: Collection_Meta_Upsell;
  data?: FlightOffer[];
  dictionaries?: Dictionaries;
}

// ============================================
// INTERFACES DE PETICIÓN/RESPUESTA
// ============================================

export interface UpsellFlightOffersRequest {
  flightOffers: FlightOffer[];
  payments?: Payment[];
}

export interface UpsellResponseResult {
  success: boolean;
  data?: FlightOffer[];
  meta?: Collection_Meta_Upsell;
  dictionaries?: Dictionaries;
  error?: string;
}

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

/**
 * Obtener ofertas de upsell (mejores tarifas) para una oferta de vuelo
 * Endpoint: POST /shopping/flight-offers/upselling
 */
export async function getFlightUpsell(
  flightOffers: FlightOffer[],
  payments?: Payment[]
): Promise<UpsellResponseResult> {
  const result = await seatMapsCache.getOrFetch(
    { type: 'flight_upsell', offerId: flightOffers[0]?.id },
    async () => {
      const amadeus = getAmadeus();
      
      if (!amadeus) {
        console.warn('⚠️ Amadeus no configurado, devolviendo datos mock');
        return {
          data: getMockUpsellOffers(flightOffers),
          totalResults: 5
        };
      }

      try {
        const requestBody: FlightOfferUpsellRequest = {
          data: {
            type: 'flight-offers-upselling',
            flightOffers,
            payments
          }
        };

        const response = await (amadeus as any).shopping.flightOffers.upselling.post(
          JSON.stringify(requestBody),
          { 'X-HTTP-Method-Override': 'GET' }
        );
        
        console.log(`🔄 Upsell - Obtenido desde API para oferta: ${flightOffers[0]?.id}`);
        return {
          data: response.data,
          totalResults: Array.isArray(response.data) ? response.data.length : 1
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`❌ Error obteniendo upsell: ${errorMessage}`);
        
        return {
          data: getMockUpsellOffers(flightOffers),
          totalResults: 5
        };
      }
    }
  );

  return { 
    success: true, 
    data: result.data as FlightOffer[],
    meta: { count: result.totalResults || 0 }
  };
}

// ============================================
// DATOS MOCK
// ============================================

function getMockUpsellOffers(originalOffers: FlightOffer[]): FlightOffer[] {
  const baseOffer = originalOffers[0];
  
  // Generar ofertas upsell con diferentes tarifas
  const upsellOffers: FlightOffer[] = [
    // 1. LIGHT - Economy básico
    {
      ...baseOffer,
      id: '2',
      price: {
        ...baseOffer.price,
        total: '381.86',
        base: '211.00',
        grandTotal: '381.86'
      },
      travelerPricings: baseOffer.travelerPricings?.map(tp => ({
        ...tp,
        price: {
          ...tp.price,
          total: tp.travelerType === 'ADULT' ? '186.96' : 
                 tp.travelerType === 'CHILD' ? '164.96' : '29.94',
          base: tp.travelerType === 'ADULT' ? '111.00' : 
                tp.travelerType === 'CHILD' ? '89.00' : '11.00'
        },
        fareDetailsBySegment: tp.fareDetailsBySegment?.map(fds => ({
          ...fds,
          brandedFare: 'LIGHT1',
          fareBasis: fds.segmentId === '2' ? 'QS50OALG' : 'VS50OALG',
          class: fds.segmentId === '2' ? 'Q' : 'V'
        }))
      }))
    },
    // 2. STANDARD - Economy con equipaje
    {
      ...baseOffer,
      id: '3',
      price: {
        ...baseOffer.price,
        total: '457.86',
        base: '287.00',
        grandTotal: '457.86'
      },
      travelerPricings: baseOffer.travelerPricings?.map(tp => ({
        ...tp,
        price: {
          ...tp.price,
          total: tp.travelerType === 'ADULT' ? '226.96' : 
                 tp.travelerType === 'CHILD' ? '196.96' : '33.94',
          base: tp.travelerType === 'ADULT' ? '151.00' : 
                tp.travelerType === 'CHILD' ? '121.00' : '15.00'
        },
        fareDetailsBySegment: tp.fareDetailsBySegment?.map(fds => ({
          ...fds,
          brandedFare: 'STANDARD',
          fareBasis: fds.segmentId === '2' ? 'QS50OBST' : 'VS50OBST',
          class: fds.segmentId === '2' ? 'Q' : 'V',
          includedCheckedBags: { quantity: 1 }
        }))
      }))
    },
    // 3. FLEX - Economy flexible
    {
      ...baseOffer,
      id: '4',
      price: {
        ...baseOffer.price,
        total: '685.86',
        base: '515.00',
        grandTotal: '685.86'
      },
      travelerPricings: baseOffer.travelerPricings?.map(tp => ({
        ...tp,
        price: {
          ...tp.price,
          total: tp.travelerType === 'ADULT' ? '346.96' : 
                 tp.travelerType === 'CHILD' ? '292.96' : '45.94',
          base: tp.travelerType === 'ADULT' ? '271.00' : 
                tp.travelerType === 'CHILD' ? '217.00' : '27.00'
        },
        fareDetailsBySegment: tp.fareDetailsBySegment?.map(fds => ({
          ...fds,
          brandedFare: 'FLEX',
          fareBasis: fds.segmentId === '2' ? 'QS50OEFX' : 'VS50OEFX',
          class: fds.segmentId === '2' ? 'Q' : 'V',
          includedCheckedBags: { quantity: 1 }
        }))
      }))
    },
    // 4. BIZLEISURE - Business Class
    {
      ...baseOffer,
      id: '5',
      price: {
        ...baseOffer.price,
        total: '759.14',
        base: '553.00',
        grandTotal: '759.14'
      },
      travelerPricings: baseOffer.travelerPricings?.map(tp => ({
        ...tp,
        price: {
          ...tp.price,
          total: tp.travelerType === 'ADULT' ? '384.60' : 
                 tp.travelerType === 'CHILD' ? '326.60' : '47.94',
          base: tp.travelerType === 'ADULT' ? '291.00' : 
                tp.travelerType === 'CHILD' ? '233.00' : '29.00'
        },
        fareDetailsBySegment: tp.fareDetailsBySegment?.map(fds => ({
          ...fds,
          cabin: 'BUSINESS',
          brandedFare: 'BIZLEISURE',
          fareBasis: fds.segmentId === '2' ? 'OS50OBNB' : 'OS50OBNB',
          class: 'O',
          includedCheckedBags: { quantity: 2, weight: 32, weightUnit: 'KG' }
        }))
      }))
    },
    // 5. BIZFLEX - Business Class Flexible
    {
      ...baseOffer,
      id: '6',
      price: {
        ...baseOffer.price,
        total: '1831.14',
        base: '1625.00',
        grandTotal: '1831.14'
      },
      travelerPricings: baseOffer.travelerPricings?.map(tp => ({
        ...tp,
        price: {
          ...tp.price,
          total: tp.travelerType === 'ADULT' ? '948.60' : 
                 tp.travelerType === 'CHILD' ? '777.60' : '104.94',
          base: tp.travelerType === 'ADULT' ? '855.00' : 
                tp.travelerType === 'CHILD' ? '684.00' : '86.00'
        },
        fareDetailsBySegment: tp.fareDetailsBySegment?.map(fds => ({
          ...fds,
          cabin: 'BUSINESS',
          brandedFare: 'BIZFLEX',
          fareBasis: fds.segmentId === '2' ? 'IS50AENB' : 'IS50AENB',
          class: 'I',
          includedCheckedBags: { quantity: 2, weight: 32, weightUnit: 'KG' }
        }))
      }))
    }
  ];

  return upsellOffers;
}

export default {
  getFlightUpsell
};
