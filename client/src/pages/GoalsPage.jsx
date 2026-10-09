import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Target, Plus, ShieldCheck, TrendingUp, Calendar, Trash2, X, AlertCircle } from 'lucide-react';

export default function GoalsPage() {
  const { isPremium } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Goal Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('custom');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Contribution Modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [entryType, setEntryType] = useState('contribution');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const res = await apiRequest('/goals');
      if (res.success) {
        setGoals(res.data.goals || []);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal(e) {
    e.preventDefault();
    setCreateError('');
    setSubmitting(true);

    try {
      const targetAmountPaise = Math.round(parseFloat(targetAmount) * 100);
      const currentAmountPaise = Math.round(parseFloat(initialAmount || '0') * 100);

      await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name,
          purpose,
          targetAmountPaise,
          currentAmountPaise,
          targetDate: new Date(targetDate).toISOString(),
          priority
        })
      });

      setIsCreateModalOpen(false);
      setName('');
      setTargetAmount('');
      setInitialAmount('0');
      fetchGoals();
    } catch (err) {
      setCreateError(err.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddEntry(e) {
    e.preventDefault();
    if (!selectedGoal) return;
    setSubmitting(true);

    try {
      const amountPaise = Math.round(parseFloat(entryAmount) * 100);
      await apiRequest(`/goals/${selectedGoal._id}/entries`, {
        method: 'POST',
        body: JSON.stringify({
          type: entryType,
          amountPaise,
          note: entryNote
        })
      });

      setIsEntryModalOpen(false);
      setSelectedGoal(null);
      setEntryAmount('');
      setEntryNote('');
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to record entry');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await apiRequest(`/goals/${id}`, { method: 'DELETE' });
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to delete goal');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Savings Goals & Earmarks</h1>
          <p className="text-sm text-slate-400">
            Define savings milestones with deterministic monthly contribution forecasting
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Savings Goals</h3>
          <p className="text-sm max-w-sm mx-auto mb-6">
            Create an Emergency Fund, Travel, or Major Purchase goal to safeguard your future cash flow.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const prog = goal.progress || {};
            const percent = prog.progressPercentage || 0;

            return (
              <div
                key={goal._id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {goal.purpose.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{goal.name}</h3>

                  <div className="flex items-baseline justify-between mt-4 mb-2">
                    <span className="text-2xl font-black text-white">
                      {formatCurrency(goal.currentAmountPaise)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: {formatCurrency(goal.targetAmountPaise)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{percent}% Completed</span>
                    <span>Shortfall: {formatCurrency(prog.shortfallPaise)}</span>
                  </div>

                  {/* Monthly Savings Forecast */}
                  {!prog.isCompleted && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Required Monthly Savings:</span>
                        <strong className="text-emerald-400 font-bold">
                          {formatCurrency(prog.requiredMonthlySavingsPaise)} / mo
                        </strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Timeline: {prog.remainingMonths} months remaining ({new Date(goal.targetDate).toLocaleDateString()})
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsEntryModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Contribute / Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Savings Goal</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose Category</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="emergency_fund">Emergency Fund</option>
                  <option value="trip">Travel / Vacation</option>
                  <option value="gadget">Gadget / Tech</option>
                  <option value="education">Education / Course</option>
                  <option value="home">Home / Real Estate</option>
                  <option value="vehicle">Vehicle Purchase</option>
                  <option value="custom">Custom Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Saved Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Milestone Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution / Withdrawal Modal */}
      {isEntryModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Update {selectedGoal.name}
              </h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEntryType('contribution')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    entryType === 'contribution'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deposit / Contribute
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('withdrawal')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    entryType === 'withdrawal'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly salary savings allocation"
                  value={entryNote}
                  onChange={(e) => setEntryNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
