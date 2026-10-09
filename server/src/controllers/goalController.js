import { z } from 'zod';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { GoalEntry } from '../models/GoalEntry.js';
import { calculateGoalProgress } from '../services/financeEngine.js';
import { FREE_TIER_MAX_GOALS } from '../middleware/entitlement.js';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Goal name is required').max(100),
    purpose: z.enum(['emergency_fund', 'trip', 'gadget', 'education', 'home', 'vehicle', 'custom']).optional().default('emergency_fund'),
    category: z.string().optional(),
    targetAmountPaise: z.number().int().min(1, 'Target amount must be at least 1 paisa'),
    currentAmountPaise: z.number().int().min(0).default(0),
    targetDate: z.string().optional().nullable().default(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    color: z.string().optional().default('#10b981'),
    icon: z.string().optional().default('target')
  })
});

export const addGoalEntrySchema = z.object({
  body: z.object({
    type: z.enum(['contribution', 'withdrawal']).optional().default('contribution'),
    amountPaise: z.number().int().min(1, 'Amount must be at least 1 paisa'),
    accountId: z.string().optional().nullable(),
    note: z.string().max(200).optional().default(''),
    date: z.string().datetime().optional().default(() => new Date().toISOString())
  })
});

export async function getGoals(req, res, next) {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId, status: { $ne: 'archived' } }).sort({ priority: -1, targetDate: 1 });

    const goalsWithProgress = goals.map((goal) => {
      const progress = calculateGoalProgress({
        targetAmountPaise: goal.targetAmountPaise,
        currentAmountPaise: goal.currentAmountPaise,
        targetDate: goal.targetDate,
        startDate: goal.createdAt
      });

      return {
        ...goal.toObject(),
        progress
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        goals: goalsWithProgress
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createGoal(req, res, next) {
  try {
    if (req.user.plan !== 'premium') {
      const activeGoalCount = await SavingsGoal.countDocuments({
        userId: req.userId,
        status: { $in: ['active', 'paused'] }
      });

      if (activeGoalCount >= FREE_TIER_MAX_GOALS) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PLAN_LIMIT_EXCEEDED',
            message: `Free plan is limited to ${FREE_TIER_MAX_GOALS} active savings goals. Upgrade to FinPilot Premium for unlimited goals.`
          }
        });
      }
    }

    const goal = await SavingsGoal.create({
      ...req.body,
      userId: req.userId
    });

    // If initial amount provided, record initial contribution entry
    if (req.body.currentAmountPaise > 0) {
      await GoalEntry.create({
        userId: req.userId,
        goalId: goal._id,
        type: 'contribution',
        amountPaise: req.body.currentAmountPaise,
        note: 'Initial goal allocation'
      });
    }

    const progress = calculateGoalProgress({
      targetAmountPaise: goal.targetAmountPaise,
      currentAmountPaise: goal.currentAmountPaise,
      targetDate: goal.targetDate,
      startDate: goal.createdAt
    });

    return res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: {
        goal: {
          ...goal.toObject(),
          progress
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function addGoalEntry(req, res, next) {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }

    const { type, amountPaise, note, date } = req.body;

    if (type === 'withdrawal' && amountPaise > goal.currentAmountPaise) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_GOAL_FUNDS',
          message: 'Withdrawal amount exceeds current goal contribution balance'
        }
      });
    }

    const entry = await GoalEntry.create({
      userId: req.userId,
      goalId: goal._id,
      type,
      amountPaise,
      note,
      date: date ? new Date(date) : new Date()
    });

    if (type === 'contribution') {
      goal.currentAmountPaise += amountPaise;
      if (goal.currentAmountPaise >= goal.targetAmountPaise) {
        goal.status = 'completed';
      }
    } else {
      goal.currentAmountPaise = Math.max(0, goal.currentAmountPaise - amountPaise);
      if (goal.status === 'completed' && goal.currentAmountPaise < goal.targetAmountPaise) {
        goal.status = 'active';
      }
    }

    await goal.save();

    const progress = calculateGoalProgress({
      targetAmountPaise: goal.targetAmountPaise,
      currentAmountPaise: goal.currentAmountPaise,
      targetDate: goal.targetDate,
      startDate: goal.createdAt
    });

    return res.status(201).json({
      success: true,
      message: `Goal ${type} recorded successfully`,
      data: {
        entry,
        goal: {
          ...goal.toObject(),
          progress
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }

    await Promise.all([
      SavingsGoal.deleteOne({ _id: goal._id }),
      GoalEntry.deleteMany({ goalId: goal._id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
