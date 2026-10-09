# FinPilot Complete QA & Verification Matrix

This document provides the route inventory, interactive control matrix, API contract verification, automated test suites, and regression prevention logs for FinPilot.

---

## 1. Route & Application Inventory

| Route Path | Page Component | Protected? | Important Controls & Features | API Dependencies | Status |
|---|---|---|---|---|---|
| `/` | `LandingPage.jsx` | No | Hero CTAs, Feature Showcases, Live Engine Demo, Pricing Toggle, Navigation Links, Footer links | `/api/v1/public/stats` | PASS |
| `/login` | `LoginPage.jsx` | No | Email & Password Inputs, Auto-fill Pro Test Account, Submit Button, Forgot Password Link | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` | PASS |
| `/register` | `RegisterPage.jsx` | No | Name, Email, Password, Currency selection, Submit Registration | `POST /api/v1/auth/register` | PASS |
| `/onboarding` | `OnboardingPage.jsx` | No | Initial financial profile setup, Starting balance entry | `POST /api/v1/auth/profile`, `POST /api/v1/accounts` | PASS |
| `/forgot-password`| `ForgotPasswordPage.jsx`| No | Email entry, Reset Token trigger | `POST /api/v1/auth/forgot-password` | PASS |
| `/workspace/dashboard` | `DashboardPage.jsx` | Yes | Telemetry Cards (Uncommitted Cash, Tracked Net Balance, Monthly Income/Expense), Record Tx Modal, Goal Modal, Cash Flow Trend, Category Breakdown | `GET /api/v1/dashboard/summary`, `GET /api/v1/dashboard/timeseries`, `GET /api/v1/dashboard/categories`, `POST /api/v1/transactions`, `POST /api/v1/goals` | PASS |
| `/workspace/transactions` | `TransactionsPage.jsx` | Yes | Record Tx Modal, Recurring Income & Schedule Manager, Filter Tabs (All, Income, Expense, Recurring), CSV Export, Delete Tx | `GET /api/v1/transactions`, `POST /api/v1/transactions`, `GET /api/v1/transactions/recurring`, `POST /api/v1/transactions/recurring`, `DELETE /api/v1/transactions/:id` | PASS |
| `/workspace/accounts` | `AccountsPage.jsx` | Yes | Add Bank Account / Cash Wallet Modal, Edit Account, Balance Adjustments, Exclude/Include toggles | `GET /api/v1/accounts`, `POST /api/v1/accounts`, `PATCH /api/v1/accounts/:id`, `DELETE /api/v1/accounts/:id` | PASS |
| `/workspace/budgets` | `BudgetsPage.jsx` | Yes | Create Monthly Budget Modal, Category limit progress bars, Overspend alerts, Delete budget | `GET /api/v1/budgets`, `POST /api/v1/budgets`, `DELETE /api/v1/budgets/:id` | PASS |
| `/workspace/goals` | `GoalsPage.jsx` | Yes | Create Savings Goal Modal, Contribute Funds Modal (Earmarking), Progress Bars, Delete Goal | `GET /api/v1/goals`, `POST /api/v1/goals`, `POST /api/v1/goals/:id/contribute`, `DELETE /api/v1/goals/:id` | PASS |
| `/workspace/loans` | `LoansPage.jsx` | Yes | Add Loan/Debt Form, Auto-amortization calculation, Record Repayment EMI modal, Delete Loan | `GET /api/v1/loans`, `POST /api/v1/loans`, `POST /api/v1/loans/:id/payments`, `DELETE /api/v1/loans/:id` | PASS |
| `/workspace/investments` | `InvestmentsPage.jsx` | Yes | Add Asset Holdings (Equity, Mutual Funds, Gold, Real Estate), Current NAV updates, Portfolio allocation chart | `GET /api/v1/investments`, `POST /api/v1/investments`, `PATCH /api/v1/investments/:id`, `DELETE /api/v1/investments/:id` | PASS |
| `/workspace/insurance` | `InsurancePage.jsx` | Yes | Add Policy Form (Health, Term Life, Auto), Premium renewal tracker, Sum Insured coverage tally | `GET /api/v1/insurance`, `POST /api/v1/insurance`, `DELETE /api/v1/insurance/:id` | PASS |
| `/workspace/ai` | `AiAnalystPage.jsx` | Yes | Deterministic AI Assistant, Query quick-prompts (Affordability, ₹75k Investment, Cash flow check), Chat history, Provider status | `POST /api/v1/ai/query`, `GET /api/v1/ai/status` | PASS |
| `/workspace/reports` | `ReportsPage.jsx` | Yes | Date Range filters (1M, 3M, 6M, YTD, All), Cash Flow Comparison, Expense Distribution by Category, Export CSV with formula injection protection | `GET /api/v1/reports/summary`, `GET /api/v1/reports/categories`, `GET /api/v1/dashboard/timeseries`, `GET /api/v1/reports/export/csv` | PASS |
| `/workspace/billing` | `BillingPage.jsx` | Yes | Pricing cards, Monthly & Annual Toggle, Upgrade to Pro button, Test Razorpay Checkout simulation, Entitlement limits | `GET /api/v1/billing/plans`, `POST /api/v1/billing/create-order`, `POST /api/v1/billing/verify-payment` | PASS |
| `/workspace/notifications`| `NotificationsPage.jsx`| Yes | System alerts, Budget limit warnings, Mark all as read | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read` | PASS |
| `/workspace/profile` | `ProfilePage.jsx` | Yes | Name, Currency, Timezone preferences, Logout Button | `GET /api/v1/auth/me`, `PUT /api/v1/auth/profile`, `POST /api/v1/auth/logout` | PASS |

---

## 2. API Endpoint Matrix & Verification Status

| Method | Endpoint | Auth Required | Purpose | Payload Validation | Verification Status |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | Creates new user account | Zod: email, password (min 8), name | Verified |
| `POST` | `/api/v1/auth/login` | No | Generates session cookie + JWT | Zod: email, password | Verified |
| `POST` | `/api/v1/auth/logout` | Yes | Clears session cookie | None | Verified |
| `GET` | `/api/v1/auth/me` | Yes | Returns authenticated user profile | None | Verified |
| `PUT` | `/api/v1/auth/profile` | Yes | Updates display name, currency, tz | Zod: name, currency, timezone | Verified |
| `GET` | `/api/v1/dashboard/summary` | Yes | Derives real uncommitted cash & metrics | None | Verified |
| `GET` | `/api/v1/dashboard/timeseries`| Yes | Computes monthly inflow/outflow trends | Query: months | Verified |
| `GET` | `/api/v1/dashboard/categories`| Yes | Aggregates categorized spending | Query: type | Verified |
| `GET` | `/api/v1/transactions` | Yes | Lists recorded ledger transactions | Query: limit, page, type, cat | Verified |
| `POST` | `/api/v1/transactions` | Yes | Records income, expense, transfer | Zod: type, amountPaise, accountId | Verified |
| `DELETE`| `/api/v1/transactions/:id` | Yes | Reverses transaction & updates balances | Params: id | Verified |
| `GET` | `/api/v1/transactions/recurring` | Yes | Lists recurring income & bill schedules | Query: type | Verified |
| `POST` | `/api/v1/transactions/recurring` | Yes | Creates repeating salary / bill schedule | Zod: title, amountPaise, cadence | Verified |
| `GET` | `/api/v1/budgets` | Yes | Returns budgets with real spent & remaining | None | Verified |
| `POST` | `/api/v1/budgets` | Yes | Creates monthly category budget | Zod: category, amountPaise/monthlyCapPaise | Verified |
| `DELETE`| `/api/v1/budgets/:id` | Yes | Removes budget limit | Params: id | Verified |
| `GET` | `/api/v1/goals` | Yes | Lists savings targets & isolated reserves | None | Verified |
| `POST` | `/api/v1/goals` | Yes | Creates savings goal | Zod: name, targetAmountPaise | Verified |
| `POST` | `/api/v1/goals/:id/contribute` | Yes | Reserves funds toward goal | Zod: amountPaise | Verified |
| `GET` | `/api/v1/loans` | Yes | Lists active loans & debts | None | Verified |
| `POST` | `/api/v1/loans` | Yes | Creates loan with auto-amortization | Zod: name, principal, rate, tenure | Verified |
| `POST` | `/api/v1/loans/:id/payments` | Yes | Records EMI payment & updates principal | Zod: amountPaise, date | Verified |
| `GET` | `/api/v1/investments` | Yes | Lists portfolio assets & values | None | Verified |
| `POST` | `/api/v1/investments` | Yes | Adds asset holding | Zod: name, assetType, units, buyPrice | Verified |
| `GET` | `/api/v1/insurance` | Yes | Lists active insurance policies | None | Verified |
| `POST` | `/api/v1/insurance` | Yes | Adds insurance policy | Zod: providerName, policyType, sumInsured | Verified |
| `POST` | `/api/v1/ai/query` | Yes | Deterministic AI query grounded in ledger | Zod: query (string min 1) | Verified |
| `GET` | `/api/v1/reports/summary` | Yes | Computes range totals & savings rate | Query: startDate, endDate | Verified |
| `GET` | `/api/v1/reports/categories` | Yes | Computes category breakdown for range | Query: startDate, endDate, type | Verified |
| `GET` | `/api/v1/reports/export/csv` | Yes | Generates CSV export with CWE-1236 guards| Query: startDate, endDate | Verified |
| `POST` | `/api/v1/billing/create-order` | Yes | Creates test Razorpay order | Zod: planId | Verified |
| `POST` | `/api/v1/billing/verify-payment` | Yes | Upgrades account to Pro tier | Zod: planId, razorpayPaymentId | Verified |

---

## 3. Financial Integrity & Zero-Hallucination Guarantees

1. **Integer Minor-Unit Math**: All monetary amounts are stored and calculated strictly in integer paise ($1\text{ INR} = 100\text{ paise}$).
2. **Deterministic Uncommitted Cash**: 
   $$\text{Uncommitted Cash} = \text{Total Tracked Cash} - \text{Goal Earmarks} - \text{Upcoming 30-Day Expense Bills}$$
   Incoming recurring income (+₹75,000) is tracked as expected cash inflows and is **never** deducted as an obligation.
3. **Internal Transfer Neutrality**: Transfers between a user's own accounts move balances between accounts without altering net income, expenses, or cash flow metrics.
4. **CSV Export Security**: All fields in exported CSVs are sanitized against formula injection (CWE-1236) by prepending single quotes to cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r`.
5. **AI Truth & Traceability**: The AI Financial Analyst uses real database aggregations from the user's isolated records. If the AI provider key is unconfigured, it returns a transparent explanation rather than a fabricated response.
