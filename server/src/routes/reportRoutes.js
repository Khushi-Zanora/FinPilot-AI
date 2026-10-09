import express from 'express';
import { exportTransactionsCsv } from '../controllers/reportController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/entitlement.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/export/csv', requirePremium, exportTransactionsCsv);

export default router;
