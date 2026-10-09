import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Info,
  Download,
  Shield,
  Target,
  CheckCircle2,
  Calendar,
  Building,
  CreditCard,
  Plus,
  TrendingUp,
  ReceiptText,
  Landmark,
  X,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState('');

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Quick transaction form
  const [txForm, setTxForm] = useState({
    type: 'expense',
    amount: '',
    accountId: '',
    category: 'Food & Dining',
    description: ''
  });

  // Quick goal form
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'emergency_fund'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');

      const [sumRes, timeRes, catRes, goalRes, accRes] = await Promise.all([
        apiRequest('/dashboard/summary').catch(() => ({ success: false })),
        apiRequest('/dashboard/timeseries?months=6').catch(() => ({ success: false })),
        apiRequest('/dashboard/categories?type=expense').catch(() => ({ success: false })),
        apiRequest('/goals').catch(() => ({ success: false })),
        apiRequest('/accounts').catch(() => ({ success: false }))
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
      if (timeRes.success && timeRes.data?.timeseries) {
        setTimeseries(timeRes.data.timeseries);
      }
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
      }
      if (goalRes.success && goalRes.data?.goals) {
        setGoals(goalRes.data.goals);
      }
      if (accRes.success && accRes.data?.accounts) {
        setAccounts(accRes.data.accounts);
        if (accRes.data.accounts.length > 0) {
          setTxForm((prev) => ({ ...prev, accountId: accRes.data.accounts[0]._id }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTx = async (e) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.accountId) return;
    try {
      const amountPaise = Math.round(parseFloat(txForm.amount) * 100);
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: txForm.type,
          amountPaise,
          accountId: txForm.accountId,
          category: txForm.category,
          description: txForm.description
        })
      });
      setShowAddTxModal(false);
      setTxForm({
        type: 'expense',
        amount: '',
        accountId: accounts[0]?._id || '',
        category: 'Food & Dining',
        description: ''
      });
      loadDashboardData();
    } catch (err) {
      alert(`Failed to save transaction: ${err.message}`);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount) return;
    try {
      const targetAmountPaise = Math.round(parseFloat(goalForm.targetAmount) * 100);
      await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: goalForm.name,
          targetAmountPaise,
          targetDate: goalForm.targetDate ? new Date(goalForm.targetDate).toISOString() : null,
          category: goalForm.category
        })
      });
      setShowGoalModal(false);
      setGoalForm({ name: '', targetAmount: '', targetDate: '', category: 'emergency_fund' });
      loadDashboardData();
    } catch (err) {
      alert(`Failed to create savings goal: ${err.message}`);
    }
  };

  const totalTrackedCashPaise = summary?.totalTrackedCashPaise || 0;
  const availableCashPaise = summary?.availableCashPaise || 0;
  const currentMonthIncomePaise = summary?.currentMonth?.incomePaise || 0;
  const currentMonthExpensePaise = summary?.currentMonth?.expensePaise || 0;
  const currentMonthNetPaise = summary?.currentMonth?.netCashFlowPaise || 0;
  const totalGoalEarmarksPaise = summary?.totalGoalEarmarksPaise || 0;
  const upcomingObligationsPaise = summary?.upcomingObligations?.totalPaise || 0;
  const recentTransactions = summary?.recentTransactions || [];

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader
        onNewGoal={() => setShowGoalModal(true)}
        onRecordTransaction={() => setShowAddTxModal(true)}
      />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">FINPILOT REAL-TIME TELEMETRY</span>
              <span className="text-slate-600">//</span>
              <span>ACCOUNTING ENGINE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Financial Command Center
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>Create Savings Goal</span>
            </button>

            <button
              onClick={() => setShowAddTxModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* 4 Core Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Tracked Cash */}
          <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 uppercase font-medium">TOTAL TRACKED CASH</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">
                {accounts.length} ACCOUNTS
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-white">
              {formatCurrency(totalTrackedCashPaise)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              {accounts.length === 0
                ? 'No financial accounts linked yet.'
                : 'Liquid balance across all bank accounts and cash vaults.'}
            </div>
          </div>

          {/* Card 2: Safe-to-Spend / Disposable Cash */}
          <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#05DF85] uppercase font-bold">UNCOMMITTED CASH</span>
              <span className="text-slate-500 text-[10px]">SAFE-TO-SPEND</span>
            </div>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-[#05DF85]">
              {formatCurrency(availableCashPaise)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              {totalGoalEarmarksPaise === 0 && upcomingObligationsPaise === 0
                ? 'After subtracting goal reserves and upcoming 30-day bills.'
                : `Excludes ${formatCurrency(totalGoalEarmarksPaise)} goals & ${formatCurrency(upcomingObligationsPaise)} bills.`}
            </div>
          </div>

          {/* Card 3: Money Received (This Month) */}
          <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 uppercase font-medium">MONEY RECEIVED [THIS MONTH]</span>
              <span className="text-[#05DF85] text-[10px]">INFLOW</span>
            </div>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-white">
              +{formatCurrency(currentMonthIncomePaise)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Salary, consulting, yields, and recorded receipts.
            </div>
          </div>

          {/* Card 4: Money Spent (This Month) */}
          <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 uppercase font-medium">MONEY SPENT [THIS MONTH]</span>
              <span className="text-rose-400 text-[10px]">OUTFLOW</span>
            </div>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-white">
              -{formatCurrency(currentMonthExpensePaise)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Living expenses, subscriptions, and discretionary costs.
            </div>
          </div>
        </div>

        {/* Brand New User Prompt Banner if 0 Accounts */}
        {accounts.length === 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#080D16] to-[#080D16] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#05DF85]">
                <Sparkles className="w-4 h-4" />
                <span>START YOUR FINANCIAL VAULT</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Add your primary bank account or cash wallet to see live balances
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                FinPilot uses integer-paise calculations to give you exact visibility into your money without rounding errors or guesswork.
              </p>
            </div>
            <Link
              to="/workspace/accounts"
              className="px-5 py-2.5 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)] shrink-0 text-center"
            >
              Add First Account →
            </Link>
          </div>
        )}

        {/* 2-Column Section: Cash Flow Trend & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cash Flow Timeseries (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Cash Flow Trend</h3>
                <p className="text-xs text-slate-400">Income received vs expenses spent across past months</p>
              </div>
            </div>

            {timeseries.length === 0 || timeseries.every((t) => t.incomePaise === 0 && t.expensePaise === 0) ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-white/[0.06] rounded-xl">
                <ReceiptText className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-400">No monthly cash flow history yet.</p>
                <p className="text-[11px] text-slate-500">Record transactions to visualize your cash flow trend.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {timeseries.map((m) => (
                  <div key={m.monthKey} className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{m.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#05DF85]">+{formatCurrency(m.incomePaise)}</span>
                      <span className="text-slate-400">-{formatCurrency(m.expensePaise)}</span>
                      <span className={`font-bold ${m.netCashFlowPaise >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        Net {formatCurrency(m.netCashFlowPaise)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Spending by Category</h3>
              <p className="text-xs text-slate-400">Real expense distribution for the current month</p>
            </div>

            {categories.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-white/[0.06] rounded-xl">
                <PieChartIcon className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-400">No category spending recorded this month.</p>
                <p className="text-[11px] text-slate-500">Categorized expenses will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {categories.map((c) => (
                  <div key={c.name} className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-white">{c.name}</span>
                      <span className="font-mono text-white font-bold">{formatCurrency(c.totalPaise)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{c.count} transactions</span>
                      <span>{c.percent}% of month</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Section: Goals & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Savings Goals (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Savings Goals & Earmarks</h3>
                <p className="text-xs text-slate-400">Isolated funds reserved from safe-to-spend cash</p>
              </div>
              <Link to="/workspace/goals" className="text-xs text-[#05DF85] font-semibold hover:underline">
                View All →
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-white/[0.06] rounded-xl">
                <Target className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-400">No active savings targets.</p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs mt-1"
                >
                  Create First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const percent = g.targetAmountPaise > 0 ? Math.min(100, Math.round((g.currentAmountPaise / g.targetAmountPaise) * 100)) : 0;
                  return (
                    <div key={g._id} className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{g.name}</span>
                        <span className="font-mono text-[#05DF85] font-bold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#05DF85] h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Saved: {formatCurrency(g.currentAmountPaise)}</span>
                        <span>Target: {formatCurrency(g.targetAmountPaise)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Latest activity from your ledger</p>
              </div>
              <Link to="/workspace/transactions" className="text-xs text-[#05DF85] font-semibold hover:underline">
                View Ledger →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-white/[0.06] rounded-xl">
                <ReceiptText className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-400">No transactions recorded yet.</p>
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs mt-1"
                >
                  Record First Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <div key={t._id} className="p-2.5 rounded-xl bg-[#0D1422] border border-white/[0.04] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-[#05DF85]' : 'bg-slate-800 text-slate-300'}`}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{t.description || t.category}</div>
                        <div className="text-[10px] font-mono text-slate-400">{t.accountId?.name || 'Account'} • {t.category}</div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-right whitespace-nowrap">
                      <span className={t.type === 'income' ? 'text-[#05DF85]' : 'text-white'}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountPaise)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white">Record Transaction</h3>
              <button onClick={() => setShowAddTxModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {accounts.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                <p>Please create at least one account in Accounts before recording transactions.</p>
                <Link to="/workspace/accounts" className="inline-block px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                  Go to Accounts
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateTx} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTxForm({ ...txForm, type: t })}
                      className={`py-2 rounded-lg font-bold border transition-all ${txForm.type === t ? 'bg-[#05DF85] text-slate-950 border-[#05DF85]' : 'bg-[#0D1422] text-slate-300 border-white/[0.08]'}`}
                    >
                      {t === 'expense' ? 'Expense (-)' : 'Income (+)'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 500.00"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Account *</label>
                    <select
                      value={txForm.accountId}
                      onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                    >
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={txForm.category}
                      onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Housing & Rent">Housing & Rent</option>
                      <option value="Transport & Fuel">Transport & Fuel</option>
                      <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                      <option value="Shopping & Tech">Shopping & Tech</option>
                      <option value="Primary Salary">Primary Salary</option>
                      <option value="Other Income">Other Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Grocery store, Salary payout"
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setShowAddTxModal(false)} className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs">
                    Save Record
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Savings Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white">Create Savings Goal</h3>
              <button onClick={() => setShowGoalModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Laptop Sinking Fund"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Amount (₹ INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 100000.00"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="emergency_fund">Emergency Cushion</option>
                    <option value="vacation">Vacation & Travel</option>
                    <option value="gadget">Tech & Gadgets</option>
                    <option value="vehicle">Vehicle Down Payment</option>
                    <option value="other">General Goal</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowGoalModal(false)} className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
