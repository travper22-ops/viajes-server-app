// ============================================
// TRANSFER CONTROLLER
// Delegado al servicio amadeus-transfer
// ============================================

import { Request, Response } from 'express';
import { searchTransfers, transformTransferOffer } from '../services/amadeus-transfer.js';

export const searchTransfersHandler = async (req: Request, res: Response) => {
  try {
    const { transferType, startLocation, endLocation, dateTime, passengers } = req.body;

    if (!transferType || !startLocation || !endLocation || !dateTime) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos: transferType, startLocation, endLocation, dateTime.'
      });
      return;
    }

    const result = await searchTransfers({
      transferType,
      startLocationCode: startLocation,
      endLocationCode: endLocation,
      startDateTime: dateTime,
      passengers: passengers || 1
    });

    if (!result.success) {
      res.status(500).json({ success: false, message: result.error });
      return;
    }

    res.json({
      success: true,
      data: (result.data || []).map(transformTransferOffer)
    });
  } catch (error: any) {
    console.error('Error al buscar transferencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};
