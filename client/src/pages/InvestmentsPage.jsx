import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { TrendingUp, Plus, PieChart, AlertCircle, Trash2, X } from 'lucide-react';

export default function InvestmentsPage() {
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Holding Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetType, setAssetType] = useState('mutual_fund');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [units, setUnits] = useState('1');
  const [buyPrice, setBuyPrice] = useState('');
  const [navPrice, setNavPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchInvestments();
  }, []);

  async function fetchInvestments() {
    try {
      setLoading(true);
      const res = await apiRequest('/investments');
      if (res.success) {
        setHoldings(res.data.holdings || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHolding(e) {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const averageBuyPricePaise = Math.round(parseFloat(buyPrice) * 100);
      const currentNavPricePaise = navPrice ? Math.round(parseFloat(navPrice) * 100) : null;

      await apiRequest('/investments', {
        method: 'POST',
        body: JSON.stringify({
          assetType,
          name,
          symbol,
          units: parseFloat(units),
          averageBuyPricePaise,
          currentNavPricePaise
        })
      });

      setIsModalOpen(false);
      setName('');
      setBuyPrice('');
      setNavPrice('');
      fetchInvestments();
    } catch (err) {
      setModalError(err.message || 'Failed to add holding');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteHolding(id) {
    if (!window.confirm('Delete this investment holding?')) return;
    try {
      await apiRequest(`/investments/${id}`, { method: 'DELETE' });
      fetchInvestments();
    } catch (err) {
      alert(err.message || 'Failed to delete holding');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Investment Portfolio</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Track asset allocations across mutual funds, equities, fixed deposits, and gold
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holding</span>
        </button>
      </div>

      {/* Portfolio Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Invested (Cost Basis)
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalInvestedPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Valuation
            </span>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(summary.totalCurrentValuationPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Unrealized Gain / Loss
            </span>
            <div
              className={`text-2xl font-black ${
                summary.unrealizedGainLossPaise >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {summary.unrealizedGainLossPaise >= 0 ? '+' : ''}
              {formatCurrency(summary.unrealizedGainLossPaise)}
            </div>
          </div>
        </div>
      )}

      {/* Asset Allocation Breakdown Strip */}
      {summary?.assetAllocation?.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Asset Allocation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.assetAllocation.map((alloc) => (
              <div key={alloc.assetType} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 capitalize block mb-1">
                  {alloc.assetType.replace('_', ' ')}
                </span>
                <div className="text-base font-bold text-white">{alloc.percentage}%</div>
                <div className="text-xs text-slate-500">{formatCurrency(alloc.totalPaise)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No investment holdings tracked yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase font-semibold text-slate-400">
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Avg Buy Price</th>
                  <th className="py-3 px-4 text-right">Current Valuation</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {holdings.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-white">
                      {h.name}
                      {h.symbol && <span className="text-xs text-slate-400 ml-1.5">({h.symbol})</span>}
                    </td>
                    <td className="py-3 px-4 text-xs capitalize text-slate-400">{h.assetType.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-right font-medium">{h.units}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatCurrency(h.averageBuyPricePaise)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(h.currentValuationPaise || h.totalInvestedPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteHolding(h._id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
        <span>Valuations are based on user-entered transaction records and manual NAVs. Live feed adapter ready for provider connection.</span>
      </div>

      {/* Add Holding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Investment Holding</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddHolding} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Category</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="equity_stock">Direct Equity / Stock</option>
                  <option value="etf">Index ETF</option>
                  <option value="fixed_deposit">Fixed Deposit (FD)</option>
                  <option value="recurring_deposit">Recurring Deposit (RD)</option>
                  <option value="gold_sgb">Sovereign Gold Bond (SGB)</option>
                  <option value="govt_securities">Government Securities (G-Sec)</option>
                  <option value="other">Other Asset</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parag Parikh Flexi Cap Fund, Nifty 50 ETF"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Units / Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="100"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avg Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50.00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current NAV / Valuation Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional current price"
                  value={navPrice}
                  onChange={(e) => setNavPrice(e.target.value)}
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
                  {submitting ? 'Saving...' : 'Add Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
