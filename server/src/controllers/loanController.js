import { z } from 'zod';
import { Loan } from '../models/Loan.js';
import { LoanPayment } from '../models/LoanPayment.js';
import { calculateLoanAmortization } from '../services/financeEngine.js';

export const createLoanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Loan name is required').max(100),
    lender: z.string().max(100).optional().default(''),
    loanType: z.string().optional().default('personal'),
    originalPrincipalPaise: z.number().int().min(1).optional(),
    principalPaise: z.number().int().min(1).optional(),
    annualInterestRatePercent: z.number().min(0).max(100).optional(),
    annualInterestRate: z.number().min(0).max(100).optional(),
    tenureMonths: z.number().int().min(1),
    emiPaise: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional().default(() => new Date().toISOString())
  }).refine((data) => data.originalPrincipalPaise || data.principalPaise, {
    message: 'Principal amount is required',
    path: ['originalPrincipalPaise']
  })
});

export const recordLoanPaymentSchema = z.object({
  body: z.object({
    totalAmountPaise: z.number().int().min(1),
    principalPaidPaise: z.number().int().min(0),
    interestPaidPaise: z.number().int().min(0),
    paymentType: z.enum(['regular_emi', 'prepayment', 'foreclosure']).default('regular_emi'),
    paymentDate: z.string().datetime().optional().default(() => new Date().toISOString()),
    note: z.string().max(200).optional().default('')
  })
});

export async function getLoans(req, res, next) {
  try {
    const loans = await Loan.find({ userId: req.userId }).sort({ createdAt: -1 });

    const totalOutstandingPaise = loans.reduce((acc, l) => l.status === 'active' ? acc + l.remainingPrincipalPaise : acc, 0);
    const totalMonthlyEmiPaise = loans.reduce((acc, l) => l.status === 'active' ? acc + l.emiPaise : acc, 0);

    return res.status(200).json({
      success: true,
      data: {
        loans,
        summary: {
          totalOutstandingPaise,
          totalMonthlyEmiPaise,
          activeLoansCount: loans.filter(l => l.status === 'active').length
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createLoan(req, res, next) {
  try {
    const principalPaise = req.body.originalPrincipalPaise || req.body.principalPaise;
    const ratePercent = req.body.annualInterestRatePercent !== undefined ? req.body.annualInterestRatePercent : (req.body.annualInterestRate || 8.5);
    const tenureMonths = req.body.tenureMonths || 12;
    const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();

    const amortization = calculateLoanAmortization({
      principalPaise,
      annualInterestRatePercent: ratePercent,
      tenureMonths,
      startDate
    });

    const nextDueDate = amortization.schedule[0] ? new Date(amortization.schedule[0].dueDate) : null;

    const loan = await Loan.create({
      name: req.body.name,
      lender: req.body.lender || '',
      loanType: req.body.loanType || 'personal',
      originalPrincipalPaise: principalPaise,
      annualInterestRatePercent: ratePercent,
      tenureMonths,
      startDate,
      userId: req.userId,
      emiPaise: req.body.emiPaise || amortization.emiPaise,
      remainingPrincipalPaise: principalPaise,
      totalInterestPaise: amortization.totalInterestPaise,
      nextDueDate
    });

    return res.status(201).json({
      success: true,
      message: 'Loan recorded successfully',
      data: {
        loan,
        amortizationSummary: {
          emiPaise: amortization.emiPaise,
          totalPaymentPaise: amortization.totalPaymentPaise,
          totalInterestPaise: amortization.totalInterestPaise
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getLoanAmortization(req, res, next) {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found' }
      });
    }

    const amortization = calculateLoanAmortization({
      principalPaise: loan.originalPrincipalPaise,
      annualInterestRatePercent: loan.annualInterestRatePercent,
      tenureMonths: loan.tenureMonths,
      startDate: loan.startDate
    });

    const payments = await LoanPayment.find({ loanId: loan._id }).sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        loan,
        amortization,
        payments
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function recordLoanPayment(req, res, next) {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found' }
      });
    }

    const { totalAmountPaise, principalPaidPaise, interestPaidPaise, paymentType, paymentDate, note } = req.body;

    const payment = await LoanPayment.create({
      userId: req.userId,
      loanId: loan._id,
      totalAmountPaise,
      principalPaidPaise,
      interestPaidPaise,
      paymentType,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      note
    });

    loan.remainingPrincipalPaise = Math.max(0, loan.remainingPrincipalPaise - principalPaidPaise);
    if (loan.remainingPrincipalPaise === 0) {
      loan.status = 'closed';
    }
    await loan.save();

    return res.status(201).json({
      success: true,
      message: 'Loan payment recorded',
      data: {
        payment,
        remainingPrincipalPaise: loan.remainingPrincipalPaise,
        status: loan.status
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteLoan(req, res, next) {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found' }
      });
    }

    await Promise.all([
      Loan.deleteOne({ _id: loan._id }),
      LoanPayment.deleteMany({ loanId: loan._id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Loan and payment history deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
