# FinPilot API Specification (v1)

**Base URL**: `/api/v1`  
**Data Format**: JSON (`application/json`)  
**Currency Standard**: Integer minor units (**Paise** for INR, e.g. `100000` = `₹1,000.00`).  
**Authentication**: HttpOnly session cookie (`finpilot_session`) with CSRF token protection for mutating requests (`X-CSRF-Token` header).

---

## 1. Standard Response Formats

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMITED | PLAN_LIMIT_EXCEEDED | INTERNAL_ERROR",
    "message": "Specific explanation of the error",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive integer in paise"
      }
    ]
  }
}
```

---

## 2. API Endpoints Overview

### 2.1. Authentication & User Profile (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user (email, password, name, currency). |
| `POST` | `/auth/login` | Public | Authenticate user, set secure httpOnly session cookie. |
| `POST` | `/auth/logout` | Session | Invalidate current session and clear cookie. |
| `GET` | `/auth/me` | Session | Get current authenticated user profile & entitlements. |
| `PUT` | `/auth/profile` | Session | Update user preferences (name, currency, timezone, theme). |
| `PUT` | `/auth/password` | Session | Change account password. |
| `POST` | `/auth/forgot-password` | Public | Request password reset token (constant-time response). |
| `POST` | `/auth/reset-password` | Public | Reset password using single-use reset token. |
| `GET` | `/auth/csrf-token` | Public | Obtain CSRF token for mutating requests. |

### 2.2. Accounts (`/api/v1/accounts`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/accounts` | Session | List all accounts with current computed tracked balances. |
| `POST` | `/accounts` | Session | Create account (name, type: `bank | cash | wallet | investment | credit`, currency, openingBalance). |
| `GET` | `/accounts/:id` | Session | Get single account details and recent transaction summary. |
| `PUT` | `/accounts/:id` | Session | Update account details (name, type, color, icon). |
| `DELETE` | `/accounts/:id` | Session | Soft-archive account or delete if no transactions exist. |

### 2.3. Transactions & Recurrings (`/api/v1/transactions`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/transactions` | Session | Paginated search/filter list (date range, type, category, account, search query). |
| `POST` | `/transactions` | Session | Create transaction (`income`, `expense`, or `transfer`). |
| `GET` | `/transactions/:id` | Session | Get transaction details. |
| `PUT` | `/transactions/:id` | Session | Update transaction. |
| `DELETE` | `/transactions/:id` | Session | Delete transaction. |
| `GET` | `/transactions/recurring` | Session | List recurring transaction rules. |
| `POST` | `/transactions/recurring` | Session | Create recurring rule (`frequency`, `startDate`, `nextDueDate`, etc.). |
| `DELETE` | `/transactions/recurring/:id` | Session | Delete recurring rule. |

### 2.4. Dashboard & Reports (`/api/v1/dashboard`, `/api/v1/reports`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Session | Tracked cash, net cash flow (current month), monthly comparison, upcoming bills. |
| `GET` | `/dashboard/cashflow-chart` | Session | Monthly income vs expense timeseries for selectable month range. |
| `GET` | `/dashboard/category-breakdown` | Session | Expense & income category aggregations for period. |
| `GET` | `/reports/net-worth` | Session | Complete asset vs liability breakdown with completeness labels. |
| `GET` | `/reports/export/csv` | Session (Plan Check) | Export filtered transactions as CSV (formula-injection protected). |

### 2.5. Budgets & Savings Goals (`/api/v1/budgets`, `/api/v1/goals`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/budgets` | Session | List budgets with real-time consumed amount and alert status. |
| `POST` | `/budgets` | Session | Create category budget (`category`, `amount`, `period`). |
| `PUT` | `/budgets/:id` | Session | Update budget amount or period. |
| `DELETE` | `/budgets/:id` | Session | Delete budget. |
| `GET` | `/goals` | Session | List savings goals with progress, shortfall, and required monthly savings. |
| `POST` | `/goals` | Session (Free/Prem Check) | Create goal (`name`, `targetAmount`, `targetDate`, `category`, `priority`). |
| `POST` | `/goals/:id/contributions` | Session | Add contribution/earmark to goal. |
| `DELETE` | `/goals/:id` | Session | Delete or archive goal. |

### 2.6. Premium Modules: Loans, Investments, Insurance (`/api/v1/loans`, `/api/v1/investments`, `/api/v1/insurance`)
| Method | Endpoint | Auth & Entitlement | Description |
|---|---|---|---|
| `GET` | `/loans` | Premium | List loans with remaining principal, next EMI date, total interest. |
| `POST` | `/loans` | Premium | Create loan (`principal`, `interestRate`, `tenureMonths`, `startDate`, `lender`). |
| `GET` | `/loans/:id/amortization` | Premium | Full deterministic amortization schedule. |
| `POST` | `/loans/:id/payments` | Premium | Record EMI / prepayment. |
| `GET` | `/investments` | Premium | List investment holdings, asset allocation, and total cost basis. |
| `POST` | `/investments` | Premium | Add investment holding (`assetType`, `symbol/name`, `units`, `buyPrice`, `date`). |
| `GET` | `/insurance` | Premium | List insurance policies with upcoming renewals and coverage totals. |
| `POST` | `/insurance` | Premium | Add policy (`policyType`, `provider`, `policyNumberMasked`, `premiumAmount`, `renewalDate`). |

### 2.7. Subscriptions & Payments (`/api/v1/billing`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/billing/plans` | Public | List available plans (Free: ₹0, Premium Monthly: ₹99, Premium Yearly: ₹799). |
| `GET` | `/billing/subscription` | Session | Get current user's subscription and entitlement status. |
| `POST` | `/billing/create-order` | Session | Create Razorpay order for subscription checkout. |
| `POST` | `/billing/verify-payment` | Session | Verify Razorpay payment signature and activate subscription. |
| `POST` | `/billing/cancel` | Session | Cancel auto-renewal of subscription. |
| `POST` | `/billing/webhook` | Public (Sig Verified) | Razorpay webhook endpoint with raw body signature check & idempotency. |

### 2.8. AI Financial Analyst (`/api/v1/ai`)
| Method | Endpoint | Auth & Entitlement | Description |
|---|---|---|---|
| `POST` | `/ai/chat` | Premium / Free limit | Submit prompt (e.g., affordability query, surplus investment options). |
| `GET` | `/ai/conversations` | Session | List user AI conversation sessions. |
| `GET` | `/ai/conversations/:id` | Session | Get messages for conversation. |
| `DELETE` | `/ai/conversations/:id` | Session | Delete conversation history. |
| `GET` | `/ai/starter-prompts` | Session | Return contextually relevant prompt suggestions. |

### 2.9. Public & Contact (`/api/v1/public`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/public/contact` | Public (Rate-Limited) | Submit contact form message with server validation. |
