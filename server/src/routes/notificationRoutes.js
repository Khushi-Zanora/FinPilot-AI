import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/', getNotifications);

export default router;
