# FinPilot Financial Calculation Rules & Formulas

## 1. Currency & Precision Standard
- **Primary Currency**: INR (Indian Rupee, `INR`).
- **Storage & Arithmetic Representation**: Integer minor units (**Paise**).
  - Formula: $\text{Paise} = \text{round}(\text{Rupees} \times 100)$
  - Example: `₹1,234.56` is strictly stored and calculated as `123456`.
- **Zero Floating-Point Arithmetic**: All internal calculations, aggregations, additions, and subtractions on currency are performed using integers.
- **Display Conversion**: Minor units are converted to decimal format only when formatting for UI display or export formatting:
  $$\text{Formatted Currency} = \frac{\text{Paise}}{100}$$

---

## 2. Cash Flow & Balance Derivation

### 2.1. Tracked Cash Balance
Tracked balances are derived from user-entered accounts and their recorded transaction ledger:
$$\text{Account Balance} = \text{Opening Balance} + \sum \text{Inflows} - \sum \text{Outflows}$$
$$\text{Total Tracked Cash} = \sum_{\text{all active accounts}} \text{Account Balance}$$

*Disclaimer: Tracked balances are based exclusively on user-entered records, not verified live bank account connections.*

### 2.2. Transaction Classifications & Double-Counting Prevention
- **Income (`income`)**: Positive cash flow into an account from an external source. Increases Tracked Cash.
- **Expense (`expense`)**: Negative cash flow out of an account to an external payee/merchant. Decreases Tracked Cash.
- **Internal Transfer (`transfer`)**: Movement of money between two user accounts (Source Account $\to$ Destination Account).
  - Ledger effect: Debits Source Account and Credits Destination Account by the same integer amount.
  - Net Cash Flow effect: **Zero** ($+0$). Transfers are strictly excluded from Income and Expense totals to prevent double-counting.
- **Savings Goal Contribution (`goal_contribution`)**:
  - An earmark/allocation of existing cash towards a goal.
  - It does **not** change total tracked cash unless linked to an actual external outflow transaction.
- **Investment Purchase (`investment_buy`)**:
  - Cash outflow from account converted into an asset holding.
  - Decreases Tracked Cash, increases Total Asset Value.
- **Loan EMI Payment (`loan_payment`)**:
  - Cash outflow split into **Principal Repayment** and **Interest Expense**.
  - Principal portion reduces Loan Liability; Interest portion is recorded as a finance expense.

### 2.3. Net Cash Flow
For any given date interval $[t_{\text{start}}, t_{\text{end}}]$:
$$\text{Net Cash Flow} = \sum_{t} \text{Income} - \sum_{t} \text{Expense}$$

---

## 3. Available Cash vs. Investable Surplus

### 3.1. Available Uncommitted Cash
$$\text{Available Cash} = \text{Total Tracked Cash} - \text{Total Active Goal Earmarks} - \text{Upcoming Mandatory 30-Day Obligations}$$
Where upcoming obligations include:
- Upcoming scheduled loan EMIs.
- Upcoming recurring utility & insurance premiums.
- Essential recurring bill commitments.

### 3.2. Genuinely Investable Surplus Determination
Before suggesting any long-term or market-linked investment, the system computes:
$$\text{Emergency Reserve Target} = 3 \times \text{Average Monthly Essential Expenses}$$
$$\text{Investable Surplus} = \max(0, \text{Available Cash} - \text{Emergency Reserve Target})$$

If $\text{Investable Surplus} \le 0$, the AI and engine prioritize emergency fund building and high-interest debt clearance over discretionary investing.

---

## 4. Savings Goals & Projections

### 4.1. Goal Progress
$$\text{Progress Percentage} = \min\left(100, \frac{\text{Current Allocated Amount}}{\text{Target Amount}} \times 100\right)$$
$$\text{Shortfall} = \max(0, \text{Target Amount} - \text{Current Allocated Amount})$$

### 4.2. Required Monthly Savings Rate
For a goal with target date $T_{\text{target}}$ and remaining months $M = \max(1, \text{MonthsToDate}(T_{\text{target}}))$:
$$\text{Required Monthly Contribution} = \left\lceil \frac{\text{Shortfall}}{M} \right\rceil$$

### 4.3. Affordability Projection (e.g. Can I afford ₹75,000 purchase in $N$ months?)
Given target item cost $C$, duration $N$ months, estimated monthly income $I_{\text{est}}$, estimated monthly expenses $E_{\text{est}}$, and current uncommitted surplus $S_0$:
$$\text{Projected Surplus at } N \text{ months} = S_0 + N \times (I_{\text{est}} - E_{\text{est}})$$
$$\text{Affordability Status} = \begin{cases} 
\mathbf{Affordable}, & \text{if } \text{Projected Surplus} \ge C \\
\mathbf{Deficit}, & \text{if } \text{Projected Surplus} < C 
\end{cases}$$
$$\text{Required Additional Monthly Savings} = \max\left(0, \left\lceil \frac{C - S_0 - N \times (I_{\text{est}} - E_{\text{est}})}{N} \right\rceil\right)$$

---

## 5. Loan & EMI Amortization Mathematics

### 5.1. Equated Monthly Installment (EMI)
For principal $P$ (in paise), monthly interest rate $r = \frac{\text{Annual Rate \%}}{12 \times 100}$, and total tenure in months $n$:
$$\text{EMI} = \text{round}\left( P \times \frac{r(1+r)^n}{(1+r)^n - 1} \right)$$
*(If $r = 0$, $\text{EMI} = \text{round}\left(\frac{P}{n}\right)$)*

### 5.2. Monthly Amortization Breakdown (Period $k \in [1, n]$)
1. **Interest Component**:
   $$\text{Interest}_k = \text{round}(P_{k-1} \times r)$$
2. **Principal Component**:
   $$\text{Principal}_k = \min(P_{k-1}, \text{EMI} - \text{Interest}_k)$$
   *(For the final month $n$, $\text{Principal}_n = P_{n-1}$ to eliminate rounding drift)*
3. **Closing Principal**:
   $$P_k = P_{k-1} - \text{Principal}_k$$
4. **Total Repayment & Total Interest**:
   $$\text{Total Payment} = \sum_{k=1}^n (\text{Principal}_k + \text{Interest}_k)$$
   $$\text{Total Interest} = \text{Total Payment} - P$$

---

## 6. Net Worth Computation
$$\text{Net Worth} = \sum \text{Assets} - \sum \text{Liabilities}$$
Where:
- $\sum \text{Assets} = \text{Tracked Cash} + \text{Investments Cost Basis / Manual Valuation} + \text{Other Tracked Valued Assets}$
- $\sum \text{Liabilities} = \sum \text{Outstanding Loan Principals} + \text{Credit Card Outstandings}$

*All net worth summaries display a data completeness notice indicating whether values are verified or manually entered estimates.*

---

## 7. Budget Tracking & Thresholds
For category $C$ with budget limit $B_C$:
$$\text{Budget Consumed \%} = \frac{\text{Actual Expenses}_C}{B_C} \times 100$$
$$\text{Remaining Budget} = B_C - \text{Actual Expenses}_C$$
- **Alert Status**:
  - `NORMAL`: $\text{Consumed} < 80\%$
  - `WARNING`: $80\% \le \text{Consumed} < 100\%$
  - `EXCEEDED`: $\text{Consumed} \ge 100\%$

---

## 8. Date Boundaries and Timezones
- All database timestamps are stored in UTC (`ISO 8601`).
- Month, quarter, and year boundaries are computed in the user's configured timezone (Default: `Asia/Kolkata`, `UTC+05:30`).
- Start of month is `00:00:00.000` local time, converted to UTC for database queries.
- End of month is `23:59:59.999` local time, converted to UTC for database queries.
