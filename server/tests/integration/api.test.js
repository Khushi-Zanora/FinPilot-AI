import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { connectTestDb, closeTestDb, clearTestDb } from '../helpers/db.js';
import { config } from '../../src/config/index.js';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: '### Financial Analysis\nBased on your verified ledger records, your affordability analysis and investment options have been calculated.'
      })
    }
  }))
}));

let app;

beforeAll(async () => {
  config.GEMINI_API_KEY = 'test-mock-gemini-key';
  await connectTestDb();
  app = createApp();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('FinPilot Core API Integration Tests', () => {
  describe('Public & Health Endpoints', () => {
    it('returns healthy status on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('submits a public contact message successfully', async () => {
      const res = await request(app)
        .post('/api/v1/public/contact')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Feedback on FinPilot',
          message: 'I would love to learn more about the AI Financial Analyst capabilities.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('registers a new user and sets HttpOnly session cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Khushi Zanora',
          email: 'khushi@finpilot.test',
          password: 'Password123!',
          currency: 'INR'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('khushi@finpilot.test');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('prevents duplicate email registration', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@finpilot.test',
          password: 'Password123!'
        });

      const duplicateRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@finpilot.test',
          password: 'Password456!'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.error.code).toBe('EMAIL_IN_USE');
    });

    it('logs in registered user and returns safe user profile', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Auth Tester',
          email: 'login@finpilot.test',
          password: 'SecurePassword123!'
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@finpilot.test',
          password: 'SecurePassword123!'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.name).toBe('Auth Tester');
      expect(loginRes.body.data.user.passwordHash).toBeUndefined();
    });
  });

  describe('Accounts & Transactions Ledger Flow', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Ledger User',
          email: 'ledger@finpilot.test',
          password: 'Password123!'
        });
      authCookie = regRes.headers['set-cookie'];
    });

    it('creates accounts, records income/expense/transfer, and correctly derives live balances', async () => {
      // 1. Create Bank Account (Opening: ₹10,000 = 1000000 paise)
      const bankRes = await request(app)
        .post('/api/v1/accounts')
        .set('Cookie', authCookie)
        .send({
          name: 'HDFC Bank',
          type: 'bank',
          openingBalancePaise: 1000000
        });
      expect(bankRes.status).toBe(201);
      const bankId = bankRes.body.data.account._id;

      // 2. Create Cash Wallet (Opening: ₹2,000 = 200000 paise)
      const cashRes = await request(app)
        .post('/api/v1/accounts')
        .set('Cookie', authCookie)
        .send({
          name: 'Cash in Hand',
          type: 'cash',
          openingBalancePaise: 200000
        });
      expect(cashRes.status).toBe(201);
      const cashId = cashRes.body.data.account._id;

      // 3. Record Salary Income (+₹50,000 into Bank = 5000000 paise)
      const incomeRes = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 5000000,
          accountId: bankId,
          category: 'Salary',
          description: 'Monthly Salary'
        });
      expect(incomeRes.status).toBe(201);

      // 4. Record Grocery Expense (-₹5,000 from Bank = 500000 paise)
      const expenseRes = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'expense',
          amountPaise: 500000,
          accountId: bankId,
          category: 'Groceries',
          description: 'Weekly essentials'
        });
      expect(expenseRes.status).toBe(201);

      // 5. Transfer ATM withdrawal (₹3,000 from Bank to Cash Wallet = 300000 paise)
      const transferRes = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'transfer',
          amountPaise: 300000,
          accountId: bankId,
          toAccountId: cashId,
          category: 'Transfer',
          description: 'ATM Cash Withdrawal'
        });
      expect(transferRes.status).toBe(201);

      // 6. Verify Accounts List with Derived Balances
      // Bank Balance: 10,000 (opening) + 50,000 (salary) - 5,000 (expense) - 3,000 (transfer out) = ₹52,000 (5200000 paise)
      // Cash Balance: 2,000 (opening) + 3,000 (transfer in) = ₹5,000 (500000 paise)
      const accountsRes = await request(app)
        .get('/api/v1/accounts')
        .set('Cookie', authCookie);

      expect(accountsRes.status).toBe(200);
      const accounts = accountsRes.body.data.accounts;
      const bankAcc = accounts.find((a) => a._id === bankId);
      const cashAcc = accounts.find((a) => a._id === cashId);

      expect(bankAcc.currentBalancePaise).toBe(5200000);
      expect(cashAcc.currentBalancePaise).toBe(500000);

      // 7. Verify Dashboard Summary
      // Total Tracked Cash: 52,000 + 5,000 = ₹57,000 (5700000 paise)
      // Current Month Income: ₹50,000 (5000000 paise)
      // Current Month Expense: ₹5,000 (500000 paise)
      // Transfer is strictly excluded from income and expense!
      const dashRes = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Cookie', authCookie);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.data.totalTrackedCashPaise).toBe(5700000);
      expect(dashRes.body.data.currentMonth.incomePaise).toBe(5000000);
      expect(dashRes.body.data.currentMonth.expensePaise).toBe(500000);
      expect(dashRes.body.data.currentMonth.netCashFlowPaise).toBe(4500000);
    });
  });

  describe('Savings Goals & Budgets Flow', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Goal Planner',
          email: 'goals@finpilot.test',
          password: 'Password123!'
        });
      authCookie = regRes.headers['set-cookie'];
    });

    it('creates a savings goal, records contributions, and tracks progress', async () => {
      const targetDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 months ahead

      const goalRes = await request(app)
        .post('/api/v1/goals')
        .set('Cookie', authCookie)
        .send({
          name: 'Emergency Fund',
          purpose: 'emergency_fund',
          targetAmountPaise: 10000000, // ₹1,00,000
          currentAmountPaise: 2000000,  // Initial ₹20,000
          targetDate
        });

      expect(goalRes.status).toBe(201);
      const goalId = goalRes.body.data.goal._id;
      expect(goalRes.body.data.goal.progress.progressPercentage).toBe(20);

      // Add ₹30,000 contribution
      const contribRes = await request(app)
        .post(`/api/v1/goals/${goalId}/entries`)
        .set('Cookie', authCookie)
        .send({
          type: 'contribution',
          amountPaise: 3000000,
          note: 'Bonus deposit'
        });

      expect(contribRes.status).toBe(201);
      expect(contribRes.body.data.goal.currentAmountPaise).toBe(5000000); // ₹50,000 (50%)
      expect(contribRes.body.data.goal.progress.progressPercentage).toBe(50);
    });
  });

  describe('Billing & AI Financial Advisor Integration', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Premium Investor',
          email: 'investor@finpilot.test',
          password: 'Password123!'
        });
      authCookie = regRes.headers['set-cookie'];
    });

    it('lists plans, creates billing order, and upgrades user to premium plan', async () => {
      // 1. Get Plans
      const plansRes = await request(app).get('/api/v1/billing/plans');
      expect(plansRes.status).toBe(200);
      expect(plansRes.body.data.plans.length).toBe(3);

      // 2. Create Order for Premium Monthly
      const orderRes = await request(app)
        .post('/api/v1/billing/create-order')
        .set('Cookie', authCookie)
        .send({ planId: 'premium_monthly' });

      expect(orderRes.status).toBe(200);
      const orderId = orderRes.body.data.orderId;

      // 3. Verify Payment and activate premium
      const verifyRes = await request(app)
        .post('/api/v1/billing/verify-payment')
        .set('Cookie', authCookie)
        .send({
          razorpayOrderId: orderId,
          planId: 'premium_monthly'
        });

      expect(verifyRes.status).toBe(200);

      // 4. Verify user profile now shows premium plan
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie);

      expect(meRes.body.data.user.plan).toBe('premium');
    });

    it('processes AI queries for affordability and ₹75,000 investment guidance', async () => {
      // Test AI Affordability Prompt
      const affordRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'Can I afford a ₹75,000 phone in 3 months?' });

      expect(affordRes.status).toBe(200);
      expect(affordRes.body.data.assistantMessage.intent).toBe('affordability_check');
      expect(affordRes.body.data.assistantMessage.structuredData.type).toBe('affordability_card');

      // Test AI Investment Suggestions for ₹75,000 savings
      const investRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'I have ₹75,000 savings, where should I invest?' });

      expect(investRes.status).toBe(200);
      expect(investRes.body.data.assistantMessage.intent).toBe('investment_suggestions');
      expect(investRes.body.data.assistantMessage.structuredData.options.length).toBeGreaterThan(0);
    });
  });
});
