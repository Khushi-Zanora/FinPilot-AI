import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  Landmark,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  ArrowRight,
  Trash2,
  X,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form for creating real account
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'bank',
    currency: 'INR',
    openingBalance: '0.00',
    color: '#05DF85'
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/accounts');
      if (res.success && res.data?.accounts) {
        setAccounts(res.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.name.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const openingBalancePaise = Math.round(parseFloat(accountForm.openingBalance || '0') * 100);
      const payload = {
        name: accountForm.name.trim(),
        type: accountForm.type,
        currency: accountForm.currency || 'INR',
        openingBalancePaise: isNaN(openingBalancePaise) ? 0 : openingBalancePaise,
        color: accountForm.color || '#05DF85'
      };

      const res = await apiRequest('/accounts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowAddModal(false);
        setAccountForm({
          name: '',
          type: 'bank',
          currency: 'INR',
          openingBalance: '0.00',
          color: '#05DF85'
        });
        await loadAccounts();
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${name}"?`)) return;
    try {
      await apiRequest(`/accounts/${id}`, { method: 'DELETE' });
      await loadAccounts();
    } catch (err) {
      alert(`Error deleting account: ${err.message}`);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = (acc.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'bank') return matchesSearch && (acc.type === 'bank' || acc.type === 'cash' || acc.type === 'wallet');
    if (activeTab === 'credit') return matchesSearch && acc.type === 'credit_card';
    if (activeTab === 'investment') return matchesSearch && acc.type === 'investment';
    return matchesSearch;
  });

  // Derived real totals
  const totalLiquidCashPaise = accounts
    .filter((a) => a.type !== 'credit_card')
    .reduce((acc, a) => acc + (a.currentBalancePaise || 0), 0);

  const totalCreditDebtPaise = accounts
    .filter((a) => a.type === 'credit_card')
    .reduce((acc, a) => acc + Math.abs(a.currentBalancePaise || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">FINANCIAL VAULT</span>
              <span className="text-slate-600">//</span>
              <span>TRACKED ACCOUNTS & BALANCES</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Tracked Accounts & Vaults
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL TRACKED ACCOUNTS</div>
            <div className="text-2xl font-mono font-bold text-white">{accounts.length}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {accounts.length === 0 ? 'No accounts added' : 'User-maintained financial ledgers'}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">TOTAL LIQUID CASH</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">{formatCurrency(totalLiquidCashPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Sum of bank accounts, wallets, and cash
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">CREDIT CARD BALANCES</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalCreditDebtPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Total credit card liabilities
            </div>
          </div>
        </div>

        {/* Notice on Data Integrity */}
        <div className="p-3.5 rounded-xl bg-[#080D16] border border-white/[0.06] text-xs text-slate-400 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#05DF85] shrink-0" />
          <span>
            FinPilot calculates account balances using verified integer-paise arithmetic from your opening balances and recorded transactions.
          </span>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#080D16] border border-white/[0.08]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts by name..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
            {[
              { id: 'all', label: `All (${accounts.length})` },
              { id: 'bank', label: 'Bank & Cash' },
              { id: 'credit', label: 'Credit Cards' },
              { id: 'investment', label: 'Investments' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#05DF85] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-[#0D1422]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Accounts Tracked Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your primary bank accounts, savings accounts, credit cards, or cash vaults to begin tracking balances.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Account</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((acc) => {
              const isCredit = acc.type === 'credit_card';
              const balancePaise = acc.currentBalancePaise || acc.openingBalancePaise || 0;

              return (
                <div
                  key={acc._id}
                  className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-white/[0.15] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{acc.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">
                            {acc.type.replace('_', ' ')} • {acc.currency || 'INR'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAccount(acc._id, acc.name)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] font-mono uppercase text-slate-500">CURRENT TRACKED BALANCE</div>
                      <div className={`text-2xl font-mono font-bold ${isCredit ? 'text-rose-400' : 'text-white'}`}>
                        {formatCurrency(balancePaise)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Inflows: +{formatCurrency(acc.inflowsPaise || 0)}</span>
                    <span>Outflows: -{formatCurrency(acc.outflowsPaise || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#05DF85]" />
                <span>Add Financial Account</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Account Name <span className="text-[#05DF85]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary, ICICI Savings, Cash Wallet"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="wallet">Digital Wallet (UPI)</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="investment">Investment / Demat</option>
                    <option value="other">Other Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Currency</label>
                  <select
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Starting Balance (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={accountForm.openingBalance}
                  onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#05DF85]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  You can start with ₹0.00 or enter your current balance.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
