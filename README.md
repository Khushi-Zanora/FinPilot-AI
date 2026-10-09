# FinPilot — Your money. Your goals. A clearer direction.

FinPilot is a full-stack personal finance management SaaS platform built with JavaScript (Node.js, Express, React, Vite, Tailwind CSS, MongoDB Atlas). It provides cashflow intelligence, loan amortization schedules, savings goal forecasting, portfolio allocation, and an AI financial analyst.

---

## 🚀 Key Features

- **Integer Paise Financial Precision**: All currency calculations are executed in integer minor units (paise) to eliminate floating-point arithmetic errors.
- **Tracked Cash & Net Cash Flow**: Live derived balances across multi-currency accounts with strict internal transfer isolation (no double-counting).
- **Available Cash vs. Investable Surplus**: Separates 30-day obligations (EMIs, recurring bills, insurance) and goal earmarks from true investable surplus.
- **Deterministic Loan & EMI Engine**: Full monthly amortization schedules splitting principal and interest components with residual balancing.
- **Savings Goals & Forecasts**: Shortfall calculation and required monthly contribution rate forecasting.
- **AI Financial Analyst**: Natural language financial analysis, affordability checks (e.g., *“Can I afford a ₹75,000 phone in 3 months?”*), and educational Indian investment instrument guidance (FDs, RDs, Index ETFs, SGBs) with regulatory disclaimers.
- **Razorpay Subscription Billing**: Safe test-mode billing adapter, plan entitlements (Free vs. Pro), and idempotent webhook processing.
- **Security & CSRF Protection**: HttpOnly cookie session management, CSRF token validation (`X-CSRF-Token`), password hashing via bcrypt, and formula injection protection on CSV exports.

---

## 🛠 Tech Stack

- **Backend**: Node.js (ES Modules), Express, Mongoose (MongoDB), Zod, JWT with HttpOnly Cookies.
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, TanStack Query, Lucide Icons, Recharts.
- **Testing**: Vitest, Supertest, In-Memory Mongo.
- **Payments**: Razorpay Test Mode & Mock Billing Adapter.

---

## 📂 Project Structure

```
FinPilot/
├── docs/
│   ├── api-contract.md       # Complete API v1 contract
│   └── financial-rules.md     # Financial mathematics, formulas, and rules
├── server/
│   ├── src/
│   │   ├── config/            # Environment parsing & validation
│   │   ├── controllers/       # Route controllers (Auth, Accounts, Goals, AI, etc.)
│   │   ├── middleware/        # Auth, CSRF, Entitlements, Rate limiters, Error handler
│   │   ├── models/            # Mongoose data schemas (19 models)
│   │   ├── routes/            # Express API v1 route definitions
│   │   ├── services/          # Finance calculation engine, AI service, Billing service
│   │   ├── utils/             # JWT & cookie helpers
│   │   ├── app.js             # Express application factory
│   │   └── server.js          # Entry point & DB connection
│   └── tests/
│       ├── helpers/           # Test database setup
│       ├── integration/       # API integration tests (Supertest)
│       └── unit/              # Finance engine unit tests
├── client/
│   ├── src/
│   │   ├── api/               # API fetch client & currency formatters
│   │   ├── components/        # Navbar, Footer, Sidebar, ProtectedRoute
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Landing, Dashboard, Ledger, Goals, AI Chat, etc.
│   │   ├── App.jsx            # Main route tree
│   │   └── main.jsx           # React DOM root
│   ├── index.html
│   └── tailwind.config.js
└── package.json
```

---

## ⚙️ Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm test              # Run unit and integration tests
npm run dev           # Start server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run build         # Build frontend bundle
npm run dev           # Start frontend dev server on http://localhost:5173
```

---

## 🧪 Testing Suite

Run all backend tests:
```bash
npm --prefix server test
```
All 28 tests across financial calculations, ledger integrity, auth sessions, subscriptions, and AI query handlers are automated and verified.

---

## 📄 License
ISC
