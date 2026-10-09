import { z } from 'zod';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { calculateTrackedBalance } from '../services/financeEngine.js';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    type: z.enum(['bank', 'cash', 'wallet', 'credit_card', 'investment', 'other']).default('bank'),
    currency: z.string().optional().default('INR'),
    openingBalancePaise: z.number().int('Opening balance must be an integer (in paise)').default(0),
    color: z.string().optional().default('#3b82f6'),
    icon: z.string().optional().default('wallet')
  })
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['bank', 'cash', 'wallet', 'credit_card', 'investment', 'other']).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    isArchived: z.boolean().optional()
  })
});

export async function getAccounts(req, res, next) {
  try {
    const accounts = await Account.find({ userId: req.userId, isArchived: false }).sort({ createdAt: 1 });

    // Compute live balance for each account from its ledger
    const accountSummaries = await Promise.all(
      accounts.map(async (acc) => {
        // Inflows: income to this account OR transfers into this account
        const inflowsAgg = await Transaction.aggregate([
          {
            $match: {
              userId: acc.userId,
              $or: [
                { accountId: acc._id, type: 'income' },
                { toAccountId: acc._id, type: 'transfer' }
              ]
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]);

        // Outflows: expense from this account, transfer out, goal contribution, loan payment, investment buy
        const outflowsAgg = await Transaction.aggregate([
          {
            $match: {
              userId: acc.userId,
              accountId: acc._id,
              type: { $in: ['expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy'] }
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]);

        const inflowsPaise = inflowsAgg[0]?.total || 0;
        const outflowsPaise = outflowsAgg[0]?.total || 0;
        const currentBalancePaise = calculateTrackedBalance({
          openingBalancePaise: acc.openingBalancePaise,
          inflowsPaise,
          outflowsPaise
        });

        return {
          ...acc.toObject(),
          inflowsPaise,
          outflowsPaise,
          currentBalancePaise
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        accounts: accountSummaries
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req, res, next) {
  try {
    const account = await Account.create({
      ...req.body,
      userId: req.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        account: {
          ...account.toObject(),
          currentBalancePaise: account.openingBalancePaise
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getAccountById(req, res, next) {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    const recentTransactions = await Transaction.find({
      userId: req.userId,
      $or: [{ accountId: account._id }, { toAccountId: account._id }]
    })
      .sort({ date: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        account,
        recentTransactions
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: { account }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' }
      });
    }

    const transactionCount = await Transaction.countDocuments({
      userId: req.userId,
      $or: [{ accountId: account._id }, { toAccountId: account._id }]
    });

    if (transactionCount > 0) {
      // Soft-archive to preserve audit ledger and history
      account.isArchived = true;
      await account.save();
      return res.status(200).json({
        success: true,
        message: 'Account has recorded transactions and was archived instead of permanently deleted.'
      });
    }

    await Account.deleteOne({ _id: account._id });
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
