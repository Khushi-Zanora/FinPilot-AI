import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { connectTestDb, closeTestDb, clearTestDb } from '../helpers/db.js';
import { User } from '../../src/models/User.js';

let app;

beforeAll(async () => {
  await connectTestDb();
  app = createApp();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Loans & Subscriptions Persistence Integration Tests', () => {
  let userACookie;
  let userBCookie;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User A',
        email: 'user.a@test.com',
        password: 'Password123!'
      });
    userACookie = resA.headers['set-cookie'];
    // Upgrade User A to premium for loan management access
    await User.updateOne({ email: 'user.a@test.com' }, { plan: 'premium' });

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User B',
        email: 'user.b@test.com',
        password: 'Password123!'
      });
    userBCookie = resB.headers['set-cookie'];
    await User.updateOne({ email: 'user.b@test.com' }, { plan: 'premium' });
  });

  describe('Bug 1 — Loan Lifecycle, Amortization & Summary Consistency', () => {
    it('creates an active loan, generates amortization, records payments, and closes loan cleanly', async () => {
      // 1. Create Active Car Loan
      const createRes = await request(app)
        .post('/api/v1/loans')
        .set('Cookie', userACookie)
        .send({
          name: 'Car Loan',
          lender: 'HDFC Bank',
          loanType: 'auto',
          principalPaise: 100000000, // ₹10,00,000
          annualInterestRate: 8.5,
          tenureMonths: 60,
          emiPaise: 205165 // ₹2,051.65 (or auto-calculated)
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const loanId = createRes.body.data.loan._id;
      expect(loanId).toBeDefined();

      // 2. Query Loans List & Summary
      const listRes = await request(app)
        .get('/api/v1/loans')
        .set('Cookie', userACookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.loans.length).toBe(1);
      const summary = listRes.body.data.summary;
      expect(summary.activeLoansCount).toBe(1);
      expect(summary.totalOutstandingPaise).toBe(100000000);
      expect(summary.totalMonthlyEmiPaise).toBeGreaterThan(0);

      // Verify virtuals in returned loan
      const loan = listRes.body.data.loans[0];
      expect(loan.remainingPrincipalPaise).toBe(100000000);
      expect(loan.outstandingBalancePaise).toBe(100000000);
      expect(loan.annualInterestRatePercent).toBe(8.5);
      expect(loan.annualInterestRate).toBe(8.5);

      // 3. Record Partial Principal Prepayment
      const prepayRes = await request(app)
        .post(`/api/v1/loans/${loanId}/payments`)
        .set('Cookie', userACookie)
        .send({
          totalAmountPaise: 50000000,
          principalPaidPaise: 50000000,
          interestPaidPaise: 0,
          paymentType: 'prepayment',
          note: 'Half prepayed'
        });

      expect(prepayRes.status).toBe(201);
      expect(prepayRes.body.data.remainingPrincipalPaise).toBe(50000000);
      expect(prepayRes.body.data.status).toBe('active');

      // 4. Record Full Foreclosure Payment (Remaining 50,000,000 paise)
      const payoffRes = await request(app)
        .post(`/api/v1/loans/${loanId}/payments`)
        .set('Cookie', userACookie)
        .send({
          totalAmountPaise: 50000000,
          principalPaidPaise: 50000000,
          interestPaidPaise: 0,
          paymentType: 'foreclosure',
          note: 'Full payoff'
        });

      expect(payoffRes.status).toBe(201);
      expect(payoffRes.body.data.remainingPrincipalPaise).toBe(0);
      expect(payoffRes.body.data.status).toBe('closed');

      // 5. Query Loans Summary after Payoff
      const postListRes = await request(app)
        .get('/api/v1/loans')
        .set('Cookie', userACookie);

      expect(postListRes.status).toBe(200);
      const postSummary = postListRes.body.data.summary;
      // Closed loan must not count toward active liabilities or EMI commitments
      expect(postSummary.activeLoansCount).toBe(0);
      expect(postSummary.totalOutstandingPaise).toBe(0);
      expect(postSummary.totalMonthlyEmiPaise).toBe(0);

      const paidLoan = postListRes.body.data.loans[0];
      expect(paidLoan.status).toBe('closed');
      expect(paidLoan.remainingPrincipalPaise).toBe(0);
      expect(paidLoan.outstandingBalancePaise).toBe(0);
    });

    it('enforces user isolation for loans (User B cannot view or modify User A loan)', async () => {
      const createRes = await request(app)
        .post('/api/v1/loans')
        .set('Cookie', userACookie)
        .send({
          name: 'Secret Personal Loan',
          principalPaise: 5000000,
          tenureMonths: 12
        });
      const loanId = createRes.body.data.loan._id;

      // User B attempts to access User A's amortization
      const getRes = await request(app)
        .get(`/api/v1/loans/${loanId}/amortization`)
        .set('Cookie', userBCookie);
      expect(getRes.status).toBe(404);

      // User B lists loans
      const listRes = await request(app)
        .get('/api/v1/loans')
        .set('Cookie', userBCookie);
      expect(listRes.body.data.loans.length).toBe(0);
    });
  });

  describe('Bug 2 — Subscriptions Persistence & User Isolation', () => {
    it('persists recurring subscriptions across multiple queries and ensures user isolation', async () => {
      // 1. User A creates 2 recurring subscriptions
      const sub1 = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', userACookie)
        .send({
          description: 'Netflix 4K Ultra',
          amountPaise: 64900,
          type: 'expense',
          category: 'Subscriptions',
          frequency: 'monthly',
          billingCycle: 'monthly',
          status: 'active'
        });

      expect(sub1.status).toBe(201);
      expect(sub1.body.success).toBe(true);
      expect(sub1.body.data.recurring.description).toBe('Netflix 4K Ultra');
      expect(sub1.body.data.recurring.amountPaise).toBe(64900);
      const sub1Id = sub1.body.data.recurring._id;

      const sub2 = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', userACookie)
        .send({
          description: 'Amazon Prime Yearly',
          amountPaise: 149900,
          type: 'expense',
          category: 'Subscriptions',
          frequency: 'yearly',
          billingCycle: 'yearly',
          status: 'active'
        });

      expect(sub2.status).toBe(201);
      expect(sub2.body.data.recurring.description).toBe('Amazon Prime Yearly');

      // 2. Simulate User Navigating Away and Returning (Fetch subscriptions list)
      const fetchRes = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', userACookie);

      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body.success).toBe(true);
      expect(fetchRes.body.data.recurrings.length).toBe(2);
      const names = fetchRes.body.data.recurrings.map(item => item.description);
      expect(names).toContain('Netflix 4K Ultra');
      expect(names).toContain('Amazon Prime Yearly');

      // 3. User B query (User Isolation)
      const userBList = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', userBCookie);

      expect(userBList.status).toBe(200);
      expect(userBList.body.data.recurrings.length).toBe(0); // Zero subscriptions visible to User B

      // 4. Delete subscription sub1
      const deleteRes = await request(app)
        .delete(`/api/v1/transactions/recurring/${sub1Id}`)
        .set('Cookie', userACookie);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 5. Verify persistence after deletion
      const refetchRes = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', userACookie);

      expect(refetchRes.body.data.recurrings.length).toBe(1);
      expect(refetchRes.body.data.recurrings[0].description).toBe('Amazon Prime Yearly');
    });
  });
});
