// ============================================
// SERVICIO DE TRANSFERS - AMADEUS API
// Basado en: Transfer Booking API Swagger
// ============================================

import { getAmadeus } from '../config/amadeus.js';
import { getSupabaseAdmin } from '../config/supabase.js';

// ============================================
// INTERFACES - Basadas en Swagger
// ============================================

export interface TransferPassenger {
  id?: string;
  firstName: string;
  lastName: string;
  title?: 'MR' | 'MRS' | 'MS' | 'MISS';
  contacts?: {
    phoneNumber?: string;
    email?: string;
  };
  billingAddress?: {
    line?: string;
    zip?: string;
    countryCode?: string;
    cityName?: string;
  };
}

export interface TransferPayment {
  methodOfPayment: 'CREDIT_CARD' | 'INVOICE' | 'TRAVEL_ACCOUNT' | 'PAYMENT_SERVICE_PROVIDER';
  paymentId?: string;
  card?: {
    number: string;
    holderName: string;
    vendorCode: string;
    expiryDate: string;
    cvv?: string;
  };
}

export interface TransferEquipment {
  code: 'BBS' | 'BYC' | 'CBB' | 'CBF' | 'CBS' | 'CSB' | 'CSI' | 'CST' | 'SBR' | 'SKB' | 'SKR' | 'TAB' | 'WAR' | 'WHC' | 'WIF' | 'CNT';
  itemId?: string;
}

export interface TransferExtraService {
  code: 'DSL' | 'EWT' | 'MAG' | 'FLM' | 'NWS' | 'CAI' | 'WNR';
  itemId?: string;
  description?: string;
  metricType?: 'YEARS' | 'DAYS' | 'HOURS' | 'MINUTES';
  metricValue?: string;
  quotation?: Quotation;
  converted?: Quotation;
  isBookable?: boolean;
  taxIncluded?: boolean;
  includedInTotal?: boolean;
}

export interface Quotation {
  monetaryAmount?: string;
  currencyCode?: string;
  isEstimated?: boolean;
  base?: PointsAndCash;
  discount?: PointsAndCash;
  taxes?: Tax[];
  fees?: Fee[];
  totalTaxes?: PointsAndCash;
  totalFees?: PointsAndCash;
}

export interface PointsAndCash {
  monetaryAmount?: string;
}

export interface Tax {
  monetaryAmount?: string;
  indicator?: string;
  natureCode?: string;
  countryCode?: string;
  rate?: string;
}

export interface Fee {
  monetaryAmount?: string;
  currencyCode?: string;
  indicator?: string;
}

export interface TransferLocation {
  dateTime?: string;
  locationCode?: string;
  address?: Address;
  name?: string;
  googlePlaceId?: string;
  uicCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Address {
  line?: string;
  zip?: string;
  countryCode?: string;
  cityName?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface StopOver {
  duration?: string;
  sequenceNumber?: number;
  location?: TransferLocation;
}

export interface PassengerCharacteristics {
  passengerTypeCode?: string;
  age?: number;
}

export interface LoyaltyNumber {
  program?: string;
  value?: string;
}

export interface Name {
  type?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
}

export interface Payment {
  methodOfPayment: 'CREDIT_CARD' | 'TRAVEL_ACCOUNT' | 'PAYMENT_SERVICE_PROVIDER';
  paymentReference?: string;
  paymentServiceProvider?: 'STRIPE_CONNECT';
  card?: CreditCard;
}

export interface CreditCard {
  number: string;
  holderName: string;
  vendorCode: string;
  expiryDate: string;
  cvv?: string;
}

export interface Contact {
  phoneNumber?: string;
  email?: string;
}

export interface ContactWithAddress extends Contact {
  address?: Address;
}

export interface ServiceProvider {
  code: string;
  name: string;
  logoUrl?: string;
  termsUrl?: string;
  isPreferred?: boolean;
  contacts?: ContactWithAddress;
  settings?: string[];
  businessIdentification?: {
    vatRegistrationNumber?: string;
  };
}

export interface PartnerInfo {
  serviceProvider?: ServiceProvider;
}

export interface Seat {
  count?: number;
  row?: string;
  size?: string;
}

export interface Baggage {
  count?: number;
  size?: 'S' | 'M' | 'L';
}

export interface Vehicle {
  code?: 'CAR' | 'SED' | 'WGN' | 'ELC' | 'VAN' | 'SUV' | 'LMS' | 'MBR' | 'TRN' | 'BUS';
  category?: 'ST' | 'BU' | 'FC';
  description?: string;
  seats?: Seat[];
  baggages?: Baggage[];
  imageURL?: string;
}

export interface TransportationType {
  transportationType: 'FLIGHT' | 'TRAIN';
  transportationNumber: string;
  departure: {
    uicCode?: string;
    iataCode: string;
    localDateTime: string;
  };
  arrival: {
    uicCode?: string;
    iataCode: string;
    localDateTime: string;
  };
}

export interface ConnectedSegment {
  transportationType: 'FLIGHT' | 'TRAIN' | 'BUS';
  transportationNumber: string;
  departure: {
    uicCode?: string;
    iataCode: string;
    localDateTime: string;
  };
  arrival: {
    uicCode?: string;
    iataCode: string;
    localDateTime: string;
  };
}

export interface TransferReservationRequest {
  offerId: string;
  note?: string;
  flightNumber?: string;
  passengers: TransferPassenger[];
  payment: TransferPayment;
  agency?: {
    contacts?: Array<{ email?: { address?: string } }>;
  };
  equipment?: TransferEquipment[];
  extraServices?: TransferExtraService[];
  loyaltyNumber?: {
    programId?: string;
    number?: string;
  };
  corporation?: {
    address?: {
      line?: string;
      zip?: string;
      countryCode?: string;
      cityName?: string;
    };
    info?: Record<string, string>;
  };
  startConnectedSegment?: ConnectedSegment;
  endConnectedSegment?: ConnectedSegment;
}

export interface TransferOrder {
  type?: string;
  id: string;
  reference?: string;
  transfers?: TransferReservation[];
  passengers?: any[];
  agency?: any;
}

export interface TransferReservation {
  confirmNbr?: string;
  status?: 'CONFIRMED' | 'CANCELLED';
  note?: string;
  methodOfPayment?: string;
  paymentServiceProvider?: string;
  offerId?: string;
  transferType?: string;
  start?: any;
  end?: any;
  vehicle?: any;
  serviceProvider?: any;
  quotation?: {
    amount?: string;
    currency?: string;
  };
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Crear una reserva de transfer
 * POST /ordering/transfer-orders
 */
export async function createTransferOrder(
  reservation: TransferReservationRequest
): Promise<{ success: boolean; data?: TransferOrder; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    // Construir el body según el Swagger
    const body = {
      data: {
        note: reservation.note,
        flightNumber: reservation.flightNumber,
        passengers: reservation.passengers.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          title: p.title,
          contacts: p.contacts,
          billingAddress: p.billingAddress
        })),
        agency: reservation.agency,
        payment: {
          methodOfPayment: reservation.payment.methodOfPayment,
          paymentId: reservation.payment.paymentId,
          creditCard: reservation.payment.card
        },
        equipment: reservation.equipment,
        extraServices: reservation.extraServices,
        loyaltyNumber: reservation.loyaltyNumber,
        corporation: reservation.corporation,
        startConnectedSegment: reservation.startConnectedSegment,
        endConnectedSegment: reservation.endConnectedSegment
      }
    };

    const response = await (amadeus as any).ordering.transferOrders.post({
      offerId: reservation.offerId,
      ...body
    });

    // Guardar en Supabase
    if (response.data) {
      await saveTransferToDatabase(response.data, reservation);
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error creando transfer order:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Guardar la reserva de transfer en Supabase
 */
async function saveTransferToDatabase(
  transferOrder: TransferOrder,
  reservation: TransferReservationRequest
): Promise<void> {
  try {
    // Extraer información del transfer
    const transfer = transferOrder.transfers?.[0];
    const passengerNames = transferOrder.passengers
      ?.map((p: any) => `${p.firstName} ${p.lastName}`)
      .join(', ') || '';

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('transfer_bookings').insert({
      user_id: reservation.passengers[0]?.id || null,
      offer_id: reservation.offerId,
      confirmation_number: transfer?.confirmNbr || transferOrder.id,
      amadeus_order_id: transferOrder.id,
      reference: transferOrder.reference,
      status: transfer?.status || 'CONFIRMED',
      transfer_type: transfer?.transferType || 'PRIVATE',
      
      // Datos del vehículo
      vehicle_info: transfer?.vehicle ? JSON.stringify(transfer.vehicle) : null,
      
      // Información de pricing
      price_amount: transfer?.quotation?.amount,
      price_currency: transfer?.quotation?.currency,
      
      // Pasajeros
      passengers: passengerNames,
      passengers_detail: JSON.stringify(transferOrder.passengers),
      
      // Metadatos
      raw_amadeus_response: JSON.stringify(transferOrder),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error guardando transfer en Supabase:', error.message);
    }
  } catch (error) {
    console.error('Error en saveTransferToDatabase:', error);
  }
}

/**
 * Confirmar transfer con datos de pago de Stripe
 */
export async function confirmTransferWithStripe(
  offerId: string,
  passengers: TransferPassenger[],
  stripePaymentIntentId: string,
  additionalData?: {
    note?: string;
    flightNumber?: string;
    equipment?: TransferEquipment[];
    startConnectedSegment?: ConnectedSegment;
    endConnectedSegment?: ConnectedSegment;
  }
): Promise<{ success: boolean; data?: TransferOrder; error?: string }> {
  return createTransferOrder({
    offerId,
    passengers,
    payment: {
      methodOfPayment: 'PAYMENT_SERVICE_PROVIDER',
      paymentId: stripePaymentIntentId
    },
    note: additionalData?.note,
    flightNumber: additionalData?.flightNumber,
    equipment: additionalData?.equipment,
    startConnectedSegment: additionalData?.startConnectedSegment,
    endConnectedSegment: additionalData?.endConnectedSegment
  });
}

// ============================================
// EXPORTS
// ============================================

// ============================================
// FUNCIONES ADICIONALES PARA COMPATIBILIDAD
// ============================================

/**
 * Buscar transfers
 * Esta función es llamada por el router
 */
export async function searchTransfers(params: any): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const response = await (amadeus as any).shopping.transferOffers.get(params);
    
    return {
      success: true,
      data: response.data || []
    };
  } catch (error: any) {
    console.error('Error buscando transfers:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reservar transfer
 */
export async function bookTransfer(params: any): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();

  if (!amadeus) {
    return { success: false, error: 'Amadeus no configurado' };
  }

  try {
    const response = await (amadeus as any).ordering.transferOrders.post(params);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error reservando transfer:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Transformar oferta de transfer para el frontend
 */
export function transformTransferOffer(offer: any): any {
  return {
    id: offer.id,
    type: offer.type,
    transferType: offer.transferType,
    start: {
      dateTime: offer.start?.dateTime,
      locationCode: offer.start?.locationCode,
      address: offer.start?.address,
      name: offer.start?.name
    },
    end: {
      dateTime: offer.end?.dateTime,
      locationCode: offer.end?.locationCode,
      address: offer.end?.address,
      name: offer.end?.name
    },
    vehicle: {
      category: offer.vehicle?.category,
      type: offer.vehicle?.code,
      description: offer.vehicle?.description,
      seats: offer.vehicle?.seats?.[0]?.count,
      bags: offer.vehicle?.baggages?.[0]?.count
    },
    serviceProvider: {
      name: offer.serviceProvider?.name,
      code: offer.serviceProvider?.code,
      logoUrl: offer.serviceProvider?.logoUrl
    },
    price: {
      total: offer.quotation?.monetaryAmount,
      currency: offer.quotation?.currencyCode,
      base: offer.quotation?.base?.monetaryAmount,
      taxes: offer.quotation?.totalTaxes?.monetaryAmount
    },
    duration: offer.duration,
    distance: offer.distance,
    methodsOfPaymentAccepted: offer.methodsOfPaymentAccepted,
    cancellationRules: offer.cancellationRules,
    extraServices: offer.extraServices,
    equipment: offer.equipment
  };
}

// ============================================
// EXPORTS
// ============================================
// TRANSFER MANAGEMENT - Retrieve & Cancel
// ============================================

/**
 * Obtener una orden de transfer por ID
 * GET /ordering/transfer-orders/{orderId}
 */
export async function getTransferOrder(
  orderId: string
): Promise<{ success: boolean; data?: TransferOrder; error?: string }> {
  const amadeus = getAmadeus();
  if (!amadeus) return { success: false, error: 'Amadeus no configurado' };

  try {
    const response = await (amadeus as any).ordering.transferOrders(orderId).get();
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error obteniendo transfer order:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Cancelar una orden de transfer
 * DELETE /ordering/transfer-orders/{orderId}?confirmNbr=xxx
 */
export async function cancelTransferOrder(
  orderId: string,
  confirmNbr: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const amadeus = getAmadeus();
  if (!amadeus) return { success: false, error: 'Amadeus no configurado' };

  try {
    const response = await (amadeus as any).ordering.transferOrders(orderId).delete({ confirmNbr });

    // Actualizar estado en Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('transfer_bookings')
        .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('amadeus_order_id', orderId);
    }

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error cancelando transfer order:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================

export default {
  createTransferOrder,
  confirmTransferWithStripe,
  searchTransfers,
  bookTransfer,
  transformTransferOffer,
  getTransferOrder,
  cancelTransferOrder
};
