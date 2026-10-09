import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
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
  ChevronRight,
  X
} from 'lucide-react';

export default function BudgetsPage() {
  const [activeCycle, setActiveCycle] = useState('monthly');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [rebalanced, setRebalanced] = useState(false);

  const [categories, setCategories] = useState([
    {
      id: 'cat-1',
      name: 'Food & Dining',
      icon: '🍔',
      desc: 'Includes gourmet groceries, delivery apps, cafes, and restaurant bills.',
      cap: 11000,
      spent: 14200,
      percent: 129.1,
      status: 'OVER BUDGET',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      recommendation: 'Shift ₹3,200 surplus from Shopping & Tech buffer to balance ledger.'
    },
    {
      id: 'cat-2',
      name: 'Transport & Mobility',
      icon: '🚗',
      desc: 'Fuel, Fastag tolls, Uber/Ola rides, and vehicle routine maintenance.',
      cap: 8500,
      spent: 7800,
      percent: 91.8,
      status: 'NEAR LIMIT',
      statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'cat-3',
      name: 'Housing & Fixed Rent',
      icon: '🏠',
      desc: 'Apartment lease, society maintenance fee, property tax allocation.',
      cap: 35000,
      spent: 35000,
      percent: 100.0,
      status: 'SETTLED',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'cat-4',
      name: 'Shopping, Gadgets & Lifestyle',
      icon: '🛍️',
      desc: 'Apparel, electronics, personal accessories, discretionary retail.',
      cap: 12000,
      spent: 5200,
      percent: 43.3,
      status: 'HEALTHY SURPLUS',
      statusColor: 'text-[#05DF85] bg-emerald-500/10 border-emerald-500/20',
      cushion: 6800
    },
    {
      id: 'cat-5',
      name: 'Utilities & Subscriptions',
      icon: '⚡',
      cap: 8000,
      spent: 6480,
      percent: 61.0,
      status: 'WITHIN CAP'
    },
    {
      id: 'cat-6',
      name: 'Healthcare & Insurance',
      icon: '🩺',
      cap: 7500,
      spent: 6000,
      percent: 80.0,
      status: 'WITHIN CAP'
    }
  ]);

  const [newCat, setNewCat] = useState({ name: '', cap: '' });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.cap) return;
    const catObj = {
      id: `cat-${Date.now()}`,
      name: newCat.name,
      icon: '📦',
      cap: parseFloat(newCat.cap),
      spent: 0,
      percent: 0,
      status: 'WITHIN CAP'
    };
    setCategories([...categories, catObj]);
    setShowCategoryModal(false);
    setNewCat({ name: '', cap: '' });
  };

  const handleApplyRebalance = () => {
    setRebalanced(true);
    // Shift ₹3,200 from Shopping buffer to Food & Dining
    setCategories(
      categories.map((c) => {
        if (c.id === 'cat-1') {
          return { ...c, cap: c.cap + 3200, status: 'REBALANCED', percent: 100.0 };
        }
        if (c.id === 'cat-4') {
          return { ...c, cap: c.cap - 3200 };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Title Bar & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">INTELLIGENCE</span>
              <span className="text-slate-600">//</span>
              <span>SPENDING RUNWAY & ALLOCATION ENGINE • 50/30/20 COMPLIANCE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Budgets & Spending Analytics
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center p-1 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono">
              <span className="px-2.5 py-1 text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#05DF85]" /> October 2024
              </span>
              <button
                onClick={() => setActiveCycle('monthly')}
                className={`px-2.5 py-1 rounded transition-all ${activeCycle === 'monthly' ? 'bg-[#0D1422] text-[#05DF85] font-bold' : 'text-slate-400'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveCycle('quarterly')}
                className={`px-2.5 py-1 rounded transition-all ${activeCycle === 'quarterly' ? 'bg-[#0D1422] text-[#05DF85] font-bold' : 'text-slate-400'}`}
              >
                Quarterly
              </button>
            </div>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Category</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>MONTHLY CAP POOL</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">87.9% USED</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹85,000<span className="text-base text-slate-400 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>₹74,680.00 spent</span>
              <span className="text-[#05DF85]">₹10,320 left</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>DAILY VELOCITY</span>
              <span className="text-rose-400 text-[10px] font-bold">+18.4% PACE</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹1,474<span className="text-base text-slate-400 font-normal"> / day</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Active Burn: ₹2,409/day</span>
              <span className="text-slate-500">7 days remaining</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-rose-400 mb-1">
              <span>OVERRUN ANOMALY</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">CRITICAL</span>
            </div>
            <div className="text-2xl font-mono font-bold text-rose-400">+₹3,200<span className="text-base text-rose-300/70 font-normal"> over limit</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Food & Gourmet Dining breached 100% cap
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#05DF85] mb-1">
              <span>SAFETY BUFFER</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">SHIELDED</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">₹33,640<span className="text-base text-emerald-300/60 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Untouched discretionary pool (SIPs insulated)
            </div>
          </div>
        </div>

        {/* Middle Section: Spending Horizon + 50/30/20 Allocation Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spending Horizon Chart (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Category Spending Horizon & Forecast</h3>
                  <p className="text-xs text-slate-400">Monthly historical tracking against predictive end-of-month trajectory</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">[MZ 2024]</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-6">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#05DF85]"></span><span>Needs (Fixed)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#22D3EE]"></span><span>Lifestyle (Wants)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#818CF8]"></span><span>Sinking Funds</span></div>
              </div>
            </div>

            {/* Visual Bars */}
            <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-white/[0.06] px-2 font-mono">
              {[
                { month: 'MAY', needs: 45, wants: 25, sink: 15 },
                { month: 'JUN', needs: 48, wants: 28, sink: 15 },
                { month: 'JUL', needs: 46, wants: 26, sink: 15 },
                { month: 'AUG', needs: 49, wants: 29, sink: 18 },
                { month: 'SEP', needs: 50, wants: 30, sink: 18 },
                { month: 'OCT (Proj)', needs: 52, wants: 34, sink: 14 }
              ].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-6 rounded-t overflow-hidden flex flex-col-reverse h-full justify-start">
                    <div className="bg-[#05DF85] w-full" style={{ height: `${b.needs}%` }}></div>
                    <div className="bg-[#22D3EE] w-full" style={{ height: `${b.wants}%` }}></div>
                    <div className="bg-[#818CF8] w-full" style={{ height: `${b.sink}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 font-semibold">{b.month}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Historical 6-Month Rolling Mean: <strong className="text-white">₹73,713/mo</strong></span>
              <span>Predictive Confidence: <strong className="text-[#05DF85]">96.2%</strong></span>
            </div>
          </div>

          {/* 50/30/20 Allocation Donut (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Allocation Breakdown</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  34% Wants (Alert)
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">50/30/20 Framework Compliance Check</p>

              {/* Ratios */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-4">
                <div className="p-2 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400">Needs (50%)</div>
                  <div className="text-sm font-bold text-white mt-0.5">52%</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0D1422] border border-rose-500/30">
                  <div className="text-[10px] text-rose-400">Wants (30%)</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">34% ↑</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400">Savings (20%)</div>
                  <div className="text-sm font-bold text-[#05DF85] mt-0.5">14% ↓</div>
                </div>
              </div>

              {/* Mini category list */}
              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between"><span>• Housing & Rent:</span><span className="text-white font-semibold">₹35,000</span></div>
                <div className="flex justify-between"><span>• Food & Dining:</span><span className="text-rose-400 font-semibold">₹14,200</span></div>
                <div className="flex justify-between"><span>• Transport & Fuel:</span><span className="text-white font-semibold">₹7,800</span></div>
                <div className="flex justify-between"><span>• Utilities & Subscriptions:</span><span className="text-white font-semibold">₹6,480</span></div>
                <div className="flex justify-between"><span>• Shopping & Tech:</span><span className="text-[#05DF85] font-semibold">₹5,200</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.04] text-[10px] font-mono text-slate-500">
              Rule status: Target 20% savings achievable post discretionary rebalance.
            </div>
          </div>
        </div>

        {/* Category Ledgers & Budget Limits List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>CATEGORY LEDGERS</span>
            <span>SORT: % SPENT (HIGHEST FIRST)</span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${cat.statusColor || 'bg-white/[0.05] text-slate-400'}`}>
                          {cat.percent}% {cat.status}
                        </span>
                      </div>
                      {cat.desc && <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs">
                    <div className="text-slate-400">Budget Cap: <strong className="text-white">₹{cat.cap.toLocaleString('en-IN')}</strong></div>
                    <div className="text-sm font-bold text-white">Spent: ₹{cat.spent.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.percent > 100 ? 'bg-rose-500' : cat.percent > 85 ? 'bg-cyan-400' : 'bg-[#05DF85]'}`}
                    style={{ width: `${Math.min(cat.percent, 100)}%` }}
                  />
                </div>

                {/* AI Recommendation Banner for Overrun Categories */}
                {cat.recommendation && (
                  <div className="p-3 rounded-lg bg-[#0D1422] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-rose-300">
                      <Sparkles className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>{cat.recommendation}</span>
                    </div>

                    <button
                      onClick={handleApplyRebalance}
                      className="px-3 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shrink-0 shadow-sm"
                    >
                      {rebalanced ? 'Rebalanced ✓' : 'Apply 1-Click Rebalance'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot Velocity Diagnosis */}
        <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#05DF85]" />
              <span>FinPilot AI Spending Velocity Diagnosis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Weekend surge detected (+42% dining spikes on Friday–Sunday). Setting an automated discretionary soft cap prevents month-end deficit.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Simulated Next Month Budget: Baseline ₹85,000 with adjusted dining envelope.')}
              className="px-4 py-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.08] text-xs font-semibold"
            >
              Simulate Nov 2024 Budget
            </button>
            <button
              onClick={handleApplyRebalance}
              className="px-4 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              Apply AI Rebalance
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#05DF85]" />
                <span>Create Budget Category</span>
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">CATEGORY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fitness & Gym"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">MONTHLY SPENDING CAP (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={newCat.cap}
                  onChange={(e) => setNewCat({ ...newCat, cap: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
