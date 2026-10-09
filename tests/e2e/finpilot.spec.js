import { test, expect } from '@playwright/test';

async function loginUser(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'premium.tester@finpilot.app');
  await page.fill('input[type="password"]', 'FinPilot2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/workspace/, { timeout: 10000 });
}

test.describe('FinPilot End-to-End User Journeys & Interaction Suite', () => {
  const testEmail = `e2e_user_${Date.now()}@finpilot.test`;
  const testPassword = 'Password123!';

  test('1. Landing Page Navigation, CTAs & Public Elements', async ({ page }) => {
    await page.goto('/');

    // Verify title and hero elements
    await expect(page).toHaveTitle(/FinPilot/i);
    await expect(page.locator('text=A clearer direction')).toBeVisible();

    // Verify CTAs and links
    const launchBtn = page.locator('a:has-text("Launch Platform")').first();
    await expect(launchBtn).toBeVisible();

    // Verify Navigation to Login
    await page.locator('a:has-text("Sign in")').first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Welcome back to FinPilot')).toBeVisible();
  });

  test('2. Authentication Flow: Registration, Invalid Credentials, Auto-fill & Protected Routes', async ({ page }) => {
    // Attempt accessing protected route directly
    await page.goto('/workspace/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Test Invalid Login
    await page.fill('input[type="email"]', 'nonexistent.user@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();

    // Register a new test user
    await page.goto('/register');
    await page.fill('input[placeholder*="Arjun"]', 'E2E Test User');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    // Should redirect to onboarding or workspace
    await expect(page).toHaveURL(/\/(onboarding|workspace)/);

    // Test logging in with seeded credentials
    await loginUser(page);
    await expect(page.locator('text=Financial Command Center')).toBeVisible();
  });

  test('3. Accounts & Balance Management', async ({ page }) => {
    await loginUser(page);

    // Navigate to Accounts page
    await page.goto('/workspace/accounts');
    await expect(page.locator('h1:has-text("Tracked Accounts & Vaults")')).toBeVisible();

    // Add a manual tracked account
    await page.locator('button:has-text("Add Account"), button:has-text("Add First Account")').first().click();
    await page.fill('input[placeholder*="HDFC Salary"]', 'HDFC Salary Account');
    await page.fill('input[placeholder*="0.00"]', '45000');
    await page.locator('button:has-text("Save Account")').click();

    // Verify account is listed
    await expect(page.locator('text=HDFC Salary Account').first()).toBeVisible();
  });

  test('4. Income & Expense Recording & Ledger Updates', async ({ page }) => {
    await loginUser(page);

    // Navigate to Transactions page
    await page.goto('/workspace/transactions');
    await expect(page.locator('h1:has-text("Transactions & Recurring Income")')).toBeVisible();

    // Record Income (+₹25,000)
    await page.locator('button:has-text("Record Transaction")').first().click();
    await page.locator('button:has-text("Income (+)")').click();
    await page.fill('input[placeholder*="1500"]', '25000');
    await page.fill('input[placeholder*="Swiggy"]', 'Freelance Consulting Bonus');
    await page.locator('button:has-text("Save Transaction")').click();

    // Verify Income appears in ledger
    await expect(page.locator('text=Freelance Consulting Bonus').first()).toBeVisible();

    // Record Expense (-₹3,500)
    await page.locator('button:has-text("Record Transaction")').first().click();
    await page.locator('button:has-text("Expense (-)")').click();
    await page.fill('input[placeholder*="1500"]', '3500');
    await page.fill('input[placeholder*="Swiggy"]', 'Monthly Grocery Run');
    await page.locator('button:has-text("Save Transaction")').click();

    // Verify Expense appears in ledger
    await expect(page.locator('text=Monthly Grocery Run').first()).toBeVisible();
  });

  test('5. Recurring Income Schedules & Non-Deduction Verification', async ({ page }) => {
    await loginUser(page);

    // Navigate to Transactions -> Recurring tab
    await page.goto('/workspace/transactions');
    await page.locator('button:has-text("Recurring Schedules")').first().click();

    // Create Recurring Income Schedule (+₹75,000)
    await page.locator('button:has-text("Add Recurring Schedule"), button:has-text("Create First Schedule")').first().click();
    await page.locator('button:has-text("Recurring Income (+)")').click();
    await page.fill('input[placeholder*="75000"]', '75000');
    await page.fill('input[placeholder*="Monthly Employer Salary"]', 'Full-time Tech Salary');
    await page.locator('button:has-text("Save Schedule")').click();

    // Verify recurring schedule is listed
    await expect(page.locator('text=Full-time Tech Salary').first()).toBeVisible();

    // Verify Dashboard Uncommitted Cash does not count incoming salary as a bill
    await page.goto('/workspace/dashboard');
    await expect(page.locator('text=UNCOMMITTED CASH')).toBeVisible();
    await expect(page.locator('text=₹75,000.00 bills')).not.toBeVisible();
  });

  test('6. Monthly Budgets & Spending Limits', async ({ page }) => {
    await loginUser(page);

    // Navigate to Budgets page
    await page.goto('/workspace/budgets');
    await expect(page.locator('h1:has-text("Budgets & Spending Limits")')).toBeVisible();

    // Create Monthly Budget (Food & Dining - ₹10,000)
    await page.locator('button:has-text("Create Budget"), button:has-text("Create First Budget")').first().click();
    await page.fill('input[placeholder*="15000"]', '10000');
    await page.locator('button:has-text("Set Budget")').click();

    // Verify Budget Card renders
    await expect(page.locator('text=Food & Dining').first()).toBeVisible();
  });

  test('7. Savings Goals & Fund Contributions', async ({ page }) => {
    await loginUser(page);

    // Navigate to Goals page
    await page.goto('/workspace/goals');
    await expect(page.locator('h1:has-text("Savings Goals & Sinking Funds")')).toBeVisible();

    // Create Goal (Emergency Fund - ₹1,00,000)
    await page.locator('button:has-text("Create Savings Goal"), button:has-text("Create First Goal")').first().click();
    await page.fill('input[placeholder*="Emergency Fund"]', '6-Month Emergency Reserve');
    await page.fill('input[placeholder*="100000"]', '100000');
    await page.locator('button:has-text("Save Goal")').click();

    // Verify Goal is listed
    await expect(page.locator('text=6-Month Emergency Reserve').first()).toBeVisible();

    // Add Funds to Goal
    await page.locator('button:has-text("Add Funds")').first().click();
    await page.fill('input[placeholder*="5000"]', '15000');
    await page.locator('button:has-text("Deposit Funds")').click();

    // Verify updated progress
    await expect(page.locator('text=₹15,000.00').first()).toBeVisible();
  });

  test('8. Loans, Investments & Insurance Records', async ({ page }) => {
    await loginUser(page);

    // 1. Loans Page
    await page.goto('/workspace/loans');
    await expect(page.locator('h1:has-text("Loans & Debt Prepayment Planner")')).toBeVisible();
    await page.locator('button:has-text("Add Loan Record"), button:has-text("Add First Loan")').first().click();
    await page.fill('input[placeholder*="Home Loan"]', 'Car Loan');
    await page.fill('input[placeholder*="2500000"]', '500000');
    await page.locator('button:has-text("Save Loan")').click();
    await expect(page.locator('text=Car Loan').first()).toBeVisible();

    // 2. Investments Page
    await page.goto('/workspace/investments');
    await expect(page.locator('h1:has-text("Investments & Capital Assets")')).toBeVisible();
    await page.locator('button:has-text("Add Investment"), button:has-text("Add First Investment")').first().click();
    await page.fill('input[placeholder*="Parag Parikh"]', 'Nifty 50 Index Fund');
    await page.fill('input[placeholder*="1500"]', '250');
    await page.locator('button:has-text("Save Investment")').click();
    await expect(page.locator('text=Nifty 50 Index Fund').first()).toBeVisible();

    // 3. Insurance Page
    await page.goto('/workspace/insurance');
    await expect(page.locator('h1:has-text("Insurance & Protection Coverage")')).toBeVisible();
    await page.locator('button:has-text("Add Policy"), button:has-text("Add First Policy")').first().click();
    await page.fill('input[placeholder*="Tata AIA"]', 'HDFC ERGO Health Guard');
    await page.fill('input[placeholder*="5000000"]', '1000000');
    await page.fill('input[placeholder*="18500"]', '15000');
    await page.locator('button:has-text("Save Policy")').click();
    await expect(page.locator('text=HDFC ERGO Health Guard').first()).toBeVisible();
  });

  test('9. Reports, Financial Analytics & CSV Export', async ({ page }) => {
    await loginUser(page);

    // Navigate to Reports page
    await page.goto('/workspace/reports');
    await expect(page.locator('h1:has-text("Reports & Financial Analytics")')).toBeVisible();

    // Check Summary Metrics
    await expect(page.locator('text=MONEY RECEIVED (INCOME)')).toBeVisible();
    await expect(page.locator('text=MONEY SPENT (EXPENSES)')).toBeVisible();
    await expect(page.locator('text=NET CASH SURPLUS')).toBeVisible();

    // Check CSV Export Button exists and is clickable
    const exportBtn = page.locator('button:has-text("Export CSV")').first();
    await expect(exportBtn).toBeVisible();
  });

  test('10. Subscription & Plan Management', async ({ page }) => {
    await loginUser(page);

    // Navigate to Billing page
    await page.goto('/workspace/billing');
    await expect(page.locator('h1:has-text("Subscriptions & Billing")')).toBeVisible();
  });

  test('11. AI Financial Analyst Interaction', async ({ page }) => {
    await loginUser(page);

    // Navigate to AI Analyst page
    await page.goto('/workspace/ai');
    await expect(page.locator('h1:has-text("AI Financial Analyst")')).toBeVisible();

    // Submit a query
    await page.fill('input[placeholder*="financial question"]', 'What is my current total income?');
    await page.locator('button[type="submit"]').first().click();

    // Verify chat response renders
    await expect(page.locator('text=What is my current total income?').first()).toBeVisible();
  });
});
