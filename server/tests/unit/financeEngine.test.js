import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  toMajorUnits,
  formatINR,
  calculateNetCashFlow,
  calculateTrackedBalance,
  calculateAvailableCash,
  calculateInvestableSurplus,
  calculateBudgetStatus,
  calculateGoalProgress,
  calculateAffordability,
  calculateLoanAmortization,
  calculateNetWorth
} from '../../src/services/financeEngine.js';

describe('FinPilot Financial Calculation Engine', () => {
  describe('Minor Unit Conversions & Currency Formatting', () => {
    it('converts decimal rupees to integer paise without floating point issues', () => {
      expect(toMinorUnits(1234.56)).toBe(123456);
      expect(toMinorUnits('1234.56')).toBe(123456);
      expect(toMinorUnits(0.01)).toBe(1);
      expect(toMinorUnits(0)).toBe(0);
      expect(toMinorUnits(null)).toBe(0);
    });

    it('converts integer paise back to decimal rupees', () => {
      expect(toMajorUnits(123456)).toBe(1234.56);
      expect(toMajorUnits(1)).toBe(0.01);
      expect(toMajorUnits(0)).toBe(0);
    });

    it('formats integer paise to standard Indian Rupee notation', () => {
      expect(formatINR(123456)).toBe('₹1,234.56');
      expect(formatINR(10000000)).toBe('₹1,00,000.00');
      expect(formatINR(1000000000)).toBe('₹1,00,00,000.00');
      expect(formatINR(-50000)).toBe('-₹500.00');
    });
  });

  describe('Cash Flow & Balance Calculations', () => {
    it('calculates net cash flow accurately', () => {
      const net = calculateNetCashFlow({
        incomePaise: 5000000, // ₹50,000
        expensePaise: 3200000 // ₹32,000
      });
      expect(net).toBe(1800000); // ₹18,000
    });

    it('calculates negative cash flow when expenses exceed income', () => {
      const net = calculateNetCashFlow({
        incomePaise: 2000000,
        expensePaise: 3500000
      });
      expect(net).toBe(-1500000);
    });

    it('derives tracked account balance from opening balance and flows', () => {
      const balance = calculateTrackedBalance({
        openingBalancePaise: 1000000, // ₹10,000
        inflowsPaise: 500000,         // +₹5,000
        outflowsPaise: 300000         // -₹3,000
      });
      expect(balance).toBe(1200000); // ₹12,000
    });
  });

  describe('Available Cash & Investable Surplus', () => {
    it('deducts goal earmarks and upcoming 30-day obligations from total cash', () => {
      const available = calculateAvailableCash({
        totalTrackedCashPaise: 10000000, // ₹1,00,000
        activeGoalsEarmarkedPaise: 3000000, // ₹30,000
        upcoming30DayObligationsPaise: 2000000 // ₹20,000
      });
      expect(available).toBe(5000000); // ₹50,000
    });

    it('calculates 3-month emergency buffer and investable surplus correctly', () => {
      const result = calculateInvestableSurplus({
        availableCashPaise: 7500000, // ₹75,000
        averageMonthlyEssentialExpensePaise: 2000000, // ₹20,000 / month
        emergencyFundMonths: 3
      });

      // Target = 3 * 20,000 = 60,000 (6000000 paise)
      // Surplus = 75,000 - 60,000 = 15,000 (1500000 paise)
      expect(result.emergencyReserveTargetPaise).toBe(6000000);
      expect(result.investableSurplusPaise).toBe(1500000);
      expect(result.hasEmergencyBuffer).toBe(true);
      expect(result.recommendedAction).toBe('SURPLUS_AVAILABLE_FOR_INVESTMENT');
    });

    it('flags when available cash does not cover emergency buffer', () => {
      const result = calculateInvestableSurplus({
        availableCashPaise: 5000000, // ₹50,000
        averageMonthlyEssentialExpensePaise: 2000000, // ₹20,000 / month
        emergencyFundMonths: 3 // Target ₹60,000
      });

      expect(result.investableSurplusPaise).toBe(0);
      expect(result.hasEmergencyBuffer).toBe(false);
      expect(result.recommendedAction).toBe('BUILD_EMERGENCY_RESERVE_FIRST');
    });
  });

  describe('Budget Tracking', () => {
    it('returns NORMAL status when spent is below 80%', () => {
      const status = calculateBudgetStatus({
        budgetedPaise: 1000000, // ₹10,000
        spentPaise: 500000      // ₹5,000 (50%)
      });
      expect(status.status).toBe('NORMAL');
      expect(status.remainingPaise).toBe(500000);
      expect(status.consumedPercentage).toBe(50);
    });

    it('returns WARNING status when spent is between 80% and 100%', () => {
      const status = calculateBudgetStatus({
        budgetedPaise: 1000000,
        spentPaise: 850000 // 85%
      });
      expect(status.status).toBe('WARNING');
      expect(status.remainingPaise).toBe(150000);
    });

    it('returns EXCEEDED status when spent is 100% or greater', () => {
      const status = calculateBudgetStatus({
        budgetedPaise: 1000000,
        spentPaise: 1100000 // 110%
      });
      expect(status.status).toBe('EXCEEDED');
      expect(status.remainingPaise).toBe(-100000);
    });
  });

  describe('Savings Goal Projections', () => {
    it('calculates shortfall and required monthly savings accurately', () => {
      const now = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01'); // 6 months

      const goal = calculateGoalProgress({
        targetAmountPaise: 6000000, // ₹60,000
        currentAmountPaise: 2400000, // ₹24,000
        targetDate,
        startDate: now
      });

      expect(goal.shortfallPaise).toBe(3600000); // ₹36,000
      expect(goal.progressPercentage).toBe(40);
      expect(goal.remainingMonths).toBe(6);
      expect(goal.requiredMonthlySavingsPaise).toBe(600000); // ₹6,000 / month
      expect(goal.isCompleted).toBe(false);
    });

    it('marks completed goal correctly', () => {
      const goal = calculateGoalProgress({
        targetAmountPaise: 5000000,
        currentAmountPaise: 5000000,
        targetDate: new Date('2026-12-01')
      });
      expect(goal.shortfallPaise).toBe(0);
      expect(goal.progressPercentage).toBe(100);
      expect(goal.requiredMonthlySavingsPaise).toBe(0);
      expect(goal.isCompleted).toBe(true);
    });
  });

  describe('Affordability Analysis', () => {
    it('evaluates affordability for a target purchase (e.g. ₹75,000 in 3 months)', () => {
      // Monthly income: ₹60,000, Expenses: ₹35,000 -> Monthly savings: ₹25,000
      // 3 months savings = ₹75,000. Existing surplus = ₹10,000. Total projected = ₹85,000.
      const result = calculateAffordability({
        targetCostPaise: 7500000, // ₹75,000
        durationMonths: 3,
        estimatedMonthlyIncomePaise: 6000000,
        estimatedMonthlyExpensesPaise: 3500000,
        currentSurplusPaise: 1000000
      });

      expect(result.isAffordable).toBe(true);
      expect(result.monthlyNetSavingsPaise).toBe(2500000);
      expect(result.projectedTotalSurplusPaise).toBe(8500000);
      expect(result.deficitPaise).toBe(0);
      expect(result.verdict).toBe('AFFORDABLE');
    });

    it('calculates deficit and shortfall when purchase exceeds projected savings', () => {
      // Monthly savings = ₹10,000 * 3 = ₹30,000. Cost = ₹75,000. Deficit = ₹45,000.
      const result = calculateAffordability({
        targetCostPaise: 7500000,
        durationMonths: 3,
        estimatedMonthlyIncomePaise: 4000000,
        estimatedMonthlyExpensesPaise: 3000000,
        currentSurplusPaise: 0
      });

      expect(result.isAffordable).toBe(false);
      expect(result.deficitPaise).toBe(4500000); // ₹45,000 deficit
      expect(result.requiredMonthlySavingsPaise).toBe(2500000); // ₹25,000 / month required
    });
  });

  describe('Loan Amortization Schedule', () => {
    it('computes exact EMI and ensures sum of principals equals original loan amount', () => {
      // Principal: ₹1,00,000 (10000000 paise), 12% per annum, 12 months
      const loan = calculateLoanAmortization({
        principalPaise: 10000000,
        annualInterestRatePercent: 12,
        tenureMonths: 12,
        startDate: new Date('2026-01-01')
      });

      // Standard EMI for 100000 at 12% for 12 months is ~8884.88 -> 888488 paise
      expect(loan.emiPaise).toBe(888488);
      expect(loan.schedule.length).toBe(12);

      // Verify that the sum of principal components matches the original principal exactly
      const totalPrincipalRepaid = loan.schedule.reduce((acc, row) => acc + row.principalPaise, 0);
      expect(totalPrincipalRepaid).toBe(10000000);

      // Verify closing principal on last month is 0
      expect(loan.schedule[11].closingPrincipalPaise).toBe(0);

      // Total interest must match total payments minus principal
      expect(loan.totalPaymentPaise - loan.principalPaise).toBe(loan.totalInterestPaise);
    });

    it('handles 0% interest loan correctly', () => {
      const loan = calculateLoanAmortization({
        principalPaise: 6000000, // ₹60,000
        annualInterestRatePercent: 0,
        tenureMonths: 6
      });

      expect(loan.emiPaise).toBe(1000000); // ₹10,000 / month
      expect(loan.totalInterestPaise).toBe(0);
      expect(loan.totalPaymentPaise).toBe(6000000);
    });
  });

  describe('Net Worth Calculation', () => {
    it('aggregates assets and deducts liabilities to compute net worth', () => {
      const netWorth = calculateNetWorth({
        cashBalancesPaise: 25000000,       // ₹2,50,000
        investmentValuationsPaise: 50000000,// ₹5,00,000
        otherAssetsPaise: 10000000,         // ₹1,00,000
        loanPrincipalsPaise: 20000000,      // ₹2,00,000
        otherLiabilitiesPaise: 5000000      // ₹50,000
      });

      // Total Assets = 2.5L + 5L + 1L = 8.5L (85000000 paise)
      // Total Liabilities = 2L + 0.5L = 2.5L (25000000 paise)
      // Net Worth = 8.5L - 2.5L = 6.0L (60000000 paise)
      expect(netWorth.totalAssetsPaise).toBe(85000000);
      expect(netWorth.totalLiabilitiesPaise).toBe(25000000);
      expect(netWorth.netWorthPaise).toBe(60000000);
      expect(netWorth.isEstimate).toBe(true);
    });
  });
});
