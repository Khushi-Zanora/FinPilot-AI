import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  Target,
  Shield,
  Laptop,
  Plane,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeAccountId, setContributeAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'emergency_fund',
    priority: 'medium'
  });

  useEffect(() => {
    loadGoalsAndAccounts();
  }, []);

  async function loadGoalsAndAccounts() {
    try {
      setLoading(true);
      setError('');

      const [gRes, aRes] = await Promise.all([
        apiRequest('/goals').catch(() => ({ success: false })),
        apiRequest('/accounts').catch(() => ({ success: false }))
      ]);

      if (gRes.success && gRes.data?.goals) {
        setGoals(gRes.data.goals);
      } else {
        setGoals([]);
      }

      if (aRes.success && aRes.data?.accounts) {
        setAccounts(aRes.data.accounts);
        if (aRes.data.accounts.length > 0) {
          setContributeAccountId(aRes.data.accounts[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount) return;

    setSubmitting(true);
    setError('');

    try {
      const targetAmountPaise = Math.round(parseFloat(goalForm.targetAmount) * 100);
      if (isNaN(targetAmountPaise) || targetAmountPaise <= 0) {
        throw new Error('Please enter a valid target amount.');
      }

      const res = await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: goalForm.name.trim(),
          targetAmountPaise,
          targetDate: goalForm.targetDate ? new Date(goalForm.targetDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: goalForm.category || 'emergency_fund',
          category: goalForm.category,
          priority: goalForm.priority
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setGoalForm({
          name: '',
          targetAmount: '',
          targetDate: '',
          category: 'emergency_fund',
          priority: 'medium'
        });
        await loadGoalsAndAccounts();
      }
    } catch (err) {
      setError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !contributeAmount) return;

    setSubmitting(true);
    setError('');

    try {
      const amountPaise = Math.round(parseFloat(contributeAmount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid contribution amount.');
      }

      const res = await apiRequest(`/goals/${selectedGoal._id}/contribute`, {
        method: 'POST',
        body: JSON.stringify({
          amountPaise,
          accountId: contributeAccountId || undefined
        })
      });

      if (res.success) {
        setShowContributeModal(false);
        setContributeAmount('');
        setSelectedGoal(null);
        await loadGoalsAndAccounts();
      }
    } catch (err) {
      setError(err.message || 'Failed to record contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id, name) => {
    if (!window.confirm(`Delete savings goal "${name}"?`)) return;
    try {
      await apiRequest(`/goals/${id}`, { method: 'DELETE' });
      await loadGoalsAndAccounts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const totalTargetPaise = goals.reduce((acc, g) => acc + (g.targetAmountPaise || 0), 0);
  const totalSavedPaise = goals.reduce((acc, g) => acc + (g.currentAmountPaise || 0), 0);
  const overallPercent = totalTargetPaise > 0 ? Math.round((totalSavedPaise / totalTargetPaise) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} onNewGoal={() => setShowAddModal(true)} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">CAPITAL EARMARKS</span>
              <span className="text-slate-600">//</span>
              <span>SAVINGS GOALS & SINKING FUNDS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Savings Goals & Sinking Funds
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Savings Goal</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL TARGET AMOUNT</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalTargetPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {goals.length} active savings targets
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">TOTAL AMOUNT SAVED</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">{formatCurrency(totalSavedPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {overallPercent}% aggregate progress
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">REMAINING TO SAVE</div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatCurrency(Math.max(0, totalTargetPaise - totalSavedPaise))}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Isolated from your disposable cash
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading savings goals...</p>
          </div>
        ) : goals.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Savings Goals Created Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Set target amounts for an emergency cushion, gadgets, or travel. FinPilot earmarks these funds from your tracked cash so you don&apos;t accidentally spend them.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First Goal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(goals) && goals.map((g) => {
              if (!g) return null;
              const targetPaise = g.targetAmountPaise || 0;
              const savedPaise = g.currentAmountPaise || 0;
              const percent = targetPaise > 0 ? Math.min(100, Math.round((savedPaise / targetPaise) * 100)) : 0;
              const isComplete = percent >= 100;
              const categoryStr = typeof g.category === 'string' ? g.category.replace(/_/g, ' ') : 'General Goal';
              const priorityStr = g.priority || 'medium';

              return (
                <div
                  key={g._id || Math.random()}
                  className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{g.name || 'Savings Goal'}</h4>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          {categoryStr} • {priorityStr}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${isComplete ? 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20' : 'bg-white/[0.05] text-slate-300 border-white/[0.08]'}`}>
                          {isComplete ? 'COMPLETED' : `${percent}%`}
                        </span>

                        <button
                          onClick={() => handleDeleteGoal(g._id, g.name)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Saved: <strong className="text-white">{formatCurrency(savedPaise)}</strong></span>
                        <span className="text-slate-400">Target: <strong className="text-white">{formatCurrency(targetPaise)}</strong></span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#05DF85] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="text-[10px] font-mono text-slate-500">
                      {g.targetDate ? `Target: ${new Date(g.targetDate).toLocaleDateString()}` : 'No target date'}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGoal(g);
                        setShowContributeModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#05DF85] border border-emerald-500/20 text-xs font-bold transition-all"
                    >
                      + Add Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#05DF85]" />
                <span>Create Savings Goal</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Fund, Laptop Sinking Fund"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="emergency_fund">Emergency Fund</option>
                    <option value="vacation">Vacation / Travel</option>
                    <option value="gadget">Tech & Gadgets</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="home">Home / Property</option>
                    <option value="other">Other Goal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                </div>
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
                  {submitting ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute to Goal Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white">Add Funds: {selectedGoal.name}</h3>
              <button onClick={() => setShowContributeModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Contribution Amount (₹ INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 5000.00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              {accounts.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deduct from Account</label>
                  <select
                    value={contributeAccountId}
                    onChange={(e) => setContributeAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Deposit Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
