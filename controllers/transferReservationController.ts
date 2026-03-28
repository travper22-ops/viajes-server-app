import { Request, Response } from 'express';
import axios from 'axios';

// Base URL for Amadeus API
const AMADEUS_API_BASE = process.env.AMADEUS_API_BASE || 'https://api.amadeus.com';
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;

// Controller for TransferReservation
export const createTransferReservation = async (req: Request, res: Response) => {
  try {
    const { confirmNbr, transferType, start, end, vehicle, quotation } = req.body;

    // Validate required fields
    if (!confirmNbr || !transferType || !start || !end || !vehicle || !quotation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Make API call to Amadeus
    const response = await axios.post(
      `${AMADEUS_API_BASE}/v1/transfer-reservations`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error('Error creating transfer reservation:', error.message);
    return res.status(500).json({ error: 'Failed to create transfer reservation' });
  }
};

export const getTransferReservation = async (req: Request, res: Response) => {
  try {
    const { confirmNbr } = req.params;

    if (!confirmNbr) {
      return res.status(400).json({ error: 'Missing confirmation number' });
    }

    // Make API call to Amadeus
    const response = await axios.get(
      `${AMADEUS_API_BASE}/v1/transfer-reservations/${confirmNbr}`,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching transfer reservation:', error.message);
    return res.status(500).json({ error: 'Failed to fetch transfer reservation' });
  }
};

export const updateTransferReservation = async (req: Request, res: Response) => {
  try {
    const { confirmNbr } = req.params;
    const updateData = req.body;

    if (!confirmNbr) {
      return res.status(400).json({ error: 'Missing confirmation number' });
    }

    // Make API call to Amadeus
    const response = await axios.put(
      `${AMADEUS_API_BASE}/v1/transfer-reservations/${confirmNbr}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error updating transfer reservation:', error.message);
    return res.status(500).json({ error: 'Failed to update transfer reservation' });
  }
};

export const deleteTransferReservation = async (req: Request, res: Response) => {
  try {
    const { confirmNbr } = req.params;

    if (!confirmNbr) {
      return res.status(400).json({ error: 'Missing confirmation number' });
    }

    // Make API call to Amadeus
    const response = await axios.delete(
      `${AMADEUS_API_BASE}/v1/transfer-reservations/${confirmNbr}`,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
        },
      }
    );

    return res.status(200).json({ message: 'Transfer reservation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transfer reservation:', error.message);
    return res.status(500).json({ error: 'Failed to delete transfer reservation' });
  }
};