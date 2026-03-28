import express from 'express';
import {
  createTransferReservation,
  getTransferReservation,
  updateTransferReservation,
  deleteTransferReservation,
} from '../controllers/transferReservationController';

const router = express.Router();

// Routes for TransferReservation
router.post('/create', createTransferReservation);
router.get('/:confirmNbr', getTransferReservation);
router.put('/:confirmNbr', updateTransferReservation);
router.delete('/:confirmNbr', deleteTransferReservation);

export default router;