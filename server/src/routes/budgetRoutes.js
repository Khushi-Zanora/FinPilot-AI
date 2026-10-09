import express from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  createBudgetSchema,
  updateBudgetSchema
} from '../controllers/budgetController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/', getBudgets);
router.post('/', validate(createBudgetSchema), createBudget);
router.put('/:id', validate(updateBudgetSchema), updateBudget);
router.delete('/:id', deleteBudget);

export default router;
