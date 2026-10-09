import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { Budget } from '../models/Budget.js';
import { RecurringTransaction } from '../models/RecurringTransaction.js';
import { Loan } from '../models/Loan.js';
import {
  calculateTrackedBalance,
  calculateNetCashFlow,
  calculateAvailableCash,
  calculateInvestableSurplus,
  calculateAffordability,
  calculateGoalProgress,
  calculateBudgetStatus,
  formatINR,
  toMinorUnits
} from './financeEngine.js';

/**
 * Educational Investment Instrument Catalog for India
 * Clearly marked with risk profiles, liquidity characteristics, and disclaimers.
 */
export const INDIAN_INVESTMENT_OPTIONS = [
  {
    category: 'Safety & Ultra-Low Risk',
    name: 'Fixed Deposits (FD) / High-Yield Savings',
    suitableFor: 'Emergency buffer and capital preservation (< 1 year)',
    riskLevel: 'Very Low (DICGC insured up to ₹5 Lakh per bank)',
    liquidity: 'High / Instant (Premature withdrawal penalty may apply)',
    returnType: 'Fixed & Guaranteed by Bank',
    taxTreatment: 'Taxed at individual income tax slab rate',
    minimumTerm: '7 days to 10 years'
  },
  {
    category: 'Short to Medium Term (1-3 yrs)',
    name: 'Liquid & Short Duration Debt Mutual Funds',
    suitableFor: 'Parking funds for 3 months to 2 years with higher flexibility',
    riskLevel: 'Low to Moderate (Subject to interest rate & credit quality)',
    liquidity: 'High (T+1 redemption to bank account)',
    returnType: 'Market-linked debt yield',
    taxTreatment: 'Taxed at individual income slab rate',
    minimumTerm: '1 day onwards'
  },
  {
    category: 'Long-Term Sovereign Hedge (5-8 yrs)',
    name: 'Sovereign Gold Bonds (SGB) / Government Securities (G-Sec)',
    suitableFor: 'Long-term gold exposure, capital safety, and fixed interest',
    riskLevel: 'Sovereign (Zero credit default risk)',
    liquidity: 'Moderate (Tradable on stock exchange or held to maturity)',
    returnType: '2.5% p.a. fixed interest + gold market appreciation',
    taxTreatment: 'Capital gains exempt on maturity; annual interest is taxable',
    minimumTerm: '5 to 8 years'
  },
  {
    category: 'Long-Term Wealth Growth (5+ yrs)',
    name: 'Broad Market Index Funds / ETFs (Nifty 50 / Sensex)',
    suitableFor: 'Long-term goals (5+ years) aiming to beat inflation',
    riskLevel: 'Moderate to High (Short-term market volatility)',
    liquidity: 'High (T+1 market settlement)',
    returnType: 'Market-linked compounding capital appreciation',
    taxTreatment: 'LTCG: 12.5% on gains exceeding ₹1.25 Lakh/yr; STCG: 20%',
    minimumTerm: '5+ years recommended'
  }
];

/**
 * Gather user's aggregated financial context for deterministic evaluation.
 */
export async function gatherUserFinancialContext(userId) {
  const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Accounts & cash balance
  const accounts = await Account.find({ userId: userObjId, isArchived: false });
  let totalTrackedCashPaise = 0;

  for (const acc of accounts) {
    const inflowsAgg = await Transaction.aggregate([
      { $match: { userId: userObjId, $or: [{ accountId: acc._id, type: 'income' }, { toAccountId: acc._id, type: 'transfer' }] } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } }
    ]);
    const outflowsAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
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
    if (acc.type !== 'credit_card') totalTrackedCashPaise += bal;
  }

  // Monthly Cash Flow
  const monthlyTransactions = await Transaction.aggregate([
    {
      $match: {
        userId: userObjId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        type: { $in: ['income', 'expense'] }
      }
    },
    { $group: { _id: '$type', total: { $sum: '$amountPaise' } } }
  ]);

  let monthlyIncomePaise = 0;
  let monthlyExpensePaise = 0;
  monthlyTransactions.forEach((t) => {
    if (t._id === 'income') monthlyIncomePaise = t.total;
    if (t._id === 'expense') monthlyExpensePaise = t.total;
  });

  const goals = await SavingsGoal.find({ userId: userObjId, status: 'active' });
  const totalGoalEarmarksPaise = goals.reduce((acc, g) => acc + g.currentAmountPaise, 0);

  const activeLoans = await Loan.find({ userId: userObjId, status: 'active' });
  const monthlyLoanEmiPaise = activeLoans.reduce((acc, l) => acc + l.emiPaise, 0);

  const availableCashPaise = calculateAvailableCash({
    totalTrackedCashPaise,
    activeGoalsEarmarkedPaise: totalGoalEarmarksPaise,
    upcoming30DayObligationsPaise: monthlyLoanEmiPaise
  });

  const surplusAnalysis = calculateInvestableSurplus({
    availableCashPaise,
    averageMonthlyEssentialExpensePaise: monthlyExpensePaise || 2500000,
    emergencyFundMonths: 3
  });

  return {
    totalTrackedCashPaise,
    availableCashPaise,
    monthlyIncomePaise,
    monthlyExpensePaise,
    netCashFlowPaise: calculateNetCashFlow({ incomePaise: monthlyIncomePaise, expensePaise: monthlyExpensePaise }),
    surplusAnalysis,
    goalsCount: goals.length,
    loansCount: activeLoans.length
  };
}

/**
 * Call real LLM provider (Google Gemini or OpenAI) if configured, grounded in verified context.
 */
async function callExternalAiProvider({ prompt, financialContextSummary }) {
  const rawKey = (config.AI_API_KEY || config.GEMINI_API_KEY || '').trim();

  if (config.AI_PROVIDER === 'gemini') {
    if (!rawKey) {
      throw new Error('GEMINI_API_KEY is not configured in server environment variables.');
    }
    const model = config.AI_MODEL_NAME || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${rawKey}`;
    
    const systemPrompt = `You are FinPilot AI Financial Analyst. You assist users with personal finance using strictly verified ledger calculations provided below. Never invent numbers or claim to execute transactions. Provide concise, friendly markdown responses with clear disclaimers on investment topics.\n\nUser Verified Context:\n${financialContextSummary}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': rawKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
          }
        ]
      })
    });

    if (!res.ok) {
      let msg = `Gemini API error (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) {
          msg = errJson.error.message;
        }
      } catch (_) {
        const errBody = await res.text();
        msg = `${msg}: ${errBody.slice(0, 150)}`;
      }
      throw new Error(msg);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } else if (config.AI_PROVIDER === 'openai') {
    if (!rawKey) {
      throw new Error('OPENAI_API_KEY is not configured in server environment variables.');
    }
    const model = config.AI_MODEL_NAME || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = `You are FinPilot AI Financial Analyst. You assist users with personal finance using strictly verified ledger calculations provided below. Never invent numbers. User Verified Context:\n${financialContextSummary}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rawKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errBody.slice(0, 100)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  }

  return null;
}

/**
 * Process AI query deterministically and return structured insights.
 */
export async function processFinancialQuery({ userId, prompt }) {
  const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const context = await gatherUserFinancialContext(userObjId);
  const lowerPrompt = prompt.toLowerCase().trim();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let intent = 'general_insights';
  let responseContent = '';
  let structuredData = null;

  // 1. "How much did I spend this month?" / "What is my spending?"
  if (
    (lowerPrompt.includes('how much') && (lowerPrompt.includes('spend') || lowerPrompt.includes('spent') || lowerPrompt.includes('expense'))) ||
    lowerPrompt.includes('total spending') ||
    lowerPrompt.includes('spending this month') ||
    lowerPrompt.includes('expenses this month')
  ) {
    intent = 'monthly_expenses';

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          type: 'expense'
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

    if (context.monthlyExpensePaise === 0) {
      responseContent = `### 💸 Spending This Month\n\nYou have not recorded any money spent (expenses) for this month yet (${now.toLocaleString('default', { month: 'long', year: 'numeric' })}).\n\nWhen you record your daily expenses, I'll calculate your total spending and show you where your money went.`;
    } else {
      let breakdownText = categoryBreakdown
        .map((c) => `- **${c._id}**: ${formatINR(c.totalPaise)} (${c.count} transaction${c.count > 1 ? 's' : ''})`)
        .join('\n');

      responseContent = `### 💸 Spending This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})\n\n` +
        `You have spent a total of **${formatINR(context.monthlyExpensePaise)}** this month across **${categoryBreakdown.reduce((sum, c) => sum + c.count, 0)}** transactions.\n\n` +
        `#### Spending Breakdown by Category:\n` +
        `${breakdownText}\n\n` +
        `> **Summary**: Your largest expense category is **${categoryBreakdown[0]._id}** at **${formatINR(categoryBreakdown[0].totalPaise)}**.`;
    }
  }

  // 2. "What were my biggest expenses?" / "biggest spending"
  else if (
    lowerPrompt.includes('biggest expense') ||
    lowerPrompt.includes('largest expense') ||
    lowerPrompt.includes('top expense') ||
    lowerPrompt.includes('biggest spending') ||
    lowerPrompt.includes('highest spending')
  ) {
    intent = 'top_expenses';

    const topExpenses = await Transaction.find({
      userId: userObjId,
      type: 'expense'
    })
      .sort({ amountPaise: -1 })
      .limit(5);

    if (topExpenses.length === 0) {
      responseContent = `### 🔍 Biggest Expenses\n\nYou have not recorded any expenses yet. Once you add transactions, your largest purchases and payments will be listed here.`;
    } else {
      let list = topExpenses
        .map(
          (t, idx) =>
            `${idx + 1}. **${t.description || t.category}** (${t.category}): **${formatINR(t.amountPaise)}** on ${new Date(t.date).toLocaleDateString()}`
        )
        .join('\n');

      responseContent = `### 🔍 Your Biggest Expenses\n\nHere are your top recorded expenses:\n\n${list}\n\n` +
        `> **Tip**: Reviewing your largest discretionary expenses regularly helps you find opportunities to save without sacrificing essentials.`;
    }
  }

  // 3. "How much money did I receive this month?" / "income this month"
  else if (
    (lowerPrompt.includes('how much') && (lowerPrompt.includes('receive') || lowerPrompt.includes('income') || lowerPrompt.includes('earn'))) ||
    lowerPrompt.includes('income this month') ||
    lowerPrompt.includes('earnings this month') ||
    lowerPrompt.includes('money received')
  ) {
    intent = 'monthly_income';

    const incomeBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          type: 'income'
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

    if (context.monthlyIncomePaise === 0) {
      responseContent = `### 💰 Money Received This Month\n\nYou have not recorded any income transactions for this month yet (${now.toLocaleString('default', { month: 'long', year: 'numeric' })}).\n\nIf you have a recurring monthly salary, freelancing, or rental income, you can set it up in the **Recurring Income** section.`;
    } else {
      let breakdownText = incomeBreakdown
        .map((c) => `- **${c._id}**: ${formatINR(c.totalPaise)}`)
        .join('\n');

      responseContent = `### 💰 Money Received This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})\n\n` +
        `You have received a total of **${formatINR(context.monthlyIncomePaise)}** this month.\n\n` +
        `#### Income Sources:\n${breakdownText}\n\n` +
        `- **Total Money Received**: ${formatINR(context.monthlyIncomePaise)}\n` +
        `- **Total Money Spent**: ${formatINR(context.monthlyExpensePaise)}\n` +
        `- **Net Remaining**: **${formatINR(context.netCashFlowPaise)}**`;
    }
  }

  // 4. "How much did I save this month?" / "savings this month"
  else if (
    lowerPrompt.includes('how much') && lowerPrompt.includes('save') ||
    lowerPrompt.includes('savings this month') ||
    lowerPrompt.includes('net savings')
  ) {
    intent = 'monthly_savings';

    const goalContributionsAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          type: 'goal_contribution'
        }
      },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } }
    ]);

    const goalContributionsPaise = goalContributionsAgg[0]?.total || 0;
    const netSavingsPaise = context.netCashFlowPaise;

    responseContent = `### 🏦 Savings Overview for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n` +
      `- **Net Cash Flow (Income minus Expenses)**: **${formatINR(netSavingsPaise)}**\n` +
      `- **Contributions Transferred to Savings Goals**: **${formatINR(goalContributionsPaise)}**\n` +
      `- **Total Available Cash Balance**: ${formatINR(context.availableCashPaise)}\n\n` +
      (netSavingsPaise > 0
        ? `> ✅ **Great progress!** You have a positive cash flow of ${formatINR(netSavingsPaise)} this month.`
        : `> ⚠️ Your expenses exceeded or equaled your income this month. Consider reviewing high-spending categories to free up savings.`);
  }

  // 5. "Am I staying within my budgets?" / "budget status"
  else if (
    lowerPrompt.includes('budget') ||
    lowerPrompt.includes('within my budget') ||
    lowerPrompt.includes('over budget')
  ) {
    intent = 'budget_status';

    const budgets = await Budget.find({ userId: userObjId });
    if (budgets.length === 0) {
      responseContent = `### 📊 Budget Status\n\nYou haven't set up any spending budgets yet. Setting a monthly budget for categories like Groceries, Dining, or Utilities helps you prevent overspending.\n\nYou can create your first budget on the **Budgets & Spending** page.`;
    } else {
      const budgetLines = [];
      for (const b of budgets) {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              userId: userObjId,
              category: b.category,
              type: 'expense',
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]);
        const spentPaise = spentAgg[0]?.total || 0;
        const status = calculateBudgetStatus({ budgetedPaise: b.amountPaise, spentPaise });
        const icon = status.status === 'EXCEEDED' ? '❌' : status.status === 'WARNING' ? '⚠️' : '✅';
        budgetLines.push(
          `${icon} **${b.category}**: Spent **${formatINR(spentPaise)}** of ${formatINR(b.amountPaise)} (${status.consumedPercentage}%) - ${status.remainingPaise >= 0 ? `${formatINR(status.remainingPaise)} left` : `${formatINR(Math.abs(status.remainingPaise))} over budget`}`
        );
      }

      responseContent = `### 📊 Budget Status for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n` +
        `Here is the current status of your category budgets:\n\n` +
        budgetLines.join('\n') +
        `\n\n> **Tip**: FinPilot alerts you automatically when any budget reaches 80% of its limit.`;
    }
  }

  // 6. "How much do I need to save each month to reach my goal?" / "savings goals"
  else if (
    lowerPrompt.includes('reach my goal') ||
    lowerPrompt.includes('save each month') ||
    lowerPrompt.includes('goal') ||
    lowerPrompt.includes('goals')
  ) {
    intent = 'goal_targets';

    const goals = await SavingsGoal.find({ userId: userObjId, status: 'active' });
    if (goals.length === 0) {
      responseContent = `### 🎯 Savings Goals\n\nYou do not have any active savings goals right now. Creating a goal (like an Emergency Fund, Vacation, or Down Payment) helps you calculate exactly how much money to put aside each month.\n\nYou can create one on the **Savings Goals** page.`;
    } else {
      const goalLines = goals.map((g) => {
        const progress = calculateGoalProgress({
          targetAmountPaise: g.targetAmountPaise,
          currentAmountPaise: g.currentAmountPaise,
          targetDate: g.targetDate
        });
        return `- **${g.name}**: Target **${formatINR(g.targetAmountPaise)}** | Saved **${formatINR(g.currentAmountPaise)}** (${progress.progressPercentage}%)\n` +
          `  - Target Date: ${new Date(g.targetDate).toLocaleDateString()}\n` +
          `  - **Required Monthly Savings**: **${formatINR(progress.requiredMonthlySavingsPaise)} / month** (${progress.remainingMonths} months left)`;
      });

      responseContent = `### 🎯 Monthly Savings Needed for Your Goals\n\n` +
        goalLines.join('\n\n') +
        `\n\n> **Recommendation**: Set up recurring automatic transfers to your savings account on your salary date to reach these targets smoothly.`;
    }
  }

  // 7. "What recurring income and bills are coming up?" / "upcoming income" / "upcoming bills"
  else if (
    lowerPrompt.includes('recurring') ||
    lowerPrompt.includes('upcoming income') ||
    lowerPrompt.includes('upcoming bill') ||
    lowerPrompt.includes('upcoming payment') ||
    lowerPrompt.includes('coming up')
  ) {
    intent = 'upcoming_recurring';

    const recurringList = await RecurringTransaction.find({ userId: userObjId, isActive: true })
      .populate('accountId', 'name')
      .sort({ nextDueDate: 1 });

    if (recurringList.length === 0) {
      responseContent = `### 🔁 Upcoming Recurring Schedules\n\nYou have no active recurring income or expense schedules set up.\n\nYou can set up recurring salary, rent received, utility bills, or subscriptions on the **Transactions** or **Recurring Income** tab.`;
    } else {
      const incomeList = recurringList.filter((r) => r.type === 'income');
      const expenseList = recurringList.filter((r) => r.type === 'expense');

      let text = `### 🔁 Your Active Recurring Schedules\n\n`;

      if (incomeList.length > 0) {
        text += `#### 💵 Upcoming Expected Income:\n`;
        incomeList.forEach((r) => {
          text += `- **${r.description || r.category}**: **${formatINR(r.amountPaise)}** (${r.frequency}) → Next expected: **${new Date(r.nextDueDate).toLocaleDateString()}** to *${r.accountId?.name || 'Unlinked'}*\n`;
        });
        text += `\n`;
      } else {
        text += `*No recurring income schedules active.*\n\n`;
      }

      if (expenseList.length > 0) {
        text += `#### 📅 Upcoming Recurring Bills & Expenses:\n`;
        expenseList.forEach((r) => {
          text += `- **${r.description || r.category}**: **${formatINR(r.amountPaise)}** (${r.frequency}) → Next due: **${new Date(r.nextDueDate).toLocaleDateString()}**\n`;
        });
      } else {
        text += `*No recurring expense schedules active.*\n`;
      }

      text += `\n> **Note**: Expected recurring income is not counted as money in your account until its scheduled date arrives and the transaction is recorded.`;
      responseContent = text;
    }
  }

  // 8. "Can I afford a purchase of ₹75,000 in three months?" / Affordability
  else if (lowerPrompt.includes('afford') || lowerPrompt.includes('can i buy')) {
    intent = 'affordability_check';
    const affordabilityMatch = lowerPrompt.match(/(?:afford|buy|purchase).*?(\d[\d,]*)/i);
    const monthsMatch = lowerPrompt.match(/(\d+)\s*(?:month|months|mo)/i);

    const amountStr = affordabilityMatch ? affordabilityMatch[1].replace(/,/g, '') : '75000';
    const targetAmountPaise = toMinorUnits(parseInt(amountStr, 10));
    const durationMonths = monthsMatch ? parseInt(monthsMatch[1], 10) : 3;

    const estIncome = context.monthlyIncomePaise || 6000000;
    const estExpenses = context.monthlyExpensePaise || 3500000;

    const analysis = calculateAffordability({
      targetCostPaise: targetAmountPaise,
      durationMonths,
      estimatedMonthlyIncomePaise: estIncome,
      estimatedMonthlyExpensesPaise: estExpenses,
      currentSurplusPaise: Math.max(0, context.availableCashPaise)
    });

    structuredData = {
      type: 'affordability_card',
      analysis,
      targetCostFormatted: formatINR(targetAmountPaise),
      durationMonths,
      monthlySavingsRequiredFormatted: formatINR(analysis.requiredMonthlySavingsPaise),
      projectedSurplusFormatted: formatINR(analysis.projectedTotalSurplusPaise)
    };

    if (analysis.isAffordable) {
      responseContent = `### ✅ Affordability Check: Feasible\n\n` +
        `Based on your recorded income and expenses, purchasing an item worth **${formatINR(targetAmountPaise)}** over **${durationMonths} months** is **affordable**.\n\n` +
        `- **Target Cost**: ${formatINR(targetAmountPaise)}\n` +
        `- **Projected Total Surplus**: ${formatINR(analysis.projectedTotalSurplusPaise)}\n` +
        `- **Estimated Monthly Net Savings**: ${formatINR(analysis.monthlyNetSavingsPaise)} / month\n\n` +
        `> **Recommendation**: Set up a dedicated savings goal of **${formatINR(analysis.requiredMonthlySavingsPaise)}/month** to ensure this purchase does not impact your emergency buffer.`;
    } else {
      responseContent = `### ⚠️ Affordability Check: Shortfall Expected\n\n` +
        `Purchasing an item worth **${formatINR(targetAmountPaise)}** in **${durationMonths} months** would leave a projected shortfall of **${formatINR(analysis.deficitPaise)}**.\n\n` +
        `- **Target Cost**: ${formatINR(targetAmountPaise)}\n` +
        `- **Required Savings Rate**: ${formatINR(analysis.requiredMonthlySavingsPaise)} / month\n` +
        `- **Projected Shortfall**: ${formatINR(analysis.deficitPaise)}\n\n` +
        `> **Suggested Adjustment**: Extend your timeline by **${Math.ceil(targetAmountPaise / Math.max(1, analysis.monthlyNetSavingsPaise))} months** or reduce discretionary spending.`;
    }
  }

  // 9. "Explain my spending in simple words." / "explain spending"
  else if (lowerPrompt.includes('explain') && (lowerPrompt.includes('spending') || lowerPrompt.includes('finances') || lowerPrompt.includes('money'))) {
    intent = 'spending_explanation';

    if (context.monthlyExpensePaise === 0 && context.monthlyIncomePaise === 0) {
      responseContent = `### 📖 Plain-English Financial Summary\n\n` +
        `You have not entered any income or expenses for this month yet.\n\n` +
        `To get started:\n` +
        `1. Add your bank accounts or cash in **Accounts**.\n` +
        `2. Record any money received (salary or income) and money spent (groceries, bills, dining) in **Transactions**.\n` +
        `3. I will then explain your cash flow, savings rate, and spending patterns in plain, simple language.`;
    } else {
      const topCategories = await Transaction.aggregate([
        {
          $match: {
            userId: userObjId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            type: 'expense'
          }
        },
        { $group: { _id: '$category', total: { $sum: '$amountPaise' } } },
        { $sort: { total: -1 } },
        { $limit: 3 }
      ]);

      const topCategoryNames = topCategories.map((c) => `${c._id} (${formatINR(c.total)})`).join(', ');

      responseContent = `### 📖 Plain-English Spending Summary for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n` +
        `- **Money Received**: You brought in **${formatINR(context.monthlyIncomePaise)}** this month.\n` +
        `- **Money Spent**: You spent **${formatINR(context.monthlyExpensePaise)}** this month.\n` +
        `- **What's Left**: You have **${formatINR(context.netCashFlowPaise)}** remaining.\n\n` +
        (topCategories.length > 0 ? `Your top spending areas were: **${topCategoryNames}**.\n\n` : '') +
        (context.netCashFlowPaise > 0
          ? `You are currently spending less than you earn, leaving room to grow your savings or pay down debt.`
          : `Your spending is higher than your income this month. Check your largest expense categories to bring your budget back into balance.`);
    }
  }

  // 10. "Give me general information about investment options in India." / "where should I invest?"
  else if (
    lowerPrompt.includes('invest') ||
    lowerPrompt.includes('investment') ||
    lowerPrompt.includes('mutual fund') ||
    lowerPrompt.includes('fixed deposit') ||
    lowerPrompt.includes('fd') ||
    lowerPrompt.includes('stocks') ||
    lowerPrompt.includes('gold')
  ) {
    intent = 'investment_suggestions';

    const amountMatch = lowerPrompt.match(/(\d[\d,]*)/);
    const enteredAmount = amountMatch ? toMinorUnits(parseInt(amountMatch[1].replace(/,/g, ''), 10)) : (context.availableCashPaise || 5000000);

    const surplus = calculateInvestableSurplus({
      availableCashPaise: enteredAmount,
      averageMonthlyEssentialExpensePaise: context.monthlyExpensePaise || 2000000,
      emergencyFundMonths: 3
    });

    structuredData = {
      type: 'investment_options_card',
      investableAmountFormatted: formatINR(enteredAmount),
      emergencyTargetFormatted: formatINR(surplus.emergencyReserveTargetPaise),
      investableSurplusFormatted: formatINR(surplus.investableSurplusPaise),
      options: INDIAN_INVESTMENT_OPTIONS
    };

    responseContent = `### 💡 Investment Options & Allocation Guide in India\n\n` +
      `Before investing in market instruments, financial planning recommends keeping an **emergency buffer** in safe liquid accounts:\n\n` +
      `- **Emergency Reserve Target (3 Months Expenses)**: ${formatINR(surplus.emergencyReserveTargetPaise)}\n` +
      `- **Genuinely Investable Surplus**: **${formatINR(surplus.investableSurplusPaise)}**\n\n` +
      `---\n\n` +
      `### 📊 Common Investment Instruments in India:\n\n` +
      `1. **Bank Fixed Deposits (FD) / High-Yield Savings**\n` +
      `   - *Best for*: Emergency fund and short-term safety (< 1 year)\n` +
      `   - *Risk*: Very Low (DICGC insured up to ₹5 Lakh per bank)\n` +
      `   - *Liquidity*: High / Instant\n\n` +
      `2. **Liquid & Short-Duration Debt Mutual Funds**\n` +
      `   - *Best for*: 3 months to 2 years holding with quick withdrawal (T+1)\n` +
      `   - *Risk*: Low to Moderate\n\n` +
      `3. **Sovereign Gold Bonds (SGB) / G-Secs**\n` +
      `   - *Best for*: Long-term wealth preservation (5 to 8 years)\n` +
      `   - *Return*: Fixed interest coupon + gold price appreciation\n` +
      `   - *Risk*: Sovereign (Backing of Government of India)\n\n` +
      `4. **Broad Market Index Funds / ETFs (Nifty 50, Sensex)**\n` +
      `   - *Best for*: Long-term growth (5+ years) to beat inflation\n` +
      `   - *Risk*: Moderate to High (Short-term market volatility)\n\n` +
      `> ⚠️ **Educational Disclaimer**: FinPilot provides educational financial modeling. We do not provide SEBI-registered individualized investment advice or guaranteed return promises. Consult a certified financial adviser for personal investment decisions.`;
  }

  // 11. Monthly cash flow summary / default
  else if (lowerPrompt.includes('summary') || lowerPrompt.includes('how am i doing')) {
    intent = 'monthly_summary';

    structuredData = {
      type: 'financial_health_card',
      incomeFormatted: formatINR(context.monthlyIncomePaise),
      expenseFormatted: formatINR(context.monthlyExpensePaise),
      netCashFlowFormatted: formatINR(context.netCashFlowPaise),
      availableCashFormatted: formatINR(context.availableCashPaise)
    };

    responseContent = `### 📋 Financial Health Summary for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n` +
      `- **Money Received (Income)**: ${formatINR(context.monthlyIncomePaise)}\n` +
      `- **Money Spent (Expenses)**: ${formatINR(context.monthlyExpensePaise)}\n` +
      `- **Net Cash Flow**: **${formatINR(context.netCashFlowPaise)}**\n` +
      `- **Available Cash Balance**: ${formatINR(context.availableCashPaise)}\n` +
      `- **Active Savings Goals**: ${context.goalsCount}\n` +
      `- **Active Loans/EMIs**: ${context.loansCount}\n\n` +
      `> **FinPilot Tip**: Aim to maintain a savings rate above 20% of monthly income to build long-term security.`;
  }

  // 12. Fallback guidance or external provider synthesis
  else {
    intent = 'general_guidance';

    // If external AI provider is configured (gemini / openai), attempt real call
    if (config.AI_PROVIDER === 'gemini' || config.AI_PROVIDER === 'openai') {
      try {
        const summaryText = `Tracked Cash: ${formatINR(context.totalTrackedCashPaise)}, Month Inflow: ${formatINR(context.monthlyIncomePaise)}, Month Outflow: ${formatINR(context.monthlyExpensePaise)}, Net Cashflow: ${formatINR(context.netCashFlowPaise)}, Active Goals: ${context.goalsCount}, Active Loans: ${context.loansCount}`;
        const externalAns = await callExternalAiProvider({
          prompt,
          financialContextSummary: summaryText
        });
        if (externalAns) {
          responseContent = externalAns;
        }
      } catch (err) {
        responseContent = `### 🧭 FinPilot Financial Analyst\n\n` +
          `⚠️ *Notice*: The AI provider (${config.AI_PROVIDER}) returned an error: ${err.message}.\n\n` +
          `Here are verified actions you can take with your records:\n` +
          `- Ask about your **monthly spending** or **top expenses**.\n` +
          `- Check your **budget limits** or **goal targets**.\n` +
          `- Review your **upcoming recurring income and bills**.`;
      }
    } else {
      responseContent = `### 🧭 FinPilot Financial Analyst\n\n` +
        `I am your personal financial assistant. Here are real questions you can ask me:\n\n` +
        `1. *"How much did I spend this month?"*\n` +
        `2. *"What were my biggest expenses?"*\n` +
        `3. *"How much money did I receive this month?"*\n` +
        `4. *"Am I staying within my budgets?"*\n` +
        `5. *"How much do I need to save each month to reach my goal?"*\n` +
        `6. *"Can I afford a purchase of ₹75,000 in three months?"*\n` +
        `7. *"What recurring income and bills are coming up?"*\n` +
        `8. *"Explain my spending in simple words."*\n` +
        `9. *"Give me general information about investment options in India."*\n\n` +
        `*All calculations are computed deterministically using your live financial accounts and transactions.*`;
    }
  }

  const isRealProvider = config.AI_PROVIDER === 'gemini' || config.AI_PROVIDER === 'openai';

  return {
    intent,
    content: responseContent,
    structuredData,
    providerMeta: {
      provider: isRealProvider ? config.AI_PROVIDER : 'deterministic_finance_engine',
      model: isRealProvider ? config.AI_MODEL_NAME : 'rules-v1.0',
      isDeterministicCalculations: true
    }
  };
}
