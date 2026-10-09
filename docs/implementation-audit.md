# FinPilot — Comprehensive Implementation & Architecture Audit

**Document Version**: 1.0  
**Status**: Completed & Verified  
**Date**: October 2026  
**Stack**: React + Vite (JS/JSX) | Node.js + Express (ESM) | MongoDB + Mongoose  

---

## 1. Actual Architecture & Project Entry Points

- **Frontend**:
  - Entry: `client/src/main.jsx` -> `client/src/App.jsx`
  - Client API: `client/src/api/client.js` with HttpOnly session cookies, CSRF protection, and standardized integer-paise currency formatting.
  - State & Auth: `client/src/context/AuthContext.jsx`
  - Design & Styling: Tailwind CSS, custom dark theme (`#05080E`, `#080D16`, `#0D1422`), Lucide React icons, accessible typography and contrast.
- **Backend**:
  - Entry: `server/src/server.js` -> `server/src/app.js`
  - Config: `server/src/config/index.js`
  - Architecture: Versioned REST API (`/api/v1`) with middleware for authentication (`server/src/middleware/auth.js`), validation (`server/src/middleware/validate.js`), rate-limiting (`server/src/middleware/rateLimiter.js`), and centralized error handling (`server/src/middleware/errorHandler.js`).
  - Scheduling: `server/src/services/recurringEngine.js` triggered on startup and hourly via `setInterval` in `server/src/server.js`.

---

## 2. Complete Route Inventory

### Public & Authentication Routes
| Route | Component | Purpose | Status |
|---|---|---|---|
| `/` | `LandingPage.jsx` | Marketing homepage with features, pricing, FAQ, about & honest contact form | **Working** |
| `/login` | `LoginPage.jsx` | User authentication via secure cookies | **Working** |
| `/register` | `RegisterPage.jsx` | Account creation with zero initial mock data | **Working** |
| `/onboarding` | `OnboardingPage.jsx` | Optional setup flow for currency & initial preferences | **Working** |
| `/forgot-password`| `ForgotPasswordPage.jsx`| Password recovery request & status | **Working** |

### Protected Workspace Routes (`/workspace/*`)
| Route | Component | Purpose | Status |
|---|---|---|---|
| `/workspace/dashboard` | `DashboardPage.jsx` | Real cash flow, income received, expenses, upcoming obligations | **Working** |
| `/workspace/transactions` | `TransactionsPage.jsx` | Ledger + Recurring Income/Expense management tabs | **Working** |
| `/workspace/accounts` | `AccountsPage.jsx` | Optional manual accounts (bank, cash, wallet tracking) | **Working** |
| `/workspace/budgets` | `BudgetsPage.jsx` | Category spending limits & consumption tracking | **Working** |
| `/workspace/goals` | `GoalsPage.jsx` | Savings goals, target dates, and contribution logs | **Working** |
| `/workspace/loans` | `LoansPage.jsx` | Loan tracking, EMI calculations & payoff schedule | **Working** |
| `/workspace/investments` | `InvestmentsPage.jsx` | User-maintained manual investment holdings | **Working** |
| `/workspace/insurance` | `InsurancePage.jsx` | Policy records, coverage tracking & premium reminders | **Working** |
| `/workspace/ai` | `AiAnalystPage.jsx` | AI Financial Analyst with deterministic ledger verification | **Working** |
| `/workspace/reports` | `ReportsPage.jsx` | Spending breakdown, trends, and CSV export | **Working** |
| `/workspace/notifications` | `NotificationsPage.jsx` | Notification center & upcoming payment reminders | **Working** |
| `/workspace/billing` | `BillingPage.jsx` | Plans & subscription management | **Working** |
| `/workspace/profile` | `ProfilePage.jsx` | User profile, security, and account preferences | **Working** |

---

## 3. Database Collections & Models

1. **User** (`server/src/models/User.js`): Email, hashed password (bcrypt), name, plan (`free`/`premium`), currency, timezone.
2. **Account** (`server/src/models/Account.js`): User-scoped manual accounts (`bank`, `cash`, `wallet`, `credit_card`), opening balance.
3. **Transaction** (`server/src/models/Transaction.js`): Minor-unit amount (`amountPaise`), type (`income`, `expense`, `transfer`, `goal_contribution`, `loan_payment`, `investment_buy`), optional `accountId`, `category`, `date`, `description`, `isRecurring`.
4. **RecurringTransaction** (`server/src/models/RecurringTransaction.js`): Repeating rules for income/expense, `amountPaise`, optional `accountId`, `frequency`, `startDate`, `nextDueDate`, `endDate`, `isActive`, `lastGeneratedDate`.
5. **Budget** (`server/src/models/Budget.js`): Monthly/weekly spending limits per category.
6. **SavingsGoal** & **GoalEntry** (`server/src/models/SavingsGoal.js`, `GoalEntry.js`): Target amount, current amount, target date, contribution logs.
7. **Loan** & **LoanPayment** (`server/src/models/Loan.js`, `LoanPayment.js`): Principal, interest rate, tenure, EMI paise, outstanding balance.
8. **Investment** (`server/src/models/Investment.js`): Asset class, units, purchase price, current NAV price.
9. **InsurancePolicy** (`server/src/models/InsurancePolicy.js`): Policy type, coverage, premium, renewal date.
10. **Subscription** & **Payment** (`server/src/models/Subscription.js`, `Payment.js`): Entitlement tracking and payment verification.
11. **AIConversation** & **AIMessage** (`server/src/models/AIConversation.js`, `AIMessage.js`): Chat history and structured assistant answers.
12. **NotificationPreference** (`server/src/models/NotificationPreference.js`): Alert settings per category.
13. **ContactMessage** (`server/src/models/ContactMessage.js`): Public contact inquiries.

---

## 4. API Endpoints & Real Capabilities

- **Auth** (`/api/v1/auth`): `/register`, `/login`, `/logout`, `/me`, `/csrf-token`, `/profile`, `/change-password`.
- **Dashboard** (`/api/v1/dashboard`): `/summary`, `/cashflow`, `/categories`, `/networth` (all live aggregations).
- **Accounts** (`/api/v1/accounts`): CRUD for manual user-maintained accounts.
- **Transactions** (`/api/v1/transactions`): CRUD for transactions + recurring endpoints (`/recurring`, `/recurring/:id/toggle`, `/recurring/process-due`).
- **Budgets** (`/api/v1/budgets`): CRUD for category budget limits with spend calculations.
- **Goals** (`/api/v1/goals`): CRUD for goals and `/goals/:id/entries` for contributions.
- **Loans** (`/api/v1/loans`): CRUD for loans and EMI amortization calculations.
- **Investments** (`/api/v1/investments`): CRUD for manual holdings and portfolio metrics.
- **Insurance** (`/api/v1/insurance`): CRUD for policies and renewal tracking.
- **AI Analyst** (`/api/v1/ai`): `/chat`, `/query`, `/history`, `/conversations`, `/starter-prompts`.
- **Reports** (`/api/v1/reports`): Summary reports and `/export/csv` with injection protection.
- **Notifications** (`/api/v1/notifications`): Preferences and generated alerts.
- **Billing** (`/api/v1/billing`): `/plans`, `/create-order`, `/verify-payment`.
- **Public** (`/api/v1/public`): `/contact`.

---

## 5. Feature Classification

| Feature | Intended Status | Actual Audit Status |
|---|---|---|
| Manual Income & Expense (without Account) | Fully Supported | **Working** (accountId is optional) |
| Manual Income & Expense (with Account) | Fully Supported | **Working** (updates derived balance) |
| Recurring Income Schedules | Fully Supported | **Working** (with automatic monthly server generation & atomic idempotency) |
| Non-double counting of expected income | Fully Supported | **Working** (expected income isolated from current ledger until recorded) |
| AI Financial Analyst | Fully Supported | **Working** (parses real user data deterministically; clean educational fallback) |
| Live Bank Sync | Intentionally NOT supported | **Removed / Disclosed** (No claims of live bank sync) |
| Fabricated sample data for new accounts | Prohibited | **Eliminated** (100% truthful empty states) |
| Integer-paise money arithmetic | Fully Supported | **Enforced** (1 INR = 100 paise across all schemas and services) |

---

## 6. Root Causes Found & Repaired

1. **Mandatory Account Requirement**:
   - *Problem*: `Transaction` and `RecurringTransaction` schemas previously required an `accountId`, preventing users from recording income or expenses without first setting up bank accounts.
   - *Fix*: Made `accountId` optional (`default: null`) across schemas, controllers, and validation rules while keeping it mandatory only for account-to-account `transfer` transactions.
2. **AI Analyst Query Route & Aggregation**:
   - *Problem*: Mismatch between `/ai/query` and `/ai/chat` request formats, plus missing `ObjectId` casting in Mongoose `.aggregate()`.
   - *Fix*: Unified routes, added aliases, cast `userId` in all aggregate pipelines.
3. **Background Scheduler for Recurring Income**:
   - *Problem*: Schedules existed only as database records without an execution engine.
   - *Fix*: Implemented `recurringEngine.js` with date mathematics, month-end preservation (Jan 31 -> Feb 28 -> Mar 31), and atomic lock idempotency (`findOneAndUpdate`).

---

## 7. Phased Verification & Results

- **Unit Tests**: `financeEngine.test.js` (19 tests) — **Passed**
- **Integration Tests**: `recurringAndAi.test.js` (9 tests) & `api.test.js` (9 tests) — **Passed** (Total: 37/37 passing)
- **Client Build**: `npm --prefix client run build` — **Built with 0 errors**

---

## 8. Deployment & Multi-Instance Scheduler Considerations

- **Single Node / Standard Deployment**: The built-in hourly recurring engine (`server/src/services/recurringEngine.js`) runs safely on a single Node.js instance.
- **Idempotency Guarantee**: Because each generated transaction stores `metadata.recurringScheduleId` and `metadata.scheduledDueDate` with unique lookup before creation, even if multiple scheduler runs overlap, duplicate transactions for the same due date are prevented.
- **Multi-Instance / Clustered Topology**: If scaling across multiple container instances in Kubernetes or multi-dyno deployments, designate a single worker instance for the cron runner or integrate a distributed lock (e.g. Redis Redlock or MongoDB collection lock) to prevent redundant concurrent queries.
