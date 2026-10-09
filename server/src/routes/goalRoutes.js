import express from 'express';
import {
  getGoals,
  createGoal,
  addGoalEntry,
  deleteGoal,
  createGoalSchema,
  addGoalEntrySchema
} from '../controllers/goalController.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate, requireAuth);

router.get('/', getGoals);
router.post('/', validate(createGoalSchema), createGoal);
router.post('/:id/entries', validate(addGoalEntrySchema), addGoalEntry);
router.post('/:id/contribute', validate(addGoalEntrySchema), addGoalEntry);
router.delete('/:id', deleteGoal);

export default router;
