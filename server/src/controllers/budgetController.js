import mongoose from 'mongoose';
import { z } from 'zod';
import { Budget } from '../models/Budget.js';
import { Transaction } from '../models/Transaction.js';
import { calculateBudgetStatus } from '../services/financeEngine.js';
import { FREE_TIER_MAX_BUDGETS } from '../middleware/entitlement.js';

export const createBudgetSchema = z.object({
  body: z.object({
    category: z.string().min(1, 'Category is required'),
    amountPaise: z.number().int().min(1, 'Budget amount must be at least 1 paisa').optional(),
    monthlyCapPaise: z.number().int().min(1, 'Budget amount must be at least 1 paisa').optional(),
    period: z.enum(['monthly', 'weekly', 'yearly']).default('monthly'),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2050).optional(),
    alertThresholdPercent: z.number().min(1).max(100).default(80)
  }).refine((data) => data.amountPaise || data.monthlyCapPaise, {
    message: 'Budget amount (amountPaise or monthlyCapPaise) is required',
    path: ['amountPaise']
  })
});

export const updateBudgetSchema = z.object({
  body: z.object({
    amountPaise: z.number().int().min(1).optional(),
    monthlyCapPaise: z.number().int().min(1).optional(),
    alertThresholdPercent: z.number().min(1).max(100).optional()
  })
});

export async function getBudgets(req, res, next) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ userId: req.userId });

    const userObjId = mongoose.Types.ObjectId.isValid(req.userId) ? new mongoose.Types.ObjectId(req.userId) : req.userId;

    // Aggregate expenses by category for the current month
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpentPaise: { $sum: '$amountPaise' }
        }
      }
    ]);

    const spentMap = new Map();
    expensesByCategory.forEach((item) => {
      if (item._id) {
        spentMap.set(item._id.toString().toLowerCase().trim(), item.totalSpentPaise);
      }
    });

    const budgetsWithStatus = budgets.map((b) => {
      const catKey = (b.category || '').toString().toLowerCase().trim();
      const spentPaise = spentMap.get(catKey) || 0;
      const statusObj = calculateBudgetStatus({
        budgetedPaise: b.amountPaise,
        spentPaise
      });

      return {
        ...b.toObject(),
        amountPaise: b.amountPaise,
        monthlyCapPaise: b.amountPaise,
        spentPaise: statusObj.spentPaise,
        remainingPaise: statusObj.remainingPaise,
        percent: statusObj.consumedPercentage,
        consumedPercentage: statusObj.consumedPercentage,
        status: statusObj.status
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        budgets: budgetsWithStatus,
        period: {
          month: currentMonth,
          year: currentYear
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createBudget(req, res, next) {
  try {
    if (req.user.plan !== 'premium') {
      const budgetCount = await Budget.countDocuments({ userId: req.userId });
      if (budgetCount >= FREE_TIER_MAX_BUDGETS) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PLAN_LIMIT_EXCEEDED',
            message: `Free plan is limited to ${FREE_TIER_MAX_BUDGETS} budgets. Please upgrade to Premium for unlimited budgets.`
          }
        });
      }
    }

    const amountPaise = req.body.amountPaise || req.body.monthlyCapPaise;
    const now = new Date();
    const budget = await Budget.create({
      ...req.body,
      amountPaise,
      month: req.body.month || now.getMonth() + 1,
      year: req.body.year || now.getFullYear(),
      userId: req.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { 
        budget: {
          ...budget.toObject(),
          monthlyCapPaise: budget.amountPaise
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBudget(req, res, next) {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Budget not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteBudget(req, res, next) {
  try {
    const result = await Budget.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Budget not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
