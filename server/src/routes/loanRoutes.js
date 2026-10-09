import express from 'express';
import {
  getLoans,
  createLoan,
  getLoanAmortization,
  recordLoanPayment,
  deleteLoan,
  createLoanSchema,
  recordLoanPaymentSchema
} from '../controllers/loanController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/entitlement.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth, requirePremium);

router.get('/', getLoans);
router.post('/', validate(createLoanSchema), createLoan);
router.get('/:id/amortization', getLoanAmortization);
router.post('/:id/payments', validate(recordLoanPaymentSchema), recordLoanPayment);
router.delete('/:id', deleteLoan);

export default router;
