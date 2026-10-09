import express from 'express';
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  createInvestmentSchema,
  updateInvestmentSchema
} from '../controllers/investmentController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/entitlement.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth, requirePremium);

router.get('/', getInvestments);
router.post('/', validate(createInvestmentSchema), createInvestment);
router.put('/:id', validate(updateInvestmentSchema), updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;
