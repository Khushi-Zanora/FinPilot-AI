import express from 'express';
import {
  getDashboardSummary,
  getCashflowTimeseries,
  getCategoryBreakdown,
  getNetWorthReport
} from '../controllers/dashboardController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/summary', getDashboardSummary);
router.get('/cashflow-chart', getCashflowTimeseries);
router.get('/timeseries', getCashflowTimeseries);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/categories', getCategoryBreakdown);
router.get('/net-worth', getNetWorthReport);
router.get('/networth', getNetWorthReport);

export default router;
