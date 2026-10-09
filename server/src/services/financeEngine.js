/**
 * FinPilot Financial Calculation Engine
 * Dedicated deterministic finance service.
 * All monetary amounts are handled strictly in integer minor units (Paise for INR: 1 INR = 100 Paise).
 * Floating-point arithmetic on currency is strictly avoided.
 */

/**
 * Convert rupee amount to integer paise.
 * @param {number|string} rupees 
 * @returns {number} Integer paise
 */
export function toMinorUnits(rupees) {
  if (rupees === null || rupees === undefined || isNaN(Number(rupees))) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
}

/**
 * Convert integer paise to decimal rupees.
 * @param {number} paise 
 * @returns {number} Rupee decimal
 */
export function toMajorUnits(paise) {
  if (!paise || isNaN(paise)) return 0;
  return Number((paise / 100).toFixed(2));
}

/**
 * Format integer paise into standard Indian Rupee string (e.g. ₹1,23,456.78)
 * @param {number} paise 
 * @returns {string} Formatted INR currency string
 */
export function formatINR(paise) {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise || 0);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;
  
  const formattedPaise = remainderPaise.toString().padStart(2, '0');
  
  // Format Indian numbering system: last 3 digits, then groups of 2 digits
  let rupeeStr = rupees.toString();
  let lastThree = rupeeStr.substring(rupeeStr.length - 3);
  let otherNumbers = rupeeStr.substring(0, rupeeStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedRupees = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}₹${formattedRupees}.${formattedPaise}`;
}

/**
 * Calculate net cash flow for a specific period.
 * Transfers are strictly excluded prior to calling this function.
 * @param {Object} params
 * @param {number} params.incomePaise
 * @param {number} params.expensePaise
 * @returns {number} Net cash flow in paise (positive or negative)
 */
export function calculateNetCashFlow({ incomePaise = 0, expensePaise = 0 }) {
  const income = Math.max(0, Math.trunc(incomePaise));
  const expense = Math.max(0, Math.trunc(expensePaise));
  return income - expense;
}

/**
 * Calculate tracked account balance.
 * @param {Object} params
 * @param {number} params.openingBalancePaise
 * @param {number} params.inflowsPaise (Income + Incoming Transfers)
 * @param {number} params.outflowsPaise (Expenses + Outgoing Transfers)
 * @returns {number} Current balance in paise
 */
export function calculateTrackedBalance({ openingBalancePaise = 0, inflowsPaise = 0, outflowsPaise = 0 }) {
  const opening = Math.trunc(openingBalancePaise);
  const inflows = Math.trunc(inflowsPaise);
  const outflows = Math.trunc(outflowsPaise);
  return opening + inflows - outflows;
}

/**
 * Calculate uncommitted available cash.
 * @param {Object} params
 * @param {number} params.totalTrackedCashPaise Total cash across all liquid accounts
 * @param {number} params.activeGoalsEarmarkedPaise Total earmarked across active savings goals
 * @param {number} params.upcoming30DayObligationsPaise Mandatory bills/EMIs in the next 30 days
 * @returns {number} Available uncommitted cash in paise
 */
export function calculateAvailableCash({
  totalTrackedCashPaise = 0,
  activeGoalsEarmarkedPaise = 0,
  upcoming30DayObligationsPaise = 0
}) {
  const totalCash = Math.trunc(totalTrackedCashPaise);
  const earmarked = Math.max(0, Math.trunc(activeGoalsEarmarkedPaise));
  const obligations = Math.max(0, Math.trunc(upcoming30DayObligationsPaise));
  return totalCash - earmarked - obligations;
}

/**
 * Determine genuinely investable surplus considering emergency reserve buffer.
 * @param {Object} params
 * @param {number} params.availableCashPaise
 * @param {number} params.averageMonthlyEssentialExpensePaise
 * @param {number} [params.emergencyFundMonths=3] Recommended minimum emergency months (default 3)
 * @returns {Object} Surplus breakdown and guidance recommendation
 */
export function calculateInvestableSurplus({
  availableCashPaise = 0,
  averageMonthlyEssentialExpensePaise = 0,
  emergencyFundMonths = 3
}) {
  const availableCash = Math.max(0, Math.trunc(availableCashPaise));
  const monthlyExpense = Math.max(0, Math.trunc(averageMonthlyEssentialExpensePaise));
  const emergencyReserveTargetPaise = monthlyExpense * emergencyFundMonths;
  
  const investableSurplusPaise = Math.max(0, availableCash - emergencyReserveTargetPaise);
  const hasEmergencyBuffer = availableCash >= emergencyReserveTargetPaise;
  
  return {
    availableCashPaise: availableCash,
    emergencyReserveTargetPaise,
    investableSurplusPaise,
    hasEmergencyBuffer,
    recommendedAction: hasEmergencyBuffer
      ? 'SURPLUS_AVAILABLE_FOR_INVESTMENT'
      : 'BUILD_EMERGENCY_RESERVE_FIRST'
  };
}

/**
 * Calculate category budget consumption and alert status.
 * @param {Object} params
 * @param {number} params.budgetedPaise
 * @param {number} params.spentPaise
 * @returns {Object} Budget consumption status
 */
export function calculateBudgetStatus({ budgetedPaise = 0, spentPaise = 0 }) {
  const budget = Math.max(0, Math.trunc(budgetedPaise));
  const spent = Math.max(0, Math.trunc(spentPaise));
  
  const remainingPaise = budget - spent;
  const consumedPercentage = budget > 0 ? Number(((spent / budget) * 100).toFixed(1)) : (spent > 0 ? 100 : 0);
  
  let status = 'NORMAL';
  if (consumedPercentage >= 100) {
    status = 'EXCEEDED';
  } else if (consumedPercentage >= 80) {
    status = 'WARNING';
  }
  
  return {
    budgetedPaise: budget,
    spentPaise: spent,
    remainingPaise,
    consumedPercentage,
    status
  };
}

/**
 * Calculate savings goal progress, shortfall, and required monthly contribution.
 * @param {Object} params
 * @param {number} params.targetAmountPaise
 * @param {number} params.currentAmountPaise
 * @param {Date|string} params.targetDate
 * @param {Date|string} [params.startDate]
 * @returns {Object} Goal progress breakdown
 */
export function calculateGoalProgress({
  targetAmountPaise = 0,
  currentAmountPaise = 0,
  targetDate,
  startDate = new Date()
}) {
  const target = Math.max(0, Math.trunc(targetAmountPaise));
  const current = Math.max(0, Math.trunc(currentAmountPaise));
  const shortfallPaise = Math.max(0, target - current);
  const progressPercentage = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 100;
  const isCompleted = shortfallPaise === 0;

  const start = new Date(startDate);
  const end = targetDate ? new Date(targetDate) : null;
  
  let remainingMonths = 1;
  if (end && !isNaN(end.getTime())) {
    const diffYears = end.getFullYear() - start.getFullYear();
    const diffMonths = end.getMonth() - start.getMonth();
    const totalMonths = diffYears * 12 + diffMonths;
    remainingMonths = Math.max(1, totalMonths);
  }

  const requiredMonthlySavingsPaise = isCompleted ? 0 : Math.ceil(shortfallPaise / remainingMonths);

  return {
    targetAmountPaise: target,
    currentAmountPaise: current,
    shortfallPaise,
    progressPercentage,
    remainingMonths,
    requiredMonthlySavingsPaise,
    isCompleted
  };
}

/**
 * Calculate purchase affordability over a future time horizon.
 * @param {Object} params
 * @param {number} params.targetCostPaise
 * @param {number} params.durationMonths
 * @param {number} params.estimatedMonthlyIncomePaise
 * @param {number} params.estimatedMonthlyExpensesPaise
 * @param {number} [params.currentSurplusPaise=0]
 * @returns {Object} Affordability breakdown and shortfall
 */
export function calculateAffordability({
  targetCostPaise = 0,
  durationMonths = 1,
  estimatedMonthlyIncomePaise = 0,
  estimatedMonthlyExpensesPaise = 0,
  currentSurplusPaise = 0
}) {
  const cost = Math.max(0, Math.trunc(targetCostPaise));
  const duration = Math.max(1, Math.trunc(durationMonths));
  const monthlyIncome = Math.max(0, Math.trunc(estimatedMonthlyIncomePaise));
  const monthlyExpenses = Math.max(0, Math.trunc(estimatedMonthlyExpensesPaise));
  const initialSurplus = Math.max(0, Math.trunc(currentSurplusPaise));

  const monthlyNetSavingsPaise = monthlyIncome - monthlyExpenses;
  const projectedFutureSavingsPaise = monthlyNetSavingsPaise * duration;
  const projectedTotalSurplusPaise = initialSurplus + projectedFutureSavingsPaise;

  const isAffordable = projectedTotalSurplusPaise >= cost;
  const deficitPaise = isAffordable ? 0 : cost - projectedTotalSurplusPaise;
  const requiredMonthlySavingsPaise = Math.ceil(cost / duration);

  return {
    targetCostPaise: cost,
    durationMonths: duration,
    monthlyNetSavingsPaise,
    projectedTotalSurplusPaise,
    isAffordable,
    deficitPaise,
    requiredMonthlySavingsPaise,
    verdict: isAffordable
      ? 'AFFORDABLE'
      : (monthlyNetSavingsPaise <= 0 ? 'NOT_FEASIBLE_CASH_DEFICIT' : 'SHORTFALL_REQUIRES_ADJUSTMENT')
  };
}

/**
 * Calculate Loan EMI and full amortization schedule.
 * Standard mathematical formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * Rounded to integer paise each month with final month principal adjustment.
 * @param {Object} params
 * @param {number} params.principalPaise
 * @param {number} params.annualInterestRatePercent
 * @param {number} params.tenureMonths
 * @param {Date|string} [params.startDate]
 * @returns {Object} EMI, Amortization schedule, total interest, total repayment
 */
export function calculateLoanAmortization({
  principalPaise = 0,
  annualInterestRatePercent = 0,
  tenureMonths = 1,
  startDate = new Date()
}) {
  const P = Math.max(0, Math.trunc(principalPaise));
  const n = Math.max(1, Math.trunc(tenureMonths));
  const annualRate = Math.max(0, Number(annualInterestRatePercent));
  
  if (P === 0) {
    return {
      emiPaise: 0,
      totalPaymentPaise: 0,
      totalInterestPaise: 0,
      schedule: []
    };
  }

  const monthlyRate = (annualRate / 100) / 12;
  
  let emiPaise = 0;
  if (monthlyRate === 0) {
    emiPaise = Math.round(P / n);
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    emiPaise = Math.round(P * (monthlyRate * factor) / (factor - 1));
  }

  const schedule = [];
  let remainingPrincipal = P;
  let totalInterest = 0;
  let totalPayment = 0;
  
  const start = new Date(startDate);

  for (let month = 1; month <= n; month++) {
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + month);

    const interestForMonth = monthlyRate === 0 ? 0 : Math.round(remainingPrincipal * monthlyRate);
    
    let principalForMonth;
    let paymentForMonth;

    if (month === n) {
      // Final month adjustment to eliminate integer rounding residuals
      principalForMonth = remainingPrincipal;
      paymentForMonth = principalForMonth + interestForMonth;
    } else {
      principalForMonth = Math.min(remainingPrincipal, emiPaise - interestForMonth);
      paymentForMonth = principalForMonth + interestForMonth;
    }

    const openingPrincipal = remainingPrincipal;
    remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);
    
    totalInterest += interestForMonth;
    totalPayment += paymentForMonth;

    schedule.push({
      monthNumber: month,
      dueDate: dueDate.toISOString(),
      openingPrincipalPaise: openingPrincipal,
      principalPaise: principalForMonth,
      interestPaise: interestForMonth,
      totalPaymentPaise: paymentForMonth,
      closingPrincipalPaise: remainingPrincipal
    });
  }

  return {
    emiPaise,
    totalPaymentPaise: totalPayment,
    totalInterestPaise: totalInterest,
    principalPaise: P,
    tenureMonths: n,
    annualInterestRatePercent: annualRate,
    schedule
  };
}

/**
 * Calculate net worth from recorded assets and liabilities.
 * @param {Object} params
 * @param {number} [params.cashBalancesPaise=0]
 * @param {number} [params.investmentValuationsPaise=0]
 * @param {number} [params.otherAssetsPaise=0]
 * @param {number} [params.loanPrincipalsPaise=0]
 * @param {number} [params.otherLiabilitiesPaise=0]
 * @returns {Object} Net worth summary and data completeness indicator
 */
export function calculateNetWorth({
  cashBalancesPaise = 0,
  investmentValuationsPaise = 0,
  otherAssetsPaise = 0,
  loanPrincipalsPaise = 0,
  otherLiabilitiesPaise = 0
}) {
  const cash = Math.max(0, Math.trunc(cashBalancesPaise));
  const investments = Math.max(0, Math.trunc(investmentValuationsPaise));
  const otherAssets = Math.max(0, Math.trunc(otherAssetsPaise));
  
  const loans = Math.max(0, Math.trunc(loanPrincipalsPaise));
  const otherLiabilities = Math.max(0, Math.trunc(otherLiabilitiesPaise));

  const totalAssetsPaise = cash + investments + otherAssets;
  const totalLiabilitiesPaise = loans + otherLiabilities;
  const netWorthPaise = totalAssetsPaise - totalLiabilitiesPaise;

  return {
    totalAssetsPaise,
    totalLiabilitiesPaise,
    netWorthPaise,
    breakdown: {
      assets: {
        cashBalancesPaise: cash,
        investmentValuationsPaise: investments,
        otherAssetsPaise: otherAssets
      },
      liabilities: {
        loanPrincipalsPaise: loans,
        otherLiabilitiesPaise: otherLiabilities
      }
    },
    isEstimate: true,
    completenessNote: 'Derived from user-entered accounts, investments, and recorded loan balances. Not verified live bank data.'
  };
}
