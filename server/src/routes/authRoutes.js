import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getCsrfToken,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/csrf-token', getCsrfToken);
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, requireAuth, logout);
router.get('/me', authenticate, requireAuth, getMe);
router.put('/profile', authenticate, requireAuth, validate(updateProfileSchema), updateProfile);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
