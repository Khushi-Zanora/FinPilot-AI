import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X
} from 'lucide-react';

export default function TransactionsPage() {
  const { isPremium } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  // Add Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formToAccountId, setFormToAccountId] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [typeFilter, accountFilter]);

  async function fetchAccounts() {
    try {
      const res = await apiRequest('/accounts');
      if (res.success) {
        setAccounts(res.data.accounts || []);
        if (res.data.accounts?.length > 0 && !formAccountId) {
          setFormAccountId(res.data.accounts[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }

  async function fetchTransactions(page = 1) {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) queryParams.append('search', search);
      if (typeFilter) queryParams.append('type', typeFilter);
      if (accountFilter) queryParams.append('accountId', accountFilter);

      const res = await apiRequest(`/transactions?${queryParams.toString()}`);
      if (res.success) {
        setTransactions(res.data.transactions || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTransaction(e) {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const amountPaise = Math.round(parseFloat(formAmount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid amount');
      }

      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: formType,
          amountPaise,
          accountId: formAccountId,
          toAccountId: formType === 'transfer' ? formToAccountId : null,
          category: formCategory,
          description: formDescription,
          date: new Date(formDate).toISOString()
        })
      });

      setIsModalOpen(false);
      setFormAmount('');
      setFormDescription('');
      fetchTransactions(1);
    } catch (err) {
      setModalError(err.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTransaction(id) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions(meta.page);
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    }
  }

  function handleExportCsv() {
    if (!isPremium) {
      alert('CSV Export with formula-injection protection is a FinPilot Premium feature. Please upgrade to Pro.');
      return;
    }
    window.open('/api/v1/reports/export/csv', '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transactions & Ledger</h1>
          <p className="text-sm text-slate-400">View and record all income, expenses, and account transfers</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTransactions(1);
          }}
          className="w-full md:w-80 relative"
        >
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase font-semibold text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.type === 'transfer'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {tx.type === 'income' && <ArrowDownLeft className="w-3 h-3" />}
                        {tx.type === 'expense' && <ArrowUpRight className="w-3 h-3" />}
                        {tx.type === 'transfer' && '⇄'}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {tx.accountId?.name}
                      {tx.type === 'transfer' && tx.toAccountId && (
                        <span className="text-cyan-400"> → {tx.toAccountId.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{tx.description || '-'}</td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-400'
                          : tx.type === 'transfer'
                          ? 'text-cyan-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄ ' : '-'}
                      {formatCurrency(tx.amountPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(tx._id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchTransactions(meta.page - 1)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchTransactions(meta.page + 1)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Record Transaction</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="space-y-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {['expense', 'income', 'transfer'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormType(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      formType === t
                        ? t === 'income'
                          ? 'bg-emerald-500 text-slate-950'
                          : t === 'transfer'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1500.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salary, Groceries, Rent, Dining"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {formType === 'transfer' ? 'From Account' : 'Account'}
                  </label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formType === 'transfer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">To Account</label>
                    <select
                      value={formToAccountId}
                      onChange={(e) => setFormToAccountId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select Account</option>
                      {accounts
                        .filter((a) => a._id !== formAccountId)
                        .map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Note</label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
