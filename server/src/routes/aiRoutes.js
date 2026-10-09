import express from 'express';
import {
  getStarterPrompts,
  getConversations,
  getConversationMessages,
  sendChatMessage,
  deleteConversation,
  aiChatSchema
} from '../controllers/aiController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/starter-prompts', getStarterPrompts);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/chat', aiRateLimiter, validate(aiChatSchema), sendChatMessage);
router.delete('/conversations/:id', deleteConversation);

export default router;
