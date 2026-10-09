import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Loan } from '../models/Loan.js';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { calculateTrackedBalance, toMajorUnits } from '../services/financeEngine.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.userId;
    const now = new Date();
    const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const notifications = [];

    // 1. Check Accounts count & Tracked Cash
    const accounts = await Account.find({ userId, isArchived: false });
    if (accounts.length === 0) {
      notifications.push({
        id: 'notif-welcome',
        type: 'info',
        title: 'Welcome to FinPilot',
        message: 'Get started by creating your primary bank account, cash wallet, or credit card.',
        actionLink: '/workspace/accounts',
        actionLabel: 'Add Account',
        createdAt: now,
        isRead: false
      });
    } else {
      // Calculate total cash
      let totalCashPaise = 0;
      for (const acc of accounts) {
        if (acc.type !== 'credit_card') {
          const inflows = await Transaction.aggregate([
            { $match: { userId: acc.userId, $or: [{ accountId: acc._id, type: 'income' }, { toAccountId: acc._id, type: 'transfer' }] } },
            { $group: { _id: null, total: { $sum: '$amountPaise' } } }
          ]);
          const outflows = await Transaction.aggregate([
            { $match: { userId: acc.userId, accountId: acc._id, type: { $in: ['expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy'] } } },
            { $group: { _id: null, total: { $sum: '$amountPaise' } } }
          ]);
          const bal = calculateTrackedBalance({
            openingBalancePaise: acc.openingBalancePaise,
            inflowsPaise: inflows[0]?.total || 0,
            outflowsPaise: outflows[0]?.total || 0
          });
          totalCashPaise += bal;
        }
      }

      if (totalCashPaise > 0 && totalCashPaise < 500000) {
        notifications.push({
          id: 'notif-low-cash',
          type: 'warning',
          title: 'Low Tracked Cash Balance',
          message: `Your total liquid cash is ₹${toMajorUnits(totalCashPaise).toLocaleString('en-IN')}, which is below ₹5,000.`,
          actionLink: '/workspace/dashboard',
          actionLabel: 'View Cash Flow',
          createdAt: now,
          isRead: false
        });
      }
    }

    // 2. Check Upcoming Loan EMIs
    const activeLoans = await Loan.find({ userId, status: 'active' });
    for (const loan of activeLoans) {
      notifications.push({
        id: `notif-loan-${loan._id}`,
        type: 'reminder',
        title: `Upcoming Loan EMI: ${loan.name}`,
        message: `Monthly EMI of ₹${toMajorUnits(loan.emiPaise).toLocaleString('en-IN')} is scheduled for ${loan.lender || 'your loan'}.`,
        actionLink: '/workspace/loans',
        actionLabel: 'View Loan Details',
        createdAt: now,
        isRead: false
      });
    }

    // 3. Check Upcoming Insurance Renewals
    const upcomingInsurance = await InsurancePolicy.find({
      userId,
      status: 'active',
      renewalDate: { $gte: now, $lte: in30Days }
    });
    for (const policy of upcomingInsurance) {
      notifications.push({
        id: `notif-ins-${policy._id}`,
        type: 'reminder',
        title: `Insurance Policy Renewal Due: ${policy.name}`,
        message: `Premium of ₹${toMajorUnits(policy.premiumAmountPaise).toLocaleString('en-IN')} is due on ${new Date(policy.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
        actionLink: '/workspace/insurance',
        actionLabel: 'View Policy',
        createdAt: now,
        isRead: false
      });
    }

    // 4. Check Budgets
    const budgets = await Budget.find({ userId });
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    for (const budget of budgets) {
      const expensesAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]);
      const spentPaise = expensesAgg[0]?.total || 0;
      if (budget.monthlyCapPaise > 0) {
        const ratio = spentPaise / budget.monthlyCapPaise;
        if (ratio >= 1.0) {
          notifications.push({
            id: `notif-budget-over-${budget._id}`,
            type: 'alert',
            title: `Budget Exceeded: ${budget.category}`,
            message: `You have spent ₹${toMajorUnits(spentPaise).toLocaleString('en-IN')} exceeding the monthly limit of ₹${toMajorUnits(budget.monthlyCapPaise).toLocaleString('en-IN')}.`,
            actionLink: '/workspace/budgets',
            actionLabel: 'Adjust Budget',
            createdAt: now,
            isRead: false
          });
        } else if (ratio >= 0.85) {
          notifications.push({
            id: `notif-budget-warn-${budget._id}`,
            type: 'warning',
            title: `Budget Alert (85%+): ${budget.category}`,
            message: `You have utilized ${(ratio * 100).toFixed(0)}% of your monthly ${budget.category} budget.`,
            actionLink: '/workspace/budgets',
            actionLabel: 'View Budget',
            createdAt: now,
            isRead: false
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (err) {
    next(err);
  }
}
