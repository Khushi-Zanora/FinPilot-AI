import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Bot,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isPremium } = useAuth();
  const [summary, setSummary] = useState(null);
  const [cashflowData, setCashflowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [sumRes, chartRes] = await Promise.all([
        apiRequest('/dashboard/summary'),
        apiRequest('/dashboard/cashflow-chart?months=6')
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (chartRes.success) setCashflowData(chartRes.data.timeseries || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time cash flow, goal progress, and AI-assisted insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/workspace/ai"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 text-sm font-semibold transition-all shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Analyst</span>
          </Link>
          <Link
            to="/workspace/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tracked Total Cash */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked Cash</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary?.totalTrackedCashPaise)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Liquid balance across active accounts
          </p>
        </div>

        {/* Available Uncommitted Cash */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Cash</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(summary?.availableCashPaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            After goal earmarks & 30-day bills
          </p>
        </div>

        {/* Current Month Inflows */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Month Inflow</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary?.currentMonth?.incomePaise)}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recorded income this month</span>
          </p>
        </div>

        {/* Current Month Outflows */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Month Outflow</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary?.currentMonth?.expensePaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Net Cash Flow:{' '}
            <span className={summary?.currentMonth?.netCashFlowPaise >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {formatCurrency(summary?.currentMonth?.netCashFlowPaise)}
            </span>
          </p>
        </div>
      </div>

      {/* 30-Day Obligations & Goal Earmarks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Upcoming 30-Day Mandatory Obligations</span>
            </h3>
            <span className="text-sm font-extrabold text-cyan-400">
              {formatCurrency(summary?.upcomingObligations?.totalPaise)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Loan EMIs</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(summary?.upcomingObligations?.breakdown?.loanEmiPaise)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Recurring Bills</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(summary?.upcomingObligations?.breakdown?.recurringBillsPaise)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Insurance Premiums</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(summary?.upcomingObligations?.breakdown?.insurancePremiumsPaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Goal Earmarks Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Goal Earmarks</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary?.totalGoalEarmarksPaise)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Allocated into active savings goals. Protected from discretionary spending.
            </p>
          </div>

          <Link
            to="/workspace/goals"
            className="mt-4 block text-center text-xs font-semibold py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Manage Savings Goals →
          </Link>
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          <Link to="/workspace/transactions" className="text-xs text-emerald-400 hover:underline">
            View All Transactions →
          </Link>
        </div>

        {summary?.recentTransactions?.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No transactions recorded yet. Click "Add Transaction" above to start your ledger.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {summary?.recentTransactions?.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : tx.type === 'transfer'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'transfer' ? (
                      <Wallet className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{tx.category}</div>
                    <div className="text-xs text-slate-400">
                      {tx.description || tx.accountId?.name} • {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold ${
                    tx.type === 'income'
                      ? 'text-emerald-400'
                      : tx.type === 'transfer'
                      ? 'text-cyan-400'
                      : 'text-slate-200'
                  }`}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄ ' : '-'}
                  {formatCurrency(tx.amountPaise)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracked Disclaimer Notice */}
      <div className="text-xs text-slate-500 flex items-center gap-2 px-2">
        <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
        <span>{summary?.disclaimer || 'Tracked balances are derived from user-recorded ledger entries.'}</span>
      </div>
    </div>
  );
}
