import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  Building2,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Plus,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Lock,
  Wallet,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';

export default function AccountsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingMode, setTrackingMode] = useState('automated');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for adding custom account/vault
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'savings',
    institution: 'HDFC Bank',
    balance: '',
    accountNumber: ''
  });

  const [accounts, setAccounts] = useState([
    {
      id: 'acc-1',
      name: 'HDFC Bank',
      sub: 'Salary A/c ••4912',
      type: 'savings',
      category: 'salary',
      balance: 324150.00,
      status: 'Linked',
      syncTime: 'Auto-synced 4m ago',
      consentId: 'FIP-HDFC-991',
      icon: 'H'
    },
    {
      id: 'acc-2',
      name: 'ICICI Bank',
      sub: 'Coral CC ••0188',
      type: 'credit',
      category: 'credit',
      balance: -14200.00,
      status: 'Linked',
      dueDate: 'Due in 12 days',
      icon: 'I'
    },
    {
      id: 'acc-3',
      name: 'State Bank of India',
      sub: 'Savings / PPF / FD',
      type: 'savings',
      category: 'savings',
      status: 'Unlinked',
      desc: 'Connect savings and public provident fund accounts.',
      icon: 'S'
    },
    {
      id: 'acc-4',
      name: 'Axis Bank',
      sub: 'Burgundy / Salary',
      type: 'savings',
      category: 'salary',
      status: 'Unlinked',
      desc: 'Retrieve savings balance and credit card transactions.',
      icon: 'A'
    },
    {
      id: 'acc-5',
      name: 'Kotak Bank',
      sub: '811 / Savings',
      type: 'savings',
      category: 'savings',
      status: 'Unlinked',
      desc: 'Monitor savings balance and recurring fixed deposits.',
      icon: 'K'
    },
    {
      id: 'acc-6',
      name: 'Zerodha Kite',
      sub: 'CDSL Demat & MF',
      type: 'investment',
      category: 'demat',
      status: 'Unlinked',
      desc: 'Track consolidated equity portfolio and mutual funds.',
      icon: 'Z'
    },
    {
      id: 'acc-7',
      name: 'Groww / CAS Portfolio',
      sub: 'CAMS / KFintech CAS',
      type: 'investment',
      category: 'demat',
      status: 'Unlinked',
      desc: 'Import Consolidated Account Statement (CAS) for exact mutual fund NAVs.',
      icon: 'G'
    },
    {
      id: 'acc-8',
      name: 'Custom Cash Vault',
      sub: 'Cash / Gold / Physical Assets',
      type: 'custom',
      category: 'wallets',
      status: 'Manual',
      desc: 'Manually register physical cash, sovereign gold bonds (SGB), or private assets.',
      icon: 'V'
    }
  ]);

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.balance) return;

    const newAcc = {
      id: `acc-${Date.now()}`,
      name: accountForm.name,
      sub: `${accountForm.type.toUpperCase()} ••${accountForm.accountNumber.slice(-4) || '0000'}`,
      type: accountForm.type,
      category: accountForm.type === 'credit' ? 'credit' : 'savings',
      balance: parseFloat(accountForm.balance),
      status: 'Linked',
      syncTime: 'Manually verified',
      icon: accountForm.name.charAt(0).toUpperCase()
    };

    setAccounts([...accounts, newAcc]);
    setShowAddModal(false);
    setAccountForm({ name: '', type: 'savings', institution: 'HDFC Bank', balance: '', accountNumber: '' });
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || acc.sub.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'salary') return matchesSearch && (acc.category === 'salary' || acc.category === 'savings');
    if (activeTab === 'credit') return matchesSearch && acc.category === 'credit';
    if (activeTab === 'demat') return matchesSearch && acc.category === 'demat';
    if (activeTab === 'wallets') return matchesSearch && acc.category === 'wallets';
    return matchesSearch;
  });

  const linkedAccounts = accounts.filter((a) => a.status === 'Linked');
  const totalTrackedNet = linkedAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => navigate('/workspace/transactions')} />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Title Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">MULTI-ACCOUNT LEDGER</span>
              <span className="text-slate-600">•</span>
              <span>PAISE-PRECISION TRACKING</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Connect financial accounts or choose tracking mode
            </h1>
            <p className="text-xs text-slate-400">
              Track balances and transactions across accounts via automated sync or privacy-first manual/CSV statement mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Account</span>
            </button>
          </div>
        </div>

        {/* Tracking Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mode 1: Automated Sync */}
          <div
            onClick={() => setTrackingMode('automated')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              trackingMode === 'automated'
                ? 'bg-[#080D16] border-[#05DF85] shadow-[0_0_20px_rgba(5,223,133,0.1)]'
                : 'bg-[#080D16]/60 border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85]">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Automated Account Sync</div>
                    <div className="text-[10px] font-mono text-[#05DF85]">Tokenized Read-Only Ledger</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-[#05DF85]">
                  RECOMMENDED
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Direct read-only pipeline for multi-account consolidated telemetry and automated balance refreshes.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Real-time net safe cash</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Categorized spending detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Daily balance reconciliation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Encrypted session tokens</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#05DF85] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Zero Passwords / PINs Retained
              </span>
              <span className="text-slate-400">ACTIVE MODE</span>
            </div>
          </div>

          {/* Mode 2: Manual & CSV Mode */}
          <div
            onClick={() => setTrackingMode('manual')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              trackingMode === 'manual'
                ? 'bg-[#080D16] border-[#05DF85] shadow-[0_0_20px_rgba(5,223,133,0.1)]'
                : 'bg-[#080D16]/60 border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Manual & CSV Ledger Mode</div>
                    <div className="text-[10px] font-mono text-cyan-400">Offline & Air-Gapped</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Purely manual bookkeeping. Import bank statements periodically via CSV or maintain manual expense vaults.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Zero third-party network sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Custom Excel / CSV parsers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Local storage support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Full control over records</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Supports HDFC, ICICI, SBI, Axis CSVs</span>
              <span>Select Mode</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across banks, demat, credit cards, or cash vaults..."
              className="w-full pl-9 pr-3 py-2 bg-[#080D16] border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono overflow-x-auto">
            {[
              { id: 'all', label: `All Accounts (${accounts.length})` },
              { id: 'salary', label: 'Salary & Savings' },
              { id: 'credit', label: 'Credit Cards' },
              { id: 'demat', label: 'Brokers & Demat' },
              { id: 'wallets', label: 'Cash & Vaults' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Institution Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAccounts.map((acc) => {
            const isLinked = acc.status === 'Linked';
            return (
              <div
                key={acc.id}
                className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isLinked ? 'bg-emerald-500/20 text-[#05DF85]' : 'bg-white/[0.05] text-slate-300'}`}>
                        {acc.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">{acc.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">{acc.sub}</div>
                      </div>
                    </div>

                    {isLinked ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                        ● Linked
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Available</span>
                    )}
                  </div>

                  {isLinked ? (
                    <div className="my-3 space-y-0.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400">
                        {acc.type === 'credit' ? 'CURRENT OUTSTANDING' : 'LIVE LEDGER BALANCE'}
                      </div>
                      <div className="text-xl font-mono font-bold text-white">
                        ₹{Math.abs(acc.balance).toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal">.00</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#05DF85] pt-0.5">
                        {acc.syncTime || acc.dueDate}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 my-3 leading-relaxed min-h-[48px]">
                      {acc.desc}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.04]">
                  {isLinked ? (
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{acc.consentId || 'Verified'}</span>
                      <button
                        onClick={() => navigate('/workspace/transactions')}
                        className="text-[#05DF85] hover:underline font-semibold"
                      >
                        View Ledger →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                        setAccountForm({ ...accountForm, name: acc.name });
                      }}
                      className="w-full py-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Connect Account</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Read-Only Security Note */}
        <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#05DF85]" />
            <span>Read-only telemetry connection. FinPilot can never execute transfers or withdraw funds.</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Total Net Tracked: <strong className="text-white">₹{totalTrackedNet.toLocaleString('en-IN')}.00</strong>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#05DF85]" />
                <span>Link Financial Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">ACCOUNT NAME / INSTITUTION</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">ACCOUNT TYPE</label>
                <select
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="savings">Savings Account</option>
                  <option value="salary">Salary Account</option>
                  <option value="credit">Credit Card</option>
                  <option value="investment">Demat / Mutual Fund</option>
                  <option value="custom">Physical Cash Vault</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">CURRENT BALANCE (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">ACCOUNT NUMBER / MASK (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. 4912"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
