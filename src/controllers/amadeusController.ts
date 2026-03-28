// ============================================
// AMADEUS CONTROLLER
// Usa el Token Manager para autenticación correcta
// ============================================

import { Request, Response } from 'express';
import { amadeusRequest } from '../services/amadeus-token-manager.js';
import env from '../config/env.js';

const BASE_URL = env.AMADEUS_ENVIRONMENT === 'production'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

// Handler genérico para llamadas dinámicas a Amadeus
export const handleAmadeusAPI = async (req: Request, res: Response) => {
  const { endpoint, method = 'GET', params, body } = req.body;

  if (!endpoint) {
    res.status(400).json({ success: false, message: 'endpoint requerido' });
    return;
  }

  try {
    let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    if (params && method === 'GET') {
      const qs = new URLSearchParams(params).toString();
      url = `${url}?${qs}`;
    }

    const data = await amadeusRequest<unknown>(url.replace(BASE_URL, ''), {
      method,
      body: body ? JSON.stringify(body) : undefined
    });

    res.json(data);
  } catch (error: any) {
    console.error('Error calling Amadeus API:', error.message);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error calling Amadeus API',
      error: error.message
    });
  }
};

export const getAirportCitySearch = async (req: Request, res: Response) => {
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const data = await amadeusRequest<unknown>(`/v1/reference-data/locations?${qs}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFlightAvailabilities = async (req: Request, res: Response) => {
  try {
    const data = await amadeusRequest<unknown>(
      '/v1/shopping/availability/flight-availabilities',
      { method: 'POST', body: JSON.stringify(req.body) }
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHotelRatings = async (req: Request, res: Response) => {
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const data = await amadeusRequest<unknown>(`/v2/e-reputation/hotel-sentiments?${qs}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAirportCityById = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const data = await amadeusRequest<unknown>(`/v1/reference-data/locations/${locationId}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
