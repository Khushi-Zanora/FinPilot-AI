import { describe, it, expect } from 'vitest';
import { calculateLoanAmortization, toMinorUnits, formatINR } from '../../src/services/financeEngine.js';
import { Loan } from '../../src/models/Loan.js';

describe('Bug 1 — Loan Calculations & Amortization Schedule Verification', () => {
  describe('Active Loan Reducing-Balance Schedule', () => {
    it('calculates reducing balance schedule accurately for standard active loan', () => {
      // Loan: ₹10,00,000 (100000000 paise) at 8.5% p.a. for 60 months (Car Loan scenario)
      const principalPaise = 100000000;
      const annualRate = 8.5;
      const tenureMonths = 60;

      const result = calculateLoanAmortization({
        principalPaise,
        annualInterestRatePercent: annualRate,
        tenureMonths,
        startDate: new Date('2026-01-01')
      });

      expect(result.emiPaise).toBeGreaterThan(0);
      expect(result.schedule.length).toBe(60);

      // Verify each row consistency
      let previousClosing = principalPaise;
      for (let i = 0; i < result.schedule.length; i++) {
        const row = result.schedule[i];
        expect(row.openingPrincipalPaise).toBe(previousClosing);
        expect(row.principalPaise + row.interestPaise).toBe(row.totalPaymentPaise);
        expect(row.closingPrincipalPaise).toBe(row.openingPrincipalPaise - row.principalPaise);
        expect(row.closingPrincipalPaise).toBeGreaterThanOrEqual(0);
        previousClosing = row.closingPrincipalPaise;
      }

      // Closing principal after final month must be exactly 0
      expect(previousClosing).toBe(0);
    });

    it('ensures final payment never overpays remaining principal and resolves rounding residuals', () => {
      // Odd principal and tenure to test integer rounding
      const principalPaise = 7777777; // ₹77,777.77
      const annualRate = 9.25;
      const tenureMonths = 13;

      const result = calculateLoanAmortization({
        principalPaise,
        annualInterestRatePercent: annualRate,
        tenureMonths
      });

      const totalPrincipalRepaid = result.schedule.reduce((acc, row) => acc + row.principalPaise, 0);
      expect(totalPrincipalRepaid).toBe(principalPaise);
      expect(result.schedule[result.schedule.length - 1].closingPrincipalPaise).toBe(0);
      expect(result.totalPaymentPaise).toBe(result.principalPaise + result.totalInterestPaise);
    });
  });

  describe('Zero Outstanding Principal & Fully Paid Loans', () => {
    it('returns empty schedule and zero EMI obligations when principal is zero', () => {
      const result = calculateLoanAmortization({
        principalPaise: 0,
        annualInterestRatePercent: 8.5,
        tenureMonths: 60
      });

      expect(result.emiPaise).toBe(0);
      expect(result.totalPaymentPaise).toBe(0);
      expect(result.totalInterestPaise).toBe(0);
      expect(result.schedule).toEqual([]);
    });

    it('handles negative or invalid principal gracefully by treating as zero obligation', () => {
      const result = calculateLoanAmortization({
        principalPaise: -500000,
        annualInterestRatePercent: 10,
        tenureMonths: 12
      });

      expect(result.emiPaise).toBe(0);
      expect(result.schedule).toEqual([]);
    });
  });

  describe('Invalid or Missing Inputs Handling', () => {
    it('handles zero interest rate correctly without divide-by-zero errors', () => {
      const principalPaise = 6000000;
      const result = calculateLoanAmortization({
        principalPaise,
        annualInterestRatePercent: 0,
        tenureMonths: 6
      });

      expect(result.emiPaise).toBe(1000000);
      expect(result.totalInterestPaise).toBe(0);
      expect(result.totalPaymentPaise).toBe(principalPaise);
      expect(result.schedule.length).toBe(6);
    });

    it('handles minimum tenure (1 month) cleanly', () => {
      const principalPaise = 5000000;
      const result = calculateLoanAmortization({
        principalPaise,
        annualInterestRatePercent: 12,
        tenureMonths: 1
      });

      expect(result.schedule.length).toBe(1);
      expect(result.schedule[0].principalPaise).toBe(principalPaise);
      expect(result.schedule[0].closingPrincipalPaise).toBe(0);
    });
  });

  describe('Loan Mongoose Model Virtual Compatibility', () => {
    it('provides outstandingBalancePaise and principalPaise virtual getters for backward compatibility', () => {
      const loanDoc = new Loan({
        name: 'Auto Loan Test',
        lender: 'HDFC Bank',
        originalPrincipalPaise: 50000000,
        remainingPrincipalPaise: 35000000,
        annualInterestRatePercent: 8.5,
        tenureMonths: 36,
        emiPaise: 157800,
        userId: '507f1f77bcf86cd799439011'
      });

      const json = loanDoc.toJSON();
      expect(json.remainingPrincipalPaise).toBe(35000000);
      expect(json.outstandingBalancePaise).toBe(35000000);
      expect(json.originalPrincipalPaise).toBe(50000000);
      expect(json.principalPaise).toBe(50000000);
      expect(json.annualInterestRatePercent).toBe(8.5);
      expect(json.annualInterestRate).toBe(8.5);
    });
  });
});
