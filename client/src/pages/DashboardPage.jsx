import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
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
  Plane,
  Laptop,
  CheckCircle2,
  Calendar,
  Building,
  Wifi,
  Tv,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  SlidersHorizontal,
  TrendingUp,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState('6M');
  const [activeView, setActiveView] = useState('monthly');
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);

  // Quick form state for modal
  const [txForm, setTxForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food & Dining',
    description: '',
    account: 'HDFC Regalia'
  });

  // Chart data for 6M dual stream & net surplus line
  const cashflowData = [
    { month: 'MAY', inflow: 160000, outflow: 87600, net: '₹72.4k net' },
    { month: 'JUN', inflow: 168000, outflow: 89900, net: '₹78.1k net' },
    { month: 'JUL', inflow: 165000, outflow: 89000, net: '₹76.0k net' },
    { month: 'AUG', inflow: 172000, outflow: 87700, net: '₹84.3k net' },
    { month: 'SEP', inflow: 175000, outflow: 88800, net: '₹86.2k net' },
    { month: 'OCT', inflow: 185000, outflow: 66680, net: '₹1,18,320' },
  ];

  // Category burn breakdown
  const categories = [
    { name: 'Housing & Rent', amount: 35000, percent: 46.8, color: '#05DF85' },
    { name: 'Food & Dining', amount: 14200, percent: 19.0, color: '#34D399' },
    { name: 'Transport & Fuel', amount: 7800, percent: 10.4, color: '#22D3EE' },
    { name: 'Utilities & Subscriptions', amount: 6480, percent: 8.7, color: '#818CF8' },
    { name: 'Entertainment & Leisure', amount: 5200, percent: 7.0, color: '#F472B6' },
    { name: 'Health & Wellness', amount: 6000, percent: 8.1, color: '#94A3B8' },
  ];

  // Financial goals
  const initialGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      targetDate: 'Dec 2024',
      percent: 82,
      current: 246000,
      target: 300000,
      icon: Shield,
      color: '#05DF85'
    },
    {
      id: 2,
      name: 'Japan Trip 2025',
      targetDate: 'Apr 2025',
      percent: 61,
      current: 110000,
      target: 180000,
      icon: Plane,
      color: '#22D3EE'
    },
    {
      id: 3,
      name: 'MacBook M3 Pro',
      targetDate: 'Nov 2024',
      percent: 71,
      current: 85000,
      target: 120000,
      icon: Laptop,
      color: '#818CF8'
    }
  ];

  // Committed obligations
  const obligations = [
    {
      name: 'HDFC Home Loan EMI',
      dueDate: 'Oct 05',
      badge: 'Scheduled',
      badgeStyle: 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20',
      amount: '₹20,450',
      icon: Building
    },
    {
      name: 'Tata AIA Term Insurance',
      dueDate: 'Oct 12',
      tier: 'Annual Tier',
      badge: 'Auto-debit',
      badgeStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      amount: '₹8,260',
      icon: Shield
    },
    {
      name: 'ACT Fibernet 1Gbps',
      dueDate: 'Oct 14',
      tier: 'Net Banking',
      badge: 'Action req',
      badgeStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      amount: '₹1,179',
      icon: Wifi
    },
    {
      name: 'Netflix 4K & Cloud',
      dueDate: 'Oct 18',
      tier: 'CC Card',
      badge: 'Subscribed',
      badgeStyle: 'bg-slate-800 text-slate-300 border-white/[0.08]',
      amount: '₹849',
      icon: Tv
    }
  ];

  // Verified transaction feed
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1',
      entity: 'Swiggy Gourmet Reserve',
      date: 'Oct 02, 2024 • 20:42',
      category: 'Food & Dining',
      account: 'HDFC Regalia (••4912)',
      amount: -1240.00
    },
    {
      id: 'tx-2',
      entity: 'Tech Corp Solutions India',
      date: 'Oct 01, 2024 • 09:15',
      category: 'Primary Income',
      account: 'ICICI Salary (••8188)',
      amount: 165000.00
    },
    {
      id: 'tx-3',
      entity: 'Shell Mobility Flagship',
      date: 'Sep 30, 2024 • 18:20',
      category: 'Transport & Fuel',
      account: 'HDFC Regalia (••4912)',
      amount: -2890.00
    },
    {
      id: 'tx-4',
      entity: 'Zerodha Broking AMC Payout',
      date: 'Sep 29, 2024 • 14:10',
      category: 'Dividend & Yield',
      account: 'ICICI Direct Linked',
      amount: 4120.00
    },
    {
      id: 'tx-5',
      entity: 'Amazon Pay India Retail',
      date: 'Sep 28, 2024 • 11:05',
      category: 'Gadgets & Office',
      account: 'ICICI Bank (••8188)',
      amount: -3499.00
    }
  ]);

  const handleCreateTx = (e) => {
    e.preventDefault();
    if (!txForm.amount) return;
    const newTx = {
      id: `tx-${Date.now()}`,
      entity: txForm.description || 'Manual Entry',
      date: 'Just now',
      category: txForm.category,
      account: txForm.account,
      amount: txForm.type === 'income' ? parseFloat(txForm.amount) : -parseFloat(txForm.amount)
    };
    setTransactions([newTx, ...transactions]);
    setShowAddTxModal(false);
    setTxForm({ type: 'expense', amount: '', category: 'Food & Dining', description: '', account: 'HDFC Regalia' });
  };

  const handleExportLedger = () => {
    const jsonStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Ledger_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      {/* Shared Header Top Bar */}
      <WorkspaceHeader
        onNewGoal={() => setShowGoalModal(true)}
        onRecordTransaction={() => setShowAddTxModal(true)}
      />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Cockpit Subheader & Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">LIVE FINANCIAL TELEMETRY</span>
              <span className="text-slate-600">•</span>
              <span>PAISE-PRECISION ACTIVE LEDGER</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-baseline gap-3">
              <span>Financial Cockpit</span>
              <span className="text-xs font-mono font-medium text-slate-400">Q4 FY2024-25</span>
            </h1>
          </div>

          {/* View Toggles & Export */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center p-1 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-medium">
              <button
                onClick={() => setActiveView('monthly')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === 'monthly'
                    ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly View
              </button>
              <button
                onClick={() => setActiveView('rolling90')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === 'rolling90'
                    ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rolling 90D
              </button>
              <button
                onClick={() => setActiveView('taxmap')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === 'taxmap'
                    ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly Tax Map
              </button>
            </div>

            <button
              onClick={handleExportLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* 1. TOTAL TRACKED CASH */}
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.12] transition-all relative group">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              <span className="font-semibold">TOTAL TRACKED CASH</span>
              <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors cursor-help" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight flex items-baseline">
              <span>₹4,82,450</span>
              <span className="text-base text-slate-400 font-normal">.00</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +32.6%
              </span>
              <span className="text-slate-500">VS PREV MONTH</span>
            </div>
          </div>

          {/* 2. NET SAFE TO SPEND */}
          <div className="p-5 rounded-xl bg-[#080D16] border border-[#05DF85]/30 relative group shadow-[0_0_30px_rgba(5,223,133,0.06)]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#05DF85] mb-2">
              <span className="font-bold">NET SAFE TO SPEND</span>
              <Lock className="w-3.5 h-3.5 text-[#05DF85]" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#05DF85] tracking-tight flex items-baseline">
              <span>₹1,18,320</span>
              <span className="text-base text-emerald-300/60 font-normal">.00</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>₹3,816.77 / DAY LEFT</span>
              <span className="text-slate-500">POST GOAL EARMARKS</span>
            </div>
          </div>

          {/* 3. MONTHLY INFLOW */}
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.12] transition-all relative group">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              <span className="font-semibold">MONTHLY INFLOW</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold border border-emerald-500/20">
                100% CLEARED
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight flex items-baseline">
              <span>₹1,85,000</span>
              <span className="text-base text-slate-400 font-normal">.00</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>SALARY ₹1,65,000</span>
              <span className="text-slate-500">+ ₹20K CONSULTING</span>
            </div>
          </div>

          {/* 4. TOTAL BURN */}
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.12] transition-all relative group">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              <span className="font-semibold">TOTAL BURN</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                40.3% CEILING
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight flex items-baseline">
              <span>₹74,680</span>
              <span className="text-base text-slate-400 font-normal">.00</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-[#05DF85]">₹10,320 UNDER PLAN</span>
              <span className="text-slate-500">CAP ₹85,000</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Cash Flow Chart + Category Burn Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cash Flow & Net Accumulation (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Cash Flow & Net Accumulation</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                    6M HISTORIC
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dual-stream comparison: Inflow capacity against operating expenses
                </p>
              </div>

              {/* Time toggles */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs font-mono">
                {['1M', '3M', '6M', 'YTD'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveRange(range)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      activeRange === range
                        ? 'bg-[#05DF85] text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs font-mono text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#05DF85]"></span>
                <span>Total Inflow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FDA4AF]"></span>
                <span>Total Outflow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#22D3EE]"></span>
                <span>Net Surplus Trend</span>
              </div>
            </div>

            {/* Visual Bar & Line Graphic */}
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2 border-b border-white/[0.06] relative">
              {cashflowData.map((item, idx) => {
                const maxVal = 200000;
                const inflowHeight = (item.inflow / maxVal) * 100;
                const outflowHeight = (item.outflow / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                      {/* Inflow Bar */}
                      <div
                        className="w-3 sm:w-4 rounded-t-sm bg-[#05DF85]/80 group-hover:bg-[#05DF85] transition-all relative"
                        style={{ height: `${inflowHeight}%` }}
                      ></div>
                      {/* Outflow Bar */}
                      <div
                        className="w-3 sm:w-4 rounded-t-sm bg-[#FDA4AF]/80 group-hover:bg-[#FDA4AF] transition-all"
                        style={{ height: `${outflowHeight}%` }}
                      ></div>
                    </div>

                    {/* Month and net label */}
                    <div className="pt-3 text-center">
                      <div className="text-[11px] font-mono text-slate-300 font-semibold">{item.month}</div>
                      <div className="text-[9px] font-mono text-[#05DF85]">{item.net}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Burn Donut (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Category Burn</h3>
                <p className="text-xs text-slate-400">October Allocation breakdown</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">₹74,680 Tot</span>
            </div>

            {/* Donut Graphic */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #05DF85 0% 46.8%,
                      #34D399 46.8% 65.8%,
                      #22D3EE 65.8% 76.2%,
                      #818CF8 76.2% 84.9%,
                      #F472B6 84.9% 91.9%,
                      #94A3B8 91.9% 100%
                    )`
                  }}
                ></div>
                <div className="absolute inset-3.5 rounded-full bg-[#080D16] flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">PRIMARY</span>
                  <span className="text-base font-mono font-bold text-[#05DF85] leading-tight">46.8%</span>
                  <span className="text-[10px] text-slate-400">Housing</span>
                </div>
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06] font-mono text-xs">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="truncate max-w-[130px] font-sans text-xs">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">₹{cat.amount.toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 w-10 text-right">{cat.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: AI Pilot Intelligence & Active Targets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Pilot Intelligence (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-[#05DF85]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-white">AI Financial Insights</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                  Cashflow Check
                </span>
              </div>

              {/* Insight 1 */}
              <div className="p-3.5 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-emerald-500/20 text-[#05DF85] flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowDownLeft className="w-3 h-3" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identified <strong className="text-[#05DF85] font-mono">₹3,400</strong> recurring monthly savings across overlapping cloud and entertainment subscriptions.
                </p>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3 h-3" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your <strong className="text-white">Emergency Reserve</strong> is <span className="text-[#05DF85] font-mono font-bold">82% funded</span>. Maintaining current monthly savings achieves the ₹3,00,000 threshold by Dec 15.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setAiOptimized(true)}
                className="flex-1 py-2 px-4 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(5,223,133,0.25)]"
              >
                <span>{aiOptimized ? 'Optimizations Applied ✓' : 'Apply Optimizations →'}</span>
              </button>
              <button
                onClick={() => navigate('/workspace/ai')}
                className="py-2 px-3.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all"
              >
                Ask AI
              </button>
            </div>
          </div>

          {/* Active Financial Targets (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Financial Targets</h3>
                <p className="text-xs text-slate-400">Automated savings goal allocations</p>
              </div>
              <Link
                to="/workspace/goals"
                className="text-xs font-mono text-[#05DF85] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Manage Goals</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Goal Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {initialGoals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: goal.color }}>
                          {goal.percent}%
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white truncate">{goal.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">Target: {goal.targetDate}</div>
                    </div>

                    <div className="pt-4 space-y-1.5">
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${goal.percent}%`,
                            backgroundColor: goal.color
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-white font-semibold">₹{goal.current.toLocaleString('en-IN')}</span>
                        <span className="text-slate-500">₹{goal.target.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Committed Obligations & Verified Transaction Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Committed Obligations (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-white">Committed Obligations</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  ₹30,678 Pending
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Upcoming bills due within 30 days</p>

              {/* Obligation Items */}
              <div className="space-y-2.5">
                {obligations.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Due {item.dueDate} {item.tier && `• ${item.tier}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-white">{item.amount}</div>
                        <span className={`inline-block text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${item.badgeStyle}`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => navigate('/workspace/loans')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>View Loans & Mandates</span>
            </button>
          </div>

          {/* Verified Transaction Feed (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between">
            <div>
              {/* Header & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                  <p className="text-xs text-slate-400">Live ledger of incoming credits and outgoing expenses</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTxModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(5,223,133,0.25)]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Record</span>
                  </button>

                  <button
                    onClick={() => setShowAddTxModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transfer</span>
                  </button>

                  <button
                    onClick={() => navigate('/workspace/transactions')}
                    className="p-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 pb-2 border-b border-white/[0.06]">
                <span className="col-span-4">DATE & ENTITY</span>
                <span className="col-span-3">CLASSIFICATION</span>
                <span className="col-span-3">ACCOUNT</span>
                <span className="col-span-2 text-right">AMOUNT (INR)</span>
              </div>

              {/* Transaction Rows */}
              <div className="divide-y divide-white/[0.04]">
                {transactions.map((tx) => {
                  const isIncome = tx.amount > 0;
                  return (
                    <div key={tx.id} className="grid grid-cols-12 gap-2 py-3 items-center hover:bg-white/[0.02] transition-colors">
                      {/* Entity & Date */}
                      <div className="col-span-4 min-w-0 pr-2">
                        <div className="text-xs font-semibold text-white truncate">{tx.entity}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">{tx.date}</div>
                      </div>

                      {/* Classification */}
                      <div className="col-span-3">
                        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                          {tx.category}
                        </span>
                      </div>

                      {/* Funding Account */}
                      <div className="col-span-3 flex items-center gap-1.5 text-xs text-slate-400 truncate">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate font-mono text-[11px]">{tx.account}</span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right font-mono font-bold text-xs">
                        <span className={isIncome ? 'text-[#05DF85]' : 'text-slate-200'}>
                          {isIncome ? `+₹${tx.amount.toLocaleString('en-IN')}.00` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}.00`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Footer Indicator */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
                <span>Exact Paise-Precision Arithmetic</span>
              </div>
              <Link
                to="/workspace/transactions"
                className="text-[#05DF85] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full Transaction Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#05DF85]" />
                <span>Record New Transaction</span>
              </h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">TYPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'expense' })}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      txForm.type === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-[#0D1422] text-slate-400 border border-white/[0.08]'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'income' })}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      txForm.type === 'income'
                        ? 'bg-emerald-500/20 text-[#05DF85] border border-emerald-500/40'
                        : 'bg-[#0D1422] text-slate-400 border border-white/[0.08]'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">AMOUNT (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1500"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">CATEGORY</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing & Rent">Housing & Rent</option>
                  <option value="Transport & Fuel">Transport & Fuel</option>
                  <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                  <option value="Entertainment & Leisure">Entertainment & Leisure</option>
                  <option value="Primary Income">Primary Income</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#05DF85]" />
                <span>Create Financial Target</span>
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Configure a dedicated savings target with monthly earmarks protected from daily spending.
            </p>
            <button
              onClick={() => {
                setShowGoalModal(false);
                navigate('/workspace/goals');
              }}
              className="w-full py-2.5 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs shadow-lg"
            >
              Open Goal Planner →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
