import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieChartIcon,
  TrendingUp,
  ReceiptText,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('6M');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [timeseries, setTimeseries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  async function loadReportsData() {
    try {
      setLoading(true);
      setError('');

      let startDate = null;
      let endDate = new Date().toISOString();
      const now = new Date();

      if (dateRange === '1M') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (dateRange === '3M') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
      } else if (dateRange === '6M') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
      } else if (dateRange === 'YTD') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }

      let summaryUrl = '/reports/summary';
      let catUrl = '/reports/categories?type=expense';
      if (startDate) {
        summaryUrl += `?startDate=${startDate}&endDate=${endDate}`;
        catUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const [sumRes, catRes, timeRes] = await Promise.all([
        apiRequest(summaryUrl).catch(() => ({ success: false })),
        apiRequest(catUrl).catch(() => ({ success: false })),
        apiRequest('/dashboard/timeseries?months=6').catch(() => ({ success: false }))
      ]);

      if (sumRes.success && sumRes.data?.summary) {
        setSummary(sumRes.data.summary);
      }
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
      }
      if (timeRes.success && timeRes.data?.timeseries) {
        setTimeseries(timeRes.data.timeseries);
      }
    } catch (err) {
      setError(err.message || 'Failed to load financial reports.');
    } finally {
      setLoading(false);
    }
  }

  const handleExportCsv = async () => {
    try {
      window.location.href = '/api/v1/reports/export/csv';
    } catch (err) {
      alert('Failed to download CSV export');
    }
  };

  const incomePaise = summary?.incomePaise || 0;
  const expensePaise = summary?.expensePaise || 0;
  const netCashFlowPaise = summary?.netCashFlowPaise || 0;
  const transactionCount = summary?.transactionCount || 0;
  const savingsRate = summary?.savingsRate || 0;

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">FINANCIAL TELEMETRY</span>
              <span className="text-slate-600">//</span>
              <span>REPORTS, CASH FLOW & TAX METRICS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Reports & Financial Analytics
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Range Picker Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#080D16] border border-white/[0.08] text-xs font-mono">
              {[
                { id: '1M', label: 'This Month' },
                { id: '3M', label: '3 Months' },
                { id: '6M', label: '6 Months' },
                { id: 'YTD', label: 'YTD' },
                { id: 'ALL', label: 'All Time' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDateRange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dateRange === tab.id
                      ? 'bg-[#05DF85] text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 4 Report Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">MONEY RECEIVED (INCOME)</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">+{formatCurrency(incomePaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              For selected timeframe ({dateRange})
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-rose-400 mb-1">MONEY SPENT (EXPENSES)</div>
            <div className="text-2xl font-mono font-bold text-white">-{formatCurrency(expensePaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Total outflows across categories
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">NET CASH SURPLUS</div>
            <div className={`text-2xl font-mono font-bold ${netCashFlowPaise >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(netCashFlowPaise)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Income minus recorded expenses
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">SAVINGS RETENTION RATE</div>
            <div className="text-2xl font-mono font-bold text-white">{savingsRate}%</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {transactionCount} transactions analyzed
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Compiling financial analytics...</p>
          </div>
        ) : transactionCount === 0 ? (
          /* Proper Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Financial Records in this Range</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Reports and spending analytics are calculated automatically once you record income and expense transactions.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Breakdown (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Expense Distribution by Category</h3>
                <p className="text-xs text-slate-400">Categorized spending for the selected period</p>
              </div>

              <div className="space-y-3 pt-2">
                {categories.map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.04] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{c.name} ({c.count} txns)</span>
                      <span className="font-mono text-white font-bold">{formatCurrency(c.totalPaise)} ({c.percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#05DF85] h-full rounded-full" style={{ width: `${Math.min(c.percent, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Monthly Cash Flow Comparison</h3>
                <p className="text-xs text-slate-400">Real inflows vs outflows over past 6 months</p>
              </div>

              <div className="space-y-2.5 pt-2 font-mono text-xs">
                {timeseries.map((m) => (
                  <div key={m.monthKey} className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                    <span className="font-bold text-slate-200">{m.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#05DF85]">+{formatCurrency(m.incomePaise)}</span>
                      <span className="text-slate-400">-{formatCurrency(m.expensePaise)}</span>
                      <span className={`font-bold ${m.netCashFlowPaise >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {formatCurrency(m.netCashFlowPaise)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
