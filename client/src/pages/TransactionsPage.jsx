import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  ReceiptText,
  Search,
  Plus,
  Download,
  Repeat,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Trash2,
  AlertCircle,
  Landmark,
  Calendar,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ledger';

  const [activeMainTab, setActiveMainTab] = useState(initialTab); // 'ledger' | 'recurring'
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [recurrings, setRecurrings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRecurringModal, setShowAddRecurringModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingDue, setProcessingDue] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Transaction Form state
  const [txForm, setTxForm] = useState({
    type: 'expense',
    amount: '',
    accountId: '',
    toAccountId: '',
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  });

  // New Recurring Form state
  const [recurringForm, setRecurringForm] = useState({
    type: 'income',
    amount: '',
    accountId: '',
    category: 'Primary Salary',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().slice(0, 10),
    nextDueDate: new Date().toISOString().slice(0, 10),
    endDate: ''
  });

  useEffect(() => {
    loadAllData();
  }, [filterTab, activeMainTab]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Accounts (optional manual tracking)
      const accRes = await apiRequest('/accounts');
      const userAccounts = accRes.success && accRes.data?.accounts ? accRes.data.accounts : [];
      setAccounts(userAccounts);

      // 2. Fetch Transactions
      let url = '/transactions?limit=100';
      if (filterTab === 'expenses') url += '&type=expense';
      if (filterTab === 'inflows') url += '&type=income';
      if (filterTab === 'transfers') url += '&type=transfer';

      const txRes = await apiRequest(url);
      if (txRes.success && txRes.data?.transactions) {
        setTransactions(txRes.data.transactions);
        if (txRes.data.transactions.length > 0 && !selectedTxId) {
          setSelectedTxId(txRes.data.transactions[0]._id);
        }
      } else {
        setTransactions([]);
      }

      // 3. Fetch Recurring Schedules
      const recRes = await apiRequest('/transactions/recurring');
      if (recRes.success && recRes.data?.recurrings) {
        setRecurrings(recRes.data.recurrings);
      } else {
        setRecurrings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTx = async (e) => {
    e.preventDefault();
    if (!txForm.amount) return;

    setSubmitting(true);
    setError('');

    try {
      const amountPaise = Math.round(parseFloat(txForm.amount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid amount greater than 0.');
      }

      const payload = {
        type: txForm.type,
        amountPaise,
        accountId: txForm.accountId ? txForm.accountId : null,
        category: txForm.category,
        description: txForm.description,
        date: txForm.date ? new Date(txForm.date).toISOString() : new Date().toISOString()
      };

      if (txForm.type === 'transfer') {
        if (!txForm.accountId) {
          throw new Error('Please select a source account for transfer.');
        }
        if (!txForm.toAccountId || txForm.toAccountId === txForm.accountId) {
          throw new Error('Please select a destination account different from the source.');
        }
        payload.toAccountId = txForm.toAccountId;
      }

      const res = await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowAddModal(false);
        setTxForm({
          type: 'expense',
          amount: '',
          accountId: accounts[0]?._id || '',
          toAccountId: '',
          category: 'Food & Dining',
          description: '',
          date: new Date().toISOString().slice(0, 16)
        });
        setSuccessMsg('Transaction recorded successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        await loadAllData();
      }
    } catch (err) {
      setError(err.message || 'Failed to record transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    if (!recurringForm.amount) return;

    setSubmitting(true);
    setError('');

    try {
      const amountPaise = Math.round(parseFloat(recurringForm.amount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid amount greater than 0.');
      }

      const payload = {
        type: recurringForm.type,
        amountPaise,
        accountId: recurringForm.accountId ? recurringForm.accountId : null,
        category: recurringForm.category,
        description: recurringForm.description,
        frequency: recurringForm.frequency,
        startDate: recurringForm.startDate ? new Date(recurringForm.startDate).toISOString() : new Date().toISOString(),
        nextDueDate: recurringForm.nextDueDate ? new Date(recurringForm.nextDueDate).toISOString() : new Date().toISOString(),
        endDate: recurringForm.endDate ? new Date(recurringForm.endDate).toISOString() : null
      };

      const res = await apiRequest('/transactions/recurring', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowAddRecurringModal(false);
        setRecurringForm({
          type: 'income',
          amount: '',
          accountId: accounts[0]?._id || '',
          category: 'Primary Salary',
          description: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().slice(0, 10),
          nextDueDate: new Date().toISOString().slice(0, 10),
          endDate: ''
        });
        setSuccessMsg('Recurring schedule created successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        await loadAllData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create recurring schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRecurring = async (id) => {
    try {
      const res = await apiRequest(`/transactions/recurring/${id}/toggle`, { method: 'PATCH' });
      if (res.success) {
        setRecurrings((prev) => prev.map((r) => (r._id === id ? res.data.recurring : r)));
      }
    } catch (err) {
      alert(`Error toggling schedule: ${err.message}`);
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Delete this recurring schedule? Completed past transactions will not be deleted.')) return;
    try {
      await apiRequest(`/transactions/recurring/${id}`, { method: 'DELETE' });
      setRecurrings((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(`Error deleting schedule: ${err.message}`);
    }
  };

  const handleProcessDue = async () => {
    setProcessingDue(true);
    setError('');
    try {
      const res = await apiRequest('/transactions/recurring/process-due', { method: 'POST' });
      if (res.success) {
        setSuccessMsg(res.message || 'Due recurring transactions processed.');
        setTimeout(() => setSuccessMsg(''), 4000);
        await loadAllData();
      }
    } catch (err) {
      setError(err.message || 'Failed to process due recurring transactions.');
    } finally {
      setProcessingDue(false);
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      if (selectedTxId === id) {
        setSelectedTxId(null);
      }
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to delete transaction'}`);
    }
  };

  const filteredTxs = transactions.filter((t) => {
    const desc = (t.description || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    const accName = (t.accountId?.name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return desc.includes(q) || cat.includes(q) || accName.includes(q);
  });

  const selectedTx = filteredTxs.find((t) => t._id === selectedTxId) || filteredTxs[0] || null;

  // Real KPIs derived from actual records
  const totalInflowsPaise = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amountPaise, 0);

  const totalOutflowsPaise = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountPaise, 0);

  const netCashFlowPaise = totalInflowsPaise - totalOutflowsPaise;

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = 'ID,Date,Type,Category,Account,Amount (INR),Description\n';
    const rows = transactions
      .map((t) => {
        const amt = (t.amountPaise / 100).toFixed(2);
        const dt = t.date ? new Date(t.date).toLocaleDateString() : '';
        const acc = t.accountId?.name || 'Unlinked';
        return `"${t._id}","${dt}","${t.type}","${t.category}","${acc}",${t.type === 'expense' ? `-${amt}` : amt},"${(t.description || '').replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => setShowAddModal(true)} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">FINANCIAL LEDGER</span>
              <span className="text-slate-600">//</span>
              <span>TRANSACTIONS & RECURRING SCHEDULES</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Transactions & Recurring Income
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activeMainTab === 'recurring' ? (
              <>
                <button
                  onClick={handleProcessDue}
                  disabled={processingDue}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
                  title="Check and record transactions for due recurring schedules now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${processingDue ? 'animate-spin' : ''}`} />
                  <span>{processingDue ? 'Processing...' : 'Process Due Schedules'}</span>
                </button>

                <button
                  onClick={() => setShowAddRecurringModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Recurring Schedule</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={exportCSV}
                  disabled={transactions.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Record Transaction</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Top Tab Switcher: Ledger vs Recurring */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#080D16] border border-white/[0.08] w-fit font-mono text-xs">
          <button
            onClick={() => setActiveMainTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer ${
              activeMainTab === 'ledger'
                ? 'bg-[#05DF85] text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('recurring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer ${
              activeMainTab === 'recurring'
                ? 'bg-[#05DF85] text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Recurring Schedules ({recurrings.length})</span>
          </button>
        </div>

        {/* TAB 1: LEDGER TRANSACTIONS */}
        {activeMainTab === 'ledger' && (
          <div className="space-y-6">
            {/* Real KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL TRANSACTIONS</div>
                <div className="text-2xl font-mono font-bold text-white">{transactions.length}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  {transactions.length === 0 ? 'No activity recorded' : 'All tracked ledger records'}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
                <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">MONEY RECEIVED (INCOME)</div>
                <div className="text-2xl font-mono font-bold text-[#05DF85]">+{formatCurrency(totalInflowsPaise)}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  Salary, investments & other income
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
                <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">MONEY SPENT (EXPENSES)</div>
                <div className="text-2xl font-mono font-bold text-white">-{formatCurrency(totalOutflowsPaise)}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  Living expenses, bills & outlays
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">NET CASH FLOW</div>
                <div className={`text-2xl font-mono font-bold ${netCashFlowPaise >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {formatCurrency(netCashFlowPaise)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  Income minus recorded expenses
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#080D16] border border-white/[0.08]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by category, description, or account..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
                {[
                  { id: 'all', label: `All (${transactions.length})` },
                  { id: 'expenses', label: 'Expenses' },
                  { id: 'inflows', label: 'Income' },
                  { id: 'transfers', label: 'Transfers' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-3 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      filterTab === tab.id
                        ? 'bg-[#05DF85] text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white bg-[#0D1422]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content: Table & Inspector */}
            {loading ? (
              <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
                <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-400">Loading ledger records...</p>
              </div>
            ) : filteredTxs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No Transactions Recorded Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Record your daily spending or income directly. Adding accounts is optional.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setTxForm((prev) => ({ ...prev, type: 'income', category: 'Primary Salary' }));
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Income</span>
                  </button>

                  <button
                    onClick={() => {
                      setTxForm((prev) => ({ ...prev, type: 'expense', category: 'Food & Dining' }));
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.1] font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Transactions Table (8 cols) */}
                <div className="lg:col-span-8 rounded-2xl bg-[#080D16] border border-white/[0.08] overflow-hidden flex flex-col justify-between">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-[#0D1422]/50 text-slate-400 font-mono text-[11px] uppercase">
                          <th className="p-3 pl-4">Transaction / Category</th>
                          <th className="p-3">Account</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredTxs.map((t) => {
                          const isExpense = t.type === 'expense';
                          const isIncome = t.type === 'income';
                          const isTransfer = t.type === 'transfer';
                          const isSelected = selectedTx && selectedTx._id === t._id;

                          return (
                            <tr
                              key={t._id}
                              onClick={() => setSelectedTxId(t._id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-emerald-500/[0.07]' : 'hover:bg-white/[0.02]'
                              }`}
                            >
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      isIncome
                                        ? 'bg-emerald-500/10 text-[#05DF85]'
                                        : isTransfer
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {isIncome ? (
                                      <ArrowDownLeft className="w-4 h-4" />
                                    ) : isTransfer ? (
                                      <Repeat className="w-4 h-4" />
                                    ) : (
                                      <ArrowUpRight className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-white truncate max-w-[200px]">
                                      {t.description || t.category}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                      <span>{t.category}</span>
                                      {t.isRecurring && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[9px]">
                                          Recurring
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-slate-300 font-mono text-[11px]">
                                {t.accountId?.name || <span className="text-slate-500 italic">Unlinked</span>}
                                {isTransfer && t.toAccountId && (
                                  <span className="text-slate-500 block text-[10px]">
                                    → {t.toAccountId.name}
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {t.date
                                  ? new Date(t.date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : '—'}
                              </td>

                              <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                                <span className={isIncome ? 'text-[#05DF85]' : 'text-white'}>
                                  {isIncome ? '+' : isExpense ? '-' : ''}
                                  {formatCurrency(t.amountPaise)}
                                </span>
                              </td>

                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTx(t._id);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 border-t border-white/[0.04] bg-[#0D1422]/30 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Showing {filteredTxs.length} of {transactions.length} records</span>
                    <span>Integer-paise arithmetic verified</span>
                  </div>
                </div>

                {/* Transaction Inspector / Details Drawer (4 cols) */}
                <div className="lg:col-span-4 rounded-2xl bg-[#080D16] border border-white/[0.08] p-5 space-y-5">
                  {selectedTx ? (
                    <>
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <div className="text-[11px] font-mono text-[#05DF85] font-bold">TRANSACTION INSPECTOR</div>
                        <span className="text-[10px] font-mono text-slate-500">ID: {selectedTx._id.slice(-6)}</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xl font-bold text-white">
                            {selectedTx.description || selectedTx.category}
                          </div>
                          <div className="text-2xl font-mono font-bold mt-1 text-[#05DF85]">
                            {selectedTx.type === 'income' ? '+' : selectedTx.type === 'expense' ? '-' : ''}
                            {formatCurrency(selectedTx.amountPaise)}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Type</span>
                            <span className="text-white uppercase font-bold">{selectedTx.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Category</span>
                            <span className="text-slate-200">{selectedTx.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Account</span>
                            <span className="text-slate-200">{selectedTx.accountId?.name || 'Unlinked Account'}</span>
                          </div>
                          {selectedTx.toAccountId && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Destination</span>
                              <span className="text-slate-200">{selectedTx.toAccountId.name}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-500">Timestamp</span>
                            <span className="text-slate-300">
                              {selectedTx.date ? new Date(selectedTx.date).toLocaleString('en-IN') : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => handleDeleteTx(selectedTx._id)}
                            className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Transaction</span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">
                      Select a transaction to inspect
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECURRING SCHEDULES (INCOME & EXPENSES) */}
        {activeMainTab === 'recurring' && (
          <div className="space-y-6">
            {/* Informational Banner */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>How Recurring Schedules Work</span>
              </div>
              <p className="leading-relaxed">
                Recurring schedules represent future scheduled income (such as monthly salary, rent received, or pensions) and repeating bills.
                Upcoming income is <strong>expected</strong> and is only recorded into your actual account balance when the scheduled due date arrives.
              </p>
            </div>

            {loading ? (
              <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
                <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-400">Loading recurring schedules...</p>
              </div>
            ) : recurrings.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No Recurring Schedules Set Up</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Set up your monthly salary, freelancing retainer, rental income, or repeating utility bills to have them automatically recorded when due.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setShowAddRecurringModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Recurring Schedule</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recurrings.map((rule) => {
                  const isIncome = rule.type === 'income';
                  const nextDue = new Date(rule.nextDueDate);

                  return (
                    <div
                      key={rule._id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        rule.isActive
                          ? 'bg-[#080D16] border-white/[0.08] hover:border-white/[0.2]'
                          : 'bg-[#080D16]/50 border-white/[0.04] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isIncome
                                ? 'bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {rule.description || (isIncome ? 'Recurring Income' : 'Recurring Expense')}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {rule.category} • <span className="capitalize">{rule.frequency}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            rule.isActive
                              ? 'bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-[#0D1422] border border-white/[0.04] text-xs font-mono">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-400 text-[11px]">Amount</span>
                          <span className={`font-bold text-sm ${isIncome ? 'text-[#05DF85]' : 'text-white'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(rule.amountPaise)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Account</span>
                          <span className="text-slate-300">{rule.accountId?.name || 'Unlinked'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Next Due Date</span>
                          <span className="text-white font-semibold">{nextDue.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {rule.lastGeneratedDate && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Last Recorded</span>
                            <span className="text-slate-400">{new Date(rule.lastGeneratedDate).toLocaleDateString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <button
                          onClick={() => handleToggleRecurring(rule._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            rule.isActive
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#05DF85] border border-emerald-500/20'
                          }`}
                        >
                          {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{rule.isActive ? 'Pause' : 'Resume'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRecurring(rule._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Record Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-[#05DF85]" />
                <span>Record New Transaction</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {[
                  { id: 'expense', label: 'Expense (-)' },
                  { id: 'income', label: 'Income (+)' },
                  { id: 'transfer', label: 'Transfer (⇄)' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: t.id })}
                    className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      txForm.type === t.id
                        ? 'bg-[#05DF85] text-slate-950 border-[#05DF85]'
                        : 'bg-[#0D1422] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Amount (₹ INR) <span className="text-[#05DF85]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 1500.00"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {txForm.type === 'transfer' ? 'Source Account' : 'Account (Optional)'}{' '}
                    {txForm.type === 'transfer' && <span className="text-[#05DF85]">*</span>}
                  </label>
                  <select
                    value={txForm.accountId}
                    onChange={(e) => setTxForm({ ...txForm, accountId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                  >
                    {txForm.type !== 'transfer' && (
                      <option value="">No specific account (Unlinked)</option>
                    )}
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({acc.type})
                      </option>
                    ))}
                  </select>
                </div>

                {txForm.type === 'transfer' ? (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Destination Account <span className="text-[#05DF85]">*</span>
                    </label>
                    <select
                      value={txForm.toAccountId}
                      onChange={(e) => setTxForm({ ...txForm, toAccountId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                    >
                      <option value="">Select Destination...</option>
                      {accounts
                        .filter((acc) => acc._id !== txForm.accountId)
                        .map((acc) => (
                          <option key={acc._id} value={acc._id}>
                            {acc.name} ({acc.type})
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={txForm.category}
                      onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                    >
                      {txForm.type === 'income' ? (
                        <>
                          <option value="Primary Salary">Primary Salary</option>
                          <option value="Consulting & Freelance">Consulting & Freelance</option>
                          <option value="Dividend & Yield">Dividend & Yield</option>
                          <option value="Rental Income">Rental Income</option>
                          <option value="Other Income">Other Income</option>
                        </>
                      ) : (
                        <>
                          <option value="Food & Dining">Food & Dining</option>
                          <option value="Housing & Rent">Housing & Rent</option>
                          <option value="Transport & Fuel">Transport & Fuel</option>
                          <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                          <option value="Shopping & Tech">Shopping & Tech</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="General Expense">General Expense</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Merchant</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, DMart, Rent payment, Client invoice"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Recurring Schedule */}
      {showAddRecurringModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#05DF85]" />
                <span>Create Recurring Schedule</span>
              </h3>
              <button onClick={() => setShowAddRecurringModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setRecurringForm({ ...recurringForm, type: 'income', category: 'Primary Salary' })}
                  className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                    recurringForm.type === 'income'
                      ? 'bg-[#05DF85] text-slate-950 border-[#05DF85]'
                      : 'bg-[#0D1422] text-slate-300 border-white/[0.08]'
                  }`}
                >
                  Recurring Income (+)
                </button>
                <button
                  type="button"
                  onClick={() => setRecurringForm({ ...recurringForm, type: 'expense', category: 'Housing & Rent' })}
                  className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                    recurringForm.type === 'expense'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[#0D1422] text-slate-300 border-white/[0.08]'
                  }`}
                >
                  Recurring Expense / Bill (-)
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Amount per occurrence (₹ INR) <span className="text-[#05DF85]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 75000.00"
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {recurringForm.type === 'income' ? 'Deposit Account (Optional)' : 'Debit Account (Optional)'}
                  </label>
                  <select
                    value={recurringForm.accountId}
                    onChange={(e) => setRecurringForm({ ...recurringForm, accountId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                  >
                    <option value="">No specific account (Unlinked)</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({acc.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                  <select
                    value={recurringForm.frequency}
                    onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                  >
                    <option value="monthly">Monthly (Recommended)</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                    <option value="quarterly">Quarterly (Every 3 months)</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Source / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Employer Salary, Rent Received"
                    value={recurringForm.description}
                    onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={recurringForm.category}
                    onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                  >
                    {recurringForm.type === 'income' ? (
                      <>
                        <option value="Primary Salary">Primary Salary</option>
                        <option value="Rental Income">Rental Income</option>
                        <option value="Consulting & Freelance">Consulting & Freelance</option>
                        <option value="Pension & Annuity">Pension & Annuity</option>
                        <option value="Dividend & Yield">Dividend & Yield</option>
                        <option value="Other Recurring Income">Other Recurring Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Housing & Rent">Housing & Rent</option>
                        <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                        <option value="Insurance Premium">Insurance Premium</option>
                        <option value="Loan EMI">Loan EMI</option>
                        <option value="General Bill">General Bill</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Next Due Date <span className="text-[#05DF85]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={recurringForm.nextDueDate}
                    onChange={(e) => setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={recurringForm.endDate}
                    onChange={(e) => setRecurringForm({ ...recurringForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddRecurringModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving Schedule...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
