import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  ReceiptText,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Building,
  Target,
  FileText,
  Scissors,
  Repeat,
  Paperclip,
  Ban,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  X
} from 'lucide-react';

export default function TransactionsPage() {
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxId, setSelectedTxId] = useState('tx-1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Transaction Form
  const [txForm, setTxForm] = useState({
    entity: '',
    category: 'Food & Dining',
    account: 'HDFC Regalia (••4912)',
    type: 'expense',
    amount: ''
  });

  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1',
      date: 'Oct 24, 2024 • 18:30:14 IST',
      entity: 'Apple India Store BKC',
      posRef: 'POS REF: APPL-MUM-994103 • C-C-AUTH',
      category: 'Electronics & Tech',
      account: 'HDFC Regalia (••4912)',
      amount: -75000.00,
      type: 'expense',
      splitGoal: 'MacBook M3 Pro Tech Sinking Fund',
      taxEligible: true,
      location: 'Bandra Kurla Complex, Mumbai, MH',
      gstin: '27AABCA1234F1Z9'
    },
    {
      id: 'tx-2',
      date: 'Oct 21, 2024 • 14:15:02 IST',
      entity: 'Tech Corp Solutions India',
      posRef: 'CMS/TECHCORP/SAL_OCT24/CMS49910',
      category: 'Primary Income',
      account: 'ICICI Salary (••8188)',
      amount: 165000.00,
      type: 'income'
    },
    {
      id: 'tx-3',
      date: 'Oct 18, 2024 • 11:20:49 IST',
      entity: 'Tata AIA Life Insurance',
      posRef: 'ACH DR / TATA-LIFE-ANNUAL-PRM / URN3981',
      category: 'Insurance & Protection',
      account: 'HDFC Salary (••4912)',
      amount: -8260.00,
      type: 'expense'
    },
    {
      id: 'tx-4',
      date: 'Oct 15, 2024 • 20:05:31 IST',
      entity: 'Swiggy Gourmet Reserve',
      posRef: 'UPI/SWIGGY/42881920/ORDER_MUMBAI',
      category: 'Food & Dining',
      account: 'HDFC Regalia (••4912)',
      amount: -1240.00,
      type: 'expense'
    },
    {
      id: 'tx-5',
      date: 'Oct 12, 2024 • 10:00:22 IST',
      entity: 'Self Transfer: HDFC to Zerodha',
      posRef: 'NEFT/ZERODHA-BROKING/HDFC00004912',
      category: 'Internal Transfer',
      account: 'HDFC Salary to Zerodha',
      amount: -25000.00,
      type: 'transfer'
    },
    {
      id: 'tx-6',
      date: 'Oct 10, 2024 • 19:48:11 IST',
      entity: 'Shell Mobility Flagship',
      posRef: 'POS/SHELL-BDR/AUTO-FUEL/TXN-88190',
      category: 'Transport & Fuel',
      account: 'HDFC Regalia (••4912)',
      amount: -2890.00,
      type: 'expense'
    },
    {
      id: 'tx-7',
      date: 'Oct 08, 2024 • 12:15:33 IST',
      entity: 'Zerodha Broking AMC Payout',
      posRef: 'ACH CR / DIVIDEND-ITC-Q2 / NSDL89100',
      category: 'Dividend & Yield',
      account: 'ICICI Direct Linked',
      amount: 4120.00,
      type: 'income'
    },
    {
      id: 'tx-8',
      date: 'Oct 04, 2024 • 09:30:19 IST',
      entity: 'ACT Fibernet Broadband',
      posRef: 'BBPS/BILLDESK/ACT-FIBER-MUMBAI-01',
      category: 'Utilities & Telecom',
      account: 'ICICI Bank (••8188)',
      amount: -1179.00,
      type: 'expense'
    },
    {
      id: 'tx-9',
      date: 'Oct 02, 2024 • 16:45:50 IST',
      entity: 'ATM Cash Withdrawal (SBI ATM)',
      posRef: 'NFS/SBI_ATM_ANDHERI_W/WDI_049811',
      category: 'Cash Vault Withdrawal',
      account: 'State Bank of India',
      amount: -5000.00,
      type: 'expense'
    }
  ]);

  const selectedTx = transactions.find((t) => t.id === selectedTxId) || transactions[0];

  const handleCreateTx = (e) => {
    e.preventDefault();
    if (!txForm.entity || !txForm.amount) return;

    const amt = parseFloat(txForm.amount);
    const newRecord = {
      id: `tx-${Date.now()}`,
      date: 'Just now',
      entity: txForm.entity,
      posRef: 'MANUAL ENTRY',
      category: txForm.category,
      account: txForm.account,
      amount: txForm.type === 'income' ? amt : -amt,
      type: txForm.type
    };

    setTransactions([newRecord, ...transactions]);
    setShowAddModal(false);
    setTxForm({ entity: '', category: 'Food & Dining', account: 'HDFC Regalia (••4912)', type: 'expense', amount: '' });
  };

  const filteredTxs = transactions.filter((t) => {
    const matchesSearch = t.entity.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTab === 'all') return matchesSearch;
    if (filterTab === 'expenses') return matchesSearch && t.type === 'expense';
    if (filterTab === 'inflows') return matchesSearch && t.type === 'income';
    if (filterTab === 'transfers') return matchesSearch && t.type === 'transfer';
    return matchesSearch;
  });

  const exportCSV = () => {
    const headers = 'ID,Date,Entity,Category,Account,Amount,Type\n';
    const rows = transactions.map((t) => `"${t.id}","${t.date}","${t.entity}","${t.category}","${t.account}",${t.amount},"${t.type}"`).join('\n');
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
              <span className="text-[#05DF85] font-semibold">LEDGER TELEMETRY</span>
              <span className="text-slate-600">//</span>
              <span>TRANSACTIONS & RECONCILIATION ENGINE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Financial Transactions Ledger
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Ledger [CSV]</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import CSV / Statement</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL VOLUME [OCT 2024]</div>
            <div className="text-2xl font-mono font-bold text-white">₹2,59,680<span className="text-base text-slate-400 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>{transactions.length} Ledger records</span>
              <span className="text-[#05DF85]">+14.2% vs Sep</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">INFLOWS / CREDITS</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">+₹1,85,000<span className="text-base text-emerald-300/60 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Salary & Capital Yields</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] font-bold">2 Inflows</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">OUTFLOWS / DEBITS</div>
            <div className="text-2xl font-mono font-bold text-white">-₹74,680<span className="text-base text-slate-400 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-rose-400">72% Burn</span>
              <span className="text-slate-500">Cap ₹1,03,700</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">AUTO-RECONCILED</div>
            <div className="text-2xl font-mono font-bold text-white">99.2%</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-[#05DF85]">62 Verified</span>
              <span className="text-slate-500">Paise Precision</span>
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
              placeholder="Search across transactions by description, merchant..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
            {[
              { id: 'all', label: `All (${transactions.length})` },
              { id: 'expenses', label: 'Expenses' },
              { id: 'inflows', label: 'Inflows' },
              { id: 'transfers', label: 'Transfers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
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

        {/* Main Grid: Transactions Table (8 cols) + Right Inspector Panels (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Transactions Table (8 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[#080D16] border border-white/[0.08] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-3.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-white/[0.06] bg-[#0D1422]/50">
              <span className="col-span-5">DATE & MERCHANT</span>
              <span className="col-span-4">CATEGORY / ACCOUNT</span>
              <span className="col-span-3 text-right">AMOUNT (INR)</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filteredTxs.map((tx) => {
                const isSelected = selectedTxId === tx.id;
                const isIncome = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxId(tx.id)}
                    className={`grid grid-cols-12 gap-2 p-3.5 items-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0D1422] border-l-2 border-l-[#05DF85]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Date & Merchant */}
                    <div className="col-span-5 min-w-0 pr-2">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <span>{tx.entity}</span>
                        {tx.splitGoal && (
                          <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/10 text-[#05DF85]">
                            Linked
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{tx.date}</div>
                    </div>

                    {/* Category / Account */}
                    <div className="col-span-4 min-w-0">
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08] truncate max-w-full">
                        {tx.category}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{tx.account}</div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-3 text-right font-mono font-bold text-xs">
                      <span className={isIncome ? 'text-[#05DF85]' : 'text-white'}>
                        {isIncome ? `+₹${tx.amount.toLocaleString('en-IN')}.00` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}.00`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Statement Parser Studio & Record Inspector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Statement Parser Studio Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#05DF85]" />
                  <h3 className="text-xs font-bold text-white">Statement Parser Studio</h3>
                </div>
                <span className="text-[10px] font-mono text-[#05DF85] font-bold">READY</span>
              </div>

              {/* Sample Uploaded File */}
              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-white truncate">HDFC_Oct2024_Statement.csv</div>
                    <div className="text-[10px] font-mono text-slate-500">348 KB • 48 valid rows parsed</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
              </div>

              {/* Smart Auto-mapping Items */}
              <div className="space-y-1 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between py-0.5">
                  <span>Transaction Date:</span>
                  <span className="text-white">Col A (DD/MM/YYYY)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Merchant / Narration:</span>
                  <span className="text-white">Col B (Description)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Withdrawal / Debit:</span>
                  <span className="text-white">Col D (INR - Outflow)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Deposit / Credit:</span>
                  <span className="text-white">Col E (INR - Inflow)</span>
                </div>
              </div>

              <button
                onClick={() => alert('Statement reconciled! 48 entries processed.')}
                className="w-full py-2.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.25)] flex items-center justify-center gap-1.5"
              >
                <span>Ingest & Reconcile Statement</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Record Inspector Card */}
            {selectedTx && (
              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ReceiptText className="w-3.5 h-3.5 text-[#05DF85]" />
                    <span>Record Inspector</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{selectedTx.id.toUpperCase()}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{selectedTx.entity}</h4>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    ₹{Math.abs(selectedTx.amount).toLocaleString('en-IN')}<span className="text-sm text-slate-400 font-normal">.00</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">{selectedTx.posRef}</div>
                </div>

                {/* Goal Linkage Section */}
                <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#05DF85]" />
                    <span>GOAL LINKAGE</span>
                  </div>
                  <div className="text-xs font-bold text-white">MacBook M3 Pro Tech Sinking Fund</div>
                  <div className="text-[10px] font-mono text-slate-400">Progress: ₹85,000 / ₹1,20,000 (71%)</div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-xs">
                  <button
                    onClick={() => alert('Split modal opened')}
                    className="p-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5 text-slate-400" />
                    <span>Split Tx</span>
                  </button>
                  <button
                    onClick={() => alert('Marked as recurring')}
                    className="p-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5 text-slate-400" />
                    <span>Make Recurring</span>
                  </button>
                  <button
                    onClick={() => alert('Receipt attachment opened')}
                    className="p-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attach Receipt</span>
                  </button>
                  <button
                    onClick={() => alert('Excluded from burn')}
                    className="p-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-400" />
                    <span>Exclude Burn</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#05DF85]" />
                <span>Record New Entry</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">TYPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'expense' })}
                    className={`py-2 rounded-lg font-bold transition-all ${txForm.type === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-[#0D1422] text-slate-400 border border-white/[0.08]'}`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'income' })}
                    className={`py-2 rounded-lg font-bold transition-all ${txForm.type === 'income' ? 'bg-emerald-500/20 text-[#05DF85] border border-emerald-500/40' : 'bg-[#0D1422] text-slate-400 border border-white/[0.08]'}`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">MERCHANT / ENTITY</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Gourmet"
                  value={txForm.entity}
                  onChange={(e) => setTxForm({ ...txForm, entity: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">AMOUNT (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1240"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">CATEGORY</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing & Rent">Housing & Rent</option>
                  <option value="Transport & Fuel">Transport & Fuel</option>
                  <option value="Utilities & Subscriptions">Utilities & Subscriptions</option>
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Primary Income">Primary Income</option>
                </select>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
