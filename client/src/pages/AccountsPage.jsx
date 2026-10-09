import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { Plus, Wallet, Building2, CreditCard, Banknote, Trash2, X, AlertCircle } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Account Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [color, setColor] = useState('#10b981');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const res = await apiRequest('/accounts');
      if (res.success) {
        setAccounts(res.data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAccount(e) {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const openingBalancePaise = Math.round(parseFloat(openingBalance || '0') * 100);

      await apiRequest('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          openingBalancePaise,
          color
        })
      });

      setIsModalOpen(false);
      setName('');
      setOpeningBalance('0');
      fetchAccounts();
    } catch (err) {
      setModalError(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAccount(id) {
    if (!window.confirm('Are you sure? If this account has transactions, it will be safely archived.')) return;
    try {
      const res = await apiRequest(`/accounts/${id}`, { method: 'DELETE' });
      alert(res.message);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Accounts Management</h1>
          <p className="text-sm text-slate-400">Track liquid cash, bank balances, and wallets with derived ledger totals</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Accounts Configured</h3>
          <p className="text-sm max-w-sm mx-auto mb-6">
            Add your primary bank account or cash wallet to start tracking balances and cash flows.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            Create Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc._id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color || '#10b981' }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                      {acc.type === 'bank' && <Building2 className="w-5 h-5 text-emerald-400" />}
                      {acc.type === 'cash' && <Banknote className="w-5 h-5 text-cyan-400" />}
                      {acc.type === 'credit_card' && <CreditCard className="w-5 h-5 text-amber-400" />}
                      {['wallet', 'investment', 'other'].includes(acc.type) && <Wallet className="w-5 h-5 text-indigo-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{acc.name}</h3>
                      <span className="text-xs text-slate-400 capitalize">{acc.type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAccount(acc._id)}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-slate-400 block mb-1">Computed Balance</span>
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(acc.currentBalancePaise)}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Inflows: <strong className="text-emerald-400">{formatCurrency(acc.inflowsPaise)}</strong></span>
                <span>Outflows: <strong className="text-rose-400">{formatCurrency(acc.outflowsPaise)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary, SBI Savings, Cash Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="wallet">Digital Wallet (Paytm / GPay)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="investment">Investment Account</option>
                  <option value="other">Other Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
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
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
