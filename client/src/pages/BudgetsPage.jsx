import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Plus,
  ArrowRight,
  Sliders,
  Sparkles,
  Lock,
  Download,
  Calendar,
  Layers,
  Trash2,
  X
} from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [budgetForm, setBudgetForm] = useState({
    category: 'Food & Dining',
    monthlyCap: '',
    period: 'monthly'
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    try {
      setLoading(true);
      setError('');

      const [bRes, cRes] = await Promise.all([
        apiRequest('/budgets').catch(() => ({ success: false })),
        apiRequest('/dashboard/categories?type=expense').catch(() => ({ success: false }))
      ]);

      const rawBudgets = bRes.success && bRes.data?.budgets ? bRes.data.budgets : [];
      const catSpent = cRes.success && cRes.data?.categories ? cRes.data.categories : [];

      // Map real spending to each budget
      const mapped = rawBudgets.map((b) => {
        const found = catSpent.find((c) => c.name.toLowerCase() === b.category.toLowerCase());
        const spentPaise = found ? found.totalPaise : 0;
        const capPaise = b.monthlyCapPaise || 0;
        const percent = capPaise > 0 ? (spentPaise / capPaise) * 100 : 0;
        const remainingPaise = capPaise - spentPaise;

        return {
          ...b,
          spentPaise,
          remainingPaise,
          percent: Math.min(999, Math.round(percent))
        };
      });

      setBudgets(mapped);
    } catch (err) {
      setError(err.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.monthlyCap) return;

    setSubmitting(true);
    setError('');

    try {
      const monthlyCapPaise = Math.round(parseFloat(budgetForm.monthlyCap) * 100);
      if (isNaN(monthlyCapPaise) || monthlyCapPaise <= 0) {
        throw new Error('Please enter a valid monthly cap amount.');
      }

      const res = await apiRequest('/budgets', {
        method: 'POST',
        body: JSON.stringify({
          category: budgetForm.category,
          amountPaise: monthlyCapPaise,
          monthlyCapPaise,
          period: budgetForm.period
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setBudgetForm({ category: 'Food & Dining', monthlyCap: '', period: 'monthly' });
        await loadBudgets();
      }
    } catch (err) {
      setError(err.message || 'Failed to create budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id, cat) => {
    if (!window.confirm(`Delete monthly budget for "${cat}"?`)) return;
    try {
      await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
      await loadBudgets();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const totalCapPaise = budgets.reduce((acc, b) => acc + (b.monthlyCapPaise || 0), 0);
  const totalSpentPaise = budgets.reduce((acc, b) => acc + (b.spentPaise || 0), 0);
  const overallPercent = totalCapPaise > 0 ? Math.round((totalSpentPaise / totalCapPaise) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">SPENDING CONTROLS</span>
              <span className="text-slate-600">//</span>
              <span>MONTHLY BUDGET CAPS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Budgets & Spending Limits
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Budget</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 3 Real Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL BUDGET CAP</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalCapPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {budgets.length} active monthly categories
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">SPENT THIS MONTH</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalSpentPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {overallPercent}% of total budgeted limit
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">REMAINING SPENDING BUFFER</div>
            <div className={`text-2xl font-mono font-bold ${totalCapPaise >= totalSpentPaise ? 'text-[#05DF85]' : 'text-rose-400'}`}>
              {formatCurrency(totalCapPaise - totalSpentPaise)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Available buffer across budgeted categories
            </div>
          </div>
        </div>

        {/* Budgets Grid */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Spending Budgets Created Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Set monthly spending limits for categories like Food & Dining, Rent, Utilities, and Shopping to track category burn.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const isOver = b.spentPaise > b.monthlyCapPaise;
              const isNear = b.percent >= 85 && !isOver;

              return (
                <div
                  key={b._id}
                  className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{b.category}</h4>
                        <div className="text-[10px] font-mono text-slate-400">Monthly Budget</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            isOver
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : isNear
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20'
                          }`}
                        >
                          {isOver ? 'OVER BUDGET' : isNear ? 'NEAR CAP' : 'ON TRACK'}
                        </span>

                        <button
                          onClick={() => handleDeleteBudget(b._id, b.category)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Spent: <strong className="text-white">{formatCurrency(b.spentPaise)}</strong></span>
                        <span className="font-bold text-white">{b.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-[#05DF85]'
                          }`}
                          style={{ width: `${Math.min(b.percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Limit: {formatCurrency(b.monthlyCapPaise)}</span>
                    <span className={b.remainingPaise >= 0 ? 'text-[#05DF85]' : 'text-rose-400'}>
                      {b.remainingPaise >= 0 ? `Left: ${formatCurrency(b.remainingPaise)}` : `Over: ${formatCurrency(Math.abs(b.remainingPaise))}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#05DF85]" />
                <span>Create Monthly Budget</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Expense Category *</label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing & Rent">Housing & Rent</option>
                  <option value="Transport & Fuel">Transport & Fuel</option>
                  <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                  <option value="Shopping & Tech">Shopping & Tech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="General Expense">General Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly Spending Limit (₹ INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 15000.00"
                  value={budgetForm.monthlyCap}
                  onChange={(e) => setBudgetForm({ ...budgetForm, monthlyCap: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
