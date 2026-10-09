import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  CreditCard,
  Building,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Percent,
  Download,
  Shield,
  X
} from 'lucide-react';

export default function LoansPage() {
  const [selectedLoan, setSelectedLoan] = useState('home');
  const [strategy, setStrategy] = useState('tenure');
  const [extraMonthly, setExtraMonthly] = useState(10000);
  const [annualStepUp, setAnnualStepUp] = useState(10);
  const [annualBonus, setAnnualBonus] = useState(150000);
  const [appliedPrepayment, setAppliedPrepayment] = useState(false);

  // Active Loan Accounts
  const loans = [
    {
      id: 'home',
      name: 'HDFC Bank Home Loan',
      accNumber: 'A/C 498421',
      rate: '8.50%',
      rateType: 'Floating Rate',
      principal: 4250000,
      sanction: 5500000,
      emi: 47750,
      tenureElapsed: 42,
      tenureTotal: 240,
      badge: 'Active',
      taxLinked: 'Tax Sec 24(b) & 80C Linked'
    },
    {
      id: 'car',
      name: 'Axis Green EV Auto Loan',
      accNumber: 'A/C 908183',
      rate: '9.25%',
      rateType: 'Fixed Rate',
      principal: 525000,
      sanction: 700000,
      emi: 14200,
      tenureElapsed: 18,
      tenureTotal: 60,
      badge: 'Active'
    },
    {
      id: 'personal',
      name: 'ICICI Gadget Personal Loan',
      accNumber: 'A/C 119859',
      rate: '11.50%',
      rateType: 'Unsecured',
      principal: 100000,
      sanction: 200000,
      emi: 6500,
      tenureElapsed: 8,
      tenureTotal: 24,
      badge: 'High Cost'
    }
  ];

  // 12-Month Amortization Preview Table Data
  const amortizationSchedule = [
    { inst: '#43', date: '05 Nov 2024', open: 4250000, emi: 47750, p: 17645, i: 30105, prepay: 10000, close: 4222355, rem: 197 },
    { inst: '#44', date: '05 Dec 2024', open: 4222355, emi: 47750, p: 17841, i: 29909, prepay: 10000, close: 4194514, rem: 195 },
    { inst: '#45', date: '05 Jan 2025', open: 4194514, emi: 47750, p: 18038, i: 29712, prepay: 10000, close: 4166476, rem: 193 },
    { inst: '#46', date: '05 Feb 2025', open: 4166476, emi: 47750, p: 18237, i: 29513, prepay: 10000, close: 4138239, rem: 191 },
    { inst: '#47 (LUMP)', date: '05 Mar 2025', open: 4138239, emi: 47750, p: 18438, i: 29312, prepay: 160000, close: 3959801, rem: 178 }
  ];

  const exportScheduleCSV = () => {
    const headers = 'Inst,DueDate,OpeningBalance,BaseEMI,Principal,Interest,Prepayment,ClosingBalance,RemainingMonths\n';
    const rows = amortizationSchedule.map((s) => `"${s.inst}","${s.date}",${s.open},${s.emi},${s.p},${s.i},${s.prepay},${s.close},${s.rem}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Amortization_Schedule_${Date.now()}.csv`;
    a.click();
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
              <span className="text-[#05DF85] font-semibold">DEBT MANAGEMENT & AMORTIZATION LAB</span>
              <span className="text-slate-600">//</span>
              <span>MULTI-LOAN ACCELERATION</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Loans, EMIs & Prepayment Lab
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-0.5">
              <span>3 ACTIVE LIABILITIES</span>
              <span>•</span>
              <span>AVERAGE COST OF DEBT: <strong className="text-[#05DF85]">8.64%</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Loan balance transfer comparison initialized.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              <span>Compare Loan Switch</span>
            </button>

            <button
              onClick={() => setAppliedPrepayment(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simulate Prepayment</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>TOTAL OUTSTANDING PRINCIPAL</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">21.4% PAID</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹48,75,000<span className="text-base text-slate-400 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Sanction: ₹62,00,000</span>
              <span className="text-slate-300">Burn: ₹68,450/mo</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>TOTAL INTEREST BURDEN</span>
              <Percent className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹34,18,200</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-rose-400 font-bold">Interest / Principal: 70.1%</span>
              <span className="text-slate-500">240 mos baseline</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#05DF85] mb-1">
              <span>AI POTENTIAL SAVINGS</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">SAVINGS</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">₹14,85,600<span className="text-sm font-normal text-emerald-300/80 ml-1">Saved</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-[#05DF85] font-bold">Tenure: 4.8 Years Off</span>
              <span className="text-slate-500">via ₹10k/mo step-up</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>DEBT-TO-INCOME (DTI)</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">HEALTHY</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">28.5%</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>₹68,450 EMI / ₹2.40L Inflow</span>
              <span className="text-slate-500">Max 40% Cap</span>
            </div>
          </div>
        </div>

        {/* Middle Grid: Prepayment Simulator (8 cols) + Active Loans & Copilot (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Prepayment Simulator (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-6">
            {/* Loan Selector Tabs */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400">SELECT LOAN TO ACCELERATE:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                {loans.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLoan(l.id)}
                    className={`p-3 rounded-lg text-left border transition-all ${
                      selectedLoan === l.id
                        ? 'bg-[#0D1422] border-[#05DF85] text-white shadow-sm'
                        : 'bg-[#0D1422]/60 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold truncate">{l.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ₹{(l.principal / 100000).toFixed(2)}L @ <strong className="text-[#05DF85]">{l.rate}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prepayment Strategy Parameters */}
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Prepayment Strategy Parameters</h3>
                <div className="flex items-center p-0.5 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs font-mono">
                  <button
                    onClick={() => setStrategy('tenure')}
                    className={`px-3 py-1 rounded transition-all ${
                      strategy === 'tenure' ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Reduce Tenure (Max Savings)
                  </button>
                  <button
                    onClick={() => setStrategy('emi')}
                    className={`px-3 py-1 rounded transition-all ${
                      strategy === 'emi' ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Reduce Monthly EMI
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                {/* Extra Monthly Prepayment */}
                <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Extra Monthly:</span>
                    <strong className="text-[#05DF85]">₹{extraMonthly.toLocaleString('en-IN')}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="2000"
                    value={extraMonthly}
                    onChange={(e) => setExtraMonthly(Number(e.target.value))}
                    className="w-full accent-[#05DF85]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹0</span>
                    <span>₹25k</span>
                    <span>₹50,000</span>
                  </div>
                </div>

                {/* Annual Step-Up */}
                <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Annual Step-Up:</span>
                    <strong className="text-cyan-400">{annualStepUp}% / yr</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="5"
                    value={annualStepUp}
                    onChange={(e) => setAnnualStepUp(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0%</span>
                    <span>10%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* March Bonus Lump Sum */}
                <div className="p-3.5 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Annual Bonus:</span>
                    <strong className="text-purple-400">₹{annualBonus.toLocaleString('en-IN')}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="25000"
                    value={annualBonus}
                    onChange={(e) => setAnnualBonus(Number(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹0</span>
                    <span>₹2.5L</span>
                    <span>₹5.0 Lakhs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Trajectory Comparison Vector */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <h4 className="font-bold text-white">Amortization Trajectory Comparison</h4>
                  <span className="text-[11px] text-slate-400">Principal remaining over time: Original vs Accelerated Plan</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>Baseline (240 mos)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#05DF85]"></span>Accelerated Plan (142 mos)</span>
                </div>
              </div>

              {/* Trajectory Vector */}
              <div className="h-28 flex items-end">
                <svg className="w-full h-24" viewBox="0 0 600 100" fill="none">
                  {/* Baseline curve */}
                  <path d="M0 20 Q 300 50, 600 90" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                  {/* Accelerated curve */}
                  <path d="M0 20 Q 200 45, 380 90" stroke="#05DF85" strokeWidth="3" fill="none" />
                  <circle cx="380" cy="90" r="4" fill="#05DF85" />
                </svg>
              </div>

              {/* Summary 3-Col Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase">DEBT-FREEDOM TARGET</div>
                  <div className="text-base font-bold text-[#05DF85] mt-0.5">Aug 2036</div>
                  <div className="text-[10px] text-slate-500">vs Oct 2044 baseline</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase">NET INTEREST PAYABLE</div>
                  <div className="text-base font-bold text-white mt-0.5">₹17.6 Lakhs</div>
                  <div className="text-[10px] text-rose-400">Original: ₹31.8 Lakhs</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase">TENURE CUT</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">8 Yrs 2 Mos</div>
                  <div className="text-[10px] text-[#05DF85]">98 EMIs Eliminated!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Loans & Debt Copilot (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Loan Accounts */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Active Loan Accounts</h3>
                <span className="text-[10px] font-mono text-slate-400">3 FACILITIES</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {loans.map((l) => (
                  <div key={l.id} className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{l.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/[0.05] text-[#05DF85]">
                        {l.badge}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white">
                      ₹{l.principal.toLocaleString('en-IN')}
                      <span className="text-[11px] text-slate-500 font-normal"> of ₹{l.sanction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>EMI: ₹{l.emi.toLocaleString('en-IN')}</span>
                      <span>Tenure: {l.tenureElapsed} / {l.tenureTotal} mos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debt Copilot Intelligence */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#05DF85]" />
                <h3 className="text-xs font-bold text-white">Debt Copilot Intelligence</h3>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-rose-500/20 text-xs space-y-1">
                <div className="font-bold text-rose-300">Avalanche Strategy Priority</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pay off ICICI Gadget Loan (11.5%) first using ₹1,00,000 from next month&apos;s surplus. Instantly unlocks <strong>₹6,500/month</strong> in free cash flow with 0% prepayment penalty.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs space-y-1">
                <div className="font-bold text-[#05DF85]">Tax Deduction Optimization</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your home loan interest is ₹3.6L/year while Sec 24(b) caps relief at ₹2.0L. Prepaying beyond the cap yields a risk-free <strong>8.50% effective return</strong>.
                </p>
              </div>

              <button
                onClick={() => alert('Recommended prepayment schedule applied to active ledger plan.')}
                className="w-full py-2.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Apply Recommended Prepayment Plan →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Upcoming 12 Months Amortization Preview Table */}
        <div className="p-6 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Upcoming 12 Months Amortization Preview</h3>
              <p className="text-xs text-slate-400">Simulated with extra ₹10,000 prepayment starting Nov 2024</p>
            </div>

            <button
              onClick={exportScheduleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-medium font-mono transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase text-slate-500 bg-[#0D1422]/50">
                  <th className="p-2.5">INST. #</th>
                  <th className="p-2.5">DUE DATE</th>
                  <th className="p-2.5">OPENING BALANCE</th>
                  <th className="p-2.5">BASE EMI</th>
                  <th className="p-2.5">PRINCIPAL</th>
                  <th className="p-2.5">INTEREST</th>
                  <th className="p-2.5 text-[#05DF85]">PREPAYMENT</th>
                  <th className="p-2.5">CLOSING BALANCE</th>
                  <th className="p-2.5 text-right">REMAINING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {amortizationSchedule.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-bold text-white">{row.inst}</td>
                    <td className="p-2.5 text-slate-400">{row.date}</td>
                    <td className="p-2.5">₹{row.open.toLocaleString('en-IN')}</td>
                    <td className="p-2.5">₹{row.emi.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-[#05DF85]">₹{row.p.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-rose-400">₹{row.i.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 font-bold text-[#05DF85]">+₹{row.prepay.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 font-semibold text-white">₹{row.close.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right text-slate-400">{row.rem} mos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
