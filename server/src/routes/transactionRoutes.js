import express from 'express';
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  createTransactionSchema,
  updateTransactionSchema,
  createRecurringSchema
} from '../controllers/transactionController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/recurring', getRecurringTransactions);
router.post('/recurring', validate(createRecurringSchema), createRecurringTransaction);
router.delete('/recurring/:id', deleteRecurringTransaction);

router.get('/', getTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/:id', getTransactionById);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
