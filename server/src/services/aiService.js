import { config } from '../config/index.js';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { Loan } from '../models/Loan.js';
import {
  calculateTrackedBalance,
  calculateNetCashFlow,
  calculateAvailableCash,
  calculateInvestableSurplus,
  calculateAffordability,
  formatINR,
  toMinorUnits
} from './financeEngine.js';

/**
 * Educational Investment Instrument Catalog for India
 * Clearly marked with risk profiles, liquidity characteristics, and disclaimers.
 */
export const INDIAN_INVESTMENT_OPTIONS = [
  {
    category: 'Emergency & Ultra-Low Risk',
    name: 'Fixed Deposits (FD) / High-Yield Savings',
    suitableFor: 'Emergency buffer and capital preservation (< 1 year)',
    riskLevel: 'Very Low (DICGC insured up to ₹5 Lakh per bank)',
    liquidity: 'High / Instant (Premature withdrawal penalty may apply)',
    returnType: 'Fixed & Guaranteed by Bank',
    taxTreatment: 'Taxed at individual slab rate (TDS applicable)',
    minimumTerm: '7 days to 10 years'
  },
  {
    category: 'Short to Medium Term Capital Growth',
    name: 'Liquid & Short Duration Debt Mutual Funds',
    suitableFor: 'Parking funds for 3 months to 2 years with better tax efficiency/flexibility',
    riskLevel: 'Low to Moderate (Subject to interest rate & credit risk)',
    liquidity: 'High (T+1 redemption)',
    returnType: 'Market-linked debt yield',
    taxTreatment: 'Taxed at slab rates under current IT rules',
    minimumTerm: '1 day onwards'
  },
  {
    category: 'Long-Term Sovereign Backed',
    name: 'Sovereign Gold Bonds (SGB) / G-Secs / RBI Floating Rate Bonds',
    suitableFor: 'Long-term wealth hedge and fixed coupon (5 to 8 years)',
    riskLevel: 'Sovereign (Zero credit default risk)',
    liquidity: 'Moderate (Tradable on exchange or held till maturity)',
    returnType: 'Fixed interest coupon + gold price appreciation / G-Sec yield',
    taxTreatment: 'SGB capital gains exempt on maturity; interest taxable',
    minimumTerm: '5 to 8 years'
  },
  {
    category: 'Long-Term Wealth Creation (Equity)',
    name: 'Broad Market Index Funds / ETFs (Nifty 50 / Sensex)',
    suitableFor: 'Long-term goals (5+ years) aiming to beat inflation',
    riskLevel: 'Moderate to High (Short-term market volatility)',
    liquidity: 'High (T+1 market settlement)',
    returnType: 'Market-linked compounding capital appreciation',
    taxTreatment: 'LTCG: 12.5% on gains exceeding ₹1.25 Lakh/year; STCG: 20%',
    minimumTerm: '5+ years recommended'
  }
];

/**
 * Gather user's aggregated financial context for deterministic evaluation.
 */
export async function gatherUserFinancialContext(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Accounts & cash balance
  const accounts = await Account.find({ userId, isArchived: false });
  let totalTrackedCashPaise = 0;

  for (const acc of accounts) {
    const inflowsAgg = await Transaction.aggregate([
      { $match: { userId, $or: [{ accountId: acc._id, type: 'income' }, { toAccountId: acc._id, type: 'transfer' }] } },
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
    if (acc.type !== 'credit_card') totalTrackedCashPaise += bal;
  }

  // Monthly Cash Flow
  const monthlyTransactions = await Transaction.aggregate([
    {
      $match: {
        userId,
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

  const goals = await SavingsGoal.find({ userId, status: 'active' });
  const totalGoalEarmarksPaise = goals.reduce((acc, g) => acc + g.currentAmountPaise, 0);

  const activeLoans = await Loan.find({ userId, status: 'active' });
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
 * Process AI query deterministically and return structured insights.
 */
export async function processFinancialQuery({ userId, prompt }) {
  const context = await gatherUserFinancialContext(userId);
  const lowerPrompt = prompt.toLowerCase();

  // 1. Detect Intent
  let intent = 'general_insights';
  let responseContent = '';
  let structuredData = null;

  // A. Affordability Query (e.g. "Can I afford a ₹75,000 phone in 3 months?")
  const affordabilityMatch = lowerPrompt.match(/(?:afford|buy|purchase).*?(\d[\d,]*)/i);
  const monthsMatch = lowerPrompt.match(/(\d+)\s*(?:month|months|mo)/i);

  if (lowerPrompt.includes('afford') || lowerPrompt.includes('can i buy')) {
    intent = 'affordability_check';
    const amountStr = affordabilityMatch ? affordabilityMatch[1].replace(/,/g, '') : '75000';
    const targetAmountPaise = toMinorUnits(parseInt(amountStr, 10));
    const durationMonths = monthsMatch ? parseInt(monthsMatch[1], 10) : 3;

    const estIncome = context.monthlyIncomePaise || 6000000; // Default baseline if newly onboarded
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
      responseContent = `### ✅ Affordability Analysis: Feasible\n\n` +
        `Based on your current tracked cash flow, purchasing an item worth **${formatINR(targetAmountPaise)}** over **${durationMonths} months** is **affordable**.\n\n` +
        `- **Target Cost**: ${formatINR(targetAmountPaise)}\n` +
        `- **Projected Total Surplus**: ${formatINR(analysis.projectedTotalSurplusPaise)}\n` +
        `- **Estimated Monthly Net Savings**: ${formatINR(analysis.monthlyNetSavingsPaise)} / month\n\n` +
        `> **Recommendation**: Set up a dedicated savings goal earmark of **${formatINR(analysis.requiredMonthlySavingsPaise)}/month** to ensure this purchase does not impact your emergency reserves.`;
    } else {
      responseContent = `### ⚠️ Affordability Analysis: Shortfall Expected\n\n` +
        `Purchasing an item worth **${formatINR(targetAmountPaise)}** in **${durationMonths} months** creates a projected deficit of **${formatINR(analysis.deficitPaise)}**.\n\n` +
        `- **Target Cost**: ${formatINR(targetAmountPaise)}\n` +
        `- **Required Savings Rate**: ${formatINR(analysis.requiredMonthlySavingsPaise)} / month\n` +
        `- **Projected Deficit**: ${formatINR(analysis.deficitPaise)}\n\n` +
        `> **Suggested Adjustment**: Extend the timeline by **${Math.ceil(targetAmountPaise / (analysis.monthlyNetSavingsPaise || 1))} months** or optimize discretionary monthly expenses.`;
    }
  }

  // B. Investment Surplus Guidance (e.g. "Where should I invest ₹75,000 / savings?")
  else if (lowerPrompt.includes('invest') || lowerPrompt.includes('savings') || lowerPrompt.includes('mutual fund') || lowerPrompt.includes('fd') || lowerPrompt.includes('surplus')) {
    intent = 'investment_suggestions';

    const amountMatch = lowerPrompt.match(/(\d[\d,]*)/);
    const enteredAmount = amountMatch ? toMinorUnits(parseInt(amountMatch[1].replace(/,/g, ''), 10)) : 7500000;

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

    responseContent = `### 💡 Investment Strategy & Surplus Allocation for ${formatINR(enteredAmount)}\n\n` +
      `Before deploying funds into market-linked instruments, we separate **emergency liquidity** from **genuinely investable surplus**:\n\n` +
      `1. **Emergency Reserve Target (3 Months Expenses)**: ${formatINR(surplus.emergencyReserveTargetPaise)}\n` +
      `2. **Genuinely Investable Surplus**: **${formatINR(surplus.investableSurplusPaise)}**\n\n` +
      `---\n\n` +
      `### 📊 Asset Allocation Breakdown\n\n` +
      `| Category | Instrument | Typical Horizon | Risk Profile | Liquidity |\n` +
      `|---|---|---|---|---|\n` +
      `| **Safety & Buffer** | High-Yield Bank FD / Liquid Fund | < 1 year | Very Low | Instant / T+1 |\n` +
      `| **Medium Term (2-4 yrs)** | Short Duration Debt Funds / Arbitrage | 1 - 3 years | Low-Moderate | T+1 |\n` +
      `| **Long Term (5+ yrs)** | Broad Index Funds (Nifty 50 / Sensex) | 5+ years | Moderate-High | T+1 (Market-linked) |\n` +
      `| **Sovereign Hedge** | Sovereign Gold Bonds (SGB) / G-Sec | 5 - 8 years | Sovereign | Fixed Coupon + Gold |\n\n` +
      `> ⚠️ **Regulatory & Educational Disclaimer**: FinPilot provides educational financial modeling and scenarios. We do not provide SEBI-registered individualized investment advice or guaranteed return promises. Please verify current interest rates and consult a registered financial adviser for consequential decisions.`;
  }

  // C. Monthly Financial Summary
  else if (lowerPrompt.includes('summary') || lowerPrompt.includes('month') || lowerPrompt.includes('how am i doing')) {
    intent = 'monthly_summary';

    structuredData = {
      type: 'financial_health_card',
      incomeFormatted: formatINR(context.monthlyIncomePaise),
      expenseFormatted: formatINR(context.monthlyExpensePaise),
      netCashFlowFormatted: formatINR(context.netCashFlowPaise),
      availableCashFormatted: formatINR(context.availableCashPaise)
    };

    responseContent = `### 📋 Your Financial Health Summary\n\n` +
      `- **Current Month Inflow**: ${formatINR(context.monthlyIncomePaise)}\n` +
      `- **Current Month Outflow**: ${formatINR(context.monthlyExpensePaise)}\n` +
      `- **Net Cash Flow**: **${formatINR(context.netCashFlowPaise)}**\n` +
      `- **Uncommitted Available Cash**: ${formatINR(context.availableCashPaise)}\n` +
      `- **Active Savings Goals**: ${context.goalsCount}\n` +
      `- **Active Loans/EMIs**: ${context.loansCount}\n\n` +
      `> **FinPilot Tip**: Maintain your savings rate above 20% of monthly income to accelerate your goal milestones.`;
  }

  // D. General Financial Guidance
  else {
    intent = 'general_guidance';
    responseContent = `### 🧭 FinPilot Financial Guidance\n\n` +
      `I can help you analyze your finances, plan major purchases, and optimize your cash flow. Here are some examples of what you can ask me:\n\n` +
      `1. *"Can I afford a ₹75,000 purchase in 3 months?"*\n` +
      `2. *"I have ₹75,000 savings, where should I invest?"*\n` +
      `3. *"Give me a summary of my cash flow this month."*\n` +
      `4. *"How much should I keep in my emergency fund?"*\n\n` +
      `*All calculations are executed deterministically using your recorded financial accounts and transactions.*`;
  }

  return {
    intent,
    content: responseContent,
    structuredData,
    providerMeta: {
      provider: config.AI_PROVIDER,
      model: config.AI_MODEL_NAME,
      tokensUsed: 120
    }
  };
}
