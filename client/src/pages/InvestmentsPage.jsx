import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  Building,
  Layers,
  Trash2,
  X
} from 'lucide-react';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [invForm, setInvForm] = useState({
    name: '',
    assetClass: 'mutual_fund',
    quantity: '1',
    buyPrice: '',
    currentPrice: '',
    notes: ''
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  async function loadInvestments() {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/investments');
      if (res.success) {
        const raw = res.data?.investments || res.data?.holdings || [];
        const mapped = raw.map((inv) => ({
          ...inv,
          assetClass: inv.assetClass || inv.assetType || 'mutual_fund',
          quantity: inv.quantity || inv.units || 1,
          buyPricePaise: inv.buyPricePaise || inv.averageBuyPricePaise || 0,
          currentPricePaise: inv.currentPricePaise || inv.currentNavPricePaise || inv.buyPricePaise || inv.averageBuyPricePaise || 0
        }));
        setInvestments(mapped);
      } else {
        setInvestments([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load investments.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateInvestment = async (e) => {
    e.preventDefault();
    if (!invForm.name || !invForm.buyPrice) return;

    setSubmitting(true);
    setError('');

    try {
      const qty = parseFloat(invForm.quantity || '1');
      const buyPricePaise = Math.round(parseFloat(invForm.buyPrice) * 100);
      const currentPricePaise = invForm.currentPrice
        ? Math.round(parseFloat(invForm.currentPrice) * 100)
        : buyPricePaise;

      const res = await apiRequest('/investments', {
        method: 'POST',
        body: JSON.stringify({
          name: invForm.name.trim(),
          assetClass: invForm.assetClass,
          quantity: qty,
          buyPricePaise,
          currentPricePaise,
          notes: invForm.notes
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setInvForm({
          name: '',
          assetClass: 'mutual_fund',
          quantity: '1',
          buyPrice: '',
          currentPrice: '',
          notes: ''
        });
        await loadInvestments();
      }
    } catch (err) {
      setError(err.message || 'Failed to create investment record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvestment = async (id, name) => {
    if (!window.confirm(`Delete investment record "${name}"?`)) return;
    try {
      await apiRequest(`/investments/${id}`, { method: 'DELETE' });
      await loadInvestments();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch = (inv.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'mf') return matchesSearch && inv.assetClass === 'mutual_fund';
    if (activeTab === 'equity') return matchesSearch && inv.assetClass === 'equity';
    if (activeTab === 'debt') return matchesSearch && (inv.assetClass === 'debt' || inv.assetClass === 'gold');
    return matchesSearch;
  });

  // Calculate real metrics
  const totalInvestedPaise = investments.reduce(
    (acc, inv) => acc + (inv.buyPricePaise || 0) * (inv.quantity || 1),
    0
  );
  const totalCurrentPaise = investments.reduce(
    (acc, inv) => acc + (inv.currentPricePaise || inv.buyPricePaise || 0) * (inv.quantity || 1),
    0
  );
  const totalPnlPaise = totalCurrentPaise - totalInvestedPaise;
  const pnlPercent = totalInvestedPaise > 0 ? ((totalPnlPaise / totalInvestedPaise) * 100).toFixed(1) : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">ASSET ALLOCATION</span>
              <span className="text-slate-600">//</span>
              <span>INVESTMENTS & PORTFOLIO</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Investments & Capital Assets
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Investment</span>
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
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL INVESTED CAPITAL</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalInvestedPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {investments.length} recorded assets
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">CURRENT PORTFOLIO VALUE</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">{formatCurrency(totalCurrentPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Based on recorded unit prices
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">UNREALIZED PROFIT / LOSS</div>
            <div className={`text-2xl font-mono font-bold ${totalPnlPaise >= 0 ? 'text-[#05DF85]' : 'text-rose-400'}`}>
              {totalPnlPaise >= 0 ? '+' : ''}{formatCurrency(totalPnlPaise)} ({pnlPercent}%)
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Manual entries • Not verified live broker feed
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#080D16] border border-white/[0.08]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search investments by name..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
            {[
              { id: 'all', label: `All (${investments.length})` },
              { id: 'mf', label: 'Mutual Funds' },
              { id: 'equity', label: 'Stocks & Equity' },
              { id: 'debt', label: 'Debt & Gold' }
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

        {/* Content */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading investment records...</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Investments Recorded Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your mutual fund SIPs, stocks, sovereign gold bonds, fixed deposits, or crypto assets to track capital allocation.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Investment</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#080D16] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0D1422]/50 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="p-3.5 pl-4">Asset Name</th>
                    <th className="p-3.5">Class</th>
                    <th className="p-3.5">Units / Qty</th>
                    <th className="p-3.5">Avg Buy Price</th>
                    <th className="p-3.5">Current Value</th>
                    <th className="p-3.5">Gain / Loss</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInvestments.map((inv) => {
                    const totalCost = (inv.buyPricePaise || 0) * (inv.quantity || 1);
                    const totalVal = (inv.currentPricePaise || inv.buyPricePaise || 0) * (inv.quantity || 1);
                    const pnl = totalVal - totalCost;

                    return (
                      <tr key={inv._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 pl-4 font-semibold text-white">
                          <div>{inv.name}</div>
                          {inv.notes && <div className="text-[10px] text-slate-500 font-normal">{inv.notes}</div>}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] uppercase text-slate-400">
                          {inv.assetClass.replace('_', ' ')}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{inv.quantity || 1}</td>
                        <td className="p-3.5 font-mono text-slate-300">{formatCurrency(inv.buyPricePaise)}</td>
                        <td className="p-3.5 font-mono font-bold text-white">{formatCurrency(totalVal)}</td>
                        <td className={`p-3.5 font-mono font-bold ${pnl >= 0 ? 'text-[#05DF85]' : 'text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <button
                            onClick={() => handleDeleteInvestment(inv._id, inv.name)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Delete investment"
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
          </div>
        )}
      </div>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#05DF85]" />
                <span>Add Investment Asset</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateInvestment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parag Parikh Flexi Cap Fund, Reliance Industries"
                  value={invForm.name}
                  onChange={(e) => setInvForm({ ...invForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Asset Class</label>
                  <select
                    value={invForm.assetClass}
                    onChange={(e) => setInvForm({ ...invForm, assetClass: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="mutual_fund">Mutual Fund (SIP)</option>
                    <option value="equity">Stock / Equity</option>
                    <option value="etf">ETF</option>
                    <option value="debt">Fixed Deposit / Debt</option>
                    <option value="gold">Gold / SGB</option>
                    <option value="crypto">Crypto</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="other">Other Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantity / Units</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={invForm.quantity}
                    onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Avg Buy Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 1500.00"
                    value={invForm.buyPrice}
                    onChange={(e) => setInvForm({ ...invForm, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Current Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Same as buy price if empty"
                    value={invForm.currentPrice}
                    onChange={(e) => setInvForm({ ...invForm, currentPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Zerodha demat, Monthly SIP"
                  value={invForm.notes}
                  onChange={(e) => setInvForm({ ...invForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                />
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
                  {submitting ? 'Adding...' : 'Save Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
