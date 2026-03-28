import express from 'express';
import { searchTransfersHandler } from '../controllers/transferController';

const router = express.Router();

router.post('/search', searchTransfersHandler);

export default router;