import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { connectTestDb, closeTestDb, clearTestDb } from '../helpers/db.js';
import { processDueRecurringTransactions, computeNextOccurrence } from '../../src/services/recurringEngine.js';
import { RecurringTransaction } from '../../src/models/RecurringTransaction.js';
import { Transaction } from '../../src/models/Transaction.js';

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

describe('Recurring Income & AI Financial Analyst Integration Tests', () => {
  let authCookie;
  let bankAccountId;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Recurring Tester',
        email: 'recurring@finpilot.test',
        password: 'Password123!'
      });
    authCookie = regRes.headers['set-cookie'];

    const accRes = await request(app)
      .post('/api/v1/accounts')
      .set('Cookie', authCookie)
      .send({
        name: 'Salary Account',
        type: 'bank',
        openingBalancePaise: 5000000 // ₹50,000
      });
    bankAccountId = accRes.body.data.account._id;
  });

  describe('Manual Tracking Without Accounts (Unlinked)', () => {
    it('allows recording income and expenses without creating or selecting an account', async () => {
      // 1. Record income without accountId
      const incomeRes = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 3000000, // ₹30,000 freelance
          category: 'Consulting & Freelance',
          description: 'Direct Client Consulting'
        });

      expect(incomeRes.status).toBe(201);
      expect(incomeRes.body.data.transaction.accountId).toBeNull();

      // 2. Record expense without accountId
      const expenseRes = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'expense',
          amountPaise: 150000, // ₹1,500 groceries
          category: 'Food & Dining',
          description: 'Cash Groceries'
        });

      expect(expenseRes.status).toBe(201);
      expect(expenseRes.body.data.transaction.accountId).toBeNull();
    });

    it('allows creating recurring income without an account', async () => {
      const pastDue = new Date(Date.now() - 1000 * 60).toISOString();

      const recRes = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 4000000, // ₹40,000 monthly
          category: 'Rental Income',
          description: 'Direct Rent Check',
          frequency: 'monthly',
          startDate: pastDue,
          nextDueDate: pastDue
        });

      expect(recRes.status).toBe(201);
      expect(recRes.body.data.recurring.accountId).toBeNull();

      // Process due and verify generated transaction has accountId: null
      const processRes = await request(app)
        .post('/api/v1/transactions/recurring/process-due')
        .set('Cookie', authCookie);

      expect(processRes.status).toBe(200);
      expect(processRes.body.data.processedCount).toBe(1);

      const generatedTx = await Transaction.findOne({ description: 'Direct Rent Check' });
      expect(generatedTx).toBeDefined();
      expect(generatedTx.accountId).toBeNull();
      expect(generatedTx.amountPaise).toBe(4000000);
    });
  });

  describe('Recurring Income Creation and Management', () => {
    it('creates a monthly recurring income schedule', async () => {
      const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 8000000, // ₹80,000 monthly salary
          accountId: bankAccountId,
          category: 'Primary Salary',
          description: 'Tech Employer Salary',
          frequency: 'monthly',
          startDate: new Date().toISOString(),
          nextDueDate
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recurring.type).toBe('income');
      expect(res.body.data.recurring.amountPaise).toBe(8000000);
      expect(res.body.data.recurring.isActive).toBe(true);
    });

    it('lists recurring schedules and allows pause/resume and deletion', async () => {
      const nextDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

      const createRes = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 2500000, // ₹25,000 rent received
          accountId: bankAccountId,
          category: 'Rental Income',
          description: 'Apartment Rent',
          frequency: 'monthly',
          nextDueDate
        });

      const ruleId = createRes.body.data.recurring._id;

      // 1. Get recurring list
      const listRes = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', authCookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.recurrings.length).toBe(1);

      // 2. Pause the schedule
      const toggleRes = await request(app)
        .patch(`/api/v1/transactions/recurring/${ruleId}/toggle`)
        .set('Cookie', authCookie);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.recurring.isActive).toBe(false);

      // 3. Delete the schedule
      const deleteRes = await request(app)
        .delete(`/api/v1/transactions/recurring/${ruleId}`)
        .set('Cookie', authCookie);

      expect(deleteRes.status).toBe(200);

      const emptyRes = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', authCookie);

      expect(emptyRes.body.data.recurrings.length).toBe(0);
    });
  });

  describe('Recurring Processing Engine & Idempotency', () => {
    it('computes next monthly occurrence accurately handling end-of-month dates', () => {
      const jan31 = new Date(2026, 0, 31); // Jan 31, 2026
      const nextFeb = computeNextOccurrence(jan31, 'monthly', 31);
      expect(nextFeb.getMonth()).toBe(1); // February
      expect(nextFeb.getDate()).toBe(28); // 2026 is not leap year -> Feb 28

      const nextMarch = computeNextOccurrence(nextFeb, 'monthly', 31);
      expect(nextMarch.getMonth()).toBe(2); // March
      expect(nextMarch.getDate()).toBe(31); // Preserves 31st
    });

    it('processes due recurring income schedules into real ledger transactions idempotently without duplicate records', async () => {
      const pastDueDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours in the past (due now)

      // Create a due recurring income schedule directly
      const createRes = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 7500000, // ₹75,000
          accountId: bankAccountId,
          category: 'Primary Salary',
          description: 'Monthly Salary',
          frequency: 'monthly',
          startDate: pastDueDate.toISOString(),
          nextDueDate: pastDueDate.toISOString()
        });

      expect(createRes.status).toBe(201);

      // Verify no transactions exist before generation
      const beforeTx = await Transaction.find();
      expect(beforeTx.length).toBe(0);

      // 1. Process due recurring schedules via API endpoint
      const processRes = await request(app)
        .post('/api/v1/transactions/recurring/process-due')
        .set('Cookie', authCookie);

      expect(processRes.status).toBe(200);
      expect(processRes.body.data.processedCount).toBe(1);

      // Verify transaction was generated in ledger
      const afterTx = await Transaction.find();
      expect(afterTx.length).toBe(1);
      expect(afterTx[0].amountPaise).toBe(7500000);
      expect(afterTx[0].type).toBe('income');
      expect(afterTx[0].isRecurring).toBe(true);

      // 2. Re-run processor immediately (duplicate execution check)
      const secondProcess = await processDueRecurringTransactions();
      expect(secondProcess.processedCount).toBe(0); // Idempotent: 0 duplicates created

      const finalTx = await Transaction.find();
      expect(finalTx.length).toBe(1); // Still exactly 1 transaction
    });

    it('catches up multiple missed occurrences sequentially if schedule was offline', async () => {
      // Set due date 65 days in the past (2 full monthly occurrences missed)
      const twoMonthsAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000);

      const createRes = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 5000000, // ₹50,000
          category: 'Consulting Retainer',
          description: 'Monthly Retainer',
          frequency: 'monthly',
          startDate: twoMonthsAgo.toISOString(),
          nextDueDate: twoMonthsAgo.toISOString()
        });

      expect(createRes.status).toBe(201);

      const beforeTxCount = await Transaction.countDocuments();

      // Process due occurrences
      const result = await processDueRecurringTransactions();
      expect(result.processedCount).toBeGreaterThanOrEqual(2);

      // Verify transactions created for the missed occurrences
      const afterTxCount = await Transaction.countDocuments();
      expect(afterTxCount - beforeTxCount).toBe(result.processedCount);

      // Verify schedule nextDueDate is now in the future
      const updatedSchedule = await RecurringTransaction.findById(createRes.body.data.recurring._id);
      expect(new Date(updatedSchedule.nextDueDate).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('User Isolation & Data Privacy', () => {
    it('prevents User B from viewing, updating, or deleting User A recurring schedules', async () => {
      const recRes = await request(app)
        .post('/api/v1/transactions/recurring')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 5000000,
          category: 'Salary',
          description: 'Private Salary',
          frequency: 'monthly',
          nextDueDate: new Date().toISOString()
        });
      const userARuleId = recRes.body.data.recurring._id;

      // Register User B
      const userBRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User B',
          email: 'userb@finpilot.test',
          password: 'Password123!'
        });
      const userBCookie = userBRes.headers['set-cookie'];

      // User B tries to delete User A's schedule
      const deleteAttempt = await request(app)
        .delete(`/api/v1/transactions/recurring/${userARuleId}`)
        .set('Cookie', userBCookie);

      expect(deleteAttempt.status).toBe(404);

      // Verify schedule still exists under User A
      const userAList = await request(app)
        .get('/api/v1/transactions/recurring')
        .set('Cookie', authCookie);

      expect(userAList.body.data.recurrings.length).toBe(1);
    });
  });

  describe('AI Financial Analyst Query Flow', () => {
    it('answers queries about spending, biggest expenses, income, budgets, goals, and investment options', async () => {
      // 1. Add some transactions for testing
      await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'income',
          amountPaise: 6000000, // ₹60,000
          accountId: bankAccountId,
          category: 'Primary Salary',
          description: 'Monthly Salary'
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', authCookie)
        .send({
          type: 'expense',
          amountPaise: 1200000, // ₹12,000
          accountId: bankAccountId,
          category: 'Groceries',
          description: 'Supermarket Groceries'
        });

      // Query: "How much did I spend this month?"
      const spendRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'How much did I spend this month?' });

      expect(spendRes.status).toBe(200);
      expect(spendRes.body.data.answer).toContain('Groceries');
      expect(spendRes.body.data.answer).toContain('₹12,000.00');

      // Query: "What were my biggest expenses?"
      const topRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'What were my biggest expenses?' });

      expect(topRes.status).toBe(200);
      expect(topRes.body.data.answer).toContain('Supermarket Groceries');

      // Query: "How much money did I receive this month?"
      const incomeRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'How much money did I receive this month?' });

      expect(incomeRes.status).toBe(200);
      expect(incomeRes.body.data.answer).toContain('₹60,000.00');

      // Query: "Give me general information about investment options in India."
      const investRes = await request(app)
        .post('/api/v1/ai/chat')
        .set('Cookie', authCookie)
        .send({ message: 'Give me general information about investment options in India.' });

      expect(investRes.status).toBe(200);
      expect(investRes.body.data.answer).toContain('Fixed Deposits');
      expect(investRes.body.data.answer).toContain('Sovereign Gold Bonds');
    });
  });
});
