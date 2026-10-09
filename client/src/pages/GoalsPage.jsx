import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
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
  X
} from 'lucide-react';

export default function GoalsPage() {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [rebalanceApplied, setRebalanceApplied] = useState(false);

  const [goals, setGoals] = useState([
    {
      id: 'g-1',
      tier: 'TIER 0 // NON-NEGOTIABLE',
      badge: 'AUTONOMOUS',
      name: 'Emergency Runway Fortress',
      desc: 'Air-gapped 6.2 months of fixed baseline burn (mortgage, groceries, health retainer, utilities).',
      target: 600000,
      current: 600000,
      percent: 100.0,
      vaultStatus: 'Vault Sealed: HDFC High-Yield Multi-Option Sweep (7.25% FD)',
      nextReview: '01 Jan 2025',
      yieldRate: 'Yield: +₹3,625/mo compounding',
      color: '#05DF85'
    },
    {
      id: 'g-2',
      tier: 'TIER 2 // TECH SINKING',
      badge: '2 MO AHEAD',
      name: 'MacBook Pro M3 Max & Studio Rig',
      desc: 'Equipment sinking fund for workstation refresh + Pro Display studio setup.',
      target: 250000,
      current: 185000,
      percent: 74.0,
      targetDate: '20 Dec 2024',
      autoSip: '₹25,000/mo (05th)',
      linkedHold: 'Linked: ₹75,000 Apple BKC Pre-authorization Hold',
      color: '#22D3EE'
    },
    {
      id: 'g-3',
      tier: 'TIER 3 // LIFESTYLE',
      badge: 'PACING OPTIMAL',
      name: 'Japan Cherry Blossom Expedition 2025',
      desc: 'Tokyo, Kyoto, and Hokkaido rail itinerary. Flight bookings lock on 15 Jan 2025.',
      target: 400000,
      current: 220000,
      percent: 55.0,
      targetDate: '31 Mar 2025',
      autoSip: '₹35,000/mo (Tata Liquid Fund Direct)',
      balanceInfo: '₹1,80,000 balance over 5 remaining pay cycles',
      color: '#818CF8'
    },
    {
      id: 'g-4',
      tier: 'TIER 1 // OBLIGATORY COMMITMENTS',
      badge: 'NEAR LOCK',
      name: 'Annual Insurance & Tax Advance Sinking Pool',
      desc: 'Pre-funded escrow amortizing non-monthly liabilities without touching operating cash flow.',
      target: 350000,
      current: 290000,
      percent: 82.8,
      milestone: 'Nov 28: Tata AIA Term Life (₹28,500) • Dec 15: Q3 Advance Tax (₹1,15,000)',
      color: '#F472B6'
    },
    {
      id: 'g-5',
      tier: 'TIER 2 // OPPORTUNISTIC',
      badge: 'GROWTH',
      name: 'Angel Syndicate Reserve',
      desc: 'Tranche pool for early-stage B2B SaaS syndicates. ₹15k/mo + 100% of bonus allocations.',
      target: 1000000,
      current: 450000,
      percent: 45.0,
      targetDate: 'H1 2025 Deployment',
      color: '#34D399'
    },
    {
      id: 'g-6',
      tier: 'TIER 2 // CAPITAL OUTLAY',
      badge: 'CAPITAL',
      name: 'Electric Vehicle Down Payment',
      desc: 'Down payment buffer for zero-depreciation luxury EV transition. Target date August.',
      target: 500000,
      current: 100000,
      percent: 20.0,
      targetDate: 'Aug 2025',
      color: '#FBBF24'
    }
  ]);

  const [newGoal, setNewGoal] = useState({ name: '', target: '', targetDate: '', autoSip: '' });

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    const tgt = parseFloat(newGoal.target);
    const goalObj = {
      id: `g-${Date.now()}`,
      tier: 'TIER 2 // CUSTOM TARGET',
      badge: 'ACTIVE',
      name: newGoal.name,
      desc: `Dedicated savings target scheduled for ${newGoal.targetDate || '2025'}.`,
      target: tgt,
      current: 0,
      percent: 0,
      targetDate: newGoal.targetDate || 'Dec 2025',
      autoSip: newGoal.autoSip ? `₹${newGoal.autoSip}/mo` : 'Manual Allocation',
      color: '#05DF85'
    };
    setGoals([...goals, goalObj]);
    setShowAddModal(false);
    setNewGoal({ name: '', target: '', targetDate: '', autoSip: '' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">WEALTH & LIQUIDITY</span>
              <span className="text-slate-600">//</span>
              <span>VIRTUAL EARMARKING & SINKING FUNDS ENGINE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Savings Goals & Earmarks
            </h1>
            <p className="text-xs text-slate-400">
              Ring-fenced liquidity pools, multi-tier sinking funds, and deterministic autopilot allocations insulated from daily spending burn.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono text-slate-300">
              <span>FY 2024-25</span>
              <span className="text-[#05DF85] font-bold">Active ({goals.length})</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Savings Goal</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL RING-FENCED EARMARKS</div>
            <div className="text-2xl font-mono font-bold text-white">₹18,45,000<span className="text-sm text-slate-500 font-normal"> / ₹28.5L</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-[#05DF85]">+₹65,000 automated Nov</span>
              <span className="text-slate-500">Target: ₹20,50,000</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#05DF85] mb-1">
              <span>EMERGENCY RUNWAY FORTRESS</span>
              <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
            </div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">₹6,00,000<span className="text-xs font-bold text-emerald-300/80 ml-2">100% FUNDED</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Fortified 6.2 Months Fixed Burn in High-Yield Sweep
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">AUTOPILOT INFLOW VELOCITY</div>
            <div className="text-2xl font-mono font-bold text-white">₹65,000<span className="text-base text-slate-400 font-normal"> / month</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>6 Scheduled Auto-Debits</span>
              <span className="text-cyan-400">Next: 05 Nov 2024</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-purple-400 mb-1">WEIGHTED LIQUID YIELD</div>
            <div className="text-2xl font-mono font-bold text-white">7.15%<span className="text-base text-slate-400 font-normal"> Blended APY</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              +₹10,995/mo compounding across Liquid & Arbitrage Funds
            </div>
          </div>
        </div>

        {/* Main Section: Goal Cards (8 cols) + Right Autopilot & Radar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Goal Cards Stream (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>{g.tier}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-300 font-bold border border-white/[0.06]">
                        {g.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{g.name}</h3>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xl font-bold text-white">
                      ₹{g.current.toLocaleString('en-IN')}
                      <span className="text-xs text-slate-400 font-normal"> / ₹{g.target.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[11px] font-bold" style={{ color: g.color }}>
                      {g.percent}% Funded
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{g.desc}</p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(g.percent, 100)}%`,
                      backgroundColor: g.color
                    }}
                  />
                </div>

                {/* Footer Metadata */}
                <div className="pt-2 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
                  <div>
                    {g.vaultStatus && <span className="text-[#05DF85]">{g.vaultStatus}</span>}
                    {g.autoSip && <span>Auto-SIP: <strong className="text-white">{g.autoSip}</strong></span>}
                    {g.milestone && <span className="text-slate-300">{g.milestone}</span>}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {g.targetDate ? `Target: ${g.targetDate}` : g.yieldRate}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Panels: Autopilot Intelligence, Vault Breakdown & Collision Radar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Autopilot Intelligence Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#05DF85]" />
                  <h3 className="text-xs font-bold text-white">Autopilot Intelligence</h3>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-[#05DF85]">
                  ACTIVE RULE
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-white mb-1">Velocity Optimization Found</div>
                With your current <strong className="text-[#05DF85] font-mono">₹1,18,320 safe cash surplus</strong>, reallocating ₹10,000/mo from discretionary dining completes <strong>Japan Cherry Blossom 45 days earlier</strong>.
              </div>

              <button
                onClick={() => setRebalanceApplied(true)}
                className="w-full py-2.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.25)]"
              >
                {rebalanceApplied ? 'Rebalance Active ✓' : 'Apply Recommended Rebalance (1-Click)'}
              </button>
            </div>

            {/* Vault Breakdown Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Vault Breakdown</h3>
                <span className="text-xs font-mono font-bold text-white">₹18.45L</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                <div className="bg-[#05DF85] h-full w-[42%]" title="Liquid 42%"></div>
                <div className="bg-cyan-400 h-full w-[32%]" title="Sweeps 32%"></div>
                <div className="bg-purple-400 h-full w-[18%]" title="Arbitrage 18%"></div>
                <div className="bg-slate-400 h-full w-[8%]" title="Savings 8%"></div>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#05DF85]"></span>Liquid & Overnight Funds</span>
                  <span className="text-white font-semibold">₹7,74,900 (6.8% APY)</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>High-Yield Bank Sweeps</span>
                  <span className="text-white font-semibold">₹5,90,400 (7.25% APY)</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span>Arbitrage Funds</span>
                  <span className="text-white font-semibold">₹3,32,100 (7.15% APY)</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Dedicated Savings Buffer</span>
                  <span className="text-white font-semibold">₹1,47,600 (4.0% APY)</span>
                </div>
              </div>
            </div>

            {/* Collision Radar (90D) */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                  <Zap className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Collision Radar</span>
                </div>
                <span className="text-[10px] font-mono text-[#05DF85] font-bold">CLEAR 90D</span>
              </div>

              <p className="text-[11px] text-slate-400">
                Milestone timeline mapped against scheduled inflows & credit card billing cycles.
              </p>

              <div className="space-y-2.5 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04]">
                  <div className="flex justify-between text-[#05DF85] font-bold">
                    <span>01 NOV • SALARY INFLOW</span>
                    <span>+₹2,40,000</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Primary payroll clears into HDFC account.</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04]">
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span>05 NOV • AUTOPILOT SINKS</span>
                    <span>-₹65,000</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Automated debit splits cleanly across active goals.</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04]">
                  <div className="flex justify-between text-white font-bold">
                    <span>20 DEC • MACBOOK GOAL</span>
                    <span>₹2,50,000 Ready</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Goal fully funded ahead of winter hardware cycle.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#05DF85]" />
                <span>Create New Savings Target</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">GOAL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Vehicle Down Payment"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">TARGET AMOUNT (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500000"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">TARGET COMPLETION DATE</label>
                <input
                  type="text"
                  placeholder="e.g. Aug 2025"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">MONTHLY AUTO-ALLOCATION (OPTIONAL)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={newGoal.autoSip}
                  onChange={(e) => setNewGoal({ ...newGoal, autoSip: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
