import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PieChart, Plus, AlertTriangle, CheckCircle2, AlertOctagon, Trash2, X } from 'lucide-react';

export default function BudgetsPage() {
  const { isPremium } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [period, setPeriod] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(true);

  // Add Budget Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      setLoading(true);
      const res = await apiRequest('/budgets');
      if (res.success) {
        setBudgets(res.data.budgets || []);
        if (res.data.period) setPeriod(res.data.period);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBudget(e) {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const amountPaise = Math.round(parseFloat(amount) * 100);
      await apiRequest('/budgets', {
        method: 'POST',
        body: JSON.stringify({
          category,
          amountPaise,
          period: 'monthly'
        })
      });

      setIsModalOpen(false);
      setCategory('');
      setAmount('');
      fetchBudgets();
    } catch (err) {
      setModalError(err.message || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBudget(id) {
    if (!window.confirm('Delete this category budget?')) return;
    try {
      await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Category Budgets</h1>
          <p className="text-sm text-slate-400">
            Set monthly spending boundaries and track threshold alerts in real-time
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Budgets Created</h3>
          <p className="text-sm max-w-sm mx-auto mb-6">
            Configure spending targets for Groceries, Dining, Utilities, or Entertainment.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.status === 'EXCEEDED';
            const isWarning = b.status === 'WARNING';

            return (
              <div
                key={b._id}
                className={`glass-panel p-6 rounded-2xl border ${
                  isExceeded
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">{b.category}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isExceeded
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isExceeded && <AlertOctagon className="w-3 h-3" />}
                        {isWarning && <AlertTriangle className="w-3 h-3" />}
                        {!isExceeded && !isWarning && <CheckCircle2 className="w-3 h-3" />}
                        <span>{b.status}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mt-2 mb-2">
                    <span className="text-2xl font-black text-white">
                      {formatCurrency(b.spentPaise)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Limit: {formatCurrency(b.amountPaise)}
                    </span>
                  </div>

                  {/* Consumed Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.consumedPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{b.consumedPercentage}% Consumed</span>
                    <span className={b.remainingPaise < 0 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                      {b.remainingPaise >= 0 ? `Remaining: ${formatCurrency(b.remainingPaise)}` : `Over by: ${formatCurrency(Math.abs(b.remainingPaise))}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Category Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries, Dining, Rent, Shopping"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="15000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
