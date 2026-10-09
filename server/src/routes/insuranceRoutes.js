import express from 'express';
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  createPolicySchema,
  updatePolicySchema
} from '../controllers/insuranceController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { requirePremium } from '../middleware/entitlement.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth, requirePremium);

router.get('/', getPolicies);
router.post('/', validate(createPolicySchema), createPolicy);
router.put('/:id', validate(updatePolicySchema), updatePolicy);
router.delete('/:id', deletePolicy);

export default router;
