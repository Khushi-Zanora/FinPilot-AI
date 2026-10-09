import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { Loan } from '../models/Loan.js';
import { Investment } from '../models/Investment.js';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { RecurringTransaction } from '../models/RecurringTransaction.js';
import {
  calculateTrackedBalance,
  calculateNetCashFlow,
  calculateAvailableCash,
  calculateNetWorth
} from '../services/financeEngine.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user._id;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Fetch Accounts & compute total tracked cash
    const accounts = await Account.find({ userId, isArchived: false });
    let totalTrackedCashPaise = 0;

    for (const acc of accounts) {
      const inflowsAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            $or: [{ accountId: acc._id, type: 'income' }, { toAccountId: acc._id, type: 'transfer' }]
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]);
      const outflowsAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            accountId: acc._id,
            type: { $in: ['expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]);

      const bal = calculateTrackedBalance({
        openingBalancePaise: acc.openingBalancePaise,
        inflowsPaise: inflowsAgg[0]?.total || 0,
        outflowsPaise: outflowsAgg[0]?.total || 0
      });

      // Liquid accounts count towards tracked cash (exclude credit card debt from cash)
      if (acc.type !== 'credit_card') {
        totalTrackedCashPaise += bal;
      }
    }

    // 2. Current Month Cash Flow
    const currentMonthCashflowAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          type: { $in: ['income', 'expense'] }
        }
      },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountPaise' }
        }
      }
    ]);

    let currentMonthIncomePaise = 0;
    let currentMonthExpensePaise = 0;
    currentMonthCashflowAgg.forEach((item) => {
      if (item._id === 'income') currentMonthIncomePaise = item.totalPaise;
      if (item._id === 'expense') currentMonthExpensePaise = item.totalPaise;
    });

    const currentMonthNetPaise = calculateNetCashFlow({
      incomePaise: currentMonthIncomePaise,
      expensePaise: currentMonthExpensePaise
    });

    // 3. Previous Month Cash Flow for Comparison
    const prevMonthCashflowAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: prevMonthStart, $lte: prevMonthEnd },
          type: { $in: ['income', 'expense'] }
        }
      },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountPaise' }
        }
      }
    ]);

    let prevMonthIncomePaise = 0;
    let prevMonthExpensePaise = 0;
    prevMonthCashflowAgg.forEach((item) => {
      if (item._id === 'income') prevMonthIncomePaise = item.totalPaise;
      if (item._id === 'expense') prevMonthExpensePaise = item.totalPaise;
    });

    // 4. Savings Goals Earmarks
    const goals = await SavingsGoal.find({ userId, status: 'active' });
    const totalGoalEarmarksPaise = goals.reduce((acc, g) => acc + g.currentAmountPaise, 0);

    // 5. Upcoming 30-Day Obligations (Loans EMI, Recurring Bills, Insurance Premiums)
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [activeLoans, upcomingRecurrings, upcomingInsurance] = await Promise.all([
      Loan.find({ userId, status: 'active' }),
      RecurringTransaction.find({ userId, isActive: true, nextDueDate: { $gte: now, $lte: in30Days } }),
      InsurancePolicy.find({ userId, status: 'active', renewalDate: { $gte: now, $lte: in30Days } })
    ]);

    const upcomingLoanEmiPaise = activeLoans.reduce((acc, l) => acc + l.emiPaise, 0);
    const upcomingRecurringPaise = upcomingRecurrings.reduce((acc, r) => acc + r.amountPaise, 0);
    const upcomingInsurancePaise = upcomingInsurance.reduce((acc, i) => acc + i.premiumAmountPaise, 0);

    const totalUpcoming30DayObligationsPaise = upcomingLoanEmiPaise + upcomingRecurringPaise + upcomingInsurancePaise;

    // 6. Available Uncommitted Cash
    const availableCashPaise = calculateAvailableCash({
      totalTrackedCashPaise,
      activeGoalsEarmarkedPaise: totalGoalEarmarksPaise,
      upcoming30DayObligationsPaise: totalUpcoming30DayObligationsPaise
    });

    // 7. Recent Transactions (last 6)
    const recentTransactions = await Transaction.find({ userId })
      .populate('accountId', 'name type color icon')
      .populate('toAccountId', 'name type color icon')
      .sort({ date: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      data: {
        totalTrackedCashPaise,
        availableCashPaise,
        totalGoalEarmarksPaise,
        upcomingObligations: {
          totalPaise: totalUpcoming30DayObligationsPaise,
          breakdown: {
            loanEmiPaise: upcomingLoanEmiPaise,
            recurringBillsPaise: upcomingRecurringPaise,
            insurancePremiumsPaise: upcomingInsurancePaise
          }
        },
        currentMonth: {
          incomePaise: currentMonthIncomePaise,
          expensePaise: currentMonthExpensePaise,
          netCashFlowPaise: currentMonthNetPaise
        },
        previousMonth: {
          incomePaise: prevMonthIncomePaise,
          expensePaise: prevMonthExpensePaise,
          netCashFlowPaise: prevMonthIncomePaise - prevMonthExpensePaise
        },
        recentTransactions,
        disclaimer: 'Tracked balances and available cash are based on user-recorded accounts and transactions.'
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCashflowTimeseries(req, res, next) {
  try {
    const userId = req.user._id;
    const monthsCount = Math.min(12, Math.max(3, parseInt(req.query.months || '6', 10)));

    const now = new Date();
    const resultSeries = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const year = now.getFullYear();
      const monthIndex = now.getMonth() - i;
      
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      const agg = await Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: start, $lte: end },
            type: { $in: ['income', 'expense'] }
          }
        },
        {
          $group: {
            _id: '$type',
            totalPaise: { $sum: '$amountPaise' }
          }
        }
      ]);

      let incomePaise = 0;
      let expensePaise = 0;
      agg.forEach((item) => {
        if (item._id === 'income') incomePaise = item.totalPaise;
        if (item._id === 'expense') expensePaise = item.totalPaise;
      });

      const monthName = start.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      resultSeries.push({
        monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        label: monthName,
        incomePaise,
        expensePaise,
        netCashFlowPaise: incomePaise - expensePaise
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        timeseries: resultSeries
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBreakdown(req, res, next) {
  try {
    const userId = req.user._id;
    const type = req.query.type === 'income' ? 'income' : 'expense';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          totalPaise: { $sum: '$amountPaise' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPaise: -1 } }
    ]);

    const grandTotalPaise = agg.reduce((acc, c) => acc + c.totalPaise, 0);

    const categories = agg.map((c) => ({
      category: c._id,
      totalPaise: c.totalPaise,
      count: c.count,
      percentage: grandTotalPaise > 0 ? Number(((c.totalPaise / grandTotalPaise) * 100).toFixed(1)) : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        type,
        grandTotalPaise,
        categories
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getNetWorthReport(req, res, next) {
  try {
    const userId = req.user._id;

    // 1. Liquid Accounts Cash
    const accounts = await Account.find({ userId, isArchived: false });
    let totalCashBalancesPaise = 0;
    let creditCardLiabilitiesPaise = 0;

    for (const acc of accounts) {
      const inflowsAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            $or: [{ accountId: acc._id, type: 'income' }, { toAccountId: acc._id, type: 'transfer' }]
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]);
      const outflowsAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            accountId: acc._id,
            type: { $in: ['expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]);

      const bal = calculateTrackedBalance({
        openingBalancePaise: acc.openingBalancePaise,
        inflowsPaise: inflowsAgg[0]?.total || 0,
        outflowsPaise: outflowsAgg[0]?.total || 0
      });

      if (acc.type === 'credit_card') {
        if (bal < 0) creditCardLiabilitiesPaise += Math.abs(bal);
      } else {
        totalCashBalancesPaise += bal;
      }
    }

    // 2. Investments Valuation
    const investments = await Investment.find({ userId });
    const totalInvestmentValuationsPaise = investments.reduce((acc, h) => {
      if (h.currentNavPricePaise) {
        return acc + Math.round(h.units * h.currentNavPricePaise);
      }
      return acc + h.totalInvestedPaise;
    }, 0);

    // 3. Loans Outstanding Principals
    const activeLoans = await Loan.find({ userId, status: 'active' });
    const totalLoanPrincipalsPaise = activeLoans.reduce((acc, l) => acc + l.remainingPrincipalPaise, 0);

    const netWorth = calculateNetWorth({
      cashBalancesPaise: totalCashBalancesPaise,
      investmentValuationsPaise: totalInvestmentValuationsPaise,
      otherAssetsPaise: 0,
      loanPrincipalsPaise: totalLoanPrincipalsPaise,
      otherLiabilitiesPaise: creditCardLiabilitiesPaise
    });

    return res.status(200).json({
      success: true,
      data: {
        netWorth
      }
    });
  } catch (err) {
    next(err);
  }
}
