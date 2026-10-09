import express from 'express';
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  toggleRecurringTransaction,
  deleteRecurringTransaction,
  processDueRecurringEndpoint,
  createTransactionSchema,
  updateTransactionSchema,
  createRecurringSchema,
  updateRecurringSchema
} from '../controllers/transactionController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

// Recurring transaction schedules
router.get('/recurring', getRecurringTransactions);
router.post('/recurring', validate(createRecurringSchema), createRecurringTransaction);
router.put('/recurring/:id', validate(updateRecurringSchema), updateRecurringTransaction);
router.patch('/recurring/:id/toggle', toggleRecurringTransaction);
router.delete('/recurring/:id', deleteRecurringTransaction);
router.post('/recurring/process-due', processDueRecurringEndpoint);

// Standard ledger transactions
router.get('/', getTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/:id', getTransactionById);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
