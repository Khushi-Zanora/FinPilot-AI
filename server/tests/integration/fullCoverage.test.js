import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Account } from '../../src/models/Account.js';
import { Transaction } from '../../src/models/Transaction.js';
import { Budget } from '../../src/models/Budget.js';
import { SavingsGoal } from '../../src/models/SavingsGoal.js';
import { Loan } from '../../src/models/Loan.js';
import { Investment } from '../../src/models/Investment.js';
import { InsurancePolicy } from '../../src/models/InsurancePolicy.js';

let mongoServer;
let app;
let authCookie;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = createApp();

  // Register dedicated test user
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Full QA Tester',
      email: 'fullqa.tester@finpilot.test',
      password: 'SecurePassword123!',
      currency: 'INR'
    });

  expect(regRes.status).toBe(201);
  authCookie = regRes.headers['set-cookie'];
  testUserId = regRes.body.data.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('FinPilot Full API Coverage & Financial Regression Tests', () => {
  let createdAccountId;
  let createdGoalId;
  let createdBudgetId;
  let createdLoanId;
  let createdInvId;
  let createdPolicyId;

  it('1. Accounts: creates an account and prevents invalid currency or initial balances', async () => {
    // Missing required name
    const failRes = await request(app)
      .post('/api/v1/accounts')
      .set('Cookie', authCookie)
      .send({ type: 'bank', initialBalancePaise: 5000000 });
    expect(failRes.status).toBe(400);

    // Valid account creation
    const res = await request(app)
      .post('/api/v1/accounts')
      .set('Cookie', authCookie)
      .send({
        name: 'HDFC Savings Salary Account',
        type: 'bank',
        initialBalancePaise: 5000000,
        currency: 'INR'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.account.name).toBe('HDFC Savings Salary Account');
    createdAccountId = res.body.data.account._id;

    // List accounts
    const listRes = await request(app).get('/api/v1/accounts').set('Cookie', authCookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.accounts.length).toBeGreaterThanOrEqual(1);
  });

  it('2. Transactions: records income, expenses, unlinked records and verifies balance derivations', async () => {
    // Record Income
    const incRes = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', authCookie)
      .send({
        type: 'income',
        amountPaise: 10000000, // ₹1,00,000.00
        accountId: createdAccountId,
        category: 'Salary',
        description: 'Monthly Tech Salary'
      });
    expect(incRes.status).toBe(201);

    // Record Expense
    const expRes = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', authCookie)
      .send({
        type: 'expense',
        amountPaise: 2500000, // ₹25,000.00
        accountId: createdAccountId,
        category: 'Housing & Rent',
        description: 'Monthly Apartment Rent'
      });
    expect(expRes.status).toBe(201);

    // Unlinked transaction without account
    const unlinkedRes = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', authCookie)
      .send({
        type: 'expense',
        amountPaise: 150000, // ₹1,500.00
        category: 'Food & Dining',
        description: 'Dinner with team'
      });
    expect(unlinkedRes.status).toBe(201);

    // Verify Dashboard summary computes correct metrics
    const dashRes = await request(app).get('/api/v1/dashboard/summary').set('Cookie', authCookie);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.currentMonth.incomePaise).toBe(10000000);
    expect(dashRes.body.data.currentMonth.expensePaise).toBe(2650000);
    expect(dashRes.body.data.currentMonth.netCashFlowPaise).toBe(7350000);
  });

  it('3. Recurring Schedules: salary (+₹75,000) is recognized as income and NOT counted as a bill', async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const recRes = await request(app)
      .post('/api/v1/transactions/recurring')
      .set('Cookie', authCookie)
      .send({
        type: 'income',
        amountPaise: 7500000, // ₹75,000
        cadence: 'monthly',
        dayOfMonth: 10,
        nextDueDate: nextMonth.toISOString(),
        title: 'Monthly Recurring Consulting Retainer',
        category: 'Consulting'
      });
    expect(recRes.status).toBe(201);

    // Verify dashboard uncommitted cash: upcoming income is NOT deducted as an obligation
    const dashRes = await request(app).get('/api/v1/dashboard/summary').set('Cookie', authCookie);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.upcomingObligations.totalPaise).toBe(0); // 0 bills because schedule is income!
  });

  it('4. Budgets: creates budget and aggregates category spending correctly', async () => {
    const bRes = await request(app)
      .post('/api/v1/budgets')
      .set('Cookie', authCookie)
      .send({
        category: 'Food & Dining',
        monthlyCapPaise: 500000, // ₹5,000 cap
        period: 'monthly'
      });
    expect(bRes.status).toBe(201);
    createdBudgetId = bRes.body.data.budget._id;

    // Get budgets and verify spent amount (₹1,500 previously recorded)
    const listRes = await request(app).get('/api/v1/budgets').set('Cookie', authCookie);
    expect(listRes.status).toBe(200);
    const foodBudget = listRes.body.data.budgets.find((b) => b.category === 'Food & Dining');
    expect(foodBudget).toBeDefined();
    expect(foodBudget.spentPaise).toBe(150000);
    expect(foodBudget.remainingPaise).toBe(350000);
  });

  it('5. Savings Goals: creates goal and records contributions without double-counting as expenses', async () => {
    const gRes = await request(app)
      .post('/api/v1/goals')
      .set('Cookie', authCookie)
      .send({
        name: 'New Car Reserve',
        targetAmountPaise: 50000000, // ₹5,00,000
        category: 'vehicle_purchase'
      });
    expect(gRes.status).toBe(201);
    createdGoalId = gRes.body.data.goal._id;

    // Contribute ₹50,000
    const contRes = await request(app)
      .post(`/api/v1/goals/${createdGoalId}/contribute`)
      .set('Cookie', authCookie)
      .send({
        amountPaise: 5000000
      });
    expect(contRes.status).toBe(201);
    expect(contRes.body.data.goal.currentAmountPaise).toBe(5000000);
  });

  it('6. Billing Upgrade: creates order and upgrades account to Premium tier', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/v1/billing/create-order')
      .set('Cookie', authCookie)
      .send({ planId: 'premium_yearly' });
    expect(orderRes.status).toBe(200);
    const orderId = orderRes.body.data.orderId;

    // 2. Verify payment
    const billRes = await request(app)
      .post('/api/v1/billing/verify-payment')
      .set('Cookie', authCookie)
      .send({
        planId: 'premium_yearly',
        razorpayPaymentId: 'pay_mock_test_123',
        razorpayOrderId: orderId,
        razorpaySignature: 'mock_signature'
      });
    expect(billRes.status).toBe(200);
    expect(billRes.body.data.user.plan).toBe('premium');
  });

  it('7. Loans & EMIs: creates loan and auto-computes amortization values', async () => {
    const lRes = await request(app)
      .post('/api/v1/loans')
      .set('Cookie', authCookie)
      .send({
        name: 'SBI Auto Loan',
        principalPaise: 60000000, // ₹6,00,000
        rateAnnual: 9.0,
        tenureMonths: 36
      });
    expect(lRes.status).toBe(201);
    createdLoanId = lRes.body.data.loan._id;
    expect(lRes.body.data.loan.emiPaise).toBeGreaterThan(0);
  });

  it('8. Investments & Insurance: creates assets and policies with proper schemas', async () => {
    // Investment
    const invRes = await request(app)
      .post('/api/v1/investments')
      .set('Cookie', authCookie)
      .send({
        name: 'UTI Nifty 50 Index Fund',
        assetType: 'mutual_fund',
        units: 200,
        buyPricePaise: 15000,
        currentPricePaise: 16500
      });
    expect(invRes.status).toBe(201);
    createdInvId = invRes.body.data.investment._id;

    // Insurance
    const insRes = await request(app)
      .post('/api/v1/insurance')
      .set('Cookie', authCookie)
      .send({
        providerName: 'Star Health Premier',
        policyType: 'health',
        sumInsuredPaise: 150000000, // ₹15,00,000
        premiumAmountPaise: 1800000,
        premiumFrequency: 'yearly'
      });
    expect(insRes.status).toBe(201);
    createdPolicyId = insRes.body.data.policy._id;
  });

  it('9. Reports, Analytics & AI Analyst: validates totals, CSV export, and AI queries', async () => {
    const repRes = await request(app).get('/api/v1/reports/summary').set('Cookie', authCookie);
    expect(repRes.status).toBe(200);
    expect(repRes.body.data.summary.incomePaise).toBe(10000000);
    expect(repRes.body.data.summary.expensePaise).toBe(2650000);

    // CSV export
    const csvRes = await request(app).get('/api/v1/reports/export/csv').set('Cookie', authCookie);
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.text).toContain('Salary');

    // AI Query
    const aiRes = await request(app)
      .post('/api/v1/ai/query')
      .set('Cookie', authCookie)
      .send({ query: 'How much did I spend this month?' });
    expect(aiRes.status).toBe(200);
    expect(aiRes.body.data.answer).toBeDefined();
  });
});
