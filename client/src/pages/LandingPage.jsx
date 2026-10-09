import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Layers,
  Landmark,
  PiggyBank,
  PieChart,
  Bot,
  Play,
  Check,
  FileSpreadsheet,
  Zap,
  ShieldAlert
} from 'lucide-react';

export default function LandingPage() {
  // Interactive States
  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' | 'yearly'
  const [chartPeriod, setChartPeriod] = useState('6M');
  const [openFaq, setOpenFaq] = useState(0); // first item open by default

  const faqs = [
    {
      q: 'Does FinPilot require access to my online banking credentials?',
      a: 'No. FinPilot is engineered with a privacy-first, zero-trust architecture. You track balances via a double-entry ledger and manual account entries. We do not store net banking passwords or use automated third-party scrapers, keeping your credentials safe.'
    },
    {
      q: 'How does the AI Analyst make affordability decisions?',
      a: 'The AI Analyst does not invent or hallucinate numbers. It passes your query into a deterministic mathematical engine calculated in integer paise minor units. It reserves your 3x emergency fund and active 30-day bill commitments, calculating exact monthly surplus availability.'
    },
    {
      q: 'Can I track Indian asset categories like SGB, PPF, Deposits, and Mutual Funds?',
      a: 'Yes. FinPilot natively supports Indian asset classes including Sovereign Gold Bonds (SGB), Public Provident Fund (PPF), Fixed/Recurring Deposits, Mutual Funds, and Index ETFs based on your recorded purchase prices and units.'
    },
    {
      q: 'What happens if I downgrade from Pro to the Free plan?',
      a: 'All your recorded historical data, accounts, and transactions remain completely preserved and accessible. Advanced modules like loan amortization schedules and unlimited AI queries will transition into free tier thresholds.'
    },
    {
      q: 'Is my financial data encrypted and private?',
      a: 'All data is encrypted in transit via TLS 1.3 and at rest using AES-256. FinPilot enforces strict user-scoped tenancy with zero third-party monetization or advertising sharing.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(5,223,133,0.12)_0%,rgba(5,223,133,0.02)_50%,rgba(5,8,14,0)_75%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1422] border border-white/[0.08] text-xs font-medium text-slate-300 mb-8 shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200">Introducing Financial Analyst v2.4</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">Built for Modern Wealth</span>
          </div>

          {/* Large Hero Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6">
            Your money. Your goals.{' '}
            <span className="italic block mt-1 bg-gradient-to-r from-[#05DF85] via-[#34D399] to-[#22D3EE] bg-clip-text text-transparent">
              A clearer direction.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Autonomous personal finance management for forward-looking individuals. Track multi-account cash flow, run automated affordability simulations, manage debt amortisation, and protect future reserves with mathematical precision.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-glow-mint hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 font-semibold text-sm border border-white/[0.08] transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-slate-300 text-slate-300" />
              <span>Explore Live Preview</span>
            </a>
          </div>

          {/* Trust Indicators Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#05DF85]" /> Bank-Grade 256-bit Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#05DF85]" /> Strictly Zero PII Monetization
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#05DF85]" /> Deterministic Math Engine
            </span>
          </div>

          {/* ========================================================================= */}
          {/* 2. HERO INTERACTIVE DASHBOARD PREVIEW FRAME */}
          {/* ========================================================================= */}
          <div id="demo" className="mt-14 relative max-w-5xl mx-auto text-left">
            {/* Outer Glow effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-b from-[#05DF85]/20 to-transparent rounded-3xl blur-xl opacity-40 pointer-events-none"></div>

            <div className="relative rounded-2xl bg-[#090E18] border border-white/[0.1] shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Window Header Bar */}
              <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#070B13]/90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-3 text-xs font-mono text-slate-400">
                    FinPilot Super-Executive Workspace • v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
                  <span className="text-[11px] font-mono text-slate-400">Status: Ledger Synchronised & Verified</span>
                </div>
              </div>

              {/* Window Content */}
              <div className="p-5 sm:p-7 space-y-6">
                {/* 3 Metrics Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Metric 1 */}
                  <div className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                      <span>TRACKED LIQUID CAPITAL</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">+4.8% M/M</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
                      ₹4,82,450
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1.5">
                      Liquid cash across 4 primary accounts
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 rounded-xl bg-[#0D1422] border border-emerald-500/30 bg-emerald-950/10">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                      <span>NET COMMITTED SURPLUS</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">EMERGENCY BUFFER: 3.2X</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-sans text-[#05DF85] tracking-tight">
                      ₹1,18,320
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1.5">
                      Emergency Reserve Locked: ₹1.5L
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                      <span>MONTHLY PREDICTED OUTFLOW</span>
                      <span className="text-rose-400 text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded font-bold">DUE IN 14 DAYS</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
                      ₹1,85,000
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1.5">
                      Includes ₹42k loan amortisation
                    </div>
                  </div>
                </div>

                {/* Main Split: Vector Chart & AI Execution Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Vector Chart */}
                  <div className="lg:col-span-7 p-5 rounded-xl bg-[#0D1422] border border-white/[0.06] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">Deterministic Cash-Flow Vector</h4>
                        <p className="text-xs text-slate-500">Autonomous multi-account trajectory forecast</p>
                      </div>

                      {/* Period Pills */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#070B13] border border-white/[0.06] text-xs font-mono">
                        {['1M', '3M', '6M', '1Y'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setChartPeriod(p)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              chartPeriod === p
                                ? 'bg-[#05DF85] text-slate-950 font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vector Line Graph Artwork */}
                    <div className="h-44 w-full relative flex items-end py-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" fill="none">
                        <defs>
                          <linearGradient id="vectorGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#05DF85" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#05DF85" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M 0 100 Q 80 90, 150 70 T 280 40 T 400 15 L 400 120 L 0 120 Z"
                          fill="url(#vectorGlow)"
                        />
                        {/* Dashed Baseline */}
                        <path
                          d="M 0 95 L 400 50"
                          stroke="#334155"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        {/* Main Vector Line */}
                        <path
                          d="M 0 100 Q 80 90, 150 70 T 280 40 T 400 15"
                          stroke="#05DF85"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Glowing Endpoint */}
                        <circle cx="400" cy="15" r="4.5" fill="#05DF85" className="animate-pulse" />
                      </svg>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-[#05DF85]"></span>
                          <span>Execution Baseline</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-slate-600"></span>
                          <span>Projected Baseline</span>
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400">Current Velocity: +₹38,200/mo</span>
                    </div>
                  </div>

                  {/* Right Column: AI Prompt Execution Stream */}
                  <div className="lg:col-span-5 p-5 rounded-xl bg-[#0D1422] border border-white/[0.06] flex flex-col justify-between space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#05DF85]" />
                        <span>AI PROMPT STREAM</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">MATH REASONER v2.4</span>
                    </div>

                    {/* User Prompt Bubble */}
                    <div className="p-3 rounded-lg bg-[#070B13] border border-white/[0.04] text-xs text-slate-300">
                      <span className="text-[10px] text-slate-500 font-mono block mb-1">USER QUERY</span>
                      <p className="font-medium text-white italic">
                        “Can I afford the premium ₹75,000 laptop in 3 months?”
                      </p>
                    </div>

                    {/* AI Simulation Result Card */}
                    <div className="p-3.5 rounded-lg bg-[#08101E] border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>Affordability: Approved</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">CONFIDENCE: 99.4%</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Allocation of <strong className="text-white font-semibold">₹25,000/month</strong> does not breach your safe reserves target. 3x emergency buffer remains intact.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-1.5 rounded bg-[#0D1422] border border-white/[0.04] text-[10px]">
                          <span className="text-slate-500 block">Monthly Allocation</span>
                          <strong className="text-white font-mono">₹25,000/mo</strong>
                        </div>
                        <div className="p-1.5 rounded bg-[#0D1422] border border-white/[0.04] text-[10px]">
                          <span className="text-slate-500 block">Surplus Post-Txn</span>
                          <strong className="text-emerald-400 font-mono">₹43,320</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 font-mono">Verified Seeded</span>
                      <a href="#ai-analyst" className="text-emerald-400 hover:underline font-medium">
                        View Execution Plan →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VERIFIED ARCHITECTURAL METRICS BAR */}
      {/* ========================================================================= */}
      <section className="py-14 border-y border-white/[0.06] bg-[#070B13]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Stat 1 */}
            <div className="space-y-1.5 border-l-2 border-[#05DF85] pl-4">
              <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                0.00%
              </div>
              <div className="text-sm font-bold text-slate-200">Floating-Point Error</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strict integer paise precision across all currency calculations
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1.5 border-l-2 border-[#05DF85] pl-4">
              <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                100%
              </div>
              <div className="text-sm font-bold text-slate-200">Deterministic Math</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Constrained algorithms with zero AI hallucination or fabricated figures
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1.5 border-l-2 border-[#05DF85] pl-4">
              <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                3x
              </div>
              <div className="text-sm font-bold text-slate-200">Emergency Reserve Guard</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated safety ring-fencing before any discretionary simulation
              </p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1.5 border-l-2 border-[#05DF85] pl-4">
              <div className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
                256-Bit
              </div>
              <div className="text-sm font-bold text-slate-200">Security & Privacy</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                User-scoped encrypted tenancy with zero data monetization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR FOUNDATIONAL PILLARS SECTION */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#05DF85] block mb-2">
              FINANCIAL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-white mb-4">
              Four foundational pillars of algorithmic capital control.
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Built from the ground up on zero-leakage ledger accounting principles. FinPilot eliminates intuitive guesswork from personal wealth management.
            </p>
          </div>

          {/* 2x2 Grid of Feature Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl bg-[#090E18] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85] mb-6 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                  PILLAR 01: ADVANCED CASH-FLOW
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Deterministic Cash Flow Forecast
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Multi-account ledger aggregation with deterministic cash flow algorithms so you know uncommitted liquidity 60 days ahead.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.04] text-xs flex items-center justify-between">
                <span className="text-slate-400">Net Uncommitted Surplus:</span>
                <span className="font-mono text-[#05DF85] font-bold">78% Protected</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl bg-[#090E18] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  PILLAR 02: CAPITAL PRESERVATION
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Targeted Savings Earmarks
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Ring-fenced funds for emergency, vacations, gadgets, and life goals. Prevent accidental capital leakage without opening dozens of bank accounts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.04] text-xs flex items-center justify-between">
                <span className="text-slate-400">Emergency Buffer Status:</span>
                <span className="font-mono text-cyan-400 font-bold">Locked (₹1.5L Reserved)</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl bg-[#090E18] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                  PILLAR 03: SCHEDULE & LOANS
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Debt & Amortisation Engine
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Exact daily interest accruals, prepayments impact forecasting, and automated balance amortization for home, auto, and personal loans.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.04] text-xs flex items-center justify-between">
                <span className="text-slate-400">Prepayment Optimization:</span>
                <span className="font-mono text-indigo-400 font-bold">-14 Months Saved</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-2xl bg-[#090E18] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-105 transition-transform">
                  <PieChart className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
                  PILLAR 04: TREASURY ALLOCATION
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Portfolio & Leverage Hub
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Track mutual funds, equity holdings, SGBs, and alternative assets in a unified ledger. Gain deep visibility into asset allocation and net-worth trajectories.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.04] text-xs flex items-center justify-between">
                <span className="text-slate-400">Consolidated Net Worth:</span>
                <span className="font-mono text-amber-400 font-bold">Unified Portfolio Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE INTELLIGENCE LAYER (CFA IN YOUR POCKET) */}
      {/* ========================================================================= */}
      <section id="ai-analyst" className="py-24 border-t border-white/[0.06] bg-[#070B13]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#05DF85] block">
                INTELLIGENCE ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-white leading-tight">
                The Intelligence Layer: Your personal CFA in your pocket.
              </h2>
              <p className="text-base text-slate-400 leading-relaxed">
                Driven by deterministic finance models and structured AI prompts. FinPilot's AI Analyst is constrained by mathematical logic—no hallucinations, no fabricated numbers. Every simulation runs through rigorous accounting equations.
              </p>

              {/* 3 Pillars / Capabilities List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Context-Aware Calculations</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluates real income streams, upcoming EMIs, and essential monthly burn rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Structured Scenario Analysis</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Runs multi-scenario stress tests before you commit to large discretionary purchases.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Tactical Investment Suggestions</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Distinguishes liquid emergency funds from true surplus and suggests suitable instruments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Terminal Card Replicating Stitch UI */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#090E18] border border-white/[0.1] shadow-2xl p-6 space-y-4">
                {/* Terminal Top Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#05DF85]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">FINPILOT CAPITAL ENGINE</span>
                      <span className="text-[10px] font-mono text-slate-500">Autonomous Reasoning Session #8412</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1422] text-emerald-400 border border-emerald-500/20">
                    LIVE MODEL READY
                  </span>
                </div>

                {/* User Prompt */}
                <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.04]">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">USER QUERY</span>
                  <p className="text-sm font-medium text-slate-200">
                    “Can I afford a vacation of ₹1,50,000 to Europe in December without leveraging emergency reserves?”
                  </p>
                </div>

                {/* Simulation Output Card */}
                <div className="p-4 rounded-xl bg-[#08101E] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>AFFORDABILITY: RECOMMENDED</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">HIGH CONFIDENCE</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    A monthly earmark of <strong className="text-white font-semibold">₹37,500</strong> over 4 months leaves a safe liquid buffer of <strong className="text-emerald-400 font-semibold">₹78,000</strong> for your monthly living expenses.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                    <div className="p-2 rounded bg-[#0D1422] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Est. Outlay</span>
                      <span className="text-xs font-bold text-white">₹1.50L</span>
                    </div>
                    <div className="p-2 rounded bg-[#0D1422] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                      <span className="text-xs font-bold text-white">4 Months</span>
                    </div>
                    <div className="p-2 rounded bg-[#0D1422] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Impact</span>
                      <span className="text-xs font-bold text-emerald-400">Zero Debt</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Constraint: 3x Reserves Preserved</span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#05DF85] hover:underline"
                  >
                    <span>Generate Goal Earmark</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TRANSPARENT PRICING SECTION */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-24 border-t border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#05DF85] block mb-2">
              PREDICTABLE MEMBERSHIP
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-white mb-4">
              Transparent pricing. Exponential financial clarity.
            </h2>
            <p className="text-base text-slate-400 leading-relaxed mb-8">
              Start free forever. Upgrade to Pro when you're ready to unlock advanced simulations and our AI Analyst engine.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#0D1422] border border-white/[0.08]">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-[#05DF85] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide transition-all ${
                  billingInterval === 'yearly'
                    ? 'bg-[#05DF85] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly (Save 33%)
              </button>
            </div>
          </div>

          {/* Pricing Tier Cards (2 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Starter Card */}
            <div className="p-8 rounded-2xl bg-[#090E18] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Free Starter</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    FOREVER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  For individuals getting organized and tracking essential cash flow month over month.
                </p>

                <div className="text-4xl font-extrabold text-white mb-6 font-sans">
                  ₹0{' '}
                  <span className="text-xs font-normal text-slate-500">/ forever</span>
                </div>

                <div className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/[0.06] pt-6">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Track up to 3 bank & cash accounts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Up to 150 monthly transactions (zero double-count)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Basic monthly category budgeting</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Up to 3 active savings goal earmarks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Standard cash-flow status reports</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 font-bold text-xs uppercase tracking-wider text-center border border-white/[0.08] transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Wealth OS Card */}
            <div className="p-8 rounded-2xl bg-[#090E18] border-2 border-[#05DF85] relative flex flex-col justify-between shadow-glow-mint">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#05DF85] text-slate-950 text-[10px] font-black uppercase tracking-wider">
                MOST POPULAR
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Pro Wealth OS</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                    ALL FEATURES
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  For ambitious individuals optimizing growing assets, loan debt, and complex purchase decisions.
                </p>

                <div className="text-4xl font-extrabold text-white mb-6 font-sans">
                  {billingInterval === 'monthly' ? '₹99' : '₹799'}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    / {billingInterval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300 mb-8 border-t border-white/[0.06] pt-6">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span className="font-semibold text-white">Unlimited accounts & unified portfolio</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span className="font-semibold text-white">Full Loan & EMI Amortisation Engine</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span className="font-semibold text-white">Advanced multi-scenario goal forecasts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span className="font-semibold text-white">AI Financial Analyst (Unlimited Queries)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Investment portfolio & asset allocation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                    <span>Formula-protected CSV financial exports</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-glow-mint"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 border-t border-white/[0.06] bg-[#070B13]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#05DF85] block mb-2">
              CLARITY & ASSURANCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Everything you need to know about FinPilot's security, calculations, and architecture.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#090E18] border border-white/[0.08] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-base font-bold text-white font-sans">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#05DF85]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BOTTOM CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#09111E] to-[#060A12] border border-[#05DF85]/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-glow-mint">
            {/* Background sparkle effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#05DF85]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#05DF85]/10 border border-[#05DF85]/30 text-[#05DF85] text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
              <span>Built for modern financial clarity</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight max-w-2xl mx-auto mb-4 leading-tight">
              Take command of your financial trajectory today.
            </h2>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Take control with mathematical precision: track sustainable liquidity, manage debt amortisation, and grow net worth with zero guesswork.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-glow-mint hover:scale-[1.02]"
              >
                <span>Get Started with FinPilot</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 font-semibold text-sm border border-white/[0.08]"
              >
                <span>Explore Architecture</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
