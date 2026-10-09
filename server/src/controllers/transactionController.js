import { z } from 'zod';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { RecurringTransaction } from '../models/RecurringTransaction.js';
import { Account } from '../models/Account.js';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy']),
    amountPaise: z.number().int().min(1, 'Amount must be at least 1 paisa'),
    accountId: z.string().min(1, 'Account is required'),
    toAccountId: z.string().optional().nullable(),
    category: z.string().min(1, 'Category is required').max(100),
    date: z.string().datetime().optional().default(() => new Date().toISOString()),
    description: z.string().max(500).optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    isRecurring: z.boolean().optional().default(false),
    metadata: z.record(z.any()).optional().default({})
  }).refine((data) => {
    if (data.type === 'transfer') {
      return data.toAccountId && data.toAccountId !== data.accountId;
    }
    return true;
  }, {
    message: 'Destination account is required and must be different from source account for transfers',
    path: ['toAccountId']
  })
});

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy']).optional(),
    amountPaise: z.number().int().min(1).optional(),
    accountId: z.string().optional(),
    toAccountId: z.string().optional().nullable(),
    category: z.string().min(1).max(100).optional(),
    date: z.string().datetime().optional(),
    description: z.string().max(500).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const createRecurringSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense']),
    amountPaise: z.number().int().min(1),
    accountId: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional().default(''),
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
    startDate: z.string().datetime().optional().default(() => new Date().toISOString()),
    nextDueDate: z.string().datetime(),
    endDate: z.string().datetime().optional().nullable()
  })
});

export async function getTransactions(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      category,
      accountId,
      startDate,
      endDate,
      minAmountPaise,
      maxAmountPaise,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.userId };

    if (type) query.type = type;
    if (category) query.category = category;
    if (accountId) {
      query.$or = [{ accountId }, { toAccountId: accountId }];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmountPaise || maxAmountPaise) {
      query.amountPaise = {};
      if (minAmountPaise) query.amountPaise.$gte = parseInt(minAmountPaise, 10);
      if (maxAmountPaise) query.amountPaise.$lte = parseInt(maxAmountPaise, 10);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('accountId', 'name type color icon')
        .populate('toAccountId', 'name type color icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        transactions
      },
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const { accountId, toAccountId } = req.body;

    // Verify user owns the source account
    const sourceAccount = await Account.findOne({ _id: accountId, userId: req.userId });
    if (!sourceAccount) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACCOUNT', message: 'Source account not found or access denied' }
      });
    }

    // If transfer, verify user owns the destination account
    if (toAccountId) {
      const destAccount = await Account.findOne({ _id: toAccountId, userId: req.userId });
      if (!destAccount) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_ACCOUNT', message: 'Destination account not found or access denied' }
        });
      }
    }

    const transaction = await Transaction.create({
      ...req.body,
      userId: req.userId
    });

    const populated = await Transaction.findById(transaction._id)
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon');

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: {
        transaction: populated
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionById(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId })
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    )
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const result = await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecurringTransactions(req, res, next) {
  try {
    const recurrings = await RecurringTransaction.find({ userId: req.userId })
      .populate('accountId', 'name type color icon')
      .sort({ nextDueDate: 1 });

    return res.status(200).json({
      success: true,
      data: { recurrings }
    });
  } catch (err) {
    next(err);
  }
}

export async function createRecurringTransaction(req, res, next) {
  try {
    const recurring = await RecurringTransaction.create({
      ...req.body,
      userId: req.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Recurring transaction rule created',
      data: { recurring }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecurringTransaction(req, res, next) {
  try {
    const result = await RecurringTransaction.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurring rule not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recurring rule deleted'
    });
  } catch (err) {
    next(err);
  }
}
