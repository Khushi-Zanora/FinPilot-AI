import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
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
  Trash2,
  Plus,
  X
} from 'lucide-react';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prepayment simulation inputs
  const [extraMonthly, setExtraMonthly] = useState(5000);

  const [loanForm, setLoanForm] = useState({
    name: '',
    lender: '',
    principal: '',
    annualInterestRate: '8.5',
    tenureMonths: '120',
    emi: '',
    startDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadLoans();
  }, []);

  async function loadLoans() {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/loans');
      if (res.success && res.data?.loans) {
        setLoans(res.data.loans);
        if (res.data.loans.length > 0 && !selectedLoanId) {
          setSelectedLoanId(res.data.loans[0]._id);
        }
      } else {
        setLoans([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load loans.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-calculate EMI in form when principal, rate, or tenure change
  const autoCalcEmi = (p, r, t) => {
    const principal = parseFloat(p);
    const rateAnnual = parseFloat(r);
    const tenure = parseInt(t, 10);
    if (!principal || !rateAnnual || !tenure) return '';
    const monthlyRate = rateAnnual / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return isNaN(emi) ? '' : emi.toFixed(2);
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!loanForm.name || !loanForm.principal) return;

    setSubmitting(true);
    setError('');

    try {
      const principalPaise = Math.round(parseFloat(loanForm.principal) * 100);
      const rateAnnual = parseFloat(loanForm.annualInterestRate);
      const tenureMonths = parseInt(loanForm.tenureMonths, 10);
      const emiVal = parseFloat(loanForm.emi || autoCalcEmi(loanForm.principal, loanForm.annualInterestRate, loanForm.tenureMonths));
      const emiPaise = Math.round(emiVal * 100);

      const res = await apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify({
          name: loanForm.name.trim(),
          lender: loanForm.lender.trim() || 'Bank',
          principalPaise,
          annualInterestRate: rateAnnual,
          tenureMonths,
          emiPaise,
          startDate: new Date(loanForm.startDate).toISOString()
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setLoanForm({
          name: '',
          lender: '',
          principal: '',
          annualInterestRate: '8.5',
          tenureMonths: '120',
          emi: '',
          startDate: new Date().toISOString().slice(0, 10)
        });
        await loadLoans();
      }
    } catch (err) {
      setError(err.message || 'Failed to create loan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLoan = async (id, name) => {
    if (!window.confirm(`Delete loan record "${name}"?`)) return;
    try {
      await apiRequest(`/loans/${id}`, { method: 'DELETE' });
      await loadLoans();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const selectedLoan = loans.find((l) => l._id === selectedLoanId) || loans[0] || null;

  // Real amortization preview for selected loan
  const generateSchedule = (loan) => {
    if (!loan) return [];
    const schedule = [];
    let balance = loan.outstandingBalancePaise || loan.principalPaise;
    const monthlyRate = loan.annualInterestRate / 12 / 100;
    const baseEmi = loan.emiPaise;

    for (let i = 1; i <= 6; i++) {
      if (balance <= 0) break;
      const interest = Math.round(balance * monthlyRate);
      const principalPart = Math.min(balance, baseEmi - interest);
      const closing = Math.max(0, balance - principalPart);

      schedule.push({
        inst: `#${i}`,
        open: balance,
        emi: baseEmi,
        principal: principalPart,
        interest,
        close: closing
      });

      balance = closing;
    }
    return schedule;
  };

  const schedule = generateSchedule(selectedLoan);

  const totalOutstandingPaise = loans.reduce((acc, l) => acc + (l.outstandingBalancePaise || l.principalPaise || 0), 0);
  const totalMonthlyEmiPaise = loans.reduce((acc, l) => acc + (l.emiPaise || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">LIABILITY RECONCILIATION</span>
              <span className="text-slate-600">//</span>
              <span>LOANS, EMIs & DEBT PREPAYMENT</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Loans & Debt Prepayment Planner
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Loan Record</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 3 Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL OUTSTANDING DEBT</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalOutstandingPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {loans.length} active loan liabilities
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">COMMITTED MONTHLY EMIs</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalMonthlyEmiPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Auto-deducted in 30-day obligations
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">AMORTIZATION ENGINE</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">Deterministic</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Reducing balance interest formula
            </div>
          </div>
        </div>

        {/* Loans Content */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading loan records...</p>
          </div>
        ) : loans.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Loans or Liabilities Tracked</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your home loan, car loan, education loan, or personal loan to track repayment schedules and calculate interest savings from prepayments.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Loan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Loans List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {loans.map((l) => {
                const isSelected = selectedLoan && selectedLoan._id === l._id;
                return (
                  <div
                    key={l._id}
                    onClick={() => setSelectedLoanId(l._id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? 'bg-[#0D1422] border-[#05DF85] shadow-[0_0_20px_rgba(5,223,133,0.15)]'
                        : 'bg-[#080D16] border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{l.name}</h4>
                        <div className="text-[10px] font-mono text-slate-400">
                          {l.lender} • {l.annualInterestRate}% p.a.
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLoan(l._id, l.name);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete loan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Outstanding</span>
                        <strong className="text-white">{formatCurrency(l.outstandingBalancePaise || l.principalPaise)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Monthly EMI</span>
                        <strong className="text-rose-400">-{formatCurrency(l.emiPaise)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Amortization Breakdown (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#080D16] border border-white/[0.08] p-6 space-y-5">
              {selectedLoan && (
                <>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Amortization Schedule: {selectedLoan.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated using standard reducing-balance formula ({selectedLoan.annualInterestRate}% p.a.)
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-slate-400 text-[10px] uppercase">
                          <th className="py-2">Month</th>
                          <th className="py-2">Opening</th>
                          <th className="py-2">EMI</th>
                          <th className="py-2">Principal</th>
                          <th className="py-2">Interest</th>
                          <th className="py-2">Closing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {schedule.map((s) => (
                          <tr key={s.inst}>
                            <td className="py-2.5 font-bold text-white">{s.inst}</td>
                            <td className="py-2.5 text-slate-300">{formatCurrency(s.open)}</td>
                            <td className="py-2.5 text-rose-400">{formatCurrency(s.emi)}</td>
                            <td className="py-2.5 text-[#05DF85]">{formatCurrency(s.principal)}</td>
                            <td className="py-2.5 text-slate-400">{formatCurrency(s.interest)}</td>
                            <td className="py-2.5 text-white font-bold">{formatCurrency(s.close)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#05DF85]" />
                <span>Add Loan Record</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Loan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Home Loan, Car Loan"
                  value={loanForm.name}
                  onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Lender / Bank</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={loanForm.lender}
                  onChange={(e) => setLoanForm({ ...loanForm, lender: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Principal (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 2500000.00"
                    value={loanForm.principal}
                    onChange={(e) => {
                      const p = e.target.value;
                      const emi = autoCalcEmi(p, loanForm.annualInterestRate, loanForm.tenureMonths);
                      setLoanForm({ ...loanForm, principal: p, emi });
                    }}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Interest Rate (% p.a.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={loanForm.annualInterestRate}
                    onChange={(e) => {
                      const r = e.target.value;
                      const emi = autoCalcEmi(loanForm.principal, r, loanForm.tenureMonths);
                      setLoanForm({ ...loanForm, annualInterestRate: r, emi });
                    }}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tenure (Months) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={loanForm.tenureMonths}
                    onChange={(e) => {
                      const t = e.target.value;
                      const emi = autoCalcEmi(loanForm.principal, loanForm.annualInterestRate, t);
                      setLoanForm({ ...loanForm, tenureMonths: t, emi });
                    }}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly EMI (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated"
                    value={loanForm.emi}
                    onChange={(e) => setLoanForm({ ...loanForm, emi: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
