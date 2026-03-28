import { Request, Response } from 'express';
import axios from 'axios';

// Base URL for Amadeus API
const AMADEUS_API_BASE = process.env.AMADEUS_API_BASE || 'https://api.amadeus.com';
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;

// Controller for TransferOrder
export const createTransferOrder = async (req: Request, res: Response) => {
  try {
    const { type, id, transfers, passengers, agency } = req.body;

    // Validate required fields
    if (!type || !id || !transfers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Make API call to Amadeus
    const response = await axios.post(
      `${AMADEUS_API_BASE}/v1/transfer-orders`,
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
    console.error('Error creating transfer order:', error.message);
    return res.status(500).json({ error: 'Failed to create transfer order' });
  }
};

export const getTransferOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing transfer order ID' });
    }

    // Make API call to Amadeus
    const response = await axios.get(
      `${AMADEUS_API_BASE}/v1/transfer-orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching transfer order:', error.message);
    return res.status(500).json({ error: 'Failed to fetch transfer order' });
  }
};

export const updateTransferOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing transfer order ID' });
    }

    // Make API call to Amadeus
    const response = await axios.put(
      `${AMADEUS_API_BASE}/v1/transfer-orders/${id}`,
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
    console.error('Error updating transfer order:', error.message);
    return res.status(500).json({ error: 'Failed to update transfer order' });
  }
};

export const deleteTransferOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing transfer order ID' });
    }

    // Make API call to Amadeus
    const response = await axios.delete(
      `${AMADEUS_API_BASE}/v1/transfer-orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${AMADEUS_API_KEY}`,
        },
      }
    );

    return res.status(200).json({ message: 'Transfer order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transfer order:', error.message);
    return res.status(500).json({ error: 'Failed to delete transfer order' });
  }
};