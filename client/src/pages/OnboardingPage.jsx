import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Landmark,
  Shield,
  Globe,
  CheckCircle2,
  Search,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Target,
  Sliders,
  DollarSign,
  ChevronDown
} from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [notationStyle, setNotationStyle] = useState('lakhs');
  const [timezone, setTimezone] = useState('IST');
  const [fiscalYear, setFiscalYear] = useState('apr-mar');
  const [focusStreams, setFocusStreams] = useState([
    'cashflow',
    'emergency',
    'loans'
  ]);

  const toggleFocus = (key) => {
    if (focusStreams.includes(key)) {
      setFocusStreams(focusStreams.filter((k) => k !== key));
    } else {
      setFocusStreams([...focusStreams, key]);
    }
  };

  const handleContinue = () => {
    navigate('/workspace/dashboard');
  };

  const currencies = [
    {
      code: 'INR',
      name: 'Indian Rupee',
      tag: 'PRIMARY',
      symbol: '₹',
      preview: '₹1,85,450.00',
      system: 'Lakh/Crore Native',
      sub: 'INR • ₹ (Default)'
    },
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      preview: '$1,850.00',
      system: 'Million / Billion',
      sub: 'USD • $ (Global)'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      preview: '€1.850,00',
      system: 'Decimal Comma',
      sub: 'EUR • € (Continental)'
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      preview: '£1,850.00',
      system: 'Western Standard',
      sub: 'GBP • £ (Sterling)'
    },
    {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S$',
      preview: 'S$1,850.00',
      system: 'Standard Tier',
      sub: 'SGD • S$ (APAC)'
    },
    {
      code: 'AED',
      name: 'UAE Dirham',
      symbol: 'AED',
      preview: 'AED 1,850.00',
      system: 'Middle East',
      sub: 'AED • د.إ (GCC)'
    },
  ];

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#05DF85] selection:text-slate-950 pb-24">
      {/* Global Header */}
      <header className="h-14 border-b border-white/[0.08] bg-[#05080E]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#05DF85] shadow-[0_0_15px_rgba(5,223,133,0.15)]">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">FinPilot</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
          <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
          <span>256-BIT SSL ENCRYPTED • SOC-2 COMPLIANT</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080D16] border border-white/[0.08] text-slate-300 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>EN / USD</span>
          </div>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">Help & Docs</Link>
          <Link to="/login" className="px-3.5 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-200 border border-white/[0.08]">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 pt-8 space-y-8">
        {/* 4-Step Stepper Header */}
        <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0D1422] border border-[#05DF85]/40 text-[#05DF85]">
            <span className="w-6 h-6 rounded-md bg-[#05DF85] text-slate-950 font-bold flex items-center justify-center text-xs">
              01
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase text-emerald-400 font-bold">ACTIVE PHASE</div>
              <div className="font-bold text-white truncate">Regional & Currency</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 p-2 text-slate-400 opacity-60">
            <span className="w-6 h-6 rounded-md bg-white/[0.06] text-slate-300 font-bold flex items-center justify-center text-xs">
              02
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase text-slate-500">STEP 02</div>
              <div className="font-semibold text-slate-300 truncate">Account Linking & Mode</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 p-2 text-slate-400 opacity-60">
            <span className="w-6 h-6 rounded-md bg-white/[0.06] text-slate-300 font-bold flex items-center justify-center text-xs">
              03
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase text-slate-500">STEP 03</div>
              <div className="font-semibold text-slate-300 truncate">Goals & Cushion</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3 p-2 text-slate-400 opacity-60">
            <span className="w-6 h-6 rounded-md bg-white/[0.06] text-slate-300 font-bold flex items-center justify-center text-xs">
              04
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase text-slate-500">STEP 04</div>
              <div className="font-semibold text-slate-300 truncate">AI Cadence</div>
            </div>
          </div>
        </div>

        {/* Page Title & Protocol Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-[#05DF85] flex items-center gap-1.5 mb-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span>Institutional Standard Telemetry Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Configure your primary financial ledger
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Choose your default currency, number formatting standard, and financial year cycle for accurate telemetry and multi-asset reconciliations.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-[#05DF85]" />
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">ENGINE PROTOCOL</span>
              <span className="text-white font-bold">ISO-4217 • SEBI / RBI Mode</span>
            </div>
          </div>
        </div>

        {/* [ SECTION 01 ] Base Currency Specification */}
        <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-[#05DF85] font-bold">[ SECTION 01 ]</div>
              <h2 className="text-base font-bold text-white mt-0.5">Base Currency Specification</h2>
              <p className="text-xs text-slate-400">Active benchmark ledger currency for conversion pipelines and net worth computations.</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search 160+ fiat currencies..."
                className="pl-8 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
              />
            </div>
          </div>

          {/* Currencies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {currencies.map((curr) => {
              const isSelected = selectedCurrency === curr.code;
              return (
                <div
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0D1422] border-[#05DF85] shadow-[0_0_20px_rgba(5,223,133,0.15)]'
                      : 'bg-[#0D1422]/60 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${isSelected ? 'bg-emerald-500/20 text-[#05DF85]' : 'bg-white/[0.05] text-slate-400'}`}>
                          {curr.symbol}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{curr.name}</span>
                            {curr.tag && (
                              <span className="text-[9px] font-mono font-bold px-1 rounded bg-emerald-500/20 text-[#05DF85]">
                                {curr.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">{curr.sub}</div>
                        </div>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#05DF85]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Preview Syntax: <strong className="text-white">{curr.preview}</strong></span>
                    <span className="text-slate-500">{curr.system}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Number Scale Notation Toggle */}
          <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#05DF85]" />
              <div>
                <span className="font-bold text-white block">Number scale notation style</span>
                <span className="text-[11px] text-slate-400">Determines how metrics, account aggregates, and forecasts present numerical thresholds.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setNotationStyle('lakhs')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  notationStyle === 'lakhs'
                    ? 'bg-[#080D16] text-[#05DF85] border border-[#05DF85]/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${notationStyle === 'lakhs' ? 'bg-[#05DF85]' : 'border border-slate-600'}`}></span>
                <span>Indian Lakhs / Crores (₹1,50,000)</span>
              </button>

              <button
                type="button"
                onClick={() => setNotationStyle('western')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  notationStyle === 'western'
                    ? 'bg-[#080D16] text-[#05DF85] border border-[#05DF85]/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${notationStyle === 'western' ? 'bg-[#05DF85]' : 'border border-slate-600'}`}></span>
                <span>Western Standard ($150,000)</span>
              </button>
            </div>
          </div>
        </div>

        {/* [ SECTION 02 ] Timezone & Fiscal Year Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 02.A: Timezone & Rebalance Sync */}
          <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div>
              <div className="text-xs font-mono text-[#05DF85] font-bold">[ SECTION 02.A ]</div>
              <h2 className="text-base font-bold text-white mt-0.5">Timezone & Rebalance Sync</h2>
              <p className="text-xs text-slate-400">Aligns end-of-day NAV captures, bank sync feeds, and daily spend notifications.</p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">PRIMARY SYSTEM TIMEZONE</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#05DF85] appearance-none"
                  >
                    <option value="IST">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi • IST</option>
                    <option value="UTC">(UTC+00:00) London, Dublin, Lisbon • GMT</option>
                    <option value="EST">(UTC-05:00) Eastern Time • New York</option>
                    <option value="SGT">(UTC+08:00) Singapore, Hong Kong • SGT</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] text-[11px] text-slate-400 flex items-start gap-2.5">
                <span className="text-[#05DF85] font-mono">⇄</span>
                <span>Ledger batch settlement runs nightly at <strong>23:59:00 IST</strong> with zero disruption to scheduled debit mandates.</span>
              </div>
            </div>
          </div>

          {/* Section 02.B: Fiscal Year Accounting Cycle */}
          <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
            <div>
              <div className="text-xs font-mono text-[#05DF85] font-bold">[ SECTION 02.B ]</div>
              <h2 className="text-base font-bold text-white mt-0.5">Fiscal Year Accounting Cycle</h2>
              <p className="text-xs text-slate-400">Configures YTD capital gains statements, tax saving run rates, and quarterly review windows.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Apr - Mar */}
              <div
                onClick={() => setFiscalYear('apr-mar')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  fiscalYear === 'apr-mar'
                    ? 'bg-[#0D1422] border-[#05DF85] shadow-[0_0_15px_rgba(5,223,133,0.15)]'
                    : 'bg-[#0D1422]/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#05DF85]" />
                    <span className="text-xs font-bold text-white">April – March</span>
                  </div>
                  {fiscalYear === 'apr-mar' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                  )}
                </div>
                <div className="text-[10px] font-mono text-[#05DF85] mb-1">Standard India FY (AY 2025-26)</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Recommended for Income Tax, TDS deduction, and advance tax tracking.
                </p>
              </div>

              {/* Jan - Dec */}
              <div
                onClick={() => setFiscalYear('jan-dec')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  fiscalYear === 'jan-dec'
                    ? 'bg-[#0D1422] border-[#05DF85]'
                    : 'bg-[#0D1422]/60 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-white">January – December</span>
                  </div>
                  {fiscalYear === 'jan-dec' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#05DF85]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mb-1">Calendar Year Standard</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Optimized for multinational corporations and global equity schedules.
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500">
              ⓘ You can change FY cycle at the close of any active financial period.
            </div>
          </div>
        </div>

        {/* [ SECTION 03 ] Financial Focus Priorities & Engine Tuning */}
        <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#05DF85] font-bold">[ SECTION 03 ]</div>
              <h2 className="text-base font-bold text-white mt-0.5">Financial Focus Priorities & Engine Tuning</h2>
              <p className="text-xs text-slate-400">Select telemetry streams to weight FinPilot&apos;s predictive alerting models during initial sync.</p>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-[#0D1422] border border-white/[0.08] text-[11px] font-mono text-slate-300">
              {focusStreams.length} Priorities Initialized
            </span>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: 'cashflow', label: 'Automate Cash Flow & Disposable Burn' },
              { id: 'emergency', label: 'Emergency Reserve & Goal Earmarks' },
              { id: 'loans', label: 'Accelerate Loan & Home EMI Paydown' },
              { id: 'investments', label: 'Analyze Mutual Funds & Asset Allocation' },
              { id: 'tax', label: 'Tax Optimization & 80C Dedication' },
            ].map((chip) => {
              const active = focusStreams.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleFocus(chip.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500/10 text-[#05DF85] border border-emerald-500/30 font-bold'
                      : 'bg-[#0D1422] text-slate-400 border border-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${active ? 'bg-[#05DF85] text-slate-950 font-bold' : 'border border-slate-600'}`}>
                    {active && '✓'}
                  </span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Sub-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3">
            <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-400">BURN RATE SAFETY RING</div>
              <div className="text-xs font-bold text-white mt-1">Adaptive 30-Day Guardrail</div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Calculates non-essential spending caps from past 30-day salary credits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-400">LIQUIDITY FORTRESS</div>
              <div className="text-xs font-bold text-white mt-1">6-Month Buffer Target</div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Earmarks high-yield liquid funds away from everyday debit accounts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-400">DEBT SNOWBALL ENGINE</div>
              <div className="text-xs font-bold text-white mt-1">Principal Prepayment Radar</div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Simulates interest savings across ongoing home and auto credit lines.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#080D16]/95 backdrop-blur-md border-t border-white/[0.08] py-3 px-6 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">Selected: </span>
              <strong className="text-white">
                {selectedCurrency} ({selectedCurrency === 'INR' ? '₹' : '$'}) • {notationStyle === 'lakhs' ? 'Lakhs' : 'Western'} • FY {fiscalYear === 'apr-mar' ? 'Apr-Mar' : 'Jan-Dec'} • {focusStreams.length} Focus Streams
              </strong>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Setup: Step 1 of 4 verified • Changes autosaved locally
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleContinue}
              className="px-4 py-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all"
            >
              Skip for now (use INR defaults)
            </button>

            <button
              onClick={handleContinue}
              className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <span>Continue to Account Linking</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
