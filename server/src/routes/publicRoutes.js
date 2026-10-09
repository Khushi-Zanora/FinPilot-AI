import express from 'express';
import { submitContactForm, contactSchema } from '../controllers/publicController.js';
import { contactRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/contact', contactRateLimiter, validate(contactSchema), submitContactForm);

export default router;
