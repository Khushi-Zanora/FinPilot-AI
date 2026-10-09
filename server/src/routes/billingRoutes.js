import express from 'express';
import {
  getPlans,
  getSubscription,
  createOrder,
  verifyPayment,
  cancelSubscription,
  handleWebhook,
  createOrderSchema,
  verifyPaymentSchema
} from '../controllers/billingController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Public route to view plans
router.get('/plans', getPlans);

// Webhook endpoint (must accept raw signature)
router.post('/webhook', handleWebhook);

// Authenticated billing routes
router.use(authenticate, requireAuth);

router.get('/subscription', getSubscription);
router.post('/create-order', validate(createOrderSchema), createOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyPayment);
router.post('/cancel', cancelSubscription);

export default router;
