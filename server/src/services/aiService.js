import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
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
 * Custom error class for explicit AI provider error reporting.
 */
export class AiProviderError extends Error {
  constructor(message, { statusCode = 502, code = 'AI_PROVIDER_ERROR', details = null, cause = null } = {}) {
    super(message);
    this.name = 'AiProviderError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    if (cause) this.cause = cause;
  }
}

/**
 * Safe server-side diagnostic logging.
 * NEVER prints API keys, full financial contexts, prompt contents, passwords, or tokens.
 */
export function logAiDiagnostic({ event, correlationId, durationMs = null, errorCode = null, errorType = null, model = null }) {
  const parts = [
    `[AI-DIAGNOSTIC]`,
    `correlationId=${correlationId || 'none'}`,
    `provider=gemini`,
    `model=${model || config.AI_MODEL_NAME || 'gemini-1.5-flash'}`,
    `event=${event}`
  ];
  if (durationMs !== null) parts.push(`durationMs=${durationMs}`);
  if (errorCode !== null) parts.push(`errorCode=${errorCode}`);
  if (errorType !== null) parts.push(`errorType=${errorType}`);
  parts.push(`timestamp=${new Date().toISOString()}`);

  const line = parts.join(' ');
  if (event === 'error') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

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
 * Gather the authenticated user's authorized financial context using existing backend finance services.
 * Every query is strictly scoped to userId to ensure complete multi-tenant isolation.
 */
export async function gatherUserFinancialContext(userId) {
  const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Accounts & Tracked Cash
  const accounts = await Account.find({ userId: userObjId, isArchived: false });
  let totalTrackedCashPaise = 0;
  const accountsDetail = [];

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
    const balance = calculateTrackedBalance({
      openingBalancePaise: acc.openingBalancePaise,
      inflowsPaise: inflowsAgg[0]?.total || 0,
      outflowsPaise: outflowsAgg[0]?.total || 0
    });

    if (acc.type !== 'credit_card') {
      totalTrackedCashPaise += balance;
    }

    accountsDetail.push({
      name: acc.name,
      type: acc.type,
      balancePaise: balance,
      balanceFormatted: formatINR(balance)
    });
  }

  // 2. Current Month Cash Flow & Transactions
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

  // 3. Category Breakdown for Current Month
  const categoryAgg = await Transaction.aggregate([
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

  const categoryBreakdown = categoryAgg.map((c) => ({
    category: c._id,
    totalPaise: c.totalPaise,
    formatted: formatINR(c.totalPaise),
    count: c.count
  }));

  // 4. Top 5 Expenses this month
  const topExpensesDocs = await Transaction.find({
    userId: userObjId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    type: 'expense'
  })
    .sort({ amountPaise: -1 })
    .limit(5);

  const topExpenses = topExpensesDocs.map((tx) => ({
    description: tx.description || tx.category,
    category: tx.category,
    amountPaise: tx.amountPaise,
    formatted: formatINR(tx.amountPaise),
    date: tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : ''
  }));

  // 5. Active Savings Goals
  const goalsDocs = await SavingsGoal.find({ userId: userObjId, status: 'active' });
  const goals = goalsDocs.map((g) => {
    const progress = calculateGoalProgress({
      targetAmountPaise: g.targetAmountPaise,
      currentAmountPaise: g.currentAmountPaise,
      targetDate: g.targetDate
    });
    return {
      name: g.name,
      targetAmountPaise: g.targetAmountPaise,
      currentAmountPaise: g.currentAmountPaise,
      targetFormatted: formatINR(g.targetAmountPaise),
      currentFormatted: formatINR(g.currentAmountPaise),
      progressPercentage: progress.progressPercentage,
      shortfallFormatted: formatINR(progress.shortfallPaise),
      monthlyRequiredFormatted: formatINR(progress.requiredMonthlySavingsPaise),
      targetDate: g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN') : null
    };
  });
  const totalGoalEarmarksPaise = goalsDocs.reduce((sum, g) => sum + g.currentAmountPaise, 0);

  // 6. Active Budgets
  const budgetsDocs = await Budget.find({ userId: userObjId });
  const budgets = budgetsDocs.map((b) => {
    const matchedCategory = categoryBreakdown.find((c) => c.category.toLowerCase() === b.category.toLowerCase());
    const spentPaise = matchedCategory ? matchedCategory.totalPaise : 0;
    const status = calculateBudgetStatus({
      budgetedPaise: b.monthlyLimitPaise,
      spentPaise
    });
    return {
      category: b.category,
      budgetedFormatted: formatINR(b.monthlyLimitPaise),
      spentFormatted: formatINR(spentPaise),
      remainingFormatted: formatINR(status.remainingPaise),
      consumedPercentage: status.consumedPercentage,
      status: status.status
    };
  });

  // 7. Active Loans & EMIs
  const loansDocs = await Loan.find({ userId: userObjId, status: 'active' });
  const loans = loansDocs.map((l) => ({
    lender: l.lender,
    principalFormatted: formatINR(l.principalPaise),
    emiFormatted: formatINR(l.emiPaise),
    interestRate: l.interestRatePercent
  }));
  const monthlyLoanEmiPaise = loansDocs.reduce((acc, l) => acc + l.emiPaise, 0);

  // 8. Upcoming Recurring Transactions
  const recurringDocs = await RecurringTransaction.find({ userId: userObjId, status: 'active' }).limit(10);
  const recurring = recurringDocs.map((r) => ({
    description: r.description,
    type: r.type,
    amountFormatted: formatINR(r.amountPaise),
    frequency: r.frequency,
    nextDueDate: r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString('en-IN') : ''
  }));

  // 9. Liquidity & Investable Surplus via Finance Engine
  const availableCashPaise = calculateAvailableCash({
    totalTrackedCashPaise,
    activeGoalsEarmarkedPaise: totalGoalEarmarksPaise,
    upcoming30DayObligationsPaise: monthlyLoanEmiPaise
  });

  const netCashFlowPaise = calculateNetCashFlow({
    incomePaise: monthlyIncomePaise,
    expensePaise: monthlyExpensePaise
  });

  const surplusAnalysis = calculateInvestableSurplus({
    availableCashPaise,
    averageMonthlyEssentialExpensePaise: monthlyExpensePaise || 2500000,
    emergencyFundMonths: 3
  });

  return {
    accounts: accountsDetail,
    totalTrackedCashPaise,
    availableCashPaise,
    monthlyIncomePaise,
    monthlyExpensePaise,
    netCashFlowPaise,
    categoryBreakdown,
    topExpenses,
    goals,
    budgets,
    loans,
    recurring,
    surplusAnalysis,
    goalsCount: goals.length,
    loansCount: loans.length
  };
}

/**
 * Build ground-truth financial system prompt.
 * Supplies deterministic calculations so Gemini explains verified facts rather than inventing data.
 */
export function buildFinancialSystemInstruction(context) {
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  let text = `You are FinPilot AI Financial Analyst, a knowledgeable, empathetic, and rigorous financial advisor.
Your responses must be grounded strictly in the verified ledger data provided below.

### VERIFIED USER FINANCIAL CONTEXT (${currentMonthName} - All values in Indian Rupees ₹):
- **Total Tracked Liquid Cash**: ${formatINR(context.totalTrackedCashPaise)}
- **Available Uncommitted Cash**: ${formatINR(context.availableCashPaise)}
- **Money Received This Month (Income)**: ${formatINR(context.monthlyIncomePaise)}
- **Money Spent This Month (Expenses)**: ${formatINR(context.monthlyExpensePaise)}
- **Net Cash Flow This Month**: ${formatINR(context.netCashFlowPaise)}
- **Emergency Reserve Target (3 Months)**: ${formatINR(context.surplusAnalysis.emergencyReserveTargetPaise)}
- **Investable Surplus**: ${formatINR(context.surplusAnalysis.investableSurplusPaise)} (Buffer Status: ${context.surplusAnalysis.hasEmergencyBuffer ? 'Funded' : 'Building'})
`;

  if (context.categoryBreakdown.length > 0) {
    text += `\n**Spending by Category This Month**:\n` +
      context.categoryBreakdown.map((c) => `- ${c.category}: ${c.formatted} (${c.count} transactions)`).join('\n') + '\n';
  } else {
    text += `\n**Spending by Category**: No expenses recorded for this month yet.\n`;
  }

  if (context.topExpenses.length > 0) {
    text += `\n**Top Expenses This Month**:\n` +
      context.topExpenses.map((t) => `- ${t.description} (${t.category}): ${t.formatted} on ${t.date}`).join('\n') + '\n';
  }

  if (context.budgets.length > 0) {
    text += `\n**Active Budgets**:\n` +
      context.budgets.map((b) => `- ${b.category}: ${b.spentFormatted} spent of ${b.budgetedFormatted} limit (${b.consumedPercentage}% used, Status: ${b.status})`).join('\n') + '\n';
  }

  if (context.goals.length > 0) {
    text += `\n**Active Savings Goals**:\n` +
      context.goals.map((g) => `- ${g.name}: ${g.currentFormatted} saved of ${g.targetFormatted} (${g.progressPercentage}% complete, Shortfall: ${g.shortfallFormatted}, Target: ${g.targetDate || 'Ongoing'}, Monthly needed: ${g.monthlyRequiredFormatted})`).join('\n') + '\n';
  }

  if (context.loans.length > 0) {
    text += `\n**Active Loans / EMIs**:\n` +
      context.loans.map((l) => `- ${l.lender}: Principal ${l.principalFormatted}, Monthly EMI: ${l.emiFormatted} at ${l.interestRate}%`).join('\n') + '\n';
  }

  if (context.recurring.length > 0) {
    text += `\n**Upcoming Recurring Schedules**:\n` +
      context.recurring.map((r) => `- ${r.description} (${r.type}): ${r.amountFormatted} ${r.frequency}, next due on ${r.nextDueDate}`).join('\n') + '\n';
  }

  text += `
CRITICAL INSTRUCTIONS FOR FINPILOT ANALYST:
1. TRUTHFULNESS & STRICT DATA GROUNDING: Ground all facts and numbers strictly in the verified context provided above. Never invent, hallucinate, or assume any transactions, balances, or figures not present here.
2. FINANCIAL ACCURACY: Use exact figures from the verified data when mentioning money.
3. PURCHASES & AFFORDABILITY: If the user asks whether they can afford a purchase, evaluate based on their available cash (${formatINR(context.availableCashPaise)}), monthly net surplus (${formatINR(context.netCashFlowPaise)}), and target time horizon. Explain clearly and realistically.
4. INVESTMENT TOPICS (INDIA): If asked about investments, explain standard Indian asset classes (Fixed Deposits, Liquid Mutual Funds, Sovereign Gold Bonds, Broad Index Funds) appropriate for their liquidity and surplus. Always include the disclaimer that FinPilot provides educational financial models and does not provide SEBI-registered individualized investment advice.
5. FORMATTING: Respond using clean, structured GitHub-flavored Markdown with bold key numbers and bullet points.`;

  return text;
}

/**
 * Call the Google Gemini API using the official @google/genai SDK.
 * Tracks correlation ID and emits safe diagnostic logs.
 */
export async function callGeminiAiProvider({ prompt, financialContextText, correlationId }) {
  const apiKey = (config.GEMINI_API_KEY || config.AI_API_KEY || '').trim();

  if (!apiKey) {
    logAiDiagnostic({ event: 'unconfigured', correlationId });
    throw new AiProviderError(
      'Google Gemini API key is not configured. Please add GEMINI_API_KEY in server/.env.',
      { statusCode: 503, code: 'AI_NOT_CONFIGURED' }
    );
  }

  const model = config.AI_MODEL_NAME || 'gemini-flash-lite-latest';
  const startTime = Date.now();
  logAiDiagnostic({ event: 'request_start', correlationId, model });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 30000 }
    });

    let response;
    let effectiveModel = model;
    try {
      response = await ai.models.generateContent({
        model: effectiveModel,
        contents: prompt,
        config: {
          systemInstruction: financialContextText,
          temperature: 0.2
        }
      });
    } catch (genErr) {
      if ((genErr.status === 404 || genErr.message?.includes('404') || genErr.message?.includes('not found') || genErr.message?.includes('DEADLINE_EXCEEDED')) && effectiveModel !== 'gemini-flash-lite-latest') {
        effectiveModel = 'gemini-flash-lite-latest';
        logAiDiagnostic({ event: 'model_fallback', correlationId, originalModel: model, fallbackModel: effectiveModel });
        response = await ai.models.generateContent({
          model: effectiveModel,
          contents: prompt,
          config: {
            systemInstruction: financialContextText,
            temperature: 0.2
          }
        });
      } else {
        throw genErr;
      }
    }

    const durationMs = Date.now() - startTime;
    const answerText = response?.text;

    if (!answerText || !answerText.trim()) {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 502, errorType: 'EMPTY_RESPONSE', model: effectiveModel });
      throw new AiProviderError('Google Gemini returned an empty response. Please try again.', {
        statusCode: 502,
        code: 'AI_EMPTY_RESPONSE'
      });
    }

    logAiDiagnostic({ event: 'response_received', correlationId, durationMs, model: effectiveModel });

    return {
      text: answerText.trim(),
      durationMs,
      model: effectiveModel,
      provider: 'gemini'
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;

    if (err instanceof AiProviderError) {
      throw err;
    }

    const rawMessage = err.message || '';
    const status = err.status || 500;

    // Check for API key invalid / unauthenticated
    if (status === 400 || rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('API key not valid')) {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 401, errorType: 'API_KEY_INVALID', model });
      throw new AiProviderError(
        'The configured Google Gemini API key is invalid or unauthorized. Please verify your GEMINI_API_KEY in server/.env.',
        { statusCode: 401, code: 'AI_INVALID_KEY', cause: err }
      );
    }

    // Check for permission denied
    if (status === 403 || rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('unregistered callers')) {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 403, errorType: 'PERMISSION_DENIED', model });
      throw new AiProviderError(
        'Google Gemini API permission denied. Ensure Generative Language API is enabled for this API key.',
        { statusCode: 403, code: 'AI_PERMISSION_DENIED', cause: err }
      );
    }

    // Check for model not found / unsupported
    if (status === 404 || rawMessage.includes('NOT_FOUND') || rawMessage.includes('models/')) {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 404, errorType: 'MODEL_NOT_FOUND', model });
      throw new AiProviderError(
        `Google Gemini model "${model}" was not found or is unsupported. Check AI_MODEL_NAME.`,
        { statusCode: 404, code: 'AI_MODEL_NOT_FOUND', cause: err }
      );
    }

    // Check for quota / rate limit exceeded
    if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('Quota exceeded')) {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 429, errorType: 'QUOTA_EXCEEDED', model });
      throw new AiProviderError(
        'Google Gemini API quota exceeded or rate limit reached. Please try again shortly.',
        { statusCode: 429, code: 'AI_QUOTA_EXCEEDED', cause: err }
      );
    }

    // Check for request timeout
    if (rawMessage.toLowerCase().includes('timeout') || rawMessage.toLowerCase().includes('timed out') || err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
      logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 504, errorType: 'TIMEOUT', model });
      throw new AiProviderError(
        'Google Gemini API request timed out after 25s. Please try again.',
        { statusCode: 504, code: 'AI_TIMEOUT', cause: err }
      );
    }

    logAiDiagnostic({ event: 'error', correlationId, durationMs, errorCode: 502, errorType: 'PROVIDER_ERROR', model });
    throw new AiProviderError(
      `Google Gemini API error: ${rawMessage.slice(0, 200)}`,
      { statusCode: 502, code: 'AI_PROVIDER_ERROR', cause: err }
    );
  }
}

/**
 * Process financial query by combining deterministic backend calculation
 * with genuine Google Gemini explanation.
 */
export async function processFinancialQuery({ userId, prompt, correlationId }) {
  const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const context = await gatherUserFinancialContext(userObjId);
  const lowerPrompt = prompt.toLowerCase().trim();

  // Determine structured intent and compute deterministic cards using existing finance engine
  let intent = 'general_insights';
  let structuredData = null;

  // 1. Affordability Check
  if (lowerPrompt.includes('afford') || lowerPrompt.includes('can i buy') || lowerPrompt.includes('can i purchase')) {
    intent = 'affordability_check';

    // Parse requested cost and duration from prompt or use intelligent defaults
    const amountMatch = prompt.match(/(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
    const monthsMatch = prompt.match(/(\d+)\s*months?/i);

    let parsedCostRupees = 75000;
    if (amountMatch) {
      const numStr = amountMatch[1].replace(/,/g, '');
      const parsedNum = parseInt(numStr, 10);
      if (parsedNum > 0) parsedCostRupees = parsedNum;
    }

    let parsedMonths = 3;
    if (monthsMatch) {
      const numMonths = parseInt(monthsMatch[1], 10);
      if (numMonths > 0) parsedMonths = numMonths;
    }

    const affordability = calculateAffordability({
      targetCostPaise: toMinorUnits(parsedCostRupees),
      durationMonths: parsedMonths,
      estimatedMonthlyIncomePaise: context.monthlyIncomePaise,
      estimatedMonthlyExpensesPaise: context.monthlyExpensePaise,
      currentSurplusPaise: context.availableCashPaise
    });

    structuredData = {
      type: 'affordability_card',
      targetCostFormatted: formatINR(affordability.targetCostPaise),
      durationMonths: affordability.durationMonths,
      isAffordable: affordability.isAffordable,
      deficitFormatted: formatINR(affordability.deficitPaise),
      requiredMonthlySavingsFormatted: formatINR(affordability.requiredMonthlySavingsPaise),
      monthlyNetSavingsFormatted: formatINR(affordability.monthlyNetSavingsPaise),
      projectedTotalSurplusFormatted: formatINR(affordability.projectedTotalSurplusPaise),
      verdict: affordability.verdict
    };
  }

  // 2. Investment Suggestions
  else if (lowerPrompt.includes('invest') || lowerPrompt.includes('portfolio') || lowerPrompt.includes('mutual fund') || lowerPrompt.includes('where to invest')) {
    intent = 'investment_suggestions';
    structuredData = {
      type: 'investment_card',
      surplusAvailable: context.surplusAnalysis.investableSurplusPaise > 0,
      investableSurplusFormatted: formatINR(context.surplusAnalysis.investableSurplusPaise),
      emergencyBufferStatus: context.surplusAnalysis.recommendedAction,
      options: INDIAN_INVESTMENT_OPTIONS
    };
  }

  // 3. Monthly Expenses
  else if (lowerPrompt.includes('spend') || lowerPrompt.includes('spent') || lowerPrompt.includes('expense')) {
    intent = 'monthly_expenses';
    structuredData = {
      type: 'spending_card',
      totalSpentFormatted: formatINR(context.monthlyExpensePaise),
      categories: context.categoryBreakdown
    };
  }

  // 4. Monthly Income
  else if (lowerPrompt.includes('income') || lowerPrompt.includes('receive') || lowerPrompt.includes('salary')) {
    intent = 'monthly_income';
    structuredData = {
      type: 'income_card',
      totalIncomeFormatted: formatINR(context.monthlyIncomePaise)
    };
  }

  // 5. Budgets
  else if (lowerPrompt.includes('budget')) {
    intent = 'budget_status';
    structuredData = {
      type: 'budget_card',
      budgets: context.budgets
    };
  }

  // 6. Savings Goals
  else if (lowerPrompt.includes('goal')) {
    intent = 'goal_savings';
    structuredData = {
      type: 'goal_card',
      goals: context.goals
    };
  }

  // Build grounded prompt and invoke genuine Gemini API
  const systemInstructionText = buildFinancialSystemInstruction(context);
  const geminiResponse = await callGeminiAiProvider({
    prompt,
    financialContextText: systemInstructionText,
    correlationId
  });

  return {
    intent,
    content: geminiResponse.text,
    structuredData,
    providerMeta: {
      provider: 'gemini',
      model: geminiResponse.model,
      durationMs: geminiResponse.durationMs,
      correlationId: correlationId || null,
      isRealProvider: true
    }
  };
}
