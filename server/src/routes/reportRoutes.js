import express from 'express';
import {
  getReportsSummary,
  getReportsCategories,
  exportTransactionsCsv
} from '../controllers/reportController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/summary', getReportsSummary);
router.get('/categories', getReportsCategories);
router.get('/export/csv', exportTransactionsCsv);

export default router;
