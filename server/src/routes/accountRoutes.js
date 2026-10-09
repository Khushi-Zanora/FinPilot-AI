import express from 'express';
import {
  getAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
  createAccountSchema,
  updateAccountSchema
} from '../controllers/accountController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/', getAccounts);
router.post('/', validate(createAccountSchema), createAccount);
router.get('/:id', getAccountById);
router.put('/:id', validate(updateAccountSchema), updateAccount);
router.delete('/:id', deleteAccount);

export default router;
