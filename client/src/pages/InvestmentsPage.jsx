import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
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
  X
} from 'lucide-react';

export default function InvestmentsPage() {
  const [activeRange, setActiveRange] = useState('1Y');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [taxHarvested, setTaxHarvested] = useState(false);

  const [holdings, setHoldings] = useState([
    {
      id: 'h-1',
      name: 'Reliance Industries',
      ticker: 'RELIANCE.NS',
      tag: 'Large Cap Energy',
      class: 'Equity',
      category: 'stocks',
      qty: 250,
      avgPrice: 2300.00,
      ltp: 2745.50,
      dayChange: '+1.20%',
      currentValue: 686375.00,
      pnl: '+₹1,11,375.00 (+19.37%)'
    },
    {
      id: 'h-2',
      name: 'Parag Parikh Flexi Cap Fund',
      ticker: 'DIRECT GROWTH',
      tag: 'SIP ₹25k/mo',
      class: 'Mutual Fund',
      category: 'mf',
      qty: 14210.38,
      avgPrice: 48.50,
      ltp: 76.84,
      dayChange: '+0.48%',
      currentValue: 1091896.00,
      pnl: '+₹4,02,896.00 (+58.43%)'
    },
    {
      id: 'h-3',
      name: 'Infosys Limited',
      ticker: 'INFY.NS',
      tag: 'IT Services Large Cap',
      class: 'Equity',
      category: 'stocks',
      qty: 400,
      avgPrice: 1420.00,
      ltp: 1865.20,
      dayChange: '-0.30%',
      currentValue: 746080.00,
      pnl: '+₹1,78,080.00 (+31.35%)'
    },
    {
      id: 'h-4',
      name: 'HDFC Bank Limited',
      ticker: 'HDFCBANK.NS',
      tag: 'Private Banking',
      class: 'Equity',
      category: 'stocks',
      qty: 300,
      avgPrice: 1510.00,
      ltp: 1682.00,
      dayChange: '+0.80%',
      currentValue: 504600.00,
      pnl: '+₹51,600.00 (+11.39%)'
    },
    {
      id: 'h-5',
      name: 'Vanguard Total Stock Market ETF',
      ticker: 'VTI (NYSE)',
      tag: 'via DriveWealth / Vested',
      class: 'US Stocks',
      category: 'us',
      qty: 22,
      avgPrice: 215.00,
      ltp: 282.40,
      dayChange: '+0.75%',
      currentValue: 518940.00,
      pnl: '+₹1,23,940.00 (+31.35%)'
    },
    {
      id: 'h-6',
      name: 'Sovereign Gold Bond 2028-VI',
      ticker: 'SGBOCT28',
      tag: '2.5% Tax-Free Coupon',
      class: 'Gold Bond',
      category: 'gold',
      qty: 45,
      avgPrice: 5120.00,
      ltp: 7140.00,
      dayChange: '+0.35%',
      currentValue: 321300.00,
      pnl: '+₹90,900.00 (+39.45%)'
    },
    {
      id: 'h-7',
      name: 'Nippon India Small Cap Fund',
      ticker: 'DIRECT GROWTH',
      tag: 'SIP ₹10k/mo',
      class: 'Mutual Fund',
      category: 'mf',
      qty: 3120,
      avgPrice: 92.00,
      ltp: 154.20,
      dayChange: '+1.80%',
      currentValue: 481104.00,
      pnl: '+₹1,94,064.00 (+67.61%)'
    }
  ]);

  const [newHolding, setNewHolding] = useState({ name: '', class: 'Equity', qty: '', avgPrice: '', ltp: '' });

  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!newHolding.name || !newHolding.qty || !newHolding.avgPrice) return;
    const q = parseFloat(newHolding.qty);
    const avg = parseFloat(newHolding.avgPrice);
    const currLtp = parseFloat(newHolding.ltp) || avg;
    const holdingObj = {
      id: `h-${Date.now()}`,
      name: newHolding.name,
      ticker: 'CUSTOM',
      tag: 'User Entry',
      class: newHolding.class,
      category: newHolding.class === 'Mutual Fund' ? 'mf' : 'stocks',
      qty: q,
      avgPrice: avg,
      ltp: currLtp,
      dayChange: '0.00%',
      currentValue: q * currLtp,
      pnl: `+₹${((q * currLtp) - (q * avg)).toFixed(2)}`
    };
    setHoldings([...holdings, holdingObj]);
    setShowAddModal(false);
    setNewHolding({ name: '', class: 'Equity', qty: '', avgPrice: '', ltp: '' });
  };

  const filteredHoldings = holdings.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.class.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'stocks') return matchesSearch && h.category === 'stocks';
    if (activeTab === 'mf') return matchesSearch && h.category === 'mf';
    if (activeTab === 'us') return matchesSearch && h.category === 'us';
    if (activeTab === 'gold') return matchesSearch && h.category === 'gold';
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">CAPITAL APPRECIATION TELEMETRY</span>
              <span className="text-slate-600">//</span>
              <span>BROKER & CAS AGGREGATOR</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Investments & Portfolio
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono">
              {['1D', '1W', '1M', '6M', '1Y', '3Y', 'MAX'].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeRange === r ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Deploy Capital</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL PORTFOLIO VALUE</div>
            <div className="text-2xl font-mono font-bold text-white">₹58,42,850<span className="text-base text-slate-400 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Invested: ₹41,20,000</span>
              <span className="text-[#05DF85] font-bold">+₹17,22,850 (+41.82%)</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>PORTFOLIO XIRR / CAGR</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">ALPHA +7.19%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">21.84%</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>vs Nifty 50: 14.65%</span>
              <span className="text-[#05DF85] font-bold">Exceptional</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">P&L STRATIFICATION [FY 24-25]</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">+₹14,92,350<span className="text-base text-emerald-300/60 font-normal">.00</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Unrealized paper gain</span>
              <span className="text-slate-400">LTCG: ₹2,38,500</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">SYSTEMATIC FLOW & YIELD</div>
            <div className="text-2xl font-mono font-bold text-white">₹85,000<span className="text-base text-slate-400 font-normal"> / mo</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>7 Active Monthly SIPs</span>
              <span className="text-cyan-400">Dividends: ₹42.8k/yr</span>
            </div>
          </div>
        </div>

        {/* Alpha Trajectory & Asset Allocation Bar */}
        <div className="p-6 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Portfolio Alpha & Growth Trajectory</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                  All-time High: ₹59.10L
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time NAV vs Nifty 50 TRI benchmark comparison</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#05DF85]"></span>FinPilot Portfolio +41.82%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>Nifty 50 TRI +22.40%</span>
            </div>
          </div>

          {/* Sparkline curve vector */}
          <div className="h-32 flex items-end">
            <svg className="w-full h-28" viewBox="0 0 800 120" fill="none">
              {/* Benchmark curve */}
              <path d="M0 100 Q 200 85, 400 70 T 800 50" stroke="#22D3EE" strokeWidth="2" strokeDasharray="4 4" fill="none" />
              {/* Alpha portfolio curve */}
              <path d="M0 110 Q 200 80, 400 45 T 800 15" stroke="#05DF85" strokeWidth="3" fill="none" />
              <circle cx="800" cy="15" r="5" fill="#05DF85" />
            </svg>
          </div>

          {/* Asset Allocation Matrix Bar */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase">ASSET ALLOCATION MATRIX</span>
              <span className="text-white font-bold">Total: ₹58,42,850</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
              <div className="bg-[#05DF85] h-full w-[52.4%]" title="Direct Equity 52.4%"></div>
              <div className="bg-emerald-400 h-full w-[28.2%]" title="Mutual Funds 28.2%"></div>
              <div className="bg-cyan-400 h-full w-[9.8%]" title="US Stocks 9.8%"></div>
              <div className="bg-amber-400 h-full w-[5.5%]" title="Gold 5.5%"></div>
              <div className="bg-purple-400 h-full w-[4.1%]" title="Debt 4.1%"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-slate-400 pt-1">
              <div><span className="text-white font-semibold block">• Direct Equity (52.4%)</span><span>₹30.62L</span></div>
              <div><span className="text-white font-semibold block">• Mutual Funds (28.2%)</span><span>₹16.48L</span></div>
              <div><span className="text-white font-semibold block">• US Equities (9.8%)</span><span>₹5.72L</span></div>
              <div><span className="text-white font-semibold block">• Gold SGB (5.5%)</span><span>₹3.21L</span></div>
              <div><span className="text-white font-semibold block">• Debt & Cash (4.1%)</span><span>₹2.40L</span></div>
            </div>
          </div>
        </div>

        {/* Main Grid: Holdings Table (8 cols) + Right Alpha Copilot (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Holdings Table (8 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[#080D16] border border-white/[0.08] overflow-hidden space-y-2">
            {/* Filter Tabs & Search */}
            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                {[
                  { id: 'all', label: `All Holdings (${holdings.length})` },
                  { id: 'stocks', label: 'Stocks' },
                  { id: 'mf', label: 'Mutual Funds' },
                  { id: 'us', label: 'US Global' },
                  { id: 'gold', label: 'Gold SGB' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                      activeTab === tab.id ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-[#0D1422]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter ticker or asset..."
                  className="pl-8 pr-3 py-1.5 bg-[#0D1422] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85]"
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-[#0D1422]/50">
              <span className="col-span-5">INSTRUMENT / ASSET</span>
              <span className="col-span-2">CLASS</span>
              <span className="col-span-2">QTY & AVG</span>
              <span className="col-span-3 text-right">CURRENT VALUE & P&L</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filteredHoldings.map((h) => (
                <div key={h.id} className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-white/[0.02] transition-colors">
                  {/* Instrument */}
                  <div className="col-span-5 min-w-0 pr-2">
                    <div className="text-xs font-bold text-white truncate">{h.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                      <span className="text-[#05DF85]">{h.ticker}</span> • {h.tag}
                    </div>
                  </div>

                  {/* Class */}
                  <div className="col-span-2">
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                      {h.class}
                    </span>
                  </div>

                  {/* Qty & Avg */}
                  <div className="col-span-2 font-mono text-xs">
                    <div className="text-white">{h.qty.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-500">@ ₹{h.avgPrice.toLocaleString('en-IN')}</div>
                  </div>

                  {/* Current Value & P&L */}
                  <div className="col-span-3 text-right font-mono text-xs">
                    <div className="font-bold text-white">₹{h.currentValue.toLocaleString('en-IN')}.00</div>
                    <div className="text-[10px] text-[#05DF85]">{h.pnl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Alpha Copilot & Upcoming Cashflows (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Alpha Copilot Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#05DF85]" />
                  <h3 className="text-xs font-bold text-white">Alpha Copilot Insights</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">2 INSIGHTS</span>
              </div>

              {/* Insight 1: Sector Concentration */}
              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span>IT Concentration Alert (27.4%)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Infosys & US Tech exposure exceeds your 20% sector allocation guideline. Consider trimming or pausing tech SIPs to rebalance into FMCG/Pharma.
                </p>
              </div>

              {/* Insight 2: Tax Harvesting Opportunity */}
              <div className="p-3 rounded-lg bg-[#0D1422] border border-emerald-500/20 text-xs space-y-1">
                <div className="font-bold text-[#05DF85]">Tax Harvesting Opportunity</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ₹42,500 of LTCG can be offset against underperforming mid-cap lots before March 31, saving <strong>₹5,310</strong> in tax liabilities.
                </p>
                <button
                  onClick={() => setTaxHarvested(true)}
                  className="mt-2 w-full py-1.5 rounded-md bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs"
                >
                  {taxHarvested ? 'Tax Harvesting Plan Generated ✓' : 'Execute 1-Click Tax Harvest Plan'}
                </button>
              </div>
            </div>

            {/* Upcoming Cash Flows Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Upcoming Cash Flows</h3>
                <span className="text-[10px] font-mono text-slate-500">NEXT 30 DAYS</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Parag Parikh Flexi Cap</div>
                    <div className="text-[10px] text-slate-500">05 Nov • Auto-debit SIP</div>
                  </div>
                  <div className="text-rose-400 font-bold">-₹25,000</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Nippon Small Cap Fund</div>
                    <div className="text-[10px] text-slate-500">10 Nov • Auto-debit SIP</div>
                  </div>
                  <div className="text-rose-400 font-bold">-₹10,000</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">SGB Half-Yearly Coupon</div>
                    <div className="text-[10px] text-slate-500">25 Nov • 2.5% Tax-Free Interest</div>
                  </div>
                  <div className="text-[#05DF85] font-bold">+₹4,816</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Capital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#05DF85]" />
                <span>Add Holding / Investment</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHolding} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">ASSET / SCHEME NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Consultancy Services"
                  value={newHolding.name}
                  onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">ASSET CLASS</label>
                <select
                  value={newHolding.class}
                  onChange={(e) => setNewHolding({ ...newHolding, class: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="Equity">Direct Equity (Stocks)</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                  <option value="US Stocks">US Equities (Global)</option>
                  <option value="Gold Bond">Sovereign Gold Bond (SGB)</option>
                  <option value="Debt">Debt / Fixed Income</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">QUANTITY / UNITS</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="e.g. 50"
                    value={newHolding.qty}
                    onChange={(e) => setNewHolding({ ...newHolding, qty: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">AVG BUY PRICE (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3200"
                    value={newHolding.avgPrice}
                    onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
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
                  Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
