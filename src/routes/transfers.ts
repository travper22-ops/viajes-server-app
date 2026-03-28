// ============================================
// RUTAS DE TRANSFERS
// ============================================

import { Router, Request, Response } from 'express';
import { searchTransfers, bookTransfer, transformTransferOffer, getTransferOrder, cancelTransferOrder } from '../services/amadeus-transfer.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

// ============================================
// INTERFACES
// ============================================

interface Transfer {
  id: string;
  type: string;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  passengers: number;
  luggage: number;
  price: {
  total: number;
  currency: string;
  };
  status: string;
}

// ============================================
// RUTAS
// ============================================

// Buscar transfers
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transferType, startLocationCode, endLocationCode, startDateTime, passengers, startAddress, endAddress } = req.query;

    if (!transferType || !startDateTime || !passengers) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Se requieren transferType, startDateTime y passengers' }
      });
      return;
    }

    const searchParams = {
      transferType: transferType as string,
      startDateTime: startDateTime as string,
      passengers: parseInt(passengers as string, 10),
      ...(startLocationCode && { startLocationCode: startLocationCode as string }),
      ...(endLocationCode && { endLocationCode: endLocationCode as string }),
      ...(startAddress && typeof startAddress === 'string' && { startAddress: JSON.parse(startAddress) }),
      ...(endAddress && typeof endAddress === 'string' && { endAddress: JSON.parse(endAddress) })
    };

    const result = await searchTransfers(searchParams);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: result.error || 'Error al buscar transfers' }
      });
      return;
    }

    // Transformar los resultados
    const transformedData = result.data.map(transformTransferOffer);

    res.json({
      success: true,
      data: transformedData,
      meta: {
        count: transformedData.length,
        filters: searchParams
      }
    });
  } catch (error) {
    console.error('Error en búsqueda de transfers:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

// Obtener transfer por ID
router.get('/:transferId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transferId } = req.params;
    const result = await getTransferOrder(transferId);

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: result.error || 'Transfer no encontrado' }
      });
      return;
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error obteniendo transfer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

// Reservar transfer
router.post('/book', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId, transferType, start, end, passengers, note, methodOfPayment, userId, totalPrice, currency } = req.body;

    if (!offerId || !transferType || !start || !end || !passengers) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_DATA', message: 'Se requieren offerId, transferType, start, end y passengers' }
      });
      return;
    }

    const bookParams = {
      offerId,
      transferType,
      start,
      end,
      passengers,
      ...(note && { note }),
      ...(methodOfPayment && { methodOfPayment })
    };

    const result = await bookTransfer(bookParams);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'BOOKING_FAILED', message: result.error || 'Error al reservar transfer' }
      });
      return;
    }

    // Extraer datos de Amadeus (result.data es unknown, convertir a any)
    const bookingData = result.data as any;
    const amadeusBookingId = bookingData?.id;
    const confirmationCode = bookingData?.associatedRecords?.[0]?.reference;

    // Guardar en la base de datos
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error: insertError } = await supabase
          .from('transfers')
          .insert({
            amadeus_offer_id: offerId,
            amadeus_booking_id: amadeusBookingId,
            transfer_type: transferType,
            start_location: start.locationCode || start.name,
            end_location: end.locationCode || end.name,
            start_address: start.address ? JSON.stringify(start.address) : null,
            end_address: end.address ? JSON.stringify(end.address) : null,
            start_datetime: start.dateTime,
            end_datetime: end.dateTime,
            passengers: passengers,
            price_total: totalPrice || bookingData?.price?.amount,
            price_currency: currency || bookingData?.price?.currency || 'EUR',
            provider_name: bookingData?.provider?.name,
            provider_phone: bookingData?.provider?.phone,
            transfer_data: bookingData,
            is_active: true
          });

        if (insertError) {
          console.warn('⚠️ No se pudo guardar en transfers:', insertError.message);
        }
      } catch (dbError) {
        console.warn('⚠️ Error guardando datos del transfer:', dbError);
      }
    }

    res.json({
      success: true,
      data: {
        ...bookingData,
        confirmationCode,
        amadeusBookingId
      }
    });
  } catch (error) {
    console.error('Error al reservar transfer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

// Cancelar transfer
router.delete('/:transferId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transferId } = req.params;
    const { confirmNbr } = req.query;

    if (!confirmNbr) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Se requiere confirmNbr para cancelar' }
      });
      return;
    }

    const result = await cancelTransferOrder(transferId, confirmNbr as string);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: { code: 'CANCEL_FAILED', message: result.error || 'Error al cancelar transfer' }
      });
      return;
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error cancelando transfer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
    });
  }
});

export default router;
