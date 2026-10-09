import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { Landmark, Plus, Calendar, FileText, CheckCircle2, Trash2, X } from 'lucide-react';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Amortization Modal
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amortizationData, setAmortizationData] = useState(null);
  const [loadingAmortization, setLoadingAmortization] = useState(false);

  // Create Loan Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [loanType, setLoanType] = useState('personal');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('10.5');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [principalPaid, setPrincipalPaid] = useState('');
  const [interestPaid, setInterestPaid] = useState('');
  const [paymentType, setPaymentType] = useState('regular_emi');

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    try {
      setLoading(true);
      const res = await apiRequest('/loans');
      if (res.success) {
        setLoans(res.data.loans || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewAmortization(loan) {
    setSelectedLoan(loan);
    try {
      setLoadingAmortization(true);
      const res = await apiRequest(`/loans/${loan._id}/amortization`);
      if (res.success) {
        setAmortizationData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load amortization schedule');
    } finally {
      setLoadingAmortization(false);
    }
  }

  async function handleCreateLoan(e) {
    e.preventDefault();
    setCreateError('');
    setSubmitting(true);

    try {
      const originalPrincipalPaise = Math.round(parseFloat(principal) * 100);

      await apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify({
          name,
          lender,
          loanType,
          originalPrincipalPaise,
          annualInterestRatePercent: parseFloat(interestRate),
          tenureMonths: parseInt(tenureMonths, 10),
          startDate: new Date(startDate).toISOString()
        })
      });

      setIsCreateModalOpen(false);
      setName('');
      setPrincipal('');
      fetchLoans();
    } catch (err) {
      setCreateError(err.message || 'Failed to record loan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    if (!paymentLoan) return;
    setSubmitting(true);

    try {
      const totalAmountPaise = Math.round(parseFloat(paymentAmount) * 100);
      const principalPaidPaise = Math.round(parseFloat(principalPaid || '0') * 100);
      const interestPaidPaise = Math.round(parseFloat(interestPaid || '0') * 100);

      await apiRequest(`/loans/${paymentLoan._id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          totalAmountPaise,
          principalPaidPaise,
          interestPaidPaise,
          paymentType
        })
      });

      setIsPaymentModalOpen(false);
      setPaymentLoan(null);
      setPaymentAmount('');
      fetchLoans();
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteLoan(id) {
    if (!window.confirm('Delete this loan record?')) return;
    try {
      await apiRequest(`/loans/${id}`, { method: 'DELETE' });
      fetchLoans();
    } catch (err) {
      alert(err.message || 'Failed to delete loan');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Loans & EMI Schedules</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Track principal balances, loan interest math, and deterministic amortization schedules
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Loan</span>
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Outstanding Principal
            </span>
            <div className="text-2xl font-black text-rose-400">
              {formatCurrency(summary.totalOutstandingPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Monthly EMI Commitment
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalMonthlyEmiPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Loans
            </span>
            <div className="text-2xl font-black text-cyan-400">
              {summary.activeLoansCount}
            </div>
          </div>
        </div>
      )}

      {/* Loans List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loans.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Loans Recorded</h3>
          <p className="text-sm max-w-sm mx-auto mb-6">
            Track home loans, car loans, or personal EMIs to keep your debt liabilities organized.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            Add Your First Loan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((l) => (
            <div key={l._id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {l.loanType.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleDeleteLoan(l._id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white">{l.name}</h3>
                <p className="text-xs text-slate-400">{l.lender || 'Lender Unspecified'}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Remaining Principal</span>
                    <strong className="text-rose-400 text-sm font-bold block">{formatCurrency(l.remainingPrincipalPaise)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Monthly EMI</span>
                    <strong className="text-white text-sm font-bold block">{formatCurrency(l.emiPaise)}</strong>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>Interest Rate: {l.annualInterestRatePercent}%</span>
                  <span>Tenure: {l.tenureMonths} mo</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => viewAmortization(l)}
                  className="w-1/2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Amortization</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentLoan(l);
                    setPaymentAmount((l.emiPaise / 100).toFixed(2));
                    setPrincipalPaid((Math.round(l.emiPaise * 0.7) / 100).toFixed(2));
                    setInterestPaid((Math.round(l.emiPaise * 0.3) / 100).toFixed(2));
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-1/2 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  Record EMI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Amortization Schedule Viewer Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Amortization Schedule: {selectedLoan.name}</h3>
                <p className="text-xs text-slate-400">
                  Principal: {formatCurrency(selectedLoan.originalPrincipalPaise)} • Rate: {selectedLoan.annualInterestRatePercent}% • EMI: {formatCurrency(selectedLoan.emiPaise)}
                </p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingAmortization ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Principal Paid</th>
                      <th className="py-2.5 px-3 text-right">Interest Paid</th>
                      <th className="py-2.5 px-3 text-right">Total EMI</th>
                      <th className="py-2.5 px-3 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {amortizationData?.amortization?.schedule?.map((row) => (
                      <tr key={row.monthNumber} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-white">{row.monthNumber}</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(row.dueDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(row.principalPaise)}</td>
                        <td className="py-2.5 px-3 text-right text-rose-400">{formatCurrency(row.interestPaise)}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">{formatCurrency(row.totalPaymentPaise)}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(row.closingPrincipalPaise)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Loan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Record Loan</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Loan, Car Loan, Education Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lender / Bank</label>
                <input
                  type="text"
                  placeholder="e.g. SBI, HDFC, ICICI"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500000.00"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="9.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    placeholder="24"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  {submitting ? 'Calculating...' : 'Create Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && paymentLoan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Record EMI Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Paid (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={principalPaid}
                    onChange={(e) => setPrincipalPaid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Paid (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={interestPaid}
                    onChange={(e) => setInterestPaid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Confirm EMI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
