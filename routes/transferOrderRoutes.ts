import express from 'express';
import {
  createTransferOrder,
  getTransferOrder,
  updateTransferOrder,
  deleteTransferOrder,
} from '../controllers/transferOrderController';

const router = express.Router();

// Routes for TransferOrder
router.post('/create', createTransferOrder);
router.get('/:id', getTransferOrder);
router.put('/:id', updateTransferOrder);
router.delete('/:id', deleteTransferOrder);

export default router;